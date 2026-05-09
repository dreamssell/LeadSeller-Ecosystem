import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Cookie, Settings2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ls/Button";
import { cn } from "@/lib/utils";
import { acceptAll, rejectNonEssential, hasDecided, openPreferences } from "@/lib/consent";

export const CookieConsent = () => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!hasDecided()) {
      const id = window.setTimeout(() => setVisible(true), 600);
      return () => window.clearTimeout(id);
    }
  }, []);

  if (!visible) return null;

  const close = (action: "accept" | "essential") => {
    if (action === "accept") acceptAll(); else rejectNonEssential();
    setVisible(false);
  };

  const privacyHref = i18n.language.startsWith("en") ? "/privacy" : "/privacidade";

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={t("cookies.title")}
      className={cn(
        "fixed inset-x-4 bottom-4 z-[60] sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md",
        "animate-in fade-in slide-in-from-bottom-4 duration-500"
      )}
    >
      <div className="relative rounded-2xl border border-navy/10 bg-white/95 backdrop-blur-xl shadow-navy-soft p-5 sm:p-6">
        <button
          onClick={() => close("essential")}
          aria-label={t("cookies.close")}
          className="absolute right-3 top-3 rounded-full p-1.5 text-navy/40 hover:text-navy hover:bg-navy/5 transition-colors"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-cyan/10 text-cyan flex items-center justify-center shrink-0">
            <Cookie className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan mb-1">
              {t("cookies.kicker")}
            </div>
            <h3 className="text-sm font-extrabold text-navy">{t("cookies.title")}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-navy/65">
              {t("cookies.description")}{" "}
              <Link
                to={privacyHref}
                className="font-semibold text-navy underline decoration-cyan/60 underline-offset-2 hover:decoration-cyan"
              >
                {t("cookies.policy_link")}
              </Link>
              .
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => { setVisible(false); openPreferences(); }}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-navy/60 hover:text-cyan transition-colors px-2 py-2"
          >
            <Settings2 className="size-3.5" />
            {t("cookies.preferences")}
          </button>
          <Button variant="secondary" size="sm" onClick={() => close("essential")}>
            {t("cookies.essential_only")}
          </Button>
          <Button variant="primary" size="sm" onClick={() => close("accept")}>
            {t("cookies.accept_all")}
          </Button>
        </div>
      </div>
    </div>
  );
};
