export interface Titular {
  fullName: string;
  email: string;
  phone: string;
}

export interface Marca {
  id: string;
  marca: string;
  acta: number;
  resolucion: number;
  renovar: string;
  vencimiento: string;
  titular: Titular;
  anotaciones: string[];
  oposicion: string[];
  user_email: string;
  created_at: string;
  updated_at: string;
}

export interface MarcaSubmissionData {
  marca: string;
  acta: string;
  resolucion: string;
  renovar: string;
  vencimiento: string;
  titular: Titular;
  anotaciones: string[];
  oposicion: string[];
} 