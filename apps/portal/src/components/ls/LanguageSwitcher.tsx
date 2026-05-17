import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export const LanguageSwitcher = ({ className }: { className?: string }) => {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith("en") ? "en" : "pt";

  const set = (lng: "pt-BR" | "en") => i18n.changeLanguage(lng);

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-navy/5 p-1 text-[10px] font-extrabold uppercase tracking-widest",
        className
      )}
    >
      <button
        onClick={() => set("pt-BR")}
        className={cn(
          "px-2.5 py-1 rounded-full transition-all",
          current === "pt" ? "bg-white shadow-sm text-navy" : "text-navy/40 hover:text-navy"
        )}
        aria-label="Português"
      >
        PT
      </button>
      <button
        onClick={() => set("en")}
        className={cn(
          "px-2.5 py-1 rounded-full transition-all",
          current === "en" ? "bg-white shadow-sm text-navy" : "text-navy/40 hover:text-navy"
        )}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};
