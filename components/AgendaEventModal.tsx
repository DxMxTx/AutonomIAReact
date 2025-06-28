import React from 'react';
import { AgendaEvent, Client } from '../types';
import { GoogleCalendarIcon, WhatsAppIcon } from './IconComponents';

interface AgendaEventModalProps {
    event: AgendaEvent;
    client: Client | null;
    onClose: () => void;
}

// Helper to format date for Google Calendar URL (YYYYMMDDTHHMMSSZ)
const formatGCalDate = (dateString: string): string => {
    return new Date(dateString).toISOString().replace(/-|:|\.\d{3}/g, '');
};

const formatDisplayDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
        dateStyle: 'full',
        timeStyle: 'short'
    });
};


export const AgendaEventModal: React.FC<AgendaEventModalProps> = ({ event, client, onClose }) => {
    const { titulo, descripcion, fecha_inicio, fecha_fin } = event;

    const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        titulo
    )}&dates=${formatGCalDate(fecha_inicio)}/${formatGCalDate(
        fecha_fin
    )}&details=${encodeURIComponent(descripcion + (client ? `\n\nCliente: ${client.nombre_fiscal}` : ''))}`;

    const whatsAppText = `Recordatorio de Cita:\n\n*${titulo}*\n\n*Cuándo:* ${formatDisplayDate(fecha_inicio)}\n*Descripción:* ${descripcion}${client ? `\n*Cliente:* ${client.nombre_fiscal}` : ''}`;
    const whatsAppUrl = `https://wa.me/?text=${encodeURIComponent(whatsAppText)}`;

    const handleOpenLink = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="bg-blanco-puro text-grafito rounded-lg shadow-2xl w-full max-w-lg flex flex-col border border-gris-platino"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gris-platino flex justify-between items-center">
                    <h2 className="text-xl font-bold text-grafito">Detalles del Evento</h2>
                    <button onClick={onClose} className="text-gris-acero hover:text-grafito text-3xl leading-none">&times;</button>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-4 overflow-y-auto">
                    <h3 className="text-2xl font-semibold text-purpura-innovador">{titulo}</h3>
                    {client && (
                        <p className="text-gris-acero">
                            <span className="font-semibold text-grafito">Cliente:</span> {client.nombre_fiscal}
                        </p>
                    )}
                     <div>
                        <p className="font-semibold text-grafito">Inicio:</p>
                        <p>{formatDisplayDate(fecha_inicio)}</p>
                    </div>
                     <div>
                        <p className="font-semibold text-grafito">Fin:</p>
                        <p>{formatDisplayDate(fecha_fin)}</p>
                    </div>
                    <div>
                        <p className="font-semibold text-grafito">Descripción:</p>
                        <p className="whitespace-pre-wrap">{descripcion || 'Sin descripción.'}</p>
                    </div>
                </div>

                 {/* Actions */}
                <div className="flex-shrink-0 p-4 bg-blanco-puro/50 border-t border-gris-platino grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <button
                        onClick={() => handleOpenLink(gCalUrl)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gris-acero text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        <GoogleCalendarIcon className="w-5 h-5" />
                        <span>Añadir a Google Calendar</span>
                    </button>
                    <button
                        onClick={() => handleOpenLink(whatsAppUrl)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-gris-acero text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors"
                    >
                        <WhatsAppIcon className="w-5 h-5" />
                        <span>Compartir por WhatsApp</span>
                    </button>
                </div>
            </div>
        </div>
    );
};