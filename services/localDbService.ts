import { Client, Invoice, AgendaEvent, InvoiceStatus, InvoiceLine, UserData, DownPayment } from '../types';

const DB_KEYS = {
    CLIENTS: 'autonomo_clients',
    INVOICES: 'autonomo_invoices',
    AGENDA_EVENTS: 'autonomo_agenda_events',
    INVOICE_COUNTER: 'autonomo_invoice_counter',
    USER_DATA: 'autonomo_user_data',
    DOWN_PAYMENTS: 'autonomo_down_payments',
};

// Generic helper functions
const getFromStorage = <T,>(key: string): T[] => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : [];
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return [];
    }
};

const saveToStorage = <T,>(key: string, data: T[]): void => {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};

// User Data Management
export const getUserData = (): UserData | null => {
    const data = getFromStorage<UserData>(DB_KEYS.USER_DATA);
    return data.length > 0 ? data[0] : null;
};

export const saveUserData = (userData: UserData): void => {
    saveToStorage<UserData>(DB_KEYS.USER_DATA, [userData]);
};


// Client Management
export const getClients = (): Client[] => getFromStorage<Client>(DB_KEYS.CLIENTS);
export const addClient = (clientData: Omit<Client, 'id'>): Client => {
    const clients = getClients();
    const newClient: Client = { ...clientData, id: `cli_${new Date().getTime()}` };
    saveToStorage(DB_KEYS.CLIENTS, [...clients, newClient]);
    return newClient;
};

// Down Payment Management
export const getDownPayments = (): DownPayment[] => getFromStorage<DownPayment>(DB_KEYS.DOWN_PAYMENTS);

export const addDownPayment = (downPaymentData: Omit<DownPayment, 'id' | 'factura_id_aplicada' | 'fecha'>): DownPayment => {
    const downPayments = getDownPayments();
    const newDownPayment: DownPayment = {
        ...downPaymentData,
        id: `dp_${new Date().getTime()}`,
        fecha: new Date().toISOString(),
        factura_id_aplicada: null
    };
    saveToStorage(DB_KEYS.DOWN_PAYMENTS, [...downPayments, newDownPayment]);
    return newDownPayment;
};


// Invoice Management
type InvoiceCreationData = Pick<Invoice, 'cliente_id'> & 
    Partial<Pick<Invoice, 'fecha_emision' | 'fecha_vencimiento' | 'tipo_iva'>> & {
    lineas: Array<Pick<InvoiceLine, 'concepto' | 'cantidad' | 'precio_unitario'>>
};

export const getInvoices = (): Invoice[] => getFromStorage<Invoice>(DB_KEYS.INVOICES);

export const addInvoice = (invoiceData: InvoiceCreationData): Invoice => {
    if (!invoiceData.lineas || !Array.isArray(invoiceData.lineas) || invoiceData.lineas.length === 0) {
        throw new Error("Para crear una factura, se necesita al menos un concepto con cantidad y precio.");
    }
    
    const invoices = getInvoices();
    let downPayments = getDownPayments();
    const emitterData = getUserData();
    
    // Robustly set default values
    const tipo_iva = (typeof invoiceData.tipo_iva === 'number' && !isNaN(invoiceData.tipo_iva)) 
        ? invoiceData.tipo_iva 
        : 21;

    const fecha_emision = (invoiceData.fecha_emision && !isNaN(new Date(invoiceData.fecha_emision).valueOf())) 
        ? new Date(invoiceData.fecha_emision).toISOString()
        : new Date().toISOString();

    let fecha_vencimiento: string;
    if (invoiceData.fecha_vencimiento && !isNaN(new Date(invoiceData.fecha_vencimiento).valueOf())) {
        fecha_vencimiento = new Date(invoiceData.fecha_vencimiento).toISOString();
    } else {
        const emissionDate = new Date(fecha_emision);
        emissionDate.setDate(emissionDate.getDate() + 30);
        fecha_vencimiento = emissionDate.toISOString();
    }
    
    // Generate Invoice Number
    const counter = parseInt(localStorage.getItem(DB_KEYS.INVOICE_COUNTER) || '0', 10) + 1;
    localStorage.setItem(DB_KEYS.INVOICE_COUNTER, counter.toString());
    
    const defaultFormat = 'F-{YYYY}-{COUNTER}';
    const format = emitterData?.invoice_format || defaultFormat;
    
    const emissionDateForNumbering = new Date(fecha_emision);
    const numero_factura = format
        .replace('{YYYY}', emissionDateForNumbering.getFullYear().toString())
        .replace('{YY}', emissionDateForNumbering.getFullYear().toString().slice(-2))
        .replace('{COUNTER}', counter.toString().padStart(4, '0'));

    const invoiceId = `inv_${new Date().getTime()}`;

    let base_imponible = 0;
    const processedLines: InvoiceLine[] = invoiceData.lineas.map((line, index) => {
        const total_linea = line.cantidad * line.precio_unitario;
        base_imponible += total_linea;
        return {
            ...line,
            id: `line_${invoiceId}_${index}`,
            factura_id: invoiceId,
            total_linea,
        };
    });

    const total_factura_bruto = base_imponible * (1 + tipo_iva / 100);

    // --- NEW LOGIC for Down Payments ---
    let down_payment_applied: number | null = null;
    let total_a_pagar = parseFloat(total_factura_bruto.toFixed(2));
    
    // Find an available down payment for this client
    const availableDownPaymentIndex = downPayments.findIndex(
        dp => dp.cliente_id === invoiceData.cliente_id && dp.factura_id_aplicada === null
    );

    if (availableDownPaymentIndex > -1) {
        const dpToApply = downPayments[availableDownPaymentIndex];
        down_payment_applied = dpToApply.monto;
        total_a_pagar -= dpToApply.monto;

        // Mark the down payment as used
        downPayments[availableDownPaymentIndex].factura_id_aplicada = invoiceId;
        saveToStorage(DB_KEYS.DOWN_PAYMENTS, downPayments);
    }


    const newInvoice: Invoice = {
        id: invoiceId,
        numero_factura,
        cliente_id: invoiceData.cliente_id,
        fecha_emision,
        fecha_vencimiento,
        base_imponible,
        tipo_iva,
        total_factura: parseFloat(total_factura_bruto.toFixed(2)),
        estado: InvoiceStatus.Emitida,
        lineas: processedLines,
        emitterData: emitterData,
        down_payment_applied,
        total_a_pagar: parseFloat(total_a_pagar.toFixed(2)),
    };
    
    saveToStorage(DB_KEYS.INVOICES, [...invoices, newInvoice]);
    return newInvoice;
};


export const updateInvoiceStatus = (invoiceId: string, status: InvoiceStatus): Invoice | null => {
    const invoices = getInvoices();
    const invoiceIndex = invoices.findIndex(inv => inv.id === invoiceId);
    if (invoiceIndex > -1) {
        invoices[invoiceIndex].estado = status;
        saveToStorage(DB_KEYS.INVOICES, invoices);
        return invoices[invoiceIndex];
    }
    return null;
}

// Agenda Management
export const getAgendaEvents = (): AgendaEvent[] => getFromStorage<AgendaEvent>(DB_KEYS.AGENDA_EVENTS);
export const addAgendaEvent = (eventData: Omit<AgendaEvent, 'id'>): AgendaEvent => {
    const events = getAgendaEvents();
    const newEvent: AgendaEvent = { ...eventData, id: `evt_${new Date().getTime()}` };
    saveToStorage(DB_KEYS.AGENDA_EVENTS, [...events, newEvent]);
    return newEvent;
};

// Utility to get all data
export const getAllData = () => ({
    clients: getClients(),
    invoices: getInvoices(),
    agendaEvents: getAgendaEvents(),
    userData: getUserData(),
    downPayments: getDownPayments(),
});

// Database Backup/Restore
export const exportData = () => {
    const allData = {
        [DB_KEYS.CLIENTS]: getClients(),
        [DB_KEYS.INVOICES]: getInvoices(),
        [DB_KEYS.AGENDA_EVENTS]: getAgendaEvents(),
        [DB_KEYS.DOWN_PAYMENTS]: getDownPayments(),
        [DB_KEYS.USER_DATA]: getUserData() ? [getUserData()] : [],
        [DB_KEYS.INVOICE_COUNTER]: localStorage.getItem(DB_KEYS.INVOICE_COUNTER) || '0'
    };

    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    link.download = `autonomo_backup_${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

export const importData = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const jsonString = event.target?.result as string;
                const data = JSON.parse(jsonString);

                const essentialKeys = [DB_KEYS.CLIENTS, DB_KEYS.INVOICES, DB_KEYS.AGENDA_EVENTS, DB_KEYS.USER_DATA];
                const hasEssentialKeys = essentialKeys.every(key => key in data);

                if (!hasEssentialKeys) {
                    throw new Error("El archivo de copia de seguridad parece incompleto o corrupto.");
                }

                Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));

                for (const key in data) {
                    if (Object.values(DB_KEYS).includes(key as any)) {
                        localStorage.setItem(key, typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]));
                    }
                }

                resolve("Base de datos importada con éxito. La aplicación se recargará para aplicar los cambios.");
            } catch (error) {
                const message = error instanceof Error ? error.message : "Ocurrió un error desconocido.";
                reject(`Error al procesar el archivo: ${message}`);
            }
        };
        reader.onerror = () => reject("No se pudo leer el archivo.");
        reader.readAsText(file);
    });
};