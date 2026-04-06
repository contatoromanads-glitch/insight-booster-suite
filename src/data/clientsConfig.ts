export interface ClientConfig {
  id: string;
  name: string;
  googleAdsId?: string; // Customer ID without dashes
  metaAdsId?: string;   // Ad account ID without act_ prefix
}

export const clientsConfig: ClientConfig[] = [
  { id: 'client-1', name: 'Cliente 1', googleAdsId: '7089560280', metaAdsId: '859992728696567' },
  { id: 'client-2', name: 'Cliente 2', metaAdsId: '1623634851792316' },
  { id: 'client-3', name: 'Oria Stones', metaAdsId: '1780222312733314' },
  { id: 'client-4', name: 'Fotógrafo', googleAdsId: '590413902' },
  { id: 'client-5', name: 'Cliente 5', metaAdsId: '538138795501885' },
  { id: 'client-6', name: 'Visualize', metaAdsId: '267673872217842' },
  { id: 'client-7', name: 'Petro', metaAdsId: '399674609491650' },
  { id: 'client-8', name: 'Cliente 8', metaAdsId: '1832621880933216' },
  { id: 'client-9', name: 'Instituto Orcelli', metaAdsId: '575625584106215' },
  { id: 'client-10', name: 'Charger', googleAdsId: '77466519', metaAdsId: '897510662577449' },
  { id: 'client-11', name: 'Cliente 11', metaAdsId: '507029406029386' },
  { id: 'client-12', name: 'Cliente 12', metaAdsId: '2571363093249272' },
  { id: 'client-13', name: 'Canto dos Passaros', googleAdsId: '7943734013', metaAdsId: '1202953261493330' },
  { id: 'client-14', name: 'Hotel Central CG', googleAdsId: '7553129742' },
  { id: 'client-15', name: 'Peniel', googleAdsId: '7790625599', metaAdsId: '436067475434404' },
  { id: 'client-16', name: 'Baía Formosa', googleAdsId: '7995524112' },
  { id: 'client-17', name: 'Cliente 17' },
  { id: 'client-18', name: 'Pousada da Praia', googleAdsId: '1303889755' },
  { id: 'client-19', name: 'Solemar', googleAdsId: '8103103128' },
  { id: 'client-20', name: 'Cliente 20' },
  { id: 'client-21', name: 'Baterias', googleAdsId: '8015784707' },
  { id: 'client-22', name: 'Cliente 22', metaAdsId: '1762293927817299' },
];

// MCC parent account ID (used as login-customer-id header)
export const MCC_CUSTOMER_ID = '7717152917';
