import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { track } from "@/lib/analytics";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { CalendarIcon, CheckCircle2, Loader2, X } from "lucide-react";
import { z } from "zod";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ls/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Routed through Lovable Cloud BFF (lead-proxy edge function) which forwards to api.leadseller.com.br

// 08:00 → 20:00 BRT, 30-min slots, Sunday→Sunday (no day filter, all weekdays incl. Sun)
const TIME_SLOTS = Array.from({ length: 25 }, (_, i) => {
  const totalMin = 8 * 60 + i * 30;
  const h = Math.floor(totalMin / 60).toString().padStart(2, "0");
  const m = (totalMin % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
});

interface SchedulingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SchedulingModal = ({ open, onOpenChange }: SchedulingModalProps) => {
  const { t, i18n } = useTranslation();
  const dateLocale = i18n.language.startsWith("en") ? enUS : ptBR;

  const schema = z.object({
    name: z.string().trim().min(2, t("modal.validation_required")).max(100),
    email: z
      .string()
      .trim()
      .email(t("modal.validation_email"))
      .max(255),
    company: z.string().trim().min(1, t("modal.validation_required")).max(100),
    phone: z
      .string()
      .trim()
      .min(8, t("modal.validation_phone"))
      .max(32)
      .regex(/^[+\d][\d\s().-]{7,}$/, t("modal.validation_phone")),
    date: z.date({ required_error: t("modal.validation_required") }),
    time: z.string().min(1, t("modal.validation_required")),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState<Date | undefined>();
  const [time, setTime] = useState<string>("");
  const [hpField, setHpField] = useState(""); // honeypot — must stay empty
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const renderedAtRef = useRef<number>(Date.now());

  useEffect(() => { if (open) renderedAtRef.current = Date.now(); }, [open]);

  const reset = () => {
    setName(""); setEmail(""); setCompany(""); setPhone("");
    setDate(undefined); setTime(""); setHpField(""); setErrors({}); setStatus("idle");
  };

  const handleClose = (o: boolean) => {
    if (!o) setTimeout(reset, 300);
    onOpenChange(o);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = schema.safeParse({ name, email, company, phone, date, time });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setStatus("loading");

    const payload = {
      source: "leadseller.com.br",
      lead: {
        full_name: result.data.name,
        corporate_email: result.data.email,
        company: result.data.company,
        phone: result.data.phone,
      },
      scheduling: {
        date: format(result.data.date, "yyyy-MM-dd"),
        time: result.data.time,
        timezone: "America/Sao_Paulo",
        timezone_label: "BRT",
      },
      locale: i18n.language,
      hp_field: hpField,
      rendered_at: renderedAtRef.current,
    };

    try {
      const { data, error } = await supabase.functions.invoke("lead-proxy", { body: payload });
      if (error) throw error;
      if (data && (data as { error?: string }).error) {
        throw new Error((data as { error: string }).error);
      }
      track("demo_booked", { locale: i18n.language });
      setStatus("success");
    } catch (err) {
      console.error("[Lead Seller] BFF lead-proxy submission failed:", err, "Payload:", payload);
      setStatus("error");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "max-w-xl p-0 gap-0 border-0 bg-transparent shadow-none",
          // Backdrop applied via DialogOverlay override via portal; the Radix overlay
          // already uses bg-black/80 by default — we re-style via class on the panel.
        )}
      >
        <div className="relative rounded-2xl bg-white shadow-navy-soft overflow-hidden border border-navy/10">
          <button
            onClick={() => handleClose(false)}
            className="absolute right-4 top-4 z-10 rounded-full p-2 text-navy/50 hover:text-navy hover:bg-navy/5 transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>

          {/* Header strip */}
          <div className="px-8 pt-8 pb-6 bg-gradient-to-br from-navy to-[hsl(218_50%_28%)] text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan/15 px-3 py-1 mb-4">
              <div className="size-1.5 rounded-full bg-cyan animate-pulse-soft" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan">BRT · UTC-3</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">{t("modal.title")}</h2>
            <p className="text-sm text-white/70 mt-1.5">{t("modal.subtitle")}</p>
          </div>

          {status === "success" || status === "error" ? (
            <div className="p-10 flex flex-col items-center text-center gap-4">
              <div className={cn(
                "size-14 rounded-full flex items-center justify-center",
                status === "success" ? "bg-lime/20 text-lime" : "bg-cyan/20 text-cyan"
              )}>
                <CheckCircle2 className="size-7" />
              </div>
              <h3 className="text-xl font-extrabold text-navy">
                {status === "success" ? t("modal.success_title") : t("modal.error_title")}
              </h3>
              <p className="text-navy/60 text-sm max-w-sm">
                {status === "success" ? t("modal.success_desc") : t("modal.error_desc")}
              </p>
              <Button variant="dark" size="md" onClick={() => handleClose(false)} className="mt-2">
                OK
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="p-8 space-y-5">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-navy/60">
                  {t("modal.name_label")}
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("modal.name_placeholder")}
                  maxLength={100}
                  className="h-11 border-navy/15 focus-visible:ring-cyan"
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-navy/60">
                    {t("modal.email_label")}
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("modal.email_placeholder")}
                    maxLength={255}
                    className="h-11 border-navy/15 focus-visible:ring-cyan"
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-navy/60">
                    {t("modal.company_label")}
                  </Label>
                  <Input
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={t("modal.company_placeholder")}
                    maxLength={100}
                    className="h-11 border-navy/15 focus-visible:ring-cyan"
                  />
                  {errors.company && <p className="text-xs text-destructive">{errors.company}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-navy/60">
                  {t("modal.phone_label")}
                </Label>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t("modal.phone_placeholder")}
                  maxLength={32}
                  className="h-11 border-navy/15 focus-visible:ring-cyan"
                />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-navy/60">
                    {t("modal.date_label")}
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className={cn(
                          "h-11 w-full rounded-md border border-navy/15 bg-white px-3 text-left text-sm flex items-center justify-between hover:border-navy/30 transition-colors",
                          !date && "text-navy/40"
                        )}
                      >
                        {date ? format(date, "PPP", { locale: dateLocale }) : t("modal.date_placeholder")}
                        <CalendarIcon className="size-4 text-navy/50" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        locale={dateLocale}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold uppercase tracking-wider text-navy/60">
                    {t("modal.time_label")}
                  </Label>
                  <Select value={time} onValueChange={setTime}>
                    <SelectTrigger className="h-11 border-navy/15 focus:ring-cyan">
                      <SelectValue placeholder={t("modal.time_placeholder")} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {TIME_SLOTS.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot} BRT
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.time && <p className="text-xs text-destructive">{errors.time}</p>}
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {t("modal.submitting")}
                  </>
                ) : (
                  t("modal.submit")
                )}
              </Button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
