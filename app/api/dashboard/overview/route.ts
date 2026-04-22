import { NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { fetchGA4Performance } from '@/lib/google';

export async function GET() {
  try {
    // 1. Fetch all clients to identify which ones have integrations
    const clients = await prisma.client.findMany({
      include: {
        SeoKeyword: true,
        leads: {
          include: {
            activities: true
          }
        },
        contentRequests: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    // 2. Aggregate SEO Data
    let top1 = 0;
    let top3 = 0;
    let top10 = 0;
    
    clients.forEach(client => {
      client.SeoKeyword.forEach(kw => {
        if (kw.currentRank) {
          if (kw.currentRank === 1) top1++;
          if (kw.currentRank <= 3) top3++;
          if (kw.currentRank <= 10) top10++;
        }
      });
    });

    // 3. Aggregate CRM Data
    let totalLeads = 0;
    let wonValue = 0;
    const leadsByStage: Record<string, number> = {
      new: 0,
      qualified: 0,
      proposal: 0,
      negotiation: 0,
      won: 0,
      lost: 0
    };

    clients.forEach(client => {
      totalLeads += client.leads.length;
      client.leads.forEach(lead => {
        const stage = lead.stage.toLowerCase();
        if (leadsByStage[stage] !== undefined) {
          leadsByStage[stage]++;
        }
        if (stage === 'won' && lead.quotedValue) {
          wonValue += lead.quotedValue;
        }
      });
    });

    // 4. Aggregate Analytics Data (Parallelized for all clients with GA4)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const ga4Clients = clients.filter(c => c.googleAnalyticsPropertyId);
    
    const ga4Results = await Promise.allSettled(
      ga4Clients.map(c => fetchGA4Performance(c.id, thirtyDaysAgo, today))
    );

    let totalUsers = 0;
    let totalSessions = 0;
    let totalConversions = 0;
    const dailyTrendMap: Record<string, number> = {};

    ga4Results.forEach(res => {
      if (res.status === 'fulfilled' && res.value) {
        const data = res.value;
        // Aggregate totals
        totalUsers += parseInt(data.totals[0]?.value || '0');
        totalSessions += parseInt(data.totals[1]?.value || '0');
        totalConversions += parseInt(data.totals[2]?.value || '0');

        // Aggregate trend
        data.rows.forEach((row: any) => {
          const dateStr = row.dimensionValues[0].value; // YYYYMMDD
          const val = parseInt(row.metricValues[0].value); // activeUsers
          dailyTrendMap[dateStr] = (dailyTrendMap[dateStr] || 0) + val;
        });
      }
    });

    const performanceTrend = Object.entries(dailyTrendMap)
      .map(([dateStr, users]) => ({
        Day: dateStr.slice(6, 8),
        reach: users,
        sortKey: dateStr
      }))
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey));

    // 5. Intelligence Feed (Combined recent activities)
    const recentLeads = clients.flatMap(c => 
      c.leads.map(l => ({
        id: l.id,
        client: c.name,
        context: `New Lead: ${l.name}`,
        status: l.stage,
        type: 'lead',
        createdAt: l.createdAt
      }))
    );

    const recentContent = clients.flatMap(c => 
      c.contentRequests.map(cr => ({
        id: cr.id,
        client: c.name,
        context: `Content: ${cr.title}`,
        status: cr.status,
        type: 'content',
        createdAt: cr.createdAt
      }))
    );

    const feed = [...recentLeads, ...recentContent]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 15);

    return NextResponse.json({
      stats: {
        leads: totalLeads,
        wonValue,
        top10Keywords: top10,
        activeUsers: totalUsers,
        conversions: totalConversions,
        sessions: totalSessions
      },
      leadsByStage,
      performanceTrend,
      feed
    });
  } catch (error: any) {
    console.error('Dashboard Overview Error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard overview' }, { status: 500 });
  }
}
