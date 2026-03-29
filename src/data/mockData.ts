export interface Client {
  id: string;
  name: string;
}

export interface KPIData {
  totalSpend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  roas: number;
  prevSpend: number;
  prevImpressions: number;
  prevClicks: number;
  prevCtr: number;
  prevConversions: number;
  prevCpa: number;
  prevRoas: number;
}

export interface TrendPoint {
  date: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export interface CityPerformance {
  city: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface AgePerformance {
  ageGroup: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
}

export interface CreativePerformance {
  id: string;
  name: string;
  type: 'image' | 'video';
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  spend: number;
}

export interface AdSetPerformance {
  id: string;
  name: string;
  status: 'active' | 'paused';
  budget: number;
  impressions: number;
  clicks: number;
  ctr: number;
  conversions: number;
  cpa: number;
  spend: number;
  roas: number;
}

export interface GenderPerformance {
  gender: string;
  value: number;
  conversions: number;
}

export const clients: Client[] = [
  { id: '1', name: 'TechNova Solutions' },
  { id: '2', name: 'Gourmet Express' },
  { id: '3', name: 'FitLife Academy' },
];

export const kpiData: Record<string, KPIData> = {
  '1': {
    totalSpend: 24580, impressions: 1284000, clicks: 38520, ctr: 3.0, conversions: 1926, cpa: 12.76, roas: 4.2,
    prevSpend: 22100, prevImpressions: 1105000, prevClicks: 33150, prevCtr: 2.8, prevConversions: 1658, prevCpa: 13.33, prevRoas: 3.8,
  },
  '2': {
    totalSpend: 15230, impressions: 892000, clicks: 26760, ctr: 3.0, conversions: 1070, cpa: 14.23, roas: 3.5,
    prevSpend: 14800, prevImpressions: 830000, prevClicks: 24900, prevCtr: 2.9, prevConversions: 996, prevCpa: 14.86, prevRoas: 3.2,
  },
  '3': {
    totalSpend: 31400, impressions: 1520000, clicks: 50160, ctr: 3.3, conversions: 2508, cpa: 12.52, roas: 4.8,
    prevSpend: 28600, prevImpressions: 1380000, prevClicks: 44160, prevCtr: 3.1, prevConversions: 2208, prevCpa: 12.95, prevRoas: 4.3,
  },
};

export const trendData: Record<string, TrendPoint[]> = {
  '1': Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 2, i + 1).toISOString().slice(0, 10),
    spend: 700 + Math.random() * 400,
    impressions: 35000 + Math.random() * 15000,
    clicks: 1050 + Math.random() * 500,
    conversions: 50 + Math.random() * 30,
  })),
  '2': Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 2, i + 1).toISOString().slice(0, 10),
    spend: 400 + Math.random() * 300,
    impressions: 25000 + Math.random() * 10000,
    clicks: 750 + Math.random() * 400,
    conversions: 30 + Math.random() * 20,
  })),
  '3': Array.from({ length: 30 }, (_, i) => ({
    date: new Date(2026, 2, i + 1).toISOString().slice(0, 10),
    spend: 900 + Math.random() * 500,
    impressions: 42000 + Math.random() * 18000,
    clicks: 1400 + Math.random() * 600,
    conversions: 70 + Math.random() * 40,
  })),
};

export const cityData: Record<string, CityPerformance[]> = {
  '1': [
    { city: 'São Paulo', impressions: 320000, clicks: 9600, conversions: 480, spend: 6145 },
    { city: 'Rio de Janeiro', impressions: 195000, clicks: 5850, conversions: 292, spend: 3728 },
    { city: 'Belo Horizonte', impressions: 148000, clicks: 4440, conversions: 222, spend: 2834 },
    { city: 'Curitiba', impressions: 128000, clicks: 3840, conversions: 192, spend: 2449 },
    { city: 'Brasília', impressions: 115000, clicks: 3450, conversions: 172, spend: 2200 },
  ],
  '2': [
    { city: 'São Paulo', impressions: 250000, clicks: 7500, conversions: 300, spend: 4280 },
    { city: 'Campinas', impressions: 132000, clicks: 3960, conversions: 158, spend: 2250 },
    { city: 'Porto Alegre', impressions: 118000, clicks: 3540, conversions: 142, spend: 2020 },
    { city: 'Recife', impressions: 98000, clicks: 2940, conversions: 118, spend: 1680 },
    { city: 'Salvador', impressions: 89000, clicks: 2670, conversions: 107, spend: 1520 },
  ],
  '3': [
    { city: 'São Paulo', impressions: 380000, clicks: 12540, conversions: 627, spend: 7850 },
    { city: 'Rio de Janeiro', impressions: 228000, clicks: 7524, conversions: 376, spend: 4710 },
    { city: 'Florianópolis', impressions: 175000, clicks: 5775, conversions: 289, spend: 3610 },
    { city: 'Fortaleza', impressions: 152000, clicks: 5016, conversions: 251, spend: 3140 },
    { city: 'Goiânia', impressions: 133000, clicks: 4389, conversions: 219, spend: 2750 },
  ],
};

export const ageData: Record<string, AgePerformance[]> = {
  '1': [
    { ageGroup: '18-24', impressions: 256800, clicks: 7704, conversions: 308, spend: 3937 },
    { ageGroup: '25-34', impressions: 385200, clicks: 11556, conversions: 578, spend: 7374 },
    { ageGroup: '35-44', impressions: 321000, clicks: 9630, conversions: 481, spend: 6145 },
    { ageGroup: '45-54', impressions: 192600, clicks: 5778, conversions: 346, spend: 4424 },
    { ageGroup: '55+', impressions: 128400, clicks: 3852, conversions: 213, spend: 2700 },
  ],
  '2': [
    { ageGroup: '18-24', impressions: 178400, clicks: 5352, conversions: 171, spend: 2436 },
    { ageGroup: '25-34', impressions: 267600, clicks: 8028, conversions: 321, spend: 4569 },
    { ageGroup: '35-44', impressions: 223000, clicks: 6690, conversions: 268, spend: 3808 },
    { ageGroup: '45-54', impressions: 133800, clicks: 4014, conversions: 201, spend: 2861 },
    { ageGroup: '55+', impressions: 89200, clicks: 2676, conversions: 109, spend: 1556 },
  ],
  '3': [
    { ageGroup: '18-24', impressions: 380000, clicks: 12540, conversions: 627, spend: 7850 },
    { ageGroup: '25-34', impressions: 456000, clicks: 15048, conversions: 752, spend: 9420 },
    { ageGroup: '35-44', impressions: 304000, clicks: 10032, conversions: 502, spend: 6280 },
    { ageGroup: '45-54', impressions: 228000, clicks: 7524, conversions: 376, spend: 4710 },
    { ageGroup: '55+', impressions: 152000, clicks: 5016, conversions: 251, spend: 3140 },
  ],
};

export const creativeData: Record<string, CreativePerformance[]> = {
  '1': [
    { id: 'c1', name: 'Banner Principal', type: 'image', impressions: 420000, clicks: 12600, ctr: 3.0, conversions: 630, spend: 8052 },
    { id: 'c2', name: 'Vídeo Institucional', type: 'video', impressions: 350000, clicks: 11550, ctr: 3.3, conversions: 577, spend: 7374 },
    { id: 'c3', name: 'Carrossel Produtos', type: 'image', impressions: 280000, clicks: 8400, ctr: 3.0, conversions: 420, spend: 5364 },
    { id: 'c4', name: 'Story Promo', type: 'video', impressions: 234000, clicks: 5976, ctr: 2.6, conversions: 299, spend: 3790 },
  ],
  '2': [
    { id: 'c5', name: 'Menu Destaque', type: 'image', impressions: 312000, clicks: 9360, ctr: 3.0, conversions: 374, spend: 5330 },
    { id: 'c6', name: 'Vídeo Chef', type: 'video', impressions: 245000, clicks: 8085, ctr: 3.3, conversions: 323, spend: 4600 },
    { id: 'c7', name: 'Oferta Semanal', type: 'image', impressions: 198000, clicks: 5940, ctr: 3.0, conversions: 238, spend: 3380 },
    { id: 'c8', name: 'Reels Delivery', type: 'video', impressions: 137000, clicks: 3375, ctr: 2.5, conversions: 135, spend: 1920 },
  ],
  '3': [
    { id: 'c9', name: 'Treino Completo', type: 'video', impressions: 480000, clicks: 16800, ctr: 3.5, conversions: 840, spend: 10520 },
    { id: 'c10', name: 'Antes e Depois', type: 'image', impressions: 400000, clicks: 13200, ctr: 3.3, conversions: 660, spend: 8260 },
    { id: 'c11', name: 'Plano Premium', type: 'image', impressions: 340000, clicks: 10880, ctr: 3.2, conversions: 544, spend: 6810 },
    { id: 'c12', name: 'Depoimento Aluno', type: 'video', impressions: 300000, clicks: 9280, ctr: 3.1, conversions: 464, spend: 5810 },
  ],
};

export const adSetData: Record<string, AdSetPerformance[]> = {
  '1': [
    { id: 'as1', name: 'Prospecção - Lookalike', status: 'active', budget: 500, impressions: 520000, clicks: 15600, ctr: 3.0, conversions: 780, cpa: 12.60, spend: 9828, roas: 4.5 },
    { id: 'as2', name: 'Retargeting - Website', status: 'active', budget: 350, impressions: 384000, clicks: 11520, ctr: 3.0, conversions: 576, cpa: 11.90, spend: 6854, roas: 5.1 },
    { id: 'as3', name: 'Interesse - Tecnologia', status: 'paused', budget: 300, impressions: 256000, clicks: 7680, ctr: 3.0, conversions: 384, cpa: 14.20, spend: 5453, roas: 3.2 },
    { id: 'as4', name: 'Broad - Nacional', status: 'active', budget: 200, impressions: 124000, clicks: 3720, ctr: 3.0, conversions: 186, cpa: 13.15, spend: 2445, roas: 3.6 },
  ],
  '2': [
    { id: 'as5', name: 'Delivery - Raio 5km', status: 'active', budget: 400, impressions: 380000, clicks: 11400, ctr: 3.0, conversions: 456, cpa: 13.40, spend: 6110, roas: 3.8 },
    { id: 'as6', name: 'Retargeting - App', status: 'active', budget: 280, impressions: 268000, clicks: 8040, ctr: 3.0, conversions: 322, cpa: 13.90, spend: 4476, roas: 3.5 },
    { id: 'as7', name: 'Foodies - Instagram', status: 'active', budget: 250, impressions: 244000, clicks: 7320, ctr: 3.0, conversions: 292, cpa: 15.90, spend: 4644, roas: 2.9 },
  ],
  '3': [
    { id: 'as8', name: 'Fitness Enthusiasts', status: 'active', budget: 600, impressions: 580000, clicks: 19140, ctr: 3.3, conversions: 957, cpa: 11.80, spend: 11292, roas: 5.2 },
    { id: 'as9', name: 'Retargeting - Free Trial', status: 'active', budget: 450, impressions: 420000, clicks: 13860, ctr: 3.3, conversions: 693, cpa: 12.10, spend: 8385, roas: 4.9 },
    { id: 'as10', name: 'Lookalike - Subscribers', status: 'active', budget: 380, impressions: 340000, clicks: 11220, ctr: 3.3, conversions: 561, cpa: 13.50, spend: 7573, roas: 4.1 },
    { id: 'as11', name: 'Yoga & Wellness', status: 'paused', budget: 200, impressions: 180000, clicks: 5940, ctr: 3.3, conversions: 297, cpa: 13.90, spend: 4150, roas: 3.8 },
  ],
};

export const genderData: Record<string, GenderPerformance[]> = {
  '1': [
    { gender: 'Masculino', value: 58, conversions: 1117 },
    { gender: 'Feminino', value: 38, conversions: 732 },
    { gender: 'Outros', value: 4, conversions: 77 },
  ],
  '2': [
    { gender: 'Masculino', value: 42, conversions: 449 },
    { gender: 'Feminino', value: 54, conversions: 578 },
    { gender: 'Outros', value: 4, conversions: 43 },
  ],
  '3': [
    { gender: 'Masculino', value: 52, conversions: 1304 },
    { gender: 'Feminino', value: 44, conversions: 1104 },
    { gender: 'Outros', value: 4, conversions: 100 },
  ],
};
