import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, AIResponse, Client, Invoice, AgendaEvent, DownPayment } from '../types';
import { processUserCommand } from '../services/geminiService';
import * as db from '../services/localDbService';
import MessageBubble from './MessageBubble';
import { SendIcon, BotIcon } from './IconComponents';

interface ChatInterfaceProps {
    messages: ChatMessage[];
    setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
    refreshData: () => void;
    clients: Client[];
    invoices: Invoice[];
    agendaEvents: AgendaEvent[];
    downPayments: DownPayment[];
    setInvoiceToView: (invoice: Invoice | null) => void;
    setEventToView: (event: AgendaEvent | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, setMessages, refreshData, clients, invoices, agendaEvents, downPayments, setInvoiceToView, setEventToView }) => {
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        if (!isTyping && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() === '' || isTyping) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            text: input,
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        const newHistory = [...messages, userMessage];
        setMessages(newHistory);
        setInput('');
        setIsTyping(true);

        const historyForAI = newHistory.slice(-5);
        const aiResponse: AIResponse = await processUserCommand(historyForAI, clients, invoices, agendaEvents, downPayments);

        if (aiResponse.action) {
            try {
                 let actionTaken = false;
                switch (aiResponse.action.type) {
                    case 'CREATE_CLIENT':
                        db.addClient(aiResponse.action.payload);
                        actionTaken = true;
                        break;
                    case 'CREATE_INVOICE':
                        const newInvoice = db.addInvoice(aiResponse.action.payload);
                        setInvoiceToView(newInvoice); // Show modal
                        actionTaken = true;
                        break;
                    case 'CREATE_DOWN_PAYMENT':
                        db.addDownPayment(aiResponse.action.payload);
                        actionTaken = true;
                        break;
                    case 'CREATE_AGENDA_EVENT':
                        const newEvent = db.addAgendaEvent(aiResponse.action.payload);
                        setEventToView(newEvent);
                        actionTaken = true;
                        break;
                    case 'UPDATE_INVOICE_STATUS':
                        db.updateInvoiceStatus(aiResponse.action.payload.invoiceId, aiResponse.action.payload.status);
                        actionTaken = true;
                        break;
                    case 'READ_INVOICE':
                        let invoiceToShow: Invoice | null = null;
                        const { lookup, numero_factura } = aiResponse.action.payload;
                        if (lookup === 'latest' && invoices.length > 0) {
                            invoiceToShow = [...invoices].sort((a, b) => new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime())[0];
                        } else if (numero_factura) {
                            invoiceToShow = invoices.find(inv => inv.numero_factura === numero_factura) || null;
                        }
                        
                        if (invoiceToShow) {
                            setInvoiceToView(invoiceToShow);
                        }
                        // This is a read action, no data was modified, so actionTaken remains false
                        break;
                }
                if(actionTaken) {
                    refreshData(); // Signal App component to refetch all data
                }
            } catch (error) {
                console.error("Error executing action:", error);
                const errorMessage: ChatMessage = {
                    id: `error-${Date.now()}`,
                    text: `Hubo un error al ejecutar la acción: ${error instanceof Error ? error.message : 'Error desconocido'}`,
                    sender: 'ai',
                    timestamp: new Date().toISOString(),
                };
                 setMessages(prev => [...prev, errorMessage]);
                 setIsTyping(false);
                 return;
            }
        }
        
        const aiMessage: ChatMessage = {
            id: `ai-${Date.now()}`,
            text: aiResponse.aiResponse,
            sender: 'ai',
            timestamp: new Date().toISOString(),
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
    };

    return (
        <div className="flex flex-col h-full bg-blanco-puro rounded-lg shadow-2xl border border-gris-platino">
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                {messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                ))}
                {isTyping && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-lavanda-digital flex items-center justify-center">
                            <BotIcon className="w-5 h-5 text-purpura-innovador" />
                        </div>
                        <div className="max-w-sm rounded-lg px-4 py-3 shadow-md bg-gris-tecnologico text-grafito">
                           <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-purpura-innovador rounded-full animate-pulse" style={{animationDelay: '0s'}}></span>
                                <span className="w-2 h-2 bg-purpura-innovador rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></span>
                                <span className="w-2 h-2 bg-purpura-innovador rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-gris-platino">
                <form onSubmit={handleSend} className="flex items-center space-x-3">
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe tu comando aquí..."
                        disabled={isTyping}
                        className="flex-1 w-full px-4 py-2 bg-gris-tecnologico text-grafito border border-gris-platino rounded-lg focus:outline-none focus:ring-2 focus:ring-purpura-innovador"
                    />
                    <button
                        type="submit"
                        disabled={isTyping || input.trim() === ''}
                        className="p-2 bg-fucsia-electrico text-white rounded-lg disabled:bg-gris-platino disabled:cursor-not-allowed hover:bg-opacity-90 transition-colors"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatInterface;