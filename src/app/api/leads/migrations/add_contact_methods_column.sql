-- Add contactMethods column to Lead table
ALTER TABLE "Lead" ADD COLUMN "contactMethods" JSONB DEFAULT '[]'::jsonb; 