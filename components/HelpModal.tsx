import React from 'react';

interface HelpModalProps {
    onClose: () => void;
}

const CommandExample: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="bg-gris-tecnologico/50 p-3 rounded-md transition-colors hover:bg-gris-tecnologico">
        <code className="text-purpura-innovador">{children}</code>
    </li>
);

const Section: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div>
        <h3 className="text-xl font-semibold text-purpura-innovador mb-2">{title}</h3>
        <p className="text-sm text-gris-acero mb-4">{description}</p>
        <ul className="space-y-2 text-sm">
            {children}
        </ul>
    </div>
);


export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {

    return (
         <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="bg-blanco-puro text-grafito rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gris-platino"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-gris-platino flex justify-between items-center flex-shrink-0">
                    <h2 className="text-2xl font-bold text-grafito">Guía de Comandos y Ayuda</h2>
                    <button onClick={onClose} className="text-gris-acero hover:text-grafito text-3xl leading-none">&times;</button>
                </div>

                <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
                    
                    <p className="text-grafito">
                        Tu asistente de IA entiende el lenguaje natural. A continuación, encontrarás ejemplos de comandos que puedes usar. ¡No dudes en probar tus propias frases!
                    </p>

                    <Section title="Gestión de Clientes" description="Crea y consulta la información de tus clientes de forma rápida.">
                        <CommandExample>Añade un nuevo cliente: ACME Corp, CIF A12345678.</CommandExample>
                        <CommandExample>Nuevo cliente: Viajes Luna SL, B98765432, email: info@viajesluna.es, Tel: 912345678</CommandExample>
                        <CommandExample>Muéstrame los datos de ACME Corp.</CommandExample>
                        <CommandExample>Lista todos mis clientes.</CommandExample>
                    </Section>

                    <Section title="Gestión de Facturas" description="Crea, consulta y actualiza el estado de tus facturas. El sistema calculará los totales y aplicará entregas a cuenta automáticamente si existen.">
                        <CommandExample>Crea una factura para ACME Corp de 500€ por 'Diseño web'.</CommandExample>
                        <CommandExample>Factura para Viajes Luna: 120€ por 'Gestión de reserva' y 50€ por 'Asesoramiento'.</CommandExample>
                        <CommandExample>Genera una factura para ACME Corp por 2 unidades de 'Consultoría' a 75€ la unidad.</CommandExample>
                        <CommandExample>Marca la factura F-2024-0001 como pagada.</CommandExample>
                        <CommandExample>Muéstrame las facturas pendientes de cobro.</CommandExample>
                        <CommandExample>Enséñame la última factura que he creado.</CommandExample>
                         <CommandExample>Ver la factura F-2024-0002</CommandExample>
                    </Section>
                    
                    <Section title="Entregas a Cuenta" description="Registra los anticipos o pagos a cuenta que recibes de tus clientes. Se aplicarán a la próxima factura que generes para ese cliente.">
                        <CommandExample>Añade una entrega a cuenta de 100€ para ACME Corp por 'Adelanto proyecto web'.</CommandExample>
                        <CommandExample>He recibido un anticipo de 250€ de Viajes Luna.</CommandExample>
                        <CommandExample>¿Tengo alguna entrega a cuenta sin usar?</CommandExample>
                    </Section>

                    <Section title="Gestión de Agenda" description="Organiza tu calendario, agenda reuniones con clientes o crea recordatorios personales.">
                        <CommandExample>Agenda una reunión con ACME Corp para mañana a las 10am sobre 'Revisión del proyecto'.</CommandExample>
                        <CommandExample>Crea un evento 'Comida de equipo' para el viernes de 14:00 a 15:30.</CommandExample>
                        <CommandExample>Apunta 'Llamar al gestor' para el lunes a primera hora.</CommandExample>
                        <CommandExample>¿Qué tengo en la agenda para esta semana?</CommandExample>
                        <CommandExample>Muéstrame los eventos de hoy.</CommandExample>
                    </Section>

                    <div>
                        <h3 className="text-xl font-semibold text-purpura-innovador mb-2">Consejos Útiles</h3>
                        <ul className="space-y-2 text-sm list-disc list-inside text-gris-acero">
                            <li><span className="text-grafito">Sé específico:</span> Proporciona tantos detalles como puedas (nombres, cifras, fechas) para obtener una respuesta más precisa.</li>
                            <li><span className="text-grafito">Contexto:</span> El asistente recuerda los últimos mensajes de la conversación, así que puedes hacer preguntas de seguimiento.</li>
                            <li><span className="text-grafito">Reformula:</span> Si el asistente no te entiende a la primera, prueba a decir lo mismo con otras palabras.</li>
                        </ul>
                    </div>

                </div>

                <div className="flex-shrink-0 p-4 bg-blanco-puro/50 border-t border-gris-platino flex justify-end">
                     <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-white bg-fucsia-electrico border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fucsia-electrico"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};