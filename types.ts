export interface Client {
  id: string;
  nombre_fiscal: string;
  cif_nif: string;
  direccion: string | null;
  email: string | null;
  telefono: string | null;
}

export enum InvoiceStatus {
  Emitida = 'emitida',
  Pagada = 'pagada',
  Vencida = 'vencida',
}

export interface InvoiceLine {
  id: string;
  factura_id: string;
  concepto: string;
  cantidad: number;
  precio_unitario: number;
  total_linea: number;
}

export interface UserData {
  nombre: string;
  nif: string;
  direccion: string;
  email: string;
  telefono: string;
  iban?: string;
  invoice_format?: string;
  registro_mercantil?: string;
}

export interface DownPayment {
  id: string;
  cliente_id: string;
  monto: number;
  fecha: string;
  descripcion: string;
  factura_id_aplicada: string | null;
}

export interface Invoice {
  id: string;
  numero_factura: string;
  cliente_id: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  base_imponible: number;
  tipo_iva: number; // e.g., 21 for 21%
  total_factura: number;
  estado: InvoiceStatus;
  lineas: InvoiceLine[];
  emitterData: UserData | null;
  down_payment_applied: number | null;
  total_a_pagar: number;
}

export interface AgendaEvent {
  id: string;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  cliente_id?: string | null;
}

export type Sender = 'user' | 'ai';

export interface ChatMessage {
  id: string;
  text: string;
  sender: Sender;
  timestamp: string;
}

export interface AIAction {
    type: 
        'CREATE_CLIENT' | 
        'READ_CLIENT' | 
        'UPDATE_CLIENT' | 
        'DELETE_CLIENT' |
        'CREATE_INVOICE' | 
        'READ_INVOICE' | 
        'UPDATE_INVOICE_STATUS' |
        'CREATE_DOWN_PAYMENT' |
        'CREATE_AGENDA_EVENT' | 
        'READ_AGENDA' | 
        'UNKNOWN';
    payload: any;
}

export interface AIResponse {
    intent: string;
    confidence: number;
    requiresMoreInfo: boolean;
    aiResponse: string;
    action: AIAction | null;
}