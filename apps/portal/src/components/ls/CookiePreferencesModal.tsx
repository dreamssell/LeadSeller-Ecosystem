import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Shield, BarChart3, Megaphone, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ls/Button";
import { getConsent, setConsent, acceptAll, rejectNonEssential, OPEN_PREFERENCES_EVENT } from "@/lib/consent";
import { cn } from "@/lib/utils";

export const CookiePreferencesModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const handler = () => {
      const c = getConsent();
      setAnalytics(c.analytics);
      setMarketing(c.marketing);
      setOpen(true);
    };
    window.addEventListener(OPEN_PREFERENCES_EVENT, handler);
    return () => window.removeEventListener(OPEN_PREFERENCES_EVENT, handler);
  }, []);

  const save = () => { setConsent({ analytics, marketing }); setOpen(false); };
  const acceptAllClick = () => { acceptAll(); setOpen(false); };
  const rejectClick = () => { rejectNonEssential(); setOpen(false); };

  const Row = ({
    icon: Icon, title, desc, checked, onChange, locked,
  }: {
    icon: typeof Shield; title: string; desc: string;
    checked: boolean; onChange?: (v: boolean) => void; locked?: boolean;
  }) => (
    <div className={cn(
      "rounded-xl border border-navy/10 bg-white p-4 flex items-start gap-4",
      locked && "bg-navy/[0.02]"
    )}>
      <div className="size-10 rounded-lg bg-cyan/10 text-cyan flex items-center justify-center shrink-0">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-extrabold text-navy">{title}</h4>
          {locked ? (
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-cyan">
              {t("preferences.always_on")}
            </span>
          ) : (
            <Switch checked={checked} onCheckedChange={onChange} />
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-navy/65">{desc}</p>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0 gap-0 border-0 bg-transparent shadow-none">
        <div className="relative rounded-2xl bg-white shadow-navy-soft overflow-hidden border border-navy/10">
          <button
            onClick={() => setOpen(false)}
            aria-label={t("cookies.close")}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-navy/50 hover:text-navy hover:bg-navy/5 transition-colors"
          >
            <X className="size-4" />
          </button>

          <div className="px-6 pt-6 pb-5 bg-gradient-to-br from-navy to-[hsl(218_50%_28%)] text-white">
            <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan mb-2">
              {t("preferences.kicker")}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">{t("preferences.title")}</h2>
            <p className="text-xs text-white/70 mt-1.5 leading-relaxed">{t("preferences.subtitle")}</p>
          </div>

          <div className="p-5 space-y-3 max-h-[55vh] overflow-y-auto">
            <Row
              icon={Shield}
              title={t("preferences.essential_title")}
              desc={t("preferences.essential_desc")}
              checked
              locked
            />
            <Row
              icon={BarChart3}
              title={t("preferences.analytics_title")}
              desc={t("preferences.analytics_desc")}
              checked={analytics}
              onChange={setAnalytics}
            />
            <Row
              icon={Megaphone}
              title={t("preferences.marketing_title")}
              desc={t("preferences.marketing_desc")}
              checked={marketing}
              onChange={setMarketing}
            />
          </div>

          <div className="p-5 pt-2 border-t border-navy/10 bg-navy/[0.02] flex flex-col-reverse sm:flex-row gap-2 sm:justify-between sm:items-center">
            <Button variant="secondary" size="sm" onClick={rejectClick}>
              {t("preferences.reject_all")}
            </Button>
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <Button variant="dark" size="sm" onClick={save}>
                {t("preferences.save")}
              </Button>
              <Button variant="primary" size="sm" onClick={acceptAllClick}>
                {t("preferences.accept_all")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
