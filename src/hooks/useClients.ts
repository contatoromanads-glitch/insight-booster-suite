import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ClientConfig } from '@/data/clientsConfig'; // To reuse the type if possible, or define locally

export function useClients() {
  const [clients, setClients] = useState<ClientConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const { data, error: err } = await supabase
          .from('clients')
          .select('*')
          .order('name');
          
        if (err) {
          throw err;
        }

        // Map the snake_case DB columns to the camelCase ClientConfig interface
        const formattedClients: ClientConfig[] = (data || []).map(row => ({
          id: row.id,
          name: row.name,
          googleAdsId: row.google_ads_id,
          metaAdsId: row.meta_ads_id,
          metaBmToken: row.meta_bm_token as 'bm1' | 'bm2' | 'bm3' | undefined
        }));

        setClients(formattedClients);
      } catch (err: any) {
        console.error('Error fetching clients:', err);
        setError(err.message || 'Erro ao buscar clientes');
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  return { clients, loading, error };
}
