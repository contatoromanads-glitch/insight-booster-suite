import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleAdsRequest {
  customer_id: string;
  date_from?: string;
  date_to?: string;
  mode?: 'data' | 'list_clients';
  client_id?: string; // specific client under MCC
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

async function queryGoogleAds(
  accessToken: string,
  customerId: string,
  query: string,
  loginCustomerId?: string,
) {
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')!;
  const cleanId = customerId.replace(/-/g, '');

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
  };

  if (loginCustomerId) {
    headers['login-customer-id'] = loginCustomerId.replace(/-/g, '');
  }

  const res = await fetch(
    `https://googleads.googleapis.com/v23/customers/${cleanId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Google Ads API error (customer ${customerId}): ${err}`);
  }

  return await res.json();
}

async function listAccessibleClients(
  accessToken: string,
  managerCustomerId: string,
): Promise<string[]> {
  const clients = await listAccessibleClientsDetailed(accessToken, managerCustomerId);
  return clients.map((c: any) => c.id);
}

async function listAccessibleClientsDetailed(
  accessToken: string,
  managerCustomerId: string,
): Promise<{ id: string; name: string }[]> {
  const developerToken = Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN')!;
  const cleanId = managerCustomerId.replace(/-/g, '');

  const query = `
    SELECT
      customer_client.id,
      customer_client.descriptive_name,
      customer_client.manager,
      customer_client.status
    FROM customer_client
    WHERE customer_client.manager = false
      AND customer_client.status = 'ENABLED'
  `;

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${accessToken}`,
    'developer-token': developerToken,
    'Content-Type': 'application/json',
    'login-customer-id': cleanId,
  };

  const res = await fetch(
    `https://googleads.googleapis.com/v23/customers/${cleanId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to list client accounts: ${err}`);
  }

  const data = await res.json();
  const results = data?.[0]?.results || [];
  return results.map((r: any) => ({
    id: r.customerClient.id,
    name: r.customerClient.descriptiveName || `Conta ${r.customerClient.id}`,
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customer_id, date_from, date_to, mode, client_id } = await req.json() as GoogleAdsRequest;

    if (!customer_id) {
      return new Response(JSON.stringify({ error: 'customer_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const accessToken = await getAccessToken();
    const loginCustomerId = customer_id;

    // Mode: list client accounts under MCC
    if (mode === 'list_clients') {
      try {
        const clients = await listAccessibleClientsDetailed(accessToken, customer_id);
        console.log(`list_clients returned ${clients.length} clients for ${customer_id}`);
        return new Response(JSON.stringify({ clients }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e: any) {
        console.error('list_clients failed:', e.message);
        // Return fallback but include the error so frontend can show it
        return new Response(JSON.stringify({ 
          clients: [{ id: customer_id.replace(/-/g, ''), name: 'Conta principal' }],
          warning: `Não foi possível listar subcontas: ${e.message}`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // If a specific client_id is provided, query only that one
    let clientIds: string[];
    if (client_id) {
      clientIds = [client_id.replace(/-/g, '')];
      console.log(`Querying specific client: ${client_id}`);
    } else {
      // Try to list client accounts (works if it's a manager account)
      try {
        clientIds = await listAccessibleClients(accessToken, customer_id);
        console.log(`Manager account detected. Found ${clientIds.length} client accounts:`, clientIds);
      } catch {
        clientIds = [customer_id.replace(/-/g, '')];
        console.log('Direct client account, querying directly.');
      }
    }

    if (clientIds.length === 0) {
      return new Response(JSON.stringify({ error: 'No client accounts found under this manager account.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const dateFilter = date_from && date_to
      ? `segments.date BETWEEN '${date_from}' AND '${date_to}'`
      : `segments.date DURING LAST_30_DAYS`;

    const campaignQuery = `
      SELECT
        metrics.cost_micros, metrics.impressions, metrics.clicks,
        metrics.ctr, metrics.conversions, metrics.cost_per_conversion,
        metrics.conversions_value
      FROM campaign
      WHERE ${dateFilter} AND campaign.status != 'REMOVED'
    `;

    const trendQuery = `
      SELECT
        segments.date, metrics.cost_micros, metrics.impressions,
        metrics.clicks, metrics.conversions
      FROM campaign
      WHERE ${dateFilter} AND campaign.status != 'REMOVED'
      ORDER BY segments.date ASC
    `;

    const adGroupQuery = `
      SELECT
        ad_group.id, ad_group.name, ad_group.status,
        metrics.cost_micros, metrics.impressions, metrics.clicks,
        metrics.ctr, metrics.conversions, metrics.cost_per_conversion,
        metrics.conversions_value
      FROM ad_group
      WHERE ${dateFilter} AND campaign.status != 'REMOVED'
    `;

    const ageQuery = `
      SELECT
        ad_group_criterion.age_range.type,
        metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros
      FROM age_range_view
      WHERE ${dateFilter}
    `;

    const genderQuery = `
      SELECT
        ad_group_criterion.gender.type,
        metrics.impressions, metrics.clicks, metrics.conversions
      FROM gender_view
      WHERE ${dateFilter}
    `;

    const geoQuery = `
      SELECT
        geographic_view.country_criterion_id,
        campaign_criterion.location.geo_target_constant,
        metrics.impressions, metrics.clicks, metrics.conversions, metrics.cost_micros
      FROM geographic_view
      WHERE ${dateFilter}
      ORDER BY metrics.impressions DESC
      LIMIT 10
    `;

    // Query all client accounts in parallel and aggregate
    const allResults = await Promise.all(
      clientIds.map(async (cid) => {
        const isManager = clientIds.length > 1 || cid !== customer_id.replace(/-/g, '');
        const loginId = isManager ? loginCustomerId : undefined;

        const [campaignData, trendData, adGroupData, ageData, genderData, geoData] = await Promise.all([
          queryGoogleAds(accessToken, cid, campaignQuery, loginId).catch(e => { console.error(`Campaign query failed for ${cid}:`, e.message); return []; }),
          queryGoogleAds(accessToken, cid, trendQuery, loginId).catch(e => { console.error(`Trend query failed for ${cid}:`, e.message); return []; }),
          queryGoogleAds(accessToken, cid, adGroupQuery, loginId).catch(e => { console.error(`AdGroup query failed for ${cid}:`, e.message); return []; }),
          queryGoogleAds(accessToken, cid, ageQuery, loginId).catch(e => { console.error(`Age query failed for ${cid}:`, e.message); return []; }),
          queryGoogleAds(accessToken, cid, genderQuery, loginId).catch(e => { console.error(`Gender query failed for ${cid}:`, e.message); return []; }),
          queryGoogleAds(accessToken, cid, geoQuery, loginId).catch(e => { console.error(`Geo query failed for ${cid}:`, e.message); return []; }),
        ]);

        return { campaignData, trendData, adGroupData, ageData, genderData, geoData };
      })
    );

    // Aggregate data across all client accounts
    const aggregated = {
      campaignData: allResults.flatMap(r => r.campaignData?.[0]?.results || []),
      trendData: allResults.flatMap(r => r.trendData?.[0]?.results || []),
      adGroupData: allResults.flatMap(r => r.adGroupData?.[0]?.results || []),
      ageData: allResults.flatMap(r => r.ageData?.[0]?.results || []),
      genderData: allResults.flatMap(r => r.genderData?.[0]?.results || []),
      geoData: allResults.flatMap(r => r.geoData?.[0]?.results || []),
    };

    const kpi = processCampaignKPIs(aggregated.campaignData);
    const trend = processTrend(aggregated.trendData);
    const adSets = processAdGroups(aggregated.adGroupData);
    const ages = processAgeData(aggregated.ageData);
    const genders = processGenderData(aggregated.genderData);
    const cities = processGeoData(aggregated.geoData);

    return new Response(JSON.stringify({ kpi, trend, adSets, ages, genders, cities }), {
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

// --- Data processing helpers ---

function processCampaignKPIs(results: any[]) {
  let totalSpend = 0, impressions = 0, clicks = 0, conversions = 0, conversionValue = 0;

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

function processTrend(results: any[]) {
  const dailyMap: Record<string, { spend: number; impressions: number; clicks: number; conversions: number }> = {};

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

function processAdGroups(results: any[]) {
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

function processAgeData(results: any[]) {
  const ageMap: Record<string, string> = {
    AGE_RANGE_18_24: '18-24',
    AGE_RANGE_25_34: '25-34',
    AGE_RANGE_35_44: '35-44',
    AGE_RANGE_45_54: '45-54',
    AGE_RANGE_55_64: '55-64',
    AGE_RANGE_65_UP: '65+',
    AGE_RANGE_UNDETERMINED: 'Indeterminado',
  };

  return results.map((row: any) => ({
    ageGroup: ageMap[row.adGroupCriterion?.ageRange?.type] || row.adGroupCriterion?.ageRange?.type || 'N/A',
    impressions: Number(row.metrics.impressions || 0),
    clicks: Number(row.metrics.clicks || 0),
    conversions: Number(row.metrics.conversions || 0),
    spend: Number(row.metrics.costMicros || 0) / 1_000_000,
  }));
}

function processGenderData(results: any[]) {
  const genderMap: Record<string, string> = {
    MALE: 'Masculino',
    FEMALE: 'Feminino',
    UNDETERMINED: 'Outros',
  };

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

function processGeoData(results: any[]) {
  return results.map((row: any) => ({
    city: row.campaignCriterion?.location?.geoTargetConstant || 'N/A',
    impressions: Number(row.metrics.impressions || 0),
    clicks: Number(row.metrics.clicks || 0),
    conversions: Number(row.metrics.conversions || 0),
    spend: Number(row.metrics.costMicros || 0) / 1_000_000,
  }));
}
