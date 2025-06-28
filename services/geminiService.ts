import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { AIResponse, ChatMessage, Client, Invoice, AgendaEvent, DownPayment, UserData } from '../types';
import * as db from './localDbService';

const API_KEY = "XXX";

const getSystemPrompt = (
    clients: Client[],
    invoices: Invoice[],
    agendaEvents: AgendaEvent[],
    downPayments: DownPayment[],
    userData: UserData | null
): string => {
    const today = new Date().toISOString().slice(0, 10);
    const clientDataSummary = clients.map(c => ({ id: c.id, nombre_fiscal: c.nombre_fiscal, cif_nif: c.cif_nif }));
    const invoiceDataSummary = invoices.map(i => ({ id: i.id, numero_factura: i.numero_factura, cliente_id: i.cliente_id, total_factura: i.total_factura, estado: i.estado, fecha_emision: i.fecha_emision }));
    const agendaEventsSummary = agendaEvents.map(e => ({ id: e.id, titulo: e.titulo, fecha_inicio: e.fecha_inicio, cliente_id: e.cliente_id }));
    const downPaymentsSummary = downPayments.map(p => ({ id: p.id, cliente_id: p.cliente_id, monto: p.monto, factura_id_aplicada: p.factura_id_aplicada }));

    return `
Eres "AutonomIA", un asistente virtual experto en gestión para autónomos y freelancers. Tu objetivo es ayudar al usuario a gestionar sus clientes, facturas y agenda. Te comunicarás en español.
La fecha de hoy es: ${today}.

**TAREA PRINCIPAL:**
Analiza la petición del usuario y el historial de chat. Determina la intención del usuario y, si es posible, genera una acción concreta en formato JSON. Si necesitas más información, pídesela amablemente.

**FORMATO DE RESPUESTA OBLIGATORIO:**
Debes responder SIEMPRE con un objeto JSON válido que siga esta estructura:
\`\`\`json
{
  "intent": "string",
  "confidence": "number",
  "requiresMoreInfo": "boolean",
  "aiResponse": "string",
  "action": {
    "type": "string",
    "payload": "object"
  } | null
}
\`\`\`

**DATOS DEL SISTEMA DISPONIBLES (CONTEXTO):**
- **Mis Datos (Usuario/Emisor):** ${JSON.stringify(userData)}
- **Clientes:** ${JSON.stringify(clientDataSummary)}
- **Facturas:** ${JSON.stringify(invoiceDataSummary)}
- **Entregas a cuenta:** ${JSON.stringify(downPaymentsSummary)}
- **Eventos de Agenda:** ${JSON.stringify(agendaEventsSummary)}

---

**DETALLES DE LAS ACCIONES Y PAYLOADS:**

1.  **CREATE_CLIENT**: Crear un nuevo cliente. Payload: \`{ nombre_fiscal: string, cif_nif: string, direccion?: string, email?: string, telefono?: string }\`
2.  **CREATE_INVOICE**: Crear una nueva factura. Payload: \`{ cliente_id: string, tipo_iva?: number, fecha_emision?: string, fecha_vencimiento?: string, lineas: [{ concepto: string, cantidad: number, precio_unitario: number }] }\`. DEBES encontrar el \`cliente_id\` a partir del nombre del cliente. Si no lo encuentras, pide la información. Asume IVA del 21% si no se especifica.
3.  **UPDATE_INVOICE_STATUS**: Cambiar estado de una factura. Payload: \`{ invoiceId: string, status: "emitida" | "pagada" | "vencida" }\`. DEBES encontrar el \`invoiceId\` a partir del número de factura.
4.  **CREATE_DOWN_PAYMENT**: Registrar un anticipo. Payload: \`{ cliente_id: string, monto: number, descripcion: string }\`. DEBES encontrar el \`cliente_id\`.
5.  **CREATE_AGENDA_EVENT**: Añadir un evento. Payload: \`{ titulo: string, descripcion: string, fecha_inicio: string (ISO), fecha_fin: string (ISO), cliente_id?: string }\`. Interpreta fechas relativas ("mañana", "lunes 10am") y busca el \`cliente_id\` si se menciona un cliente.
6.  **READ_INVOICE**: Mostrar una factura. Payload: \`{ lookup: "latest" | "by_number", numero_factura?: string }\`.
7.  **CONSULTAS / PREGUNTAS (action: null)**: Si el usuario solo pregunta algo, calcula la respuesta, ponla en \`aiResponse\`, y deja \`action\` en \`null\`.
8.  **UNKNOWN**: Si no puedes determinar la intención.

**PROCESO MENTAL:**
1. Lee la petición.
2. Analiza el contexto.
3. Determina la intención.
4. ¿Tengo todos los datos? Si no, pon \`requiresMoreInfo: true\`, pregunta en \`aiResponse\` y pon \`action: null\`.
5. Si tengo los datos, construye el objeto \`action\`.
6. Formula una respuesta de confirmación en \`aiResponse\`.
7. Envuelve todo en el JSON especificado. ¡SIN TEXTO ADICIONAL FUERA DEL JSON!`;
};

export const processUserCommand = async (
    history: ChatMessage[],
    clients: Client[],
    invoices: Invoice[],
    agendaEvents: AgendaEvent[],
    downPayments: DownPayment[]
): Promise<AIResponse> => {
    const userData = db.getUserData();
    
    const systemPrompt = getSystemPrompt(clients, invoices, agendaEvents, downPayments, userData);
    const latestUserMessage = history[history.length - 1].text;
    const conversationHistory = history.slice(-4, -1).map(m => `${m.sender === 'user' ? 'Usuario' : 'Asistente'}: ${m.text}`).join('\n');
    
    const finalPrompt = `${systemPrompt}\n\n**HISTORIAL DE CONVERSACIÓN RECIENTE:**\n${conversationHistory}\n\n**PETICIÓN ACTUAL DEL USUARIO:**\n${latestUserMessage}`;

    try {
        const ai = new GoogleGenAI({ apiKey: API_KEY });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: finalPrompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.2,
            },
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
            jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr) as AIResponse;
        return parsedData;

    } catch (error) {
        console.error("Error calling Google Gemini API:", error);
        let errorMessage = "Lo siento, ha ocurrido un error al comunicarme con la IA. Inténtalo de nuevo.";
        if (error instanceof Error) {
            errorMessage += ` Detalle: ${error.message}`;
        }
        
        return {
            intent: "ERROR_API",
            confidence: 1.0,
            requiresMoreInfo: false,
            aiResponse: errorMessage,
            action: null,
        };
    }
};
