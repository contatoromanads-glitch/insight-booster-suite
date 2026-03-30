import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAdsRequest {
  customer_id: string;
  date_from?: string;
  date_to?: string;
}

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_ADS_CLIENT_ID')!;
  const clientSecret = Deno.env.get('GOOGLE_ADS_CLIENT_SECRET')!;
  const refreshToken = Deno.env.get('GOOGLE_ADS_REFRESH_TOKEN')!;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to refresh token: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function queryGoogleAds(accessToken: string, customerId: string, query: string) {
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')!;
  const cleanId = customerId.replace(/-/g, '');

  const res = await fetch(
    `https://googleads.googleapis.com/v19/customers/${cleanId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Ads API error: ${err}`);
  }

  return await res.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customer_id, date_from, date_to } = await req.json() as GoogleAdsRequest;

    if (!customer_id) {
      return new Response(JSON.stringify({ error: 'customer_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await getAccessToken();

    const dateFilter = date_from && date_to
      ? `segments.date BETWEEN '${date_from}' AND '${date_to}'`
      : `segments.date DURING LAST_30_DAYS`;

    // Campaign performance summary
    const campaignQuery = `
      SELECT
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.conversions_value
      FROM campaign
      WHERE ${dateFilter}
        AND campaign.status != 'REMOVED'
    `;

    // Daily trend
    const trendQuery = `
      SELECT
        segments.date,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions
      FROM campaign
      WHERE ${dateFilter}
        AND campaign.status != 'REMOVED'
      ORDER BY segments.date ASC
    `;

    // Ad group (ad set) performance
    const adGroupQuery = `
      SELECT
        ad_group.id,
        ad_group.name,
        ad_group.status,
        metrics.cost_micros,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.conversions,
        metrics.cost_per_conversion,
        metrics.conversions_value
      FROM ad_group
      WHERE ${dateFilter}
        AND campaign.status != 'REMOVED'
    `;

    // Age performance
    const ageQuery = `
      SELECT
        ad_group_criterion.age_range.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM age_range_view
      WHERE ${dateFilter}
    `;

    // Gender performance
    const genderQuery = `
      SELECT
        ad_group_criterion.gender.type,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions
      FROM gender_view
      WHERE ${dateFilter}
    `;

    // Geographic performance
    const geoQuery = `
      SELECT
        geographic_view.country_criterion_id,
        campaign_criterion.location.geo_target_constant,
        metrics.impressions,
        metrics.clicks,
        metrics.conversions,
        metrics.cost_micros
      FROM geographic_view
      WHERE ${dateFilter}
      ORDER BY metrics.impressions DESC
      LIMIT 10
    `;

    const [campaignData, trendData, adGroupData, ageData, genderData, geoData] = await Promise.all([
      queryGoogleAds(accessToken, customer_id, campaignQuery),
      queryGoogleAds(accessToken, customer_id, trendQuery),
      queryGoogleAds(accessToken, customer_id, adGroupQuery),
      queryGoogleAds(accessToken, customer_id, ageQuery),
      queryGoogleAds(accessToken, customer_id, genderQuery),
      queryGoogleAds(accessToken, customer_id, geoQuery),
    ]);

    // Process campaign KPI totals
    const kpi = processCampaignKPIs(campaignData);
    const trend = processTrend(trendData);
    const adSets = processAdGroups(adGroupData);
    const ages = processAgeData(ageData);
    const genders = processGenderData(genderData);
    const cities = processGeoData(geoData);

    return new Response(JSON.stringify({
      kpi,
      trend,
      adSets,
      ages,
      genders,
      cities,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function processCampaignKPIs(data: any) {
  let totalSpend = 0, impressions = 0, clicks = 0, conversions = 0, conversionValue = 0;

  const results = data?.[0]?.results || [];
  for (const row of results) {
    const m = row.metrics;
    totalSpend += Number(m.costMicros || 0) / 1_000_000;
    impressions += Number(m.impressions || 0);
    clicks += Number(m.clicks || 0);
    conversions += Number(m.conversions || 0);
    conversionValue += Number(m.conversionsValue || 0);
  }

  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const cpa = conversions > 0 ? totalSpend / conversions : 0;
  const roas = totalSpend > 0 ? conversionValue / totalSpend : 0;

  return { totalSpend, impressions, clicks, ctr, conversions, cpa, roas };
}

function processTrend(data: any) {
  const dailyMap: Record<string, { spend: number; impressions: number; clicks: number; conversions: number }> = {};

  const results = data?.[0]?.results || [];
  for (const row of results) {
    const date = row.segments.date;
    if (!dailyMap[date]) dailyMap[date] = { spend: 0, impressions: 0, clicks: 0, conversions: 0 };
    dailyMap[date].spend += Number(row.metrics.costMicros || 0) / 1_000_000;
    dailyMap[date].impressions += Number(row.metrics.impressions || 0);
    dailyMap[date].clicks += Number(row.metrics.clicks || 0);
    dailyMap[date].conversions += Number(row.metrics.conversions || 0);
  }

  return Object.entries(dailyMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, d]) => ({ date, ...d }));
}

function processAdGroups(data: any) {
  const results = data?.[0]?.results || [];
  return results.map((row: any) => {
    const m = row.metrics;
    const spend = Number(m.costMicros || 0) / 1_000_000;
    const conversions = Number(m.conversions || 0);
    const convValue = Number(m.conversionsValue || 0);
    return {
      id: row.adGroup.id,
      name: row.adGroup.name,
      status: row.adGroup.status === 'ENABLED' ? 'active' : 'paused',
      budget: 0,
      impressions: Number(m.impressions || 0),
      clicks: Number(m.clicks || 0),
      ctr: Number(m.ctr || 0) * 100,
      conversions,
      cpa: conversions > 0 ? spend / conversions : 0,
      spend,
      roas: spend > 0 ? convValue / spend : 0,
    };
  });
}

function processAgeData(data: any) {
  const ageMap: Record<string, string> = {
    AGE_RANGE_18_24: '18-24',
    AGE_RANGE_25_34: '25-34',
    AGE_RANGE_35_44: '35-44',
    AGE_RANGE_45_54: '45-54',
    AGE_RANGE_55_64: '55-64',
    AGE_RANGE_65_UP: '65+',
    AGE_RANGE_UNDETERMINED: 'Indeterminado',
  };

  const results = data?.[0]?.results || [];
  return results.map((row: any) => ({
    ageGroup: ageMap[row.adGroupCriterion?.ageRange?.type] || row.adGroupCriterion?.ageRange?.type || 'N/A',
    impressions: Number(row.metrics.impressions || 0),
    clicks: Number(row.metrics.clicks || 0),
    conversions: Number(row.metrics.conversions || 0),
    spend: Number(row.metrics.costMicros || 0) / 1_000_000,
  }));
}

function processGenderData(data: any) {
  const genderMap: Record<string, string> = {
    MALE: 'Masculino',
    FEMALE: 'Feminino',
    UNDETERMINED: 'Outros',
  };

  const results = data?.[0]?.results || [];
  const totalImpressions = results.reduce((s: number, r: any) => s + Number(r.metrics.impressions || 0), 0);

  return results.map((row: any) => {
    const impressions = Number(row.metrics.impressions || 0);
    return {
      gender: genderMap[row.adGroupCriterion?.gender?.type] || 'Outros',
      value: totalImpressions > 0 ? Math.round((impressions / totalImpressions) * 100) : 0,
      conversions: Number(row.metrics.conversions || 0),
    };
  });
}

function processGeoData(data: any) {
  const results = data?.[0]?.results || [];
  return results.map((row: any) => ({
    city: row.campaignCriterion?.location?.geoTargetConstant || 'N/A',
    impressions: Number(row.metrics.impressions || 0),
    clicks: Number(row.metrics.clicks || 0),
    conversions: Number(row.metrics.conversions || 0),
    spend: Number(row.metrics.costMicros || 0) / 1_000_000,
  }));
}
