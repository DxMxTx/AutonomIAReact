import React, { createContext, useState, useEffect, useMemo } from 'react';
import { themes, ThemeColors } from '../themes';

interface ThemeContextType {
    theme: string;
    setTheme: (theme: string) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
    theme: 'innovador',
    setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        try {
            const savedTheme = localStorage.getItem('app-theme');
            return savedTheme && themes[savedTheme] ? savedTheme : 'innovador';
        } catch (error) {
            return 'innovador';
        }
    });

    useEffect(() => {
        const applyTheme = (themeName: string) => {
            const selectedTheme = themes[themeName] as ThemeColors;
            if (!selectedTheme) return;

            const root = document.documentElement;
            const styleSheetId = 'app-theme-styles';
            let styleSheet = document.getElementById(styleSheetId);

            if (!styleSheet) {
                styleSheet = document.createElement('style');
                styleSheet.id = styleSheetId;
                document.head.appendChild(styleSheet);
            }
            
            const cssVariables = Object.entries(selectedTheme)
                .map(([key, value]) => `--${key}: ${value};`)
                .join('\n');

            styleSheet.innerHTML = `:root {\n${cssVariables}\n}`;

            try {
                localStorage.setItem('app-theme', themeName);
            } catch (error) {
                console.error("Could not save theme to localStorage", error);
            }
        };

        applyTheme(theme);
    }, [theme]);

    const value = useMemo(() => ({ theme, setTheme }), [theme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};