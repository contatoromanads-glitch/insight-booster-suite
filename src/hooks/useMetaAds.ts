import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { KPIData, TrendPoint, CityPerformance, AgePerformance, AdSetPerformance, GenderPerformance } from '@/data/mockData';

interface MetaAdsData {
  kpi: KPIData;
  trend: TrendPoint[];
  cities: CityPerformance[];
  ages: AgePerformance[];
  adSets: AdSetPerformance[];
  genders: GenderPerformance[];
}

export function useMetaAds() {
  const [data, setData] = useState<MetaAdsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (adAccountId: string, dateFrom?: string, dateTo?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('meta-ads', {
        body: {
          ad_account_id: adAccountId,
          date_from: dateFrom,
          date_to: dateTo,
        },
      });

      if (fnError) throw fnError;

      setData({
        kpi: result.kpi,
        trend: result.trend,
        cities: result.cities,
        ages: result.ages,
        adSets: result.adSets,
        genders: result.genders,
      });
    } catch (err: any) {
      console.error('Meta Ads fetch error:', err);
      setError(err.message || 'Erro ao buscar dados do Meta Ads');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData };
}
