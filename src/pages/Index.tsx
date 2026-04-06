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
import { clientsConfig, MCC_CUSTOMER_ID } from '@/data/clientsConfig';

export default function Index() {
  const [selectedClientId, setSelectedClientId] = useState('all');
  const [period, setPeriod] = useState('30d');
  const [clientOpen, setClientOpen] = useState(false);

  const { data: gadsData, loading: gadsLoading, error: gadsError, fetchData: fetchGads } = useGoogleAds();
  const { data: metaData, loading: metaLoading, error: metaError, fetchData: fetchMeta } = useMetaAds();

  const isAll = selectedClientId === 'all';
  const client = isAll ? null : clientsConfig.find(c => c.id === selectedClientId)!;
  const displayName = isAll ? 'Todos os Clientes' : client!.name;
  const hasGoogle = isAll || !!client?.googleAdsId;
  const hasMeta = isAll || !!client?.metaAdsId;

  const loading = (hasGoogle && gadsLoading) || (hasMeta && metaLoading);

  const getDateRange = useCallback(() => {
    const now = new Date();
    const to = now.toISOString().slice(0, 10);
    let from: string;
    switch (period) {
      case 'today': from = to; break;
      case '7d': from = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10); break;
      case 'month': from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10); break;
      case 'year': from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10); break;
      default: from = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10); break;
    }
    return { from, to };
  }, [period]);

  // Fetch data when client or period changes
  useEffect(() => {
    const { from, to } = getDateRange();
    if (isAll) {
      fetchGads(MCC_CUSTOMER_ID, from, to);
      fetchMeta(undefined, from, to);
    } else {
      if (client?.googleAdsId) {
        fetchGads(MCC_CUSTOMER_ID, from, to, client.googleAdsId);
      }
      if (client?.metaAdsId) {
        fetchMeta(client.metaAdsId, from, to);
      }
    }
  }, [selectedClientId, period]);

  const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

  const renderPlatformSection = (
    label: string,
    data: any,
    platformLoading: boolean,
    platformError: string | null,
  ) => {
    if (platformLoading) {
      return (
        <div className="flex items-center justify-center py-8 gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Carregando dados do {label}...</span>
        </div>
      );
    }

    if (platformError) {
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          <strong>{label} — Erro:</strong> {platformError}
        </div>
      );
    }

    if (!data?.kpi) return null;

    const { kpi, trend, cities, ages, adSets, genders } = data;

    return (
      <div className="space-y-6">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{label}</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          <KPICard title="Investimento" value={`${fmt(kpi.totalSpend)}`} prefix="R$ " icon={<DollarSign className="w-4 h-4" />} currentValue={kpi.totalSpend} previousValue={kpi.prevSpend} delay={0} />
          <KPICard title="Impressões" value={fmt(kpi.impressions)} icon={<Eye className="w-4 h-4" />} currentValue={kpi.impressions} previousValue={kpi.prevImpressions} delay={50} />
          <KPICard title="Cliques" value={fmt(kpi.clicks)} icon={<MousePointer className="w-4 h-4" />} currentValue={kpi.clicks} previousValue={kpi.prevClicks} delay={100} />
          <KPICard title="CTR" value={kpi.ctr.toFixed(1)} suffix="%" icon={<Percent className="w-4 h-4" />} currentValue={kpi.ctr} previousValue={kpi.prevCtr} delay={150} />
          <KPICard title="Conversões" value={fmt(kpi.conversions)} icon={<Target className="w-4 h-4" />} currentValue={kpi.conversions} previousValue={kpi.prevConversions} delay={200} />
          <KPICard title="CPA" value={kpi.cpa.toFixed(2)} prefix="R$ " icon={<BarChart3 className="w-4 h-4" />} currentValue={kpi.cpa} previousValue={kpi.prevCpa} delay={250} />
          <KPICard title="ROAS" value={kpi.roas.toFixed(1)} suffix="x" icon={<TrendingUp className="w-4 h-4" />} currentValue={kpi.roas} previousValue={kpi.prevRoas} delay={300} />
        </div>

        {trend && trend.length > 0 && <TrendChart data={trend} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cities && cities.length > 0 && <CityTable data={cities} />}
          {ages && ages.length > 0 && <AgeChart data={ages} />}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {genders && genders.length > 0 && <GenderChart data={genders} />}
        </div>

        {adSets && adSets.length > 0 && <AdSetTable data={adSets} />}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <div>
              <h1 className="text-base font-bold text-foreground">{displayName}</h1>
              <p className="text-xs text-muted-foreground">Dashboard de Campanhas</p>
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setClientOpen(!clientOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-sm font-medium text-secondary-foreground hover:bg-accent transition-colors"
            >
              {client.name}
              <ChevronDown className="w-4 h-4" />
            </button>
            {clientOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50 max-h-80 overflow-y-auto">
                {clientsConfig.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setSelectedClientId(c.id); setClientOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-accent transition-colors ${
                      c.id === selectedClientId ? 'text-primary bg-primary/5' : 'text-card-foreground'
                    }`}
                  >
                    <span>{c.name}</span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {c.googleAdsId && c.metaAdsId ? 'Google + Meta' : c.googleAdsId ? 'Google' : c.metaAdsId ? 'Meta' : '—'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <DateFilter value={period} onChange={setPeriod} />

        {!hasGoogle && !hasMeta && (
          <div className="text-center py-12 text-muted-foreground">
            Este cliente não possui contas de anúncios vinculadas.
          </div>
        )}

        {hasGoogle && renderPlatformSection('Google Ads', gadsData, gadsLoading, gadsError)}
        {hasMeta && renderPlatformSection('Meta Ads', metaData, metaLoading, metaError)}
      </main>

      <ChatPanel clientName={client.name} />
    </div>
  );
}
