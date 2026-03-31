import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { KPIData, TrendPoint, CityPerformance, AgePerformance, AdSetPerformance, GenderPerformance } from '@/data/mockData';

interface GoogleAdsData {
  kpi: KPIData;
  trend: TrendPoint[];
  cities: CityPerformance[];
  ages: AgePerformance[];
  adSets: AdSetPerformance[];
  genders: GenderPerformance[];
}

export interface GoogleAdsClient {
  id: string;
  name: string;
}

export function useGoogleAds() {
  const [data, setData] = useState<GoogleAdsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<GoogleAdsClient[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  const fetchClients = async (customerId: string) => {
    setLoadingClients(true);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('google-ads', {
        body: { customer_id: customerId, mode: 'list_clients' },
      });
      if (fnError) throw fnError;
      if (result.warning) {
        console.warn('MCC warning:', result.warning);
      }
      setClients(result.clients || []);
    } catch (err: any) {
      console.error('Failed to list MCC clients:', err);
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchData = async (customerId: string, dateFrom?: string, dateTo?: string, clientId?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('google-ads', {
        body: {
          customer_id: customerId,
          date_from: dateFrom,
          date_to: dateTo,
          client_id: clientId,
        },
      });

      if (fnError) throw fnError;

      setData({
        kpi: {
          ...result.kpi,
          prevSpend: 0,
          prevImpressions: 0,
          prevClicks: 0,
          prevCtr: 0,
          prevConversions: 0,
          prevCpa: 0,
          prevRoas: 0,
        },
        trend: result.trend,
        cities: result.cities,
        ages: result.ages,
        adSets: result.adSets,
        genders: result.genders,
      });
    } catch (err: any) {
      console.error('Google Ads fetch error:', err);
      setError(err.message || 'Erro ao buscar dados do Google Ads');
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fetchData, clients, loadingClients, fetchClients };
}
