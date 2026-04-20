import { createContext, useContext, useEffect } from "react";

type ThemeProviderContextType = {
  theme: "light";
  toggleTheme: () => void;
};

const ThemeProviderContext = createContext<ThemeProviderContextType>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
    localStorage.removeItem("theme");
  }, []);

  return (
    <ThemeProviderContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeProviderContext);
