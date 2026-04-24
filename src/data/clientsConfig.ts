export interface ClientConfig {
  id: string;
  name: string;
  googleAdsId?: string;
  metaAdsId?: string;
  metaBmToken?: 'bm1' | 'bm2';
}

export const clientsConfig: ClientConfig[] = [
  { id: 'client-1',  name: 'Higieniza',               googleAdsId: '972909978',    metaAdsId: '596865298882846',   metaBmToken: 'bm2' },
  { id: 'client-2',  name: 'Ótica Areias',             googleAdsId: '7089560280',   metaAdsId: '859992728696567',   metaBmToken: 'bm1' },
  { id: 'client-3',  name: 'Supripostos',                                           metaAdsId: '1623634851792316',  metaBmToken: 'bm1' },
  { id: 'client-4',  name: 'Vitória Stones',                                        metaAdsId: '1780222312733314',  metaBmToken: 'bm2' },
  { id: 'client-5',  name: 'Bruno Fotógrafo',          googleAdsId: '590413902' },
  { id: 'client-6',  name: 'Pérola Pratas',                                         metaAdsId: '538138795501885',   metaBmToken: 'bm1' },
  { id: 'client-7',  name: 'Atualize',                                              metaAdsId: '267673872217842',   metaBmToken: 'bm1' },
  { id: 'client-8',  name: 'Connect Petro',                                         metaAdsId: '399674609491650',   metaBmToken: 'bm1' },
  { id: 'client-9',  name: 'Morada do Rio',            googleAdsId: '7445150795',   metaAdsId: '1832621880933216',  metaBmToken: 'bm2' },
  { id: 'client-10', name: 'Instituto Orcelli',                                     metaAdsId: '575625584106215' },
  { id: 'client-11', name: 'Fast Charger',             googleAdsId: '77466519',     metaAdsId: '897510662577449',   metaBmToken: 'bm1' },
  { id: 'client-12', name: 'Guarde Já',                googleAdsId: '1130322136',   metaAdsId: '507029406029386' },
  { id: 'client-13', name: 'Bispo',                                                 metaAdsId: '2571363093249272' },
  { id: 'client-14', name: 'Canto dos Pássaros',       googleAdsId: '7943734013',   metaAdsId: '1202953261493330' },
  { id: 'client-15', name: 'Hotel Central CG',         googleAdsId: '7553129742' },
  { id: 'client-16', name: 'Resort Peniel',            googleAdsId: '7790625599',   metaAdsId: '436067475434404',   metaBmToken: 'bm2' },
  { id: 'client-17', name: 'Recanto Baía Formosa',     googleAdsId: '7995524112' },
  { id: 'client-18', name: 'Pousada Kadosh',           googleAdsId: '7492820808' },
  { id: 'client-19', name: 'Capitão da Praia',         googleAdsId: '1303889755' },
  { id: 'client-20', name: 'Recanto Solemar',          googleAdsId: '8103103128' },
  { id: 'client-21', name: 'Chalés Urubici',           googleAdsId: '8030691096' },
  { id: 'client-22', name: 'Route Baterias',           googleAdsId: '8015784707' },
  { id: 'client-23', name: 'Beniba',                   googleAdsId: '8109180717',   metaAdsId: '1762293927817299' },
  { id: 'client-24', name: 'Casarão Solar Aguilar',                                 metaAdsId: '3076233885893649',  metaBmToken: 'bm2' },
  { id: 'client-25', name: 'Pousada Costa Azul Recreio',                            metaAdsId: '909740702051674',   metaBmToken: 'bm2' },
  { id: 'client-26', name: 'ATHS Investimentos',                                    metaAdsId: '1289602133054345',  metaBmToken: 'bm1' },
];

export const MCC_CUSTOMER_ID = '7717152917';
