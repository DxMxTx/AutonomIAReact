import React, { useContext } from 'react';
import { Client, Invoice, AgendaEvent, InvoiceStatus } from '../types';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { ThemeContext } from '../contexts/ThemeContext';
import { themes } from '../themes';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

interface DashboardProps {
    clients: Client[];
    invoices: Invoice[];
    agendaEvents: AgendaEvent[];
    onViewInvoice: (invoice: Invoice) => void;
    onViewEvent: (event: AgendaEvent) => void;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
};

const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
        case InvoiceStatus.Pagada:
            return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Pagada</span>;
        case InvoiceStatus.Vencida:
            return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Vencida</span>;
        case InvoiceStatus.Emitida:
        default:
            return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Emitida</span>;
    }
}

export const Dashboard: React.FC<DashboardProps> = ({ clients, invoices, agendaEvents, onViewInvoice, onViewEvent }) => {
    const { theme } = useContext(ThemeContext);
    const currentTheme = themes[theme];
    const chartBorderColor = currentTheme ? currentTheme['blanco-puro'] : '#FFFFFF';

    // --- KPIs Calculations ---
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total_factura, 0);
    const totalPending = invoices
        .filter(inv => inv.estado === InvoiceStatus.Emitida || inv.estado === InvoiceStatus.Vencida)
        .reduce((sum, inv) => sum + inv.total_a_pagar, 0);
    const activeClientsCount = new Set(invoices.map(inv => inv.cliente_id)).size;

    // --- Chart Data ---
    // Bar Chart: Monthly Invoicing
    const monthlyInvoicing = invoices.reduce((acc, inv) => {
        const month = new Date(inv.fecha_emision).toLocaleString('es-ES', { month: 'short', year: '2-digit' });
        acc[month] = (acc[month] || 0) + inv.total_factura;
        return acc;
    }, {} as Record<string, number>);

    const barChartData = {
        labels: Object.keys(monthlyInvoicing),
        datasets: [{
            label: 'Total Facturado',
            data: Object.values(monthlyInvoicing),
            backgroundColor: 'rgba(0, 188, 212, 0.7)', // cian-neon hardcoded for viz consistency
            borderColor: 'rgba(0, 188, 212, 1)',
            borderWidth: 1,
        }],
    };

    // Doughnut Chart: Invoice Status
    const statusCounts = invoices.reduce((acc, inv) => {
        acc[inv.estado] = (acc[inv.estado] || 0) + 1;
        return acc;
    }, {} as Record<InvoiceStatus, number>);

    const doughnutChartData = {
        labels: ['Pagadas', 'Emitidas', 'Vencidas'],
        datasets: [{
            data: [
                statusCounts[InvoiceStatus.Pagada] || 0,
                statusCounts[InvoiceStatus.Emitida] || 0,
                statusCounts[InvoiceStatus.Vencida] || 0
            ],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
            hoverBackgroundColor: ['#059669', '#D97706', '#DC2626'],
            borderColor: chartBorderColor,
            borderWidth: 2,
        }],
    };

    // --- Lists ---
    const upcomingDueInvoices = invoices
        .filter(inv => inv.estado === InvoiceStatus.Emitida)
        .sort((a, b) => new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime())
        .slice(0, 5);

    const upcomingEvents = agendaEvents
        .filter(evt => new Date(evt.fecha_inicio) >= new Date())
        .sort((a, b) => new Date(a.fecha_inicio).getTime() - new Date(b.fecha_inicio).getTime())
        .slice(0, 5);
    
    const getClientName = (clientId: string) => clients.find(c => c.id === clientId)?.nombre_fiscal || 'N/A';

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-grafito">Dashboard</h1>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blanco-puro p-6 rounded-lg shadow-lg border border-gris-platino">
                    <h3 className="text-sm font-medium text-gris-acero">Total Facturado</h3>
                    <p className="text-3xl font-bold text-grafito mt-1">{formatCurrency(totalInvoiced)}</p>
                </div>
                <div className="bg-blanco-puro p-6 rounded-lg shadow-lg border border-gris-platino">
                    <h3 className="text-sm font-medium text-gris-acero">Pendiente de Cobro</h3>
                    <p className="text-3xl font-bold text-cian-neon mt-1">{formatCurrency(totalPending)}</p>
                </div>
                <div className="bg-blanco-puro p-6 rounded-lg shadow-lg border border-gris-platino">
                    <h3 className="text-sm font-medium text-gris-acero">Clientes Activos</h3>
                    <p className="text-3xl font-bold text-grafito mt-1">{activeClientsCount}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-blanco-puro p-6 rounded-lg shadow-lg border border-gris-platino">
                    <h3 className="text-lg font-semibold text-grafito mb-4">Facturación Mensual</h3>
                    <Bar data={barChartData} options={{ responsive: true, plugins: { legend: { display: false }}}} />
                </div>
                <div className="lg:col-span-2 bg-blanco-puro p-6 rounded-lg shadow-lg flex flex-col justify-center border border-gris-platino">
                    <h3 className="text-lg font-semibold text-grafito mb-4">Estado de Facturas</h3>
                    <Doughnut data={doughnutChartData} options={{ responsive: true, plugins: { legend: { position: 'top' }}}}/>
                </div>
            </div>

            {/* Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-blanco-puro p-6 rounded-lg shadow-lg border border-gris-platino">
                    <h3 className="text-lg font-semibold text-grafito mb-4">Próximos Vencimientos</h3>
                    <div className="space-y-3">
                        {upcomingDueInvoices.length > 0 ? upcomingDueInvoices.map(inv => (
                             <button
                                key={inv.id}
                                onClick={() => onViewInvoice(inv)}
                                className="w-full text-left p-3 rounded-lg hover:bg-gris-tecnologico transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold text-grafito">{inv.numero_factura}</p>
                                    <p className="text-sm text-gris-acero">{getClientName(inv.cliente_id)}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-cian-neon">{formatCurrency(inv.total_a_pagar)}</p>
                                    <p className="text-xs text-gris-acero">Vence: {new Date(inv.fecha_vencimiento).toLocaleDateString()}</p>
                                </div>
                             </button>
                        )) : <p className="text-gris-acero text-sm">No hay facturas próximas a vencer.</p>}
                    </div>
                </div>
                <div className="bg-blanco-puro p-6 rounded-lg shadow-lg border border-gris-platino">
                    <h3 className="text-lg font-semibold text-grafito mb-4">Próximas Citas</h3>
                    <div className="space-y-3">
                         {upcomingEvents.length > 0 ? upcomingEvents.map(evt => (
                            <button
                                key={evt.id}
                                onClick={() => onViewEvent(evt)}
                                className="w-full text-left p-3 rounded-lg hover:bg-gris-tecnologico transition-colors flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-semibold text-grafito">{evt.titulo}</p>
                                    {evt.cliente_id && <p className="text-sm text-gris-acero">{getClientName(evt.cliente_id)}</p>}
                                </div>
                                <p className="text-sm text-grafito font-medium">{new Date(evt.fecha_inicio).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                            </button>
                         )) : <p className="text-gris-acero text-sm">No hay citas en la agenda.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};