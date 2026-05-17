-- Fase 1: clients persistence
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  google_ads_id text,
  meta_ads_id text,
  meta_bm_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- For now: dashboard interno sem auth — leitura pública, escrita pública
-- Quando adicionar auth (futuro), restringir para admins
CREATE POLICY "Anyone can read clients"
  ON public.clients FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert clients"
  ON public.clients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update clients"
  ON public.clients FOR UPDATE
  USING (true);

CREATE POLICY "Anyone can delete clients"
  ON public.clients FOR DELETE
  USING (true);

-- Trigger para manter updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Seed dos 23 clientes existentes
INSERT INTO public.clients (name, google_ads_id, meta_ads_id) VALUES
  ('Higieniza', '972909978', NULL),
  ('Ótica Areias', '7089560280', '859992728696567'),
  ('Supripostos', NULL, '1623634851792316'),
  ('Vitória Stones', NULL, '1780222312733314'),
  ('Bruno Fotógrafo', '590413902', NULL),
  ('Pérola Pratas', NULL, '538138795501885'),
  ('Atualize', NULL, '267673872217842'),
  ('Connect Petro', NULL, '399674609491650'),
  ('Morada do Rio', '7445150795', '1832621880933216'),
  ('Instituto Orcelli', NULL, '575625584106215'),
  ('Fast Charger', '77466519', '897510662577449'),
  ('Guarde Já', '1130322136', '507029406029386'),
  ('Bispo', NULL, '2571363093249272'),
  ('Canto dos Pássaros', '7943734013', '1202953261493330'),
  ('Hotel Central CG', '7553129742', NULL),
  ('Resort Peniel', '7790625599', '436067475434404'),
  ('Recanto Baía Formosa', '7995524112', NULL),
  ('Pousada Kadosh', '7492820808', NULL),
  ('Capitão da Praia', '1303889755', NULL),
  ('Recanto Solemar', '8103103128', NULL),
  ('Chalés Urubici', '8030691096', NULL),
  ('Route Baterias', '8015784707', NULL),
  ('Beniba', '8109180717', '1762293927817299');