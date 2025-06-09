export interface Titular {
  fullName: string;
  email: string;
  phone: string;
}

export interface Oposicion {
  text: string;
  completed: boolean;
}

export interface Marca {
  id: string;
  nombre: string;
  marca: string;
  acta: string;
  clase: string;
  estado: string;
  resolucion: string;
  renovar: string;
  vencimiento: string;
  anotaciones: string[];
  oposicion: Oposicion[];
  user_email: string;
  titular: Titular;
  titularId: string;
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