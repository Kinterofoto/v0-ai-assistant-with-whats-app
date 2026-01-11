-- Tabla de usuarios/contactos de WhatsApp
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'pending'))
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent')),
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'product', 'alert')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de productos consultados
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  current_price DECIMAL(12, 2),
  original_price DECIMAL(12, 2),
  image_url TEXT,
  product_url TEXT,
  source TEXT DEFAULT 'mercadolibre',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de alertas de precios
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  target_price DECIMAL(12, 2),
  alert_type TEXT DEFAULT 'any' CHECK (alert_type IN ('below', 'above', 'any')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_at TIMESTAMPTZ
);

-- Tabla de consultas de productos por usuario
CREATE TABLE IF NOT EXISTS product_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_conversations_contact ON conversations(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_contact ON price_alerts(contact_id);
CREATE INDEX IF NOT EXISTS idx_product_queries_contact ON product_queries(contact_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Habilitar RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_queries ENABLE ROW LEVEL SECURITY;

-- Políticas públicas para lectura (el agente necesita acceso)
CREATE POLICY "Allow public read on contacts" ON contacts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on contacts" ON contacts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on contacts" ON contacts FOR UPDATE USING (true);

CREATE POLICY "Allow public read on conversations" ON conversations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on conversations" ON conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on conversations" ON conversations FOR UPDATE USING (true);

CREATE POLICY "Allow public read on messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Allow public insert on messages" ON messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public insert on products" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on products" ON products FOR UPDATE USING (true);

CREATE POLICY "Allow public read on price_alerts" ON price_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public insert on price_alerts" ON price_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on price_alerts" ON price_alerts FOR UPDATE USING (true);

CREATE POLICY "Allow public read on product_queries" ON product_queries FOR SELECT USING (true);
CREATE POLICY "Allow public insert on product_queries" ON product_queries FOR INSERT WITH CHECK (true);
