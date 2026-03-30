import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GRAPH_API = 'https://graph.facebook.com/v25.0';

interface MetaAdsRequest {
  ad_account_id: string;
  date_from?: string;
  date_to?: string;
}

async function fetchInsights(accountId: string, accessToken: string, dateFrom: string, dateTo: string, fields: string, breakdowns?: string, level?: string) {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields,
    time_range: JSON.stringify({ since: dateFrom, until: dateTo }),
    limit: '500',
  });
  if (breakdowns) params.set('breakdowns', breakdowns);
  if (level) params.set('level', level);

  const url = `${GRAPH_API}/${accountId}/insights?${params}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API error: ${JSON.stringify(data.error)}`);
  }

  return data.data || [];
}

async function fetchAdSets(accountId: string, accessToken: string, dateFrom: string, dateTo: string) {
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: 'name,status,daily_budget,insights.time_range(' + JSON.stringify({ since: dateFrom, until: dateTo }) + '){spend,impressions,clicks,ctr,actions,cost_per_action_type}',
    limit: '100',
  });

  const url = `${GRAPH_API}/${accountId}/adsets?${params}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta API error (adsets): ${JSON.stringify(data.error)}`);
  }

  return data.data || [];
}

function getConversions(actions: any[]): number {
  if (!actions) return 0;
  const convAction = actions.find((a: any) =>
    a.action_type === 'offsite_conversion' ||
    a.action_type === 'lead' ||
    a.action_type === 'purchase' ||
    a.action_type === 'complete_registration'
  );
  return convAction ? parseInt(convAction.value, 10) : 0;
}

function getCostPerConversion(costPerAction: any[]): number {
  if (!costPerAction) return 0;
  const cpa = costPerAction.find((a: any) =>
    a.action_type === 'offsite_conversion' ||
    a.action_type === 'lead' ||
    a.action_type === 'purchase' ||
    a.action_type === 'complete_registration'
  );
  return cpa ? parseFloat(cpa.value) : 0;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get('META_ACCESS_TOKEN');
    if (!accessToken) throw new Error('META_ACCESS_TOKEN not configured');

    const body: MetaAdsRequest = await req.json();
    const accountId = body.ad_account_id || Deno.env.get('META_AD_ACCOUNT_ID');
    if (!accountId) throw new Error('No ad account ID provided');

    // Ensure act_ prefix
    const cleanAccountId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;

    const now = new Date();
    const dateTo = body.date_to || now.toISOString().slice(0, 10);
    const dateFrom = body.date_from || new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);

    // Calculate previous period for comparison
    const periodMs = new Date(dateTo).getTime() - new Date(dateFrom).getTime();
    const prevTo = new Date(new Date(dateFrom).getTime() - 86400000).toISOString().slice(0, 10);
    const prevFrom = new Date(new Date(dateFrom).getTime() - periodMs - 86400000).toISOString().slice(0, 10);

    // Fetch all data in parallel
    const [
      summaryData,
      prevSummaryData,
      dailyData,
      ageData,
      genderData,
      regionData,
    ] = await Promise.all([
      fetchInsights(cleanAccountId, accessToken, dateFrom, dateTo, 'spend,impressions,clicks,ctr,actions,cost_per_action_type'),
      fetchInsights(cleanAccountId, accessToken, prevFrom, prevTo, 'spend,impressions,clicks,ctr,actions,cost_per_action_type'),
      fetchInsights(cleanAccountId, accessToken, dateFrom, dateTo, 'spend,impressions,clicks,conversions,date_start', undefined, 'campaign').then(data => {
        // Aggregate by date
        const byDate: Record<string, any> = {};
        for (const row of data) {
          const d = row.date_start;
          if (!byDate[d]) byDate[d] = { date: d, spend: 0, impressions: 0, clicks: 0, conversions: 0 };
          byDate[d].spend += parseFloat(row.spend || '0');
          byDate[d].impressions += parseInt(row.impressions || '0', 10);
          byDate[d].clicks += parseInt(row.clicks || '0', 10);
          byDate[d].conversions += parseInt(row.conversions || '0', 10);
        }
        return Object.values(byDate).sort((a: any, b: any) => a.date.localeCompare(b.date));
      }),
      fetchInsights(cleanAccountId, accessToken, dateFrom, dateTo, 'spend,impressions,clicks,actions', 'age'),
      fetchInsights(cleanAccountId, accessToken, dateFrom, dateTo, 'impressions,actions', 'gender'),
      fetchInsights(cleanAccountId, accessToken, dateFrom, dateTo, 'spend,impressions,clicks,actions', 'region'),
    ]);

    // Process KPI
    const s = summaryData[0] || {};
    const ps = prevSummaryData[0] || {};
    const spend = parseFloat(s.spend || '0');
    const impressions = parseInt(s.impressions || '0', 10);
    const clicks = parseInt(s.clicks || '0', 10);
    const ctr = parseFloat(s.ctr || '0');
    const conversions = getConversions(s.actions);
    const cpa = conversions > 0 ? spend / conversions : 0;
    const roas = spend > 0 ? (conversions * 100) / spend : 0; // Simplified

    const prevSpend = parseFloat(ps.spend || '0');
    const prevImpressions = parseInt(ps.impressions || '0', 10);
    const prevClicks = parseInt(ps.clicks || '0', 10);
    const prevCtr = parseFloat(ps.ctr || '0');
    const prevConversions = getConversions(ps.actions);
    const prevCpa = prevConversions > 0 ? prevSpend / prevConversions : 0;
    const prevRoas = prevSpend > 0 ? (prevConversions * 100) / prevSpend : 0;

    const kpi = {
      totalSpend: spend, impressions, clicks, ctr, conversions, cpa, roas,
      prevSpend, prevImpressions, prevClicks, prevCtr, prevConversions, prevCpa, prevRoas,
    };

    // Process ages
    const ages = ageData.map((row: any) => ({
      ageGroup: row.age || 'Unknown',
      impressions: parseInt(row.impressions || '0', 10),
      clicks: parseInt(row.clicks || '0', 10),
      conversions: getConversions(row.actions),
      spend: parseFloat(row.spend || '0'),
    }));

    // Process genders
    const genders = genderData.map((row: any) => ({
      gender: row.gender === 'male' ? 'Masculino' : row.gender === 'female' ? 'Feminino' : 'Outros',
      value: parseInt(row.impressions || '0', 10),
      conversions: getConversions(row.actions),
    }));

    // Process cities/regions
    const cities = regionData
      .map((row: any) => ({
        city: row.region || 'Unknown',
        impressions: parseInt(row.impressions || '0', 10),
        clicks: parseInt(row.clicks || '0', 10),
        conversions: getConversions(row.actions),
        spend: parseFloat(row.spend || '0'),
      }))
      .sort((a: any, b: any) => b.impressions - a.impressions)
      .slice(0, 10);

    // Fetch ad sets separately
    let adSets: any[] = [];
    try {
      const rawAdSets = await fetchAdSets(cleanAccountId, accessToken, dateFrom, dateTo);
      adSets = rawAdSets.map((as: any) => {
        const ins = as.insights?.data?.[0] || {};
        const asSpend = parseFloat(ins.spend || '0');
        const asClicks = parseInt(ins.clicks || '0', 10);
        const asImpressions = parseInt(ins.impressions || '0', 10);
        const asConversions = getConversions(ins.actions);
        return {
          id: as.id,
          name: as.name,
          status: as.status === 'ACTIVE' ? 'active' : 'paused',
          budget: parseFloat(as.daily_budget || '0') / 100,
          impressions: asImpressions,
          clicks: asClicks,
          ctr: parseFloat(ins.ctr || '0'),
          conversions: asConversions,
          cpa: asConversions > 0 ? asSpend / asConversions : 0,
          spend: asSpend,
          roas: asSpend > 0 ? (asConversions * 100) / asSpend : 0,
        };
      });
    } catch (e) {
      console.error('Failed to fetch ad sets:', e);
    }

    return new Response(JSON.stringify({
      kpi,
      trend: dailyData,
      cities,
      ages,
      genders,
      adSets,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Meta Ads error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
