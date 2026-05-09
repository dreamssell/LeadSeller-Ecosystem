import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";
import { openPreferences } from "@/lib/consent";
import { useCompanyBranding } from "@/hooks/use-company-branding";

export const Footer = () => {
  const { t, i18n } = useTranslation();
  const { name, logoUrl } = useCompanyBranding();
  const privacyHref = i18n.language.startsWith("en") ? "/privacy" : "/privacidade";

  return (
    <footer className="bg-navy text-white py-14 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt={name} className="h-10 w-auto" />
          <div>
            <div className="font-extrabold uppercase tracking-tighter">{name}</div>
            <div className="text-[11px] text-white/50">{t("footer.tagline")}</div>
          </div>
        </div>

        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] font-bold uppercase tracking-widest">
          <Link to={privacyHref} className="text-white/60 hover:text-cyan transition-colors">
            {t("footer.privacy")}
          </Link>
          <button
            type="button"
            onClick={openPreferences}
            className="inline-flex items-center gap-1.5 text-white/60 hover:text-cyan transition-colors"
          >
            <Settings2 className="size-3" />
            {t("footer.cookie_preferences")}
          </button>
          <a href="mailto:contato@leadseller.com.br" className="text-white/60 hover:text-cyan transition-colors">
            {t("footer.contact")}
          </a>
        </nav>

        <div className="text-[11px] font-bold uppercase tracking-widest text-white/40">
          {t("footer.rights")}
        </div>
      </div>
    </footer>
  );
};
