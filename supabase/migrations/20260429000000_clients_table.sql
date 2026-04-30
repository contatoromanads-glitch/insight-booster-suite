-- Create the clients table
CREATE TABLE IF NOT EXISTS public.clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    google_ads_id TEXT,
    meta_ads_id TEXT,
    meta_bm_token TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for authenticated users
CREATE POLICY "Allow read access for authenticated users" ON public.clients
    FOR SELECT USING (true); -- Change to authenticated role in production if needed

-- Insert the current clients data
INSERT INTO public.clients (id, name, google_ads_id, meta_ads_id, meta_bm_token) VALUES
('client-1', 'Higieniza', '972909978', '596865298882846', 'bm2'),
('client-2', 'Ótica Areias', '7089560280', '859992728696567', 'bm1'),
('client-3', 'Supripostos', NULL, '1623634851792316', 'bm1'),
('client-4', 'Vitória Stones', NULL, '1780222312733314', 'bm2'),
('client-5', 'Bruno Fotógrafo', '590413902', NULL, NULL),
('client-6', 'Pérola Pratas', NULL, '538138795501885', 'bm1'),
('client-7', 'Atualize', NULL, '267673872217842', 'bm1'),
('client-8', 'Connect Petro', NULL, '399674609491650', 'bm1'),
('client-9', 'Morada do Rio', '7445150795', '1832621880933216', 'bm2'),
('client-10', 'Instituto Orcelli', NULL, '575625584106215', NULL),
('client-11', 'Fast Charger', '77466519', '897510662577449', 'bm1'),
('client-12', 'Guarde Já', '1130322136', '507029406029386', NULL),
('client-13', 'Bispo', NULL, '2571363093249272', NULL),
('client-14', 'Canto dos Pássaros', '7943734013', '1202953261493330', NULL),
('client-15', 'Hotel Central CG', '7553129742', NULL, NULL),
('client-16', 'Resort Peniel', '7790625599', '436067475434404', 'bm2'),
('client-17', 'Recanto Baía Formosa', '7995524112', NULL, NULL),
('client-18', 'Pousada Kadosh', '7492820808', NULL, NULL),
('client-19', 'Capitão da Praia', '1303889755', NULL, NULL),
('client-20', 'Recanto Solemar', '8103103128', NULL, NULL),
('client-21', 'Chalés Urubici', '8030691096', NULL, NULL),
('client-22', 'Route Baterias', '8015784707', NULL, NULL),
('client-23', 'Beniba', '8109180717', '1762293927817299', NULL),
('client-24', 'Casarão Solar Aguilar', NULL, '3076233885893649', 'bm2'),
('client-25', 'Pousada Costa Azul Recreio', NULL, '909740702051674', 'bm2'),
('client-26', 'ATHS Investimentos', NULL, '1289602133054345', 'bm1')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    google_ads_id = EXCLUDED.google_ads_id,
    meta_ads_id = EXCLUDED.meta_ads_id,
    meta_bm_token = EXCLUDED.meta_bm_token;
