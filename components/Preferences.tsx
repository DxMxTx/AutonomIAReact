import React, { useState, useRef, useContext } from 'react';
import { UserData } from '../types';
import { DownloadIcon, UploadIcon } from './IconComponents';
import { ThemeContext } from '../contexts/ThemeContext';
import { themes } from '../themes';

interface PreferencesProps {
    initialUserData: UserData | null;
    onSave: (data: UserData) => void;
    onClose: () => void;
    onExport: () => void;
    onImport: (file: File) => Promise<string>;
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

export const Preferences: React.FC<PreferencesProps> = ({ initialUserData, onSave, onClose, onExport, onImport }) => {
    const [userData, setUserData] = useState<UserData>(initialUserData || defaultUserData);
    const [isSaving, setIsSaving] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { theme, setTheme } = useContext(ThemeContext);
    const themeEntries = Object.entries(themes);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUserData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        onSave(userData);
        setIsSaving(false);
        setNotification({ type: 'success', message: 'Datos guardados correctamente.' });
        setTimeout(() => setNotification(null), 3000);
    };
    
    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsImporting(true);
            setNotification(null);
            try {
                const message = await onImport(file);
                setNotification({ type: 'success', message });
                setTimeout(() => window.location.reload(), 2000);
            } catch (error) {
                const message = error instanceof Error ? error.message : "Error desconocido.";
                setNotification({ type: 'error', message });
            } finally {
                setIsImporting(false);
            }
        }
        // Reset file input value to allow re-uploading the same file
        if (e.target) {
            e.target.value = '';
        }
    };
    
    const inputClass = "w-full px-3 py-2 bg-gris-tecnologico text-grafito border border-gris-platino rounded-lg focus:outline-none focus:ring-2 focus:ring-purpura-innovador";

    return (
        <div className="bg-blanco-puro rounded-lg shadow-2xl p-6 sm:p-8 max-w-5xl mx-auto w-full animate-fade-in h-full overflow-y-auto border border-gris-platino">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-grafito">Preferencias y Ajustes</h2>
                <button onClick={onClose} className="text-gris-acero hover:text-grafito text-3xl leading-none">&times;</button>
            </div>

            {notification && (
                <div className={`p-4 mb-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {notification.message}
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                {/* User Data Section */}
                <div className="p-6 border border-gris-platino rounded-lg">
                    <h3 className="text-lg font-semibold text-purpura-innovador mb-4">Mis Datos (para facturas)</h3>
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
                            <label htmlFor="direccion" className="block text-sm font-medium text-grafito mb-1">Dirección</label>
                            <input type="text" id="direccion" name="direccion" value={userData.direccion} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-grafito mb-1">Email</label>
                            <input type="email" id="email" name="email" value={userData.email} onChange={handleChange} className={inputClass} required />
                        </div>
                        <div>
                            <label htmlFor="telefono" className="block text-sm font-medium text-grafito mb-1">Teléfono</label>
                            <input type="tel" id="telefono" name="telefono" value={userData.telefono} onChange={handleChange} className={inputClass} required />
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="iban" className="block text-sm font-medium text-grafito mb-1">IBAN (Opcional)</label>
                            <input type="text" id="iban" name="iban" value={userData.iban || ''} onChange={handleChange} className={inputClass} />
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="registro_mercantil" className="block text-sm font-medium text-grafito mb-1">Registro Mercantil (Opcional)</label>
                            <input type="text" id="registro_mercantil" name="registro_mercantil" value={userData.registro_mercantil || ''} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>
                </div>

                {/* Invoice Settings Section */}
                <div className="p-6 border border-gris-platino rounded-lg">
                    <h3 className="text-lg font-semibold text-purpura-innovador mb-4">Configuración de Facturas</h3>
                     <div>
                        <label htmlFor="invoice_format" className="block text-sm font-medium text-grafito mb-1">Formato de numeración de facturas</label>
                        <input type="text" id="invoice_format" name="invoice_format" value={userData.invoice_format || ''} onChange={handleChange} className={inputClass} />
                        <p className="mt-2 text-sm text-gris-acero">
                           Define la plantilla para tus números de factura. Usa <code className="text-fucsia-electrico bg-lavanda-digital/50 px-1 rounded">{'{YYYY}'}</code> para el año, <code className="text-fucsia-electrico bg-lavanda-digital/50 px-1 rounded">{'{YY}'}</code> para el año corto, y <code className="text-fucsia-electrico bg-lavanda-digital/50 px-1 rounded">{'{COUNTER}'}</code> para el número secuencial (ej. 0001).
                        </p>
                    </div>
                </div>

                {/* Theme Section */}
                <div className="p-6 border border-gris-platino rounded-lg">
                    <h3 className="text-lg font-semibold text-purpura-innovador mb-4">Temas de la Aplicación</h3>
                    <p className="text-sm text-gris-acero mb-4">
                        Haz clic en un círculo para cambiar la apariencia de la aplicación. Tu selección se guardará para la próxima vez que nos visites.
                    </p>
                    <div className="flex items-center justify-around p-4 rounded-lg bg-gris-tecnologico/50">
                        {themeEntries.map(([themeKey, themeValue]) => (
                            <div key={themeKey} className="flex flex-col items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTheme(themeKey)}
                                    className={`w-12 h-12 rounded-full cursor-pointer transition-all duration-200 ease-in-out transform hover:scale-110 ${theme === themeKey ? 'ring-4 ring-offset-2 ring-fucsia-electrico' : 'ring-2 ring-transparent'}`}
                                    style={{
                                        backgroundColor: themeValue['purpura-innovador'],
                                        '--tw-ring-offset-color': themeValue['blanco-puro'],
                                    } as React.CSSProperties}
                                    aria-label={`Activar tema ${themeKey}`}
                                />
                                <span className="text-xs font-medium text-gris-acero capitalize">{themeKey}</span>
                            </div>
                        ))}
                    </div>
                </div>


                 {/* DB Management Section */}
                <div className="p-6 border border-gris-platino rounded-lg">
                    <h3 className="text-lg font-semibold text-purpura-innovador mb-4">Gestión de Datos</h3>
                    <p className="text-sm text-gris-acero mb-4">
                        Realiza una copia de seguridad de todos tus datos o restaura la aplicación desde un archivo previo. La importación reemplazará todos los datos actuales.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button type="button" onClick={onExport} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gris-acero text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors">
                            <DownloadIcon className="w-5 h-5" />
                            <span>Hacer Copia de Seguridad (Exportar)</span>
                        </button>
                        <button type="button" onClick={handleImportClick} disabled={isImporting} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gris-acero text-white font-semibold rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-wait">
                            <UploadIcon className="w-5 h-5" />
                            <span>{isImporting ? 'Importando...' : 'Restaurar Copia (Importar)'}</span>
                        </button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />
                    </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                     <button type="submit" disabled={isSaving} className="px-6 py-2 bg-fucsia-electrico text-white font-semibold rounded-lg disabled:bg-opacity-50 hover:bg-opacity-90 transition-colors">
                        {isSaving ? 'Guardando...' : 'Guardar Preferencias'}
                    </button>
                </div>
            </form>
        </div>
    );
};