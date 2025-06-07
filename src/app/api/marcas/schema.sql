CREATE TABLE IF NOT EXISTS marcas (
  id SERIAL PRIMARY KEY,
  marca VARCHAR(20) NOT NULL,
  acta VARCHAR(20) NOT NULL CHECK (acta ~ '^N\d+$'),
  resolucion VARCHAR(20) NOT NULL CHECK (resolucion ~ '^N\d+$'),
  renovar DATE NOT NULL,
  vencimiento DATE NOT NULL,
  titular_nombre VARCHAR(255) NOT NULL,
  titular_email VARCHAR(255) NOT NULL,
  titular_telefono VARCHAR(50) NOT NULL,
  anotaciones TEXT[] DEFAULT ARRAY[]::TEXT[],
  oposicion TEXT[] DEFAULT ARRAY[]::TEXT[],
  user_email VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 