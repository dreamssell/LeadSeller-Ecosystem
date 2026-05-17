import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ls/Button";
import { LanguageSwitcher } from "@/components/ls/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { useCompanyBranding } from "@/hooks/use-company-branding";

const AUTH_URL = "https://acesso.leadseller.com.br/";

interface NavBarProps {
  onOpenDemo: () => void;
}

export const NavBar = ({ onOpenDemo }: NavBarProps) => {
  const { t } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { name, logoUrl } = useCompanyBranding();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
        className={cn(
          "fixed top-0 z-50 w-full border-b transition-all duration-300",
          scrolled
            ? "bg-surface/85 backdrop-blur-xl border-navy/10 shadow-glass"
            : "bg-surface/40 backdrop-blur-sm border-transparent"
        )}
      >
        <div className="mx-auto flex h-14 md:h-20 max-w-7xl items-center justify-between px-4 md:px-6">
          <a href="#top" className="flex items-center gap-2.5 group min-w-0">
            <img
              src={logoUrl}
              alt={name}
              className="h-8 md:h-10 w-auto transition-transform group-hover:scale-105"
            />
            <span className="hidden md:inline text-lg font-extrabold tracking-tighter uppercase text-navy">
              {name}
            </span>
          </a>

          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-navy/60">
            <a href="#ecosystem" className="hover:text-navy transition-colors">{t("nav.platform")}</a>
            <a href="#funnel" className="hover:text-navy transition-colors">{t("nav.solutions")}</a>
            <a href="#advantages" className="hover:text-navy transition-colors">{t("nav.enterprise")}</a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="secondary" size="sm" asChild>
              <a href={AUTH_URL}>{t("nav.login")}</a>
            </Button>
            <Button variant="primary" size="sm" onClick={onOpenDemo}>
              {t("nav.demo")}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-full text-navy hover:bg-navy/5 transition-colors"
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-navy/10 bg-surface/95 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-4 flex flex-col gap-4">
              <nav className="flex flex-col gap-1 text-sm font-semibold text-navy/70">
                <a href="#ecosystem" onClick={() => setMenuOpen(false)} className="py-2">{t("nav.platform")}</a>
                <a href="#funnel" onClick={() => setMenuOpen(false)} className="py-2">{t("nav.solutions")}</a>
                <a href="#advantages" onClick={() => setMenuOpen(false)} className="py-2">{t("nav.enterprise")}</a>
              </nav>
              <div className="flex items-center justify-between gap-3">
                <LanguageSwitcher />
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="secondary" size="sm" asChild>
                  <a href={AUTH_URL}>{t("nav.login")}</a>
                </Button>
                <Button variant="primary" size="sm" onClick={() => { setMenuOpen(false); onOpenDemo(); }}>
                  {t("nav.demo")}
                </Button>
              </div>
            </div>
          </div>
        )}
    </nav>
  );
};
