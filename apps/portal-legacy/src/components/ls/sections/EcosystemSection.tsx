import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Check, MessageSquare, Headphones, Phone } from "lucide-react";
import { SectionHeading } from "@/components/ls/SectionHeading";
import { cn } from "@/lib/utils";

interface Solution {
  kicker: string;
  title: string;
  desc: string;
  bullets: string[];
  mockup: React.ReactNode;
}

const SDRMockup = () => (
  <div className="glass-panel rounded-2xl p-6 w-full max-w-md shadow-navy-soft">
    <div className="flex items-center justify-between mb-5">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-navy/40">Inbox Omnichannel</div>
      <div className="flex items-center gap-1.5">
        <div className="size-1.5 rounded-full bg-lime animate-pulse-soft" />
        <span className="text-[10px] font-bold text-lime">LIVE</span>
      </div>
    </div>
    <div className="space-y-2.5">
      {[
        { ch: "WhatsApp", color: "bg-lime/20 text-lime", txt: "Olá, quero saber sobre o plano enterprise...", tag: "HOT", tagC: "bg-lime text-navy" },
        { ch: "Instagram", color: "bg-cyan/20 text-cyan", txt: "Vocês atendem fora do Brasil?", tag: "MID", tagC: "bg-cyan/20 text-cyan" },
        { ch: "LinkedIn", color: "bg-navy/10 text-navy", txt: "Demo agendada · 14:30 BRT", tag: "WIN", tagC: "bg-navy text-white" },
      ].map((m, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/60 border border-navy/5 hover:border-navy/15 transition-colors">
          <div className={cn("px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider", m.color)}>{m.ch}</div>
          <div className="flex-1 text-xs text-navy/70 truncate">{m.txt}</div>
          <div className={cn("px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-widest", m.tagC)}>{m.tag}</div>
        </div>
      ))}
    </div>
    <div className="mt-5 pt-4 border-t border-navy/5 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-navy/40">
      <span>Avg response</span>
      <span className="text-cyan">1.4s</span>
    </div>
  </div>
);

const HelpDeskMockup = () => (
  <div className="glass-panel rounded-2xl p-6 w-full max-w-md shadow-navy-soft">
    <div className="flex items-center justify-between mb-5">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-navy/40">Ticket Triage AI</div>
      <Headphones className="size-4 text-cyan" />
    </div>
    <div className="grid grid-cols-3 gap-2 mb-5">
      {[
        { v: "78%", l: "Auto-resolved" },
        { v: "12s", l: "First response" },
        { v: "94", l: "CSAT" },
      ].map((s, i) => (
        <div key={i} className="text-center p-3 rounded-lg bg-white/60 border border-navy/5">
          <div className="text-lg font-extrabold text-navy tabular-nums">{s.v}</div>
          <div className="text-[9px] font-bold text-navy/40 uppercase tracking-wider mt-0.5">{s.l}</div>
        </div>
      ))}
    </div>
    <div className="space-y-2">
      {[
        { p: "P1", c: "bg-destructive/15 text-destructive", t: "Database connection timeout" },
        { p: "P2", c: "bg-cyan/15 text-cyan", t: "Reset 2FA · auto-resolved" },
        { p: "P3", c: "bg-navy/10 text-navy/60", t: "Billing inquiry · routed" },
      ].map((t, i) => (
        <div key={i} className="flex items-center gap-2 text-xs p-2 rounded bg-white/40">
          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-extrabold", t.c)}>{t.p}</span>
          <span className="text-navy/70 truncate">{t.t}</span>
        </div>
      ))}
    </div>
  </div>
);

const VoiceMockup = () => (
  <div className="glass-panel rounded-2xl p-6 w-full max-w-md shadow-navy-soft">
    <div className="flex items-center justify-between mb-5">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-navy/40">Live Call · SIP</div>
      <div className="flex items-center gap-1.5">
        <Phone className="size-3 text-lime animate-pulse-soft" />
        <span className="text-[10px] font-bold text-lime">02:14</span>
      </div>
    </div>
    <div className="rounded-lg bg-navy p-4 mb-4">
      <div className="flex items-end gap-0.5 h-12">
        {[40, 70, 50, 90, 60, 80, 45, 95, 55, 75, 50, 85, 60, 40, 70, 50, 80].map((h, i) => (
          <div key={i} className="flex-1 bg-cyan rounded-sm" style={{ height: `${h}%` }} />
        ))}
      </div>
      <div className="flex justify-between mt-3 text-[9px] font-bold tracking-widest text-white/40 uppercase">
        <span>Speaker · Cliente</span>
        <span className="text-lime">Sentiment +0.82</span>
      </div>
    </div>
    <div className="space-y-1.5 text-xs">
      <div className="text-navy/70">"...preciso de uma solução que escale com nossa operação."</div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-[9px] font-extrabold uppercase tracking-widest text-cyan">AI Suggests</span>
        <span className="text-navy/80 italic">Mention enterprise SLA tier</span>
      </div>
    </div>
  </div>
);

export const EcosystemSection = () => {
  const { t } = useTranslation();

  const solutions: Solution[] = [
    {
      kicker: t("ecosystem.sdr_kicker"),
      title: t("ecosystem.sdr_title"),
      desc: t("ecosystem.sdr_desc"),
      bullets: [t("ecosystem.sdr_b1"), t("ecosystem.sdr_b2"), t("ecosystem.sdr_b3")],
      mockup: <SDRMockup />,
    },
    {
      kicker: t("ecosystem.help_kicker"),
      title: t("ecosystem.help_title"),
      desc: t("ecosystem.help_desc"),
      bullets: [t("ecosystem.help_b1"), t("ecosystem.help_b2"), t("ecosystem.help_b3")],
      mockup: <HelpDeskMockup />,
    },
    {
      kicker: t("ecosystem.voice_kicker"),
      title: t("ecosystem.voice_title"),
      desc: t("ecosystem.voice_desc"),
      bullets: [t("ecosystem.voice_b1"), t("ecosystem.voice_b2"), t("ecosystem.voice_b3")],
      mockup: <VoiceMockup />,
    },
  ];

  return (
    <section id="ecosystem" className="relative py-28 md:py-36 bg-surface overflow-hidden">
      <div className="absolute top-1/4 right-0 size-[600px] rounded-full blur-[120px]" style={{ background: "var(--gradient-cyan-glow)" }} />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading kicker={t("ecosystem.kicker")} title={t("ecosystem.title")} subtitle={t("ecosystem.subtitle")} />

        <div className="mt-24 space-y-28">
          {solutions.map((s, i) => {
            const reverse = i % 2 === 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center",
                  reverse && "lg:[&>*:first-child]:order-2"
                )}
              >
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-cyan">
                    {s.kicker}
                  </span>
                  <h3 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-extrabold text-navy tracking-tight leading-[1.1] text-balance">
                    {s.title}
                  </h3>
                  <p className="mt-5 text-lg text-navy/70 leading-relaxed text-pretty">{s.desc}</p>
                  <ul className="mt-7 space-y-3">
                    {s.bullets.map((b, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <div className="mt-0.5 size-5 rounded-full bg-lime/20 flex items-center justify-center shrink-0">
                          <Check className="size-3 text-navy" strokeWidth={3} />
                        </div>
                        <span className="text-navy/80 text-base">{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex justify-center">{s.mockup}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
