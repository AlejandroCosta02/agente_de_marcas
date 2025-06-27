export type TipoMarca = 
  | "denominativa"
  | "mixta"
  | "figurativa"
  | "tridimensional"
  | "olfativa"
  | "sonora"
  | "movimiento"
  | "holografica"
  | "colectiva"
  | "certificacion";

export interface Titular {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Oposicion {
  id: string;
  text: string;
  completed: boolean;
  date: string;
}

export interface Anotacion {
  id: string;
  text: string;
  date: string;
}

export interface MarcaFile {
  id: string;
  filename: string;
  original_name: string;
  size: number;
  s3_url?: string;
  s3_key?: string;
  uploaded_at: string;
}

export interface Marca {
  id: string;
  marca: string;
  renovar: string;
  vencimiento: string;
  titulares: Titular[];
  titular?: Titular;
  oposicion: Oposicion[];
  anotacion: Anotacion[];
  clases: number[];
  tipoMarca: TipoMarca;
  createdAt: string;
  updatedAt: string;
}

export type MarcaSubmissionData = Omit<Marca, 'id' | 'createdAt' | 'updatedAt'>; 