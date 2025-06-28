
import { ChatMessage } from './types';

export const INITIAL_MESSAGE: ChatMessage = {
    id: 'init-message',
    text: `¡Hola! Soy tu asistente de gestión para autónomos. Puedes pedirme que gestione tus clientes, facturas y agenda.

Por ejemplo, puedes probar con:
- "Añade un nuevo cliente: ACME Corp, CIF A12345678"
- "Crea una factura para ACME Corp de 500€ por 'Diseño web'"
- "Muéstrame las facturas pendientes"
- "Agenda una reunión con ACME Corp para mañana a las 10am"

¿En qué te puedo ayudar hoy?`,
    sender: 'ai',
    timestamp: new Date().toISOString(),
};
