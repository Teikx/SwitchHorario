-- ========================================================
-- SwitchHorario - Esquema de Base de Datos para Supabase
-- ========================================================
-- Copia y pega este contenido en el SQL Editor de Supabase
-- y presiona RUN para crear las tablas necesarias.

-- 1. Tabla de Jugadores / Primos
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar TEXT NOT NULL DEFAULT 'mario',
  color TEXT NOT NULL DEFAULT '#FF3C28',
  pin_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Reservas / Turnos
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES players(id) ON DELETE CASCADE NOT NULL,
  game_title TEXT NOT NULL DEFAULT 'Cualquiera',
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  is_open_ended BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para optimizar las consultas de calendario por fecha
CREATE INDEX IF NOT EXISTS idx_bookings_time ON bookings (start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_player ON bookings (player_id);

-- Habilitar Row Level Security (RLS) pero permitir acceso público anónimo (lectura y escritura para la familia)
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de jugadores" ON players
  FOR SELECT USING (true);

CREATE POLICY "Permitir insercion y edicion de jugadores" ON players
  FOR ALL USING (true);

CREATE POLICY "Permitir lectura publica de reservas" ON bookings
  FOR SELECT USING (true);

CREATE POLICY "Permitir crear y modificar reservas" ON bookings
  FOR ALL USING (true);

-- 3. Datos iniciales de ejemplo (Primos por defecto)
INSERT INTO players (name, avatar, color, pin_hash) VALUES
  ('Carlos', 'mario', '#FF3C28', '1234'),
  ('Mateo', 'luigi', '#10E364', '1234'),
  ('Lucía', 'peach', '#FF69B4', '1234'),
  ('Santi', 'link', '#00C3E3', '1234')
ON CONFLICT DO NOTHING;
