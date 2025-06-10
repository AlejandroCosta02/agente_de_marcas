-- Remove acta and resolucion columns as they are no longer needed
ALTER TABLE marcas
DROP COLUMN acta,
DROP COLUMN resolucion; 