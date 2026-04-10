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
      'https://www.googleapis.com/auth/webmasters'
    ],
    state: clientId // Pass clientId in state to recover it in callback
  });
}

/**
 * Exchange code for tokens
 */
export async function exchangeCodeForTokens(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
