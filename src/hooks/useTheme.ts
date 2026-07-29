import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "taskflow-theme";

function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// El tema inicial ya se aplica en index.html (script inline) para evitar
// parpadeo antes de que React monte. Este hook solo sincroniza el estado
// de React con ese valor y persiste los cambios que el usuario haga.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }

  return { theme, toggleTheme };
}
