import React, { useState, createContext } from "react";

export const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <div data-bs-theme={theme} >
                {children}
            </div>
        </ThemeContext.Provider>
    );
};