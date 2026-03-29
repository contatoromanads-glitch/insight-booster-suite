import { useState } from 'react';
import { DollarSign, Eye, MousePointer, BarChart3, Target, TrendingUp, Percent, ChevronDown, LayoutDashboard } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { TrendChart } from '@/components/dashboard/TrendChart';
import { CityTable } from '@/components/dashboard/CityTable';
import { AgeChart } from '@/components/dashboard/AgeChart';
import { CreativeGrid } from '@/components/dashboard/CreativeGrid';
import { AdSetTable } from '@/components/dashboard/AdSetTable';
import { GenderChart } from '@/components/dashboard/GenderChart';
import { ChatPanel } from '@/components/dashboard/ChatPanel';
import { DateFilter } from '@/components/dashboard/DateFilter';
import {
  clients, kpiData, trendData, cityData, ageData,
  creativeData, adSetData, genderData,
} from '@/data/mockData';

export default function Index() {
  const [clientId, setClientId] = useState('1');
  const [period, setPeriod] = useState('30d');
  const [clientOpen, setClientOpen] = useState(false);

  const client = clients.find(c => c.id === clientId)!;
  const kpi = kpiData[clientId];
  const trend = trendData[clientId];
  const cities = cityData[clientId];
  const ages = ageData[clientId];
  const creatives = creativeData[clientId];
  const adSets = adSetData[clientId];
  const genders = genderData[clientId];

  const fmt = (n: number) => n >= 1000000 ? (n / 1000000).toFixed(1) + 'M' : n >= 1000 ? (n / 1000).toFixed(1) + 'K' : n.toString();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h1 className="text-base font-bold text-foreground">Dashboard de Campanhas</h1>
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
              <div className="absolute right-0 top-full mt-1 w-56 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                {clients.map(c => (
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
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Date Filter */}
        <DateFilter value={period} onChange={setPeriod} />

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
        <TrendChart data={trend} />

        {/* Two-column analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CityTable data={cities} />
          <AgeChart data={ages} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CreativeGrid data={creatives} />
          <GenderChart data={genders} />
        </div>

        {/* Ad Sets */}
        <AdSetTable data={adSets} />
      </main>

      {/* Chat */}
      <ChatPanel clientName={client.name} />
    </div>
  );
}
