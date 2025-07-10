export interface Lead {
  id: string;
  nombre: string;
  direccion?: string | null;
  website?: string | null;
  socialMedia?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  contacted: boolean;
  estado: string;
  meetingSet: boolean;
  contactMethods?: string[]; // Array of contact methods used
  futureContactDate?: string | null; // ISO date string for future contact
  userId: number;
  created_at: string;
  updated_at: string;
}

export interface LeadSubmissionData {
  nombre: string;
  direccion?: string;
  website?: string;
  socialMedia?: string;
  whatsapp?: string;
  email?: string;
}

export type LeadEstado = 
  | 'nuevo'
  | 'sin_respuesta'
  | 'cancelado'
  | 'en_espera'
  | 'agente_detectado';

export const LEAD_ESTADOS: Record<LeadEstado, { label: string; emoji: string; color: string }> = {
  nuevo: { label: 'Nuevo cliente confirmado', emoji: '🟢', color: 'text-green-600' },
  sin_respuesta: { label: 'Sin respuesta aún', emoji: '🟡', color: 'text-yellow-600' },
  cancelado: { label: 'Lead cancelado o no interesado', emoji: '🔴', color: 'text-red-600' },
  en_espera: { label: 'En espera para futura renovación', emoji: '🔵', color: 'text-blue-600' },
  agente_detectado: { label: 'Agente actual detectado (no contactar)', emoji: '🧩', color: 'text-purple-600' }
};

export const CONTACT_METHODS = {
  whatsapp: { label: 'WhatsApp', emoji: '📱', color: 'text-green-600' },
  email: { label: 'Email', emoji: '📧', color: 'text-blue-600' },
  phone: { label: 'Llamada telefónica', emoji: '📞', color: 'text-purple-600' },
  social: { label: 'Red social', emoji: '🌐', color: 'text-pink-600' },
  in_person: { label: 'En persona', emoji: '👥', color: 'text-orange-600' },
  website: { label: 'Website', emoji: '🌍', color: 'text-gray-600' }
}; 