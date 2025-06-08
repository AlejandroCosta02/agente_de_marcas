CREATE TABLE IF NOT EXISTS marcas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca VARCHAR(20) NOT NULL,
  acta INTEGER NOT NULL CHECK (acta > 0 AND acta < 100000000),
  resolucion INTEGER NOT NULL CHECK (resolucion > 0 AND resolucion < 100000000),
  renovar DATE NOT NULL,
  vencimiento DATE NOT NULL,
  titular_nombre VARCHAR(100) NOT NULL,
  titular_email VARCHAR(100) NOT NULL,
  titular_telefono VARCHAR(20) NOT NULL,
  anotaciones TEXT[] DEFAULT '{}',
  oposicion TEXT[] DEFAULT '{}',
  user_email VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 