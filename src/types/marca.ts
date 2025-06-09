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
  fullName: string;
  email: string;
  phone: string;
}

export interface Oposicion {
  id: string;
  text: string;
  date: string;
  completed: boolean;
}

export interface Anotacion {
  id: string;
  text: string;
  date: string;
}

export interface Marca {
  id: string;
  name: string;
  acta: string;
  resolucion: string;
  renovar: string;
  vencimiento: string;
  titular: Titular;
  oposicion: Oposicion[];
  anotacion: Anotacion[];
  clases: number[];
  tipoMarca: TipoMarca;
  createdAt: string;
  updatedAt: string;
}

export type MarcaSubmissionData = Omit<Marca, 'id' | 'createdAt' | 'updatedAt'>; 