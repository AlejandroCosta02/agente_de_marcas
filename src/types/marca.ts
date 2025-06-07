export interface Marca {
  id: string;
  nombre: string;
  numero: string;
  anotaciones: string[];
  oposiciones: boolean;
  user_email: string;
  created_at: string;
  updated_at: string;
}

export interface MarcaSubmissionData {
  nombre: string;
  numero: string;
  anotaciones: string[];
  oposiciones: boolean;
} 