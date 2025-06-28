import React, { useState, useEffect, useCallback } from 'react';
import ChatInterface from './components/ChatInterface';
import { Preferences } from './components/Preferences';
import { Dashboard } from './components/Dashboard';
import { SettingsIcon, AppLogo, DashboardIcon, ChatIcon, HelpIcon } from './components/IconComponents';
import { ChatMessage, UserData, Client, Invoice, AgendaEvent, DownPayment } from './types';
import * as db from './services/localDbService';
import { INITIAL_MESSAGE } from './constants';
import { InvoiceModal } from './components/InvoiceModal';
import { HelpModal } from './components/HelpModal';
import { AgendaEventModal } from './components/AgendaEventModal';
import { InitialSetup } from './components/InitialSetup';

type View = 'dashboard' | 'chat' | 'preferences';

export const App: React.FC = () => {
    const [view, setView] = useState<View>('dashboard');
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    
    // Centralized data state
    const [userData, setUserData] = useState<UserData | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [agendaEvents, setAgendaEvents] = useState<AgendaEvent[]>([]);
    const [downPayments, setDownPayments] = useState<DownPayment[]>([]);
    const [invoiceToView, setInvoiceToView] = useState<Invoice | null>(null);
    const [eventToView, setEventToView] = useState<AgendaEvent | null>(null);
    const [showHelpModal, setShowHelpModal] = useState(false);

    // State for initial setup flow
    const [isCheckingSetup, setIsCheckingSetup] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);
    
    const refreshData = useCallback(() => {
        const data = db.getAllData();
        setUserData(data.userData);
        setClients(data.clients);
        setInvoices(data.invoices);
        setAgendaEvents(data.agendaEvents);
        setDownPayments(data.downPayments);
    }, []);

    useEffect(() => {
        const data = db.getUserData();
        if (!data || !data.nombre || !data.nif || !data.direccion || !data.email || !data.telefono) {
            setNeedsSetup(true);
        }
        refreshData();
        setIsCheckingSetup(false);
    }, [refreshData]);
    
    const handleSavePreferences = (data: UserData) => {
        db.saveUserData(data);
        refreshData();
    };

    const handleSetupComplete = (data: UserData) => {
        db.saveUserData(data);
        refreshData();
        setNeedsSetup(false);
    };

    const handleExportData = () => {
        db.exportData();
    };

    const handleImportData = async (file: File) => {
        const message = await db.importData(file);
        // The page will reload after a successful import as per the component's logic
        return message;
    };

    const NavLink: React.FC<{
        targetView?: View;
        onClick?: () => void;
        icon: React.ReactNode;
        label: string;
    }> = ({ targetView, onClick, icon, label }) => {
        const isActive = targetView ? view === targetView : false;
        
        const action = onClick ? onClick : () => setView(targetView!);

        return (
            <button
                onClick={action}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left ${
                    isActive ? 'bg-purpura-innovador text-white' : 'text-gris-acero hover:bg-lavanda-digital hover:text-purpura-innovador'
                }`}
                aria-current={isActive ? 'page' : undefined}
            >
                {icon}
                <span>{label}</span>
            </button>
        );
    };

    if (isCheckingSetup) {
        return (
            <div className="bg-blanco-puro h-screen w-screen flex items-center justify-center">
                {/* Initial loading state */}
            </div>
        );
    }

    if (needsSetup) {
        return <InitialSetup onSave={handleSetupComplete} />;
    }

    return (
        <>
            {/* Mobile-only warning screen */}
            <div className="md:hidden fixed inset-0 bg-blanco-puro flex flex-col justify-center items-center z-50 p-8 text-center">
                <AppLogo className="w-16 h-16 mb-6" />
                <h1 className="text-2xl font-bold text-grafito mb-2">¡Hola!</h1>
                <p className="text-gris-acero max-w-sm">
                    AutonomIA está diseñada para ofrecer la mejor experiencia en pantallas más grandes.
                </p>
                <p className="text-gris-acero mt-4 text-sm">
                    Por favor, utiliza un ordenador o una tableta para gestionar tu negocio.
                </p>
            </div>

            {/* Main App - Hidden on Mobile */}
            <div className="hidden md:flex antialiased text-grafito bg-blanco-puro h-screen">
                {/* Sidebar Navigation */}
                <aside className="w-64 bg-gris-tecnologico/50 p-6 flex flex-col justify-between border-r border-gris-platino">
                    <div>
                         <div className="flex items-center gap-3 mb-10">
                            <AppLogo className="w-10 h-10" />
                            <div className="text-left">
                                 <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purpura-innovador to-fucsia-electrico">
                                    AutonomIA
                                </h1>
                            </div>
                        </div>
                        <nav className="space-y-2">
                            <NavLink targetView="dashboard" icon={<DashboardIcon className="w-6 h-6" />} label="Dashboard" />
                            <NavLink targetView="chat" icon={<ChatIcon className="w-6 h-6" />} label="Asistente de Chat" />
                        </nav>
                    </div>
                    <nav className="space-y-2">
                        <NavLink onClick={() => setShowHelpModal(true)} icon={<HelpIcon className="w-6 h-6" />} label="Ayuda y Comandos" />
                        <NavLink targetView="preferences" icon={<SettingsIcon className="w-6 h-6" />} label="Ajustes" />
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
                    {view === 'dashboard' && (
                        <Dashboard
                            clients={clients}
                            invoices={invoices}
                            agendaEvents={agendaEvents}
                            onViewInvoice={setInvoiceToView}
                            onViewEvent={setEventToView}
                        />
                    )}
                    {view === 'chat' && (
                        <div className="h-full">
                             <ChatInterface 
                                messages={messages} 
                                setMessages={setMessages}
                                refreshData={refreshData} 
                                clients={clients}
                                invoices={invoices}
                                agendaEvents={agendaEvents}
                                downPayments={downPayments}
                                setInvoiceToView={setInvoiceToView}
                                setEventToView={setEventToView}
                            />
                        </div>
                    )}
                     {view === 'preferences' && (
                        <Preferences
                            initialUserData={userData}
                            onClose={() => setView('dashboard')}
                            onSave={handleSavePreferences}
                            onExport={handleExportData}
                            onImport={handleImportData}
                        />
                     )}
                </main>
            </div>

            {/* Modals are now siblings to the main app container */}
            {invoiceToView && (
                <InvoiceModal 
                    invoice={invoiceToView} 
                    client={clients.find(c => c.id === invoiceToView.cliente_id) || null}
                    emitter={invoiceToView.emitterData || userData}
                    onClose={() => setInvoiceToView(null)} 
                />
            )}

            {eventToView && (
                <AgendaEventModal 
                    event={eventToView} 
                    client={clients.find(c => c.id === eventToView.cliente_id) || null}
                    onClose={() => setEventToView(null)} 
                />
            )}
            
            {showHelpModal && (
                <HelpModal onClose={() => setShowHelpModal(false)} />
            )}
        </>
    );
};