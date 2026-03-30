import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Eye, MousePointer, BarChart3, Target, TrendingUp, Percent, ChevronDown, LayoutDashboard, Loader2 } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { CityTable } from '@/components/dashboard/CityTable';
import { AgeChart } from '@/components/dashboard/AgeChart';
import { CreativeGrid } from '@/components/dashboard/CreativeGrid';
import { AdSetTable } from '@/components/dashboard/AdSetTable';
import { GenderChart } from '@/components/dashboard/GenderChart';
import { ChatPanel } from '@/components/dashboard/ChatPanel';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { useGoogleAds } from '@/hooks/useGoogleAds';
import { useMetaAds } from '@/hooks/useMetaAds';
import {
  clients as mockClients, kpiData as mockKpiData, trendData as mockTrendData,
  cityData as mockCityData, ageData as mockAgeData,
  creativeData as mockCreativeData, adSetData as mockAdSetData, genderData as mockGenderData,
} from '@/data/mockData';

// Google Ads accounts to monitor
const googleAdsAccounts = [
  { id: 'gads-1', name: 'Google Ads - 771-715-2917', customerId: '771-715-2917' },
];

// Meta Ads accounts
const metaAdsAccounts = [
  { id: 'meta-1', name: 'Meta Ads', adAccountId: '' }, // uses env default
];

// Combine all clients
const allClients = [
  ...googleAdsAccounts.map(a => ({ id: a.id, name: a.name })),
  ...metaAdsAccounts.map(a => ({ id: a.id, name: a.name })),
  ...mockClients.map(c => ({ id: `mock-${c.id}`, name: `[Demo] ${c.name}` })),
];

export default function Index() {
  const [clientId, setClientId] = useState(googleAdsAccounts[0].id);
  const [period, setPeriod] = useState('30d');
  const [clientOpen, setClientOpen] = useState(false);
  const [subAccountId, setSubAccountId] = useState<string | null>(null);
  const [subAccountOpen, setSubAccountOpen] = useState(false);
  const { data: gadsData, loading: gadsLoading, error: gadsError, fetchData: fetchGads, clients: mccClients, loadingClients, fetchClients } = useGoogleAds();
  const { data: metaData, loading: metaLoading, error: metaError, fetchData: fetchMeta } = useMetaAds();

  const isGoogleAds = clientId.startsWith('gads-');
  const isMetaAds = clientId.startsWith('meta-');
  const gadsAccount = googleAdsAccounts.find(a => a.id === clientId);
  const metaAccount = metaAdsAccounts.find(a => a.id === clientId);
  const mockId = clientId.replace('mock-', '');

  const loading = isGoogleAds ? gadsLoading : isMetaAds ? metaLoading : false;
  const error = isGoogleAds ? gadsError : isMetaAds ? metaError : null;

  const getDateRange = useCallback(() => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from: string;
    switch (period) {
      case '7d': from = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10); break;
      case '14d': from = new Date(now.getTime() - 14 * 86400000).toISOString().slice(0, 10); break;
      case '90d': from = new Date(now.getTime() - 90 * 86400000).toISOString().slice(0, 10); break;
      default: from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10); break;
    }
    return { from, to };
  }, [period]);

  // Load MCC sub-accounts when a Google Ads account is selected
  useEffect(() => {
    if (isGoogleAds && gadsAccount) {
      fetchClients(gadsAccount.customerId);
      setSubAccountId(null);
    }
  }, [clientId, isGoogleAds]);

  // Fetch data when sub-account, period, or client changes
  useEffect(() => {
    const { from, to } = getDateRange();
    if (isGoogleAds && gadsAccount) {
      fetchGads(gadsAccount.customerId, from, to, subAccountId || undefined);
    } else if (isMetaAds && metaAccount) {
      fetchMeta(metaAccount.adAccountId || undefined, from, to);
    }
  }, [clientId, period, isGoogleAds, isMetaAds, subAccountId]);

  const client = allClients.find(c => c.id === clientId)!;

  // Use real or mock data
  const activeData = isGoogleAds ? gadsData : isMetaAds ? metaData : null;
  const kpi = activeData ? activeData.kpi : mockKpiData[mockId];
  const trend = activeData ? activeData.trend : mockTrendData[mockId];
  const cities = activeData ? activeData.cities : mockCityData[mockId];
  const ages = activeData ? activeData.ages : mockAgeData[mockId];
  const creatives = (isGoogleAds || isMetaAds) ? [] : mockCreativeData[mockId];
  const adSets = activeData ? activeData.adSets : mockAdSetData[mockId];
  const genders = activeData ? activeData.genders : mockGenderData[mockId];

  const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">Dashboard de Campanhas</h1>
              {isGoogleAds && subAccountId && mccClients.length > 1 && (
                <span className="text-sm text-muted-foreground font-normal">
                  — {mccClients.find(c => c.id === subAccountId)?.name || subAccountId}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Sub-account selector for MCC */}
            {isGoogleAds && mccClients.length > 1 && (
              <div className="relative">
                <button
                  onClick={() => setSubAccountOpen(!subAccountOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  {loadingClients ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /> Carregando...</>
                  ) : (
                    <>
                      {subAccountId ? mccClients.find(c => c.id === subAccountId)?.name || subAccountId : 'Todas as contas'}
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
                {subAccountOpen && (
                  <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
                    <button
                      onClick={() => { setSubAccountId(null); setSubAccountOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${
                        !subAccountId ? 'text-primary bg-primary/5' : 'text-card-foreground'
                      }`}
                    >
                      Todas as contas (agregado)
                    </button>
                    {mccClients.map(c => (
                      <button
                        key={c.id}
                        onClick={() => { setSubAccountId(c.id); setSubAccountOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${
                          c.id === subAccountId ? 'text-primary bg-primary/5' : 'text-card-foreground'
                        }`}
                      >
                        {c.name} <span className="text-xs text-muted-foreground">({c.id})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Main client selector */}
            <div className="relative">
              <button
                onClick={() => setClientOpen(!clientOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
              >
                {client.name}
                <ChevronDown className="w-4 h-4" />
              </button>
              {clientOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                  {allClients.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setClientId(c.id); setClientOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${
                        c.id === clientId ? 'text-primary bg-primary/5' : 'text-card-foreground'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Date Filter */}
        <DateFilter value={period} onChange={setPeriod} />

        {/* Loading / Error */}
        {loading && (
          <div className="flex items-center justify-center py-12 gap-3 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Carregando dados do Google Ads...</span>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {!loading && kpi && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
              <KPICard title="Investimento" value={`${fmt(kpi.totalSpend)}`} prefix="R$ " icon={<DollarSign className="w-4 h-4" />} currentValue={kpi.totalSpend} previousValue={kpi.prevSpend} delay={0} />
              <KPICard title="Impressões" value={fmt(kpi.impressions)} icon={<Eye className="w-4 h-4" />} currentValue={kpi.impressions} previousValue={kpi.prevImpressions} delay={50} />
              <KPICard title="Cliques" value={fmt(kpi.clicks)} icon={<MousePointer className="w-4 h-4" />} currentValue={kpi.clicks} previousValue={kpi.prevClicks} delay={100} />
              <KPICard title="CTR" value={kpi.ctr.toFixed(1)} suffix="%" icon={<Percent className="w-4 h-4" />} currentValue={kpi.ctr} previousValue={kpi.prevCtr} delay={150} />
              <KPICard title="Conversões" value={fmt(kpi.conversions)} icon={<Target className="w-4 h-4" />} currentValue={kpi.conversions} previousValue={kpi.prevConversions} delay={200} />
              <KPICard title="CPA" value={kpi.cpa.toFixed(2)} prefix="R$ " icon={<BarChart3 className="w-4 h-4" />} currentValue={kpi.cpa} previousValue={kpi.prevCpa} delay={250} />
              <KPICard title="ROAS" value={kpi.roas.toFixed(1)} suffix="x" icon={<TrendingUp className="w-4 h-4" />} currentValue={kpi.roas} previousValue={kpi.prevRoas} delay={300} />
            </div>

            {/* Trend */}
            {trend && trend.length > 0 && <TrendChart data={trend} />}

            {/* Two-column analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {cities && cities.length > 0 && <CityTable data={cities} />}
              {ages && ages.length > 0 && <AgeChart data={ages} />}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {creatives && creatives.length > 0 && <CreativeGrid data={creatives} />}
              {genders && genders.length > 0 && <GenderChart data={genders} />}
            </div>

            {/* Ad Sets */}
            {adSets && adSets.length > 0 && <AdSetTable data={adSets} />}
          </>
        )}
      </main>

      {/* Chat */}
      <ChatPanel clientName={client.name} />
    </div>
  );
}
