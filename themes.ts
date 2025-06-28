export interface ThemeColors {
    'purpura-innovador': string;
    'lavanda-digital': string;
    'gris-tecnologico': string;
    'fucsia-electrico': string;
    'cian-neon': string;
    'grafito': string;
    'gris-acero': string;
    'gris-platino': string;
    'blanco-puro': string;
}

export const themes: { [key: string]: ThemeColors } = {
    innovador: {
        'purpura-innovador': '#4A00E0',
        'lavanda-digital': '#D2B4DE',
        'gris-tecnologico': '#EAEAEA',
        'fucsia-electrico': '#E91E63',
        'cian-neon': '#00BCD4',
        'grafito': '#1A1A1A',
        'gris-acero': '#757575',
        'gris-platino': '#E0E0E0',
        'blanco-puro': '#FFFFFF',
    },
    corporativo: {
        'purpura-innovador': '#0A3D62', // Primario: Azul Corporativo
        'lavanda-digital': '#A9CCE3', // Secundario 1: Azul Suave
        'gris-tecnologico': '#EAF2F8', // Secundario 2: Gris Niebla
        'fucsia-electrico': '#F39C12', // Acento 1 (CTA): Naranja Éxito
        'cian-neon': '#E74C3C',       // Acento 2 (Alertas): Rojo Alerta
        'grafito': '#212529',         // Neutro (Texto): Gris Oscuro
        'gris-acero': '#6C757D',      // Neutro (Secundario): Gris Medio
        'gris-platino': '#CED4DA',    // Neutro (Bordes): Gris Claro
        'blanco-puro': '#F8F9FA',      // Neutro (Fondo): Blanco Roto
    },
    sereno: {
        'purpura-innovador': '#00695C', // Primario: Verde Sereno
        'lavanda-digital': '#E0F2F1', // Secundario 1: Menta Pálida
        'gris-tecnologico': '#F5EFE6', // Secundario 2: Arena Relajante
        'fucsia-electrico': '#D4A017', // Acento 1 (CTA): Ocre Dorado
        'cian-neon': '#EF9A9A',       // Acento 2 (Alerta): Coral Suave
        'grafito': '#37474F',         // Neutro (Texto): Gris Pizarra
        'gris-acero': '#8D9397',      // Neutro (Secundario): Gris Topo
        'gris-platino': '#CFD8DC',    // Neutro (Bordes): Gris Perla
        'blanco-puro': '#FCFCFC',      // Neutro (Fondo): Blanco Hueso
    },
    oscuro: {
        'purpura-innovador': '#8B5CF6', // Primario
        'lavanda-digital': '#C4B5FD', // Secundario 1
        'gris-tecnologico': '#374151', // Secundario 2
        'fucsia-electrico': '#F472B6', // Acento 1 (CTA)
        'cian-neon': '#22D3EE',       // Acento 2 (Datos)
        'grafito': '#F9FAFB',         // Neutro (Texto)
        'gris-acero': '#9CA3AF',      // Neutro (Secundario)
        'gris-platino': '#4B5567',    // Neutro (Bordes)
        'blanco-puro': '#111827',      // Neutro (Fondo)
    }
};