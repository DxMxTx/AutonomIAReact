import React, { useState } from 'react';
import { UserData } from '../types';
import { AppLogo } from './IconComponents';

interface InitialSetupProps {
    onSave: (data: UserData) => void;
}

const defaultUserData: UserData = {
    nombre: '',
    nif: '',
    direccion: '',
    email: '',
    telefono: '',
    iban: '',
    invoice_format: 'F-{YYYY}-{COUNTER}',
    registro_mercantil: '',
};

export const InitialSetup: React.FC<InitialSetupProps> = ({ onSave }) => {
    const [userData, setUserData] = useState<UserData>(defaultUserData);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        onSave(userData);
        // The parent component will unmount this component upon state change.
    };
    
    const inputClass = "w-full px-3 py-2 bg-gris-tecnologico text-grafito border border-gris-platino rounded-lg focus:outline-none focus:ring-2 focus:ring-purpura-innovador";

    return (
        <div className="bg-blanco-puro min-h-screen flex flex-col justify-center items-center p-4 antialiased text-grafito">
            <div className="w-full max-w-2xl bg-blanco-puro rounded-xl shadow-2xl p-8 animate-fade-in border border-gris-platino">
                <div className="text-center mb-8">
                    <AppLogo className="w-16 h-16 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-grafito">¡Bienvenido a AutonomIA!</h1>
                    <p className="text-gris-acero mt-2">
                        Antes de empezar, necesitamos algunos datos. Esta información se usará para generar tus facturas y se guardará de forma segura <strong className="text-grafito">únicamente en tu navegador</strong>.
                    </p>
                </div>
                
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-grafito mb-1">Nombre / Razón Social</label>
                            <input type="text" id="nombre" name="nombre" value={userData.nombre} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label htmlFor="nif" className="block text-sm font-medium text-grafito mb-1">NIF / CIF</label>
                            <input type="text" id="nif" name="nif" value={userData.nif} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="direccion" className="block text-sm font-medium text-grafito mb-1">Dirección Fiscal</label>
                            <input type="text" id="direccion" name="direccion" value={userData.direccion} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-grafito mb-1">Email de Contacto</label>
                            <input type="email" id="email" name="email" value={userData.email} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-grafito mb-1">Teléfono</label>
                            <input type="tel" id="telefono" name="telefono" value={userData.telefono} onChange={handleChange} className={inputClass} required />
                        </div>
                    </div>
                     <p className="text-xs text-gris-acero text-center pt-2">
                        Podrás cambiar estos datos y añadir otros opcionales (IBAN, formato de factura, etc.) más tarde en la sección de "Ajustes".
                    </p>
                    <div className="pt-2">
                         <button type="submit" disabled={isSaving} className="w-full px-6 py-3 bg-fucsia-electrico text-white font-bold text-lg rounded-lg disabled:bg-opacity-50 hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blanco-puro focus:ring-fucsia-electrico">
                            {isSaving ? 'Guardando...' : 'Guardar y Empezar a Gestionar'}
                        </button>
                    </div>
                </form>
            </div>
             <footer className="text-center mt-8 text-sm text-gris-acero">
                <p>&copy; {new Date().getFullYear()} AutonomIA. Todos los datos se guardan localmente.</p>
            </footer>
        </div>
    );
};