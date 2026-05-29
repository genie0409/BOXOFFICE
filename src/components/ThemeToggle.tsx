import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "motion/react";

interface ThemeToggleProps {
  onThemeChange?: (theme: "light" | "dark") => void;
}

export default function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    // Default to dark theme as it looks highly immersive for a cinema app!
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      // Fallback to true (dark theme default)
      return true;
    }
    return true;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
      if (onThemeChange) onThemeChange("dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
      if (onThemeChange) onThemeChange("light");
    }
  }, [isDark]);

  return (
    <button
      id="theme-toggle-button"
      onClick={() => setIsDark(!isDark)}
      className="relative flex items-center justify-center p-2 rounded-xl transition-all border border-gray-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm hover:shadow-md cursor-pointer outline-none focus:ring-2 focus:ring-sky-500"
      title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 180 : 0, scale: isDark ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        className={isDark ? "absolute hidden" : "block text-sky-550"}
      >
        <Sun className="w-5 h-5 fill-sky-500/20" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : -180, scale: isDark ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={isDark ? "block text-sky-450" : "absolute hidden"}
      >
        <Moon className="w-5 h-5 fill-sky-400/20" />
      </motion.div>
      <span className="sr-only">화면 모드 전환</span>
    </button>
  );
}
