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
  name: string;
  description: string;
  status: string;
  oposicion: Oposicion[];
  anotacion: Anotacion[];
  createdAt: Date;
  updatedAt: Date;
  user_email: string;
  acta: string;
  resolucion: string;
  clases: number[];
  tipoMarca: TipoMarca;
}

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

export interface Anotacion {
  text: string;
  completed: boolean;
}

export interface MarcaSubmissionData {
  name: string;
  description: string;
  status: string;
  acta: string;
  resolucion: string;
  clases: number[];
  tipoMarca: TipoMarca;
} 