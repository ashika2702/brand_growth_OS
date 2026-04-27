import { google } from 'googleapis';
import prisma from './db';

/**
 * Google Search Console API Utility
 * Implementation based on Phase 1 & 2 of the Integration Plan.
 */

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function getGoogleToken(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { googleAccessToken: true, googleRefreshToken: true, googleTokenExpiresAt: true }
  });

  if (!client?.googleRefreshToken) {
    throw new Error('Google Search Console not connected for this client');
  }

  oauth2Client.setCredentials({
    access_token: client.googleAccessToken || undefined,
    refresh_token: client.googleRefreshToken,
    expiry_date: client.googleTokenExpiresAt ? client.googleTokenExpiresAt.getTime() : undefined,
  });

  // Ensure listener is only added once
  if (oauth2Client.listenerCount('tokens') === 0) {
    oauth2Client.on('tokens', async (tokens) => {
      const data: any = {};
      if (tokens.access_token) data.googleAccessToken = tokens.access_token;
      if (tokens.refresh_token) data.googleRefreshToken = tokens.refresh_token;
      if (tokens.expiry_date) data.googleTokenExpiresAt = new Date(tokens.expiry_date);

      if (Object.keys(data).length > 0) {
        // We use a separate prisma call here to avoid capturing clientId in a way that risks leaks
        // But since this is a utility, we'll keep it simple for now or use a global update logic
        // For now, this listener is global, so it might not have the clientId easily.
        // Better: Update by Refresh Token which is unique.
        await prisma.client.updateMany({
          where: { googleRefreshToken: tokens.refresh_token || client.googleRefreshToken },
          data
        });
      }
    });
  }

  // This will trigger the 'tokens' event and refresh if needed
  const { token } = await oauth2Client.getAccessToken();
  return token;
}

/**
 * Fetch performance data for a specific site
 */
export async function fetchGSCPerformance(
  clientId: string, 
  startDate: string, 
  endDate: string,
  dimensions: string[] = ['query'],
  dataState?: string,
  country?: string
) {
  await getGoogleToken(clientId);
  
  const clientData = await prisma.client.findUnique({ 
    where: { id: clientId }, 
    select: { googleSearchConsoleUrl: true } 
  });
  
  if (!clientData?.googleSearchConsoleUrl) {
    throw new Error('Google Search Console URL not configured for this client');
  }
 
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
  
  try {
    const requestBody: any = {
      startDate,
      endDate,
      dimensions,
      rowLimit: 5000,
    };
    if (dataState) requestBody.dataState = dataState;

    if (country && country !== 'all') {
      const countryList = country.split(',').filter(Boolean);
      if (countryList.length > 0) {
        requestBody.dimensionFilterGroups = [{
          filters: [{
            dimension: 'country',
            operator: countryList.length > 1 ? 'includingRegex' : 'equals',
            expression: countryList.length > 1 
              ? countryList.map(c => c.toLowerCase()).join('|') 
              : countryList[0].toLowerCase()
          }]
        }];
      }
    }

    console.log('GSC Request Body:', JSON.stringify(requestBody, null, 2));

    const res = await searchconsole.searchanalytics.query({
      siteUrl: clientData.googleSearchConsoleUrl,
      requestBody,
    });
    return res.data.rows || [];
  } catch (error: any) {
    if (error.response?.data) {
      console.error('GSC API Error Detail:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

/**
 * Check indexing status for a specific URL
 */
export async function checkIndexingStatus(clientId: string, url: string) {
  await getGoogleToken(clientId);
  
  const clientData = await prisma.client.findUnique({ 
    where: { id: clientId }, 
    select: { googleSearchConsoleUrl: true } 
  });
  
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });
  
  const res = await searchconsole.urlInspection.index.inspect({
    requestBody: {
      inspectionUrl: url,
      siteUrl: clientData?.googleSearchConsoleUrl || url, // Fallback to URL itself
    },
  });

  return res.data.inspectionResult;
}

/**
 * Generate Authorization URL
 */
export function getGoogleAuthUrl(clientId: string) {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/analytics.readonly',
      'https://www.googleapis.com/auth/analytics',
      'https://www.googleapis.com/auth/tagmanager.readonly'
    ],
    state: clientId // Pass clientId in state to recover it in callback
  });
}


/**
 * Fetch Performance Data from GA4
 */
export async function fetchGA4Performance(
  clientId: string,
  startDate: string,
  endDate: string
) {
  await getGoogleToken(clientId);

  const clientData = await prisma.client.findUnique({
    where: { id: clientId },
    select: { googleAnalyticsPropertyId: true }
  });

  if (!clientData?.googleAnalyticsPropertyId) {
    throw new Error('Google Analytics Property ID not configured for this client');
  }

  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth: oauth2Client });

  // 1. Standard Report (Totals & Trend)
  const response = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'bounceRate' }
      ],
      metricAggregations: ['TOTAL']
    }
  });

  // 2. Realtime Report (Active Users now)
  const realtimeResponse = await analyticsdata.properties.runRealtimeReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      metrics: [{ name: 'activeUsers' }]
    }
  });

  // 3. Geographic Report
  const geoData = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }, { name: 'city' }],
      metrics: [{ name: 'activeUsers' }],
      limit: 10000
    }
  });

  // 4. Event Explorer Report
  const eventData = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      limit: 5000
    }
  });

  // 5. Acquisition / Behavior (Existing - Keeping for compatibility)
  const behaviorData = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'pagePath' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      limit: 5000
    }
  });

  // 6. Detailed User Acquisition (Mirroring GA4 UI Screenshot - FOR CHART)
  const acquisitionData = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'firstUserDefaultChannelGroup' },
        { name: 'date' }
      ],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'activeUsers' },
        { name: 'userEngagementDuration' },
        { name: 'engagedSessions' },
        { name: 'eventCount' },
        { name: 'conversions' }
      ]
    }
  });

  // 7. Aggregate User Acquisition (FOR TABLE - Accurate unique counts)
  const acquisitionTable = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'firstUserDefaultChannelGroup' }
      ],
      metrics: [
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'activeUsers' },
        { name: 'userEngagementDuration' },
        { name: 'engagedSessions' },
        { name: 'eventCount' },
        { name: 'conversions' },
        { name: 'userKeyEventRate' }
      ],
      metricAggregations: ['TOTAL']
    }
  });

  // 8. User Type Breakdown (FOR TABLE - Accurate Returning users)
  const acquisitionBreakdown = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'firstUserDefaultChannelGroup' },
        { name: 'newVsReturning' }
      ],
      metrics: [
        { name: 'activeUsers' }
      ]
    }
  });

  // 9. Session Acquisition (FOR CHART)
  const sessionData = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' },
        { name: 'date' }
      ],
      metrics: [
        { name: 'sessions' }
      ]
    }
  });

  // 10. Session Acquisition Aggregates (FOR TABLE)
  const sessionTable = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'sessionDefaultChannelGroup' }
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'engagementRate' },
        { name: 'eventsPerSession' },
        { name: 'sessionKeyEventRate' },
        { name: 'averageSessionDuration' },
        { name: 'eventCount' },
        { name: 'conversions' }
      ],
      metricAggregations: ['TOTAL']
    }
  });

  // 11. Non-Google Campaign Report (Mirroring User Screenshot)
  const campaignData = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'sessionCampaignName' },
        { name: 'sessionSource' },
        { name: 'sessionMedium' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'eventCount' },
        { name: 'conversions' },
        { name: 'userEngagementDuration' },
        { name: 'totalRevenue' }
      ],
      dimensionFilter: {
        notExpression: {
          filter: {
            fieldName: 'sessionSource',
            stringFilter: {
              value: 'google',
              matchType: 'CONTAINS'
            }
          }
        }
      },
      metricAggregations: ['TOTAL'],
      limit: 5000
    }
  });

  // 12. Campaign Trend Report (FOR GRAPH)
  const campaignSeries = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'sessionCampaignName' },
        { name: 'date' }
      ],
      metrics: [
        { name: 'activeUsers' }
      ],
      dimensionFilter: {
        notExpression: {
          filter: {
            fieldName: 'sessionSource',
            stringFilter: {
              value: 'google',
              matchType: 'CONTAINS'
            }
          }
        }
      }
    }
  });

  return {
    rows: response.data.rows || [],
    totals: response.data.totals?.[0]?.metricValues || [],
    realtime: realtimeResponse.data.rows?.[0]?.metricValues?.[0]?.value || '0',
    geo: geoData.data.rows || [],
    events: eventData.data.rows || [],
    behavior: behaviorData.data.rows || [],
    performanceTotals: response.data.totals?.[0] || null,
    acquisition: acquisitionData.data.rows || [],
    acquisitionTable: acquisitionTable.data.rows || [],
    acquisitionTableTotals: acquisitionTable.data.totals?.[0] || null,
    acquisitionBreakdown: acquisitionBreakdown.data.rows || [],
    sessionAcquisition: sessionData.data.rows || [],
    sessionTable: sessionTable.data.rows || [],
    sessionTableTotals: sessionTable.data.totals?.[0] || null,
    campaigns: campaignData.data.rows || [],
    campaignTotals: campaignData.data.totals?.[0] || null,
    campaignSeries: campaignSeries.data.rows || []
  };
}



/**
 * Fetch Full Realtime Report (Last 30 Minutes)
 */
export async function fetchGA4Realtime(clientId: string) {
  await getGoogleToken(clientId);

  const clientData = await prisma.client.findUnique({
    where: { id: clientId },
    select: { googleAnalyticsPropertyId: true }
  });

  if (!clientData?.googleAnalyticsPropertyId) {
    throw new Error('Google Analytics Property ID not configured for this client');
  }

  const analyticsdata = google.analyticsdata({ version: 'v1beta', auth: oauth2Client });
  const propertyId = `properties/${clientData.googleAnalyticsPropertyId}`;

  // Helper to run a report safely without crashing the dashboard
  const runSafeReport = async (name: string, dimensions: any[], metrics: any[]) => {
    try {
      const response = await analyticsdata.properties.runRealtimeReport({
        property: propertyId,
        requestBody: { dimensions, metrics }
      });
      return response.data.rows || [];
    } catch (err: any) {
      console.error(`GA4 Realtime [${name}] Error:`, err.message);
      return [];
    }
  };

  // Execute focused reports in compatible batches (Metrics like eventCount must be requested with eventName separately)
  const [timeline, masterA, masterB] = await Promise.all([
    runSafeReport('Timeline', [{ name: 'minutesAgo' }], [{ name: 'activeUsers' }]),
    runSafeReport('MasterA', 
      [
        { name: 'country' },           // index 0
        { name: 'city' },              // index 1
        { name: 'deviceCategory' }     // index 2
      ], 
      [
        { name: 'activeUsers' }        // index 0
      ]
    ),
    runSafeReport('MasterB', 
      [
        { name: 'eventName' }          // index 0
      ], 
      [
        { name: 'eventCount' },        // index 0
        { name: 'keyEvents' }          // index 1
      ]
    )
  ]);

  // Aggregate helper to extract specific dimension data from a specific master result
  const getBreakdown = (rows: any[], dimIndex: number, metricIndex: number, secondaryDimIndex?: number) => {
      const summary = new Map<string, { metrics: number[], dims: string[] }>();
      
      rows.forEach(row => {
          const key = secondaryDimIndex !== undefined 
            ? `${row.dimensionValues[dimIndex].value}|${row.dimensionValues[secondaryDimIndex].value}`
            : row.dimensionValues[dimIndex].value;
          
          const val = parseInt(row.metricValues[metricIndex].value || '0');
          if (val === 0) return;

          const existing = summary.get(key);
          if (existing) {
              existing.metrics[0] += val;
          } else {
              summary.set(key, { 
                metrics: [val], 
                dims: secondaryDimIndex !== undefined 
                    ? [row.dimensionValues[dimIndex].value, row.dimensionValues[secondaryDimIndex].value]
                    : [row.dimensionValues[dimIndex].value]
              });
          }
      });

      return Array.from(summary.values())
        .sort((a, b) => b.metrics[0] - a.metrics[0])
        .map(item => ({
            dimensionValues: item.dims.map(d => ({ value: d })),
            metricValues: item.metrics.map(m => ({ value: m.toString() }))
        }));
  };

  const totalActive = timeline.reduce((acc, row) => acc + parseInt(row.metricValues?.[0]?.value || '0'), 0) || 0;

  return {
    totalActive,
    timeline,
    geo: getBreakdown(masterA, 0, 0, 1),      // Country + City
    sources: getBreakdown(masterA, 2, 0),     // Device Category
    events: getBreakdown(masterB, 0, 0),      // Event Name + Event Count
    keyEvents: getBreakdown(masterB, 0, 1)    // Event Name + Key Events
  };
}

/**
 * Fetch GTM Inventory (Tags, Triggers, Variables)
 */
export async function fetchGTMInventory(clientId: string) {
  await getGoogleToken(clientId);

  const clientData = await prisma.client.findUnique({
    where: { id: clientId },
    select: { googleTagManagerContainerId: true }
  });

  const tagmanager = google.tagmanager({ version: 'v2', auth: oauth2Client });

  try {
    // 1. List accounts
    const accountsRes = await tagmanager.accounts.list();
    const accounts = accountsRes.data.account || [];

    let targetContainer: any = null;
    let targetWorkspace: any = null;

    // 2. Find the container by publicId (GTM-XXXX)
    for (const account of accounts) {
      if (!account.path) continue;
      const containersRes = await tagmanager.accounts.containers.list({ parent: account.path });
      const containers = containersRes.data.container || [];
      
      targetContainer = containers.find(c => c.publicId === clientData?.googleTagManagerContainerId);
      if (targetContainer) break;
    }

    if (!targetContainer) {
      // If we don't have a specific ID, or can't find it, we'll try to find the first one as fallback
      // but only if the user hasn't specified one.
      if (!clientData?.googleTagManagerContainerId && accounts[0]) {
         const firstContainers = await tagmanager.accounts.containers.list({ parent: accounts[0].path! });
         targetContainer = firstContainers.data.container?.[0];
      }
    }

    if (!targetContainer) {
      throw new Error('GTM Container not found for this account');
    }

    // 3. Get the latest workspace (usually 'Default Workspace')
    const workspacesRes = await tagmanager.accounts.containers.workspaces.list({ parent: targetContainer.path! });
    targetWorkspace = workspacesRes.data.workspace?.[0];

    if (!targetWorkspace) {
      throw new Error('No workspace found in GTM container');
    }

    // 4. Fetch Tags, Triggers, and Variables in parallel
    const [tags, triggers, variables] = await Promise.all([
      tagmanager.accounts.containers.workspaces.tags.list({ parent: targetWorkspace.path! }),
      tagmanager.accounts.containers.workspaces.triggers.list({ parent: targetWorkspace.path! }),
      tagmanager.accounts.containers.workspaces.variables.list({ parent: targetWorkspace.path! })
    ]);

    return {
      container: targetContainer,
      workspace: targetWorkspace,
      tags: tags.data.tag || [],
      triggers: triggers.data.trigger || [],
      variables: variables.data.variable || []
    };

  } catch (error: any) {
    console.error('GTM API Error:', error.message);
    throw error;
  }
}

/**
 * Exchange code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
