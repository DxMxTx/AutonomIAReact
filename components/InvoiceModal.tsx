import React, { useEffect } from 'react';
import { Invoice, Client, UserData } from '../types';

interface InvoiceModalProps {
    invoice: Invoice;
    client: Client | null;
    emitter: UserData | null;
    onClose: () => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

const formatDate = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).valueOf())) {
        return 'Fecha inválida';
    }
    return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ invoice, client, emitter, onClose }) => {
    
    useEffect(() => {
        const handleAfterPrint = () => {
            document.body.classList.remove('print-active');
        };

        window.addEventListener('afterprint', handleAfterPrint);

        return () => {
            window.removeEventListener('afterprint', handleAfterPrint);
            // Ensure class is removed if component unmounts while print dialog is open
            document.body.classList.remove('print-active');
        };
    }, []);
    
    const handlePrint = () => {
        document.body.classList.add('print-active');
        window.print();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 animate-fade-in p-4 printable-container"
            onClick={onClose}
        >
            <div 
                className="bg-white text-grafito rounded-lg shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div id="invoice-modal-content" className="p-8 sm:p-10 overflow-y-auto">
                    {/* Header */}
                    <div className="flex justify-between items-start pb-6 border-b">
                        <div>
                            <h1 className="text-3xl font-bold text-grafito">FACTURA</h1>
                            <p className="text-gris-acero mt-1">
                                <span className="font-semibold">Nº Factura:</span> {invoice.numero_factura}
                            </p>
                        </div>
                         {emitter && (
                            <div className="text-right">
                                <h2 className="text-xl font-bold text-purpura-innovador">{emitter.nombre}</h2>
                                <p className="text-sm">{emitter.direccion}</p>
                                <p className="text-sm">{emitter.nif}</p>
                                <p className="text-sm">{emitter.email} - {emitter.telefono}</p>
                            </div>
                         )}
                    </div>

                    {/* Emitter & Client Info */}
                    <div className="grid sm:grid-cols-2 gap-8 my-8">
                        {client && (
                             <div>
                                <h3 className="font-semibold text-gris-acero uppercase tracking-wider text-sm mb-2">Facturar a</h3>
                                <p className="font-bold text-lg">{client.nombre_fiscal}</p>
                                {client.direccion && <p>{client.direccion}</p>}
                                <p>{client.cif_nif}</p>
                                {client.email && <p>{client.email}</p>}
                            </div>
                        )}
                        <div className={client ? 'text-right' : ''}>
                             <h3 className="font-semibold text-gris-acero uppercase tracking-wider text-sm mb-2">Fechas</h3>
                             <p><span className="font-semibold">Emisión:</span> {formatDate(invoice.fecha_emision)}</p>
                             <p><span className="font-semibold">Vencimiento:</span> {formatDate(invoice.fecha_vencimiento)}</p>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="flow-root">
                        <table className="min-w-full text-left">
                            <thead className="bg-gris-tecnologico">
                                <tr>
                                    <th scope="col" className="px-4 py-3 font-semibold text-grafito">Concepto</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-grafito text-right">Cantidad</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-grafito text-right">P. Unitario</th>
                                    <th scope="col" className="px-4 py-3 font-semibold text-grafito text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lineas && invoice.lineas.length > 0 ? (
                                    invoice.lineas.map(line => (
                                        <tr key={line.id} className="border-b border-gris-platino text-grafito">
                                            <td className="px-4 py-3 align-top">{line.concepto}</td>
                                            <td className="px-4 py-3 align-top text-right">{line.cantidad}</td>
                                            <td className="px-4 py-3 align-top text-right">{formatCurrency(line.precio_unitario)}</td>
                                            <td className="px-4 py-3 align-top text-right">{formatCurrency(line.total_linea)}</td>
                                        </tr>
                                    ))
                                 ) : (
                                    <tr>
                                        <td colSpan={4} className="text-center text-gris-acero py-6">
                                            Esta factura no contiene líneas de conceptos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                     {/* Totals */}
                    <div className="mt-8 flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gris-acero">Base Imponible:</span>
                                <span className="font-semibold">{formatCurrency(invoice.base_imponible)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gris-acero">IVA ({invoice.tipo_iva}%):</span>
                                <span className="font-semibold">{formatCurrency(invoice.total_factura - invoice.base_imponible)}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2 mt-1">
                                <span className="font-semibold">Total Factura:</span>
                                <span className="font-semibold">{formatCurrency(invoice.total_factura)}</span>
                            </div>
                            {invoice.down_payment_applied && invoice.down_payment_applied > 0 && (
                                <div className="flex justify-between text-cian-neon">
                                    <span className="font-semibold">Entrega a cuenta:</span>
                                    <span className="font-semibold">- {formatCurrency(invoice.down_payment_applied)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-xl font-bold pt-2 border-t-2 border-grafito">
                                <span>Total a Pagar:</span>
                                <span className="text-purpura-innovador">{formatCurrency(invoice.total_a_pagar)}</span>
                            </div>
                        </div>
                    </div>
                    
                    {emitter?.iban && (
                         <div className="mt-8 pt-4 border-t text-sm text-gris-acero">
                            <h4 className="font-semibold mb-1 text-grafito">Forma de pago</h4>
                            <p>Transferencia bancaria a la cuenta: {emitter.iban}</p>
                         </div>
                    )}

                    {emitter?.registro_mercantil && (
                        <div className="mt-8 pt-4 border-t text-center text-xs text-gris-acero">
                            <p>{emitter.registro_mercantil}</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex-shrink-0 p-4 bg-gray-50 border-t flex justify-end items-center space-x-4 print:hidden">
                     <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-medium text-grafito bg-white border border-gris-platino rounded-md shadow-sm hover:bg-gris-tecnologico focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purpura-innovador"
                    >
                        Cerrar
                    </button>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-6 py-2 text-sm font-medium text-white bg-fucsia-electrico border border-transparent rounded-md shadow-sm hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fucsia-electrico"
                    >
                        Imprimir / Guardar PDF
                    </button>
                </div>
            </div>
        </div>
    );
};