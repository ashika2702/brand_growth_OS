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
  dataState?: string
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
      'https://www.googleapis.com/auth/analytics'
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
      limit: 10
    }
  });

  // 4. Event Explorer Report
  const eventData = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      limit: 15
    }
  });

  // 5. Acquisition / Behavior (Refined)
  const behaviorData = await analyticsdata.properties.runReport({
    property: `properties/${clientData.googleAnalyticsPropertyId}`,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'pagePath' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
      limit: 15
    }
  });

  return {
    rows: response.data.rows || [],
    totals: response.data.totals?.[0]?.metricValues || [],
    realtime: realtimeResponse.data.rows?.[0]?.metricValues?.[0]?.value || '0',
    geo: geoData.data.rows || [],
    events: eventData.data.rows || [],
    behavior: behaviorData.data.rows || []
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
 * Exchange code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
