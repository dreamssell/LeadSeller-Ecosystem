import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ArrowDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ls/Button";

interface HeroProps { onOpenDemo: () => void; }

export const HeroSection = ({ onOpenDemo }: HeroProps) => {
  const { t } = useTranslation();

  return (
    <section id="top" className="relative overflow-hidden pt-32 pb-24 lg:pt-40 lg:pb-32 bg-grid-navy">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 size-[800px] rounded-full blur-[120px] pointer-events-none"
           style={{ background: "var(--gradient-cyan-glow)" }} />
      <div className="absolute bottom-0 left-0 size-[600px] rounded-full blur-[100px] pointer-events-none"
           style={{ background: "var(--gradient-lime-glow)" }} />

      <div className="relative mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-7 z-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan/10 border border-cyan/20 px-4 py-1.5 mb-8">
            <Sparkles className="size-3 text-cyan" />
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-cyan">
              {t("hero.badge")}
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.04] text-navy text-balance">
            {t("hero.title_part1")}{" "}
            <span className="text-cyan text-glow-cyan">{t("hero.title_accent")}</span>
          </h1>

          <p className="mt-8 max-w-[55ch] text-lg md:text-xl text-navy/70 leading-relaxed text-pretty">
            {t("hero.subtitle")}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Button variant="primary" size="lg" onClick={onOpenDemo}>
              {t("hero.cta_primary")}
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#funnel">
                {t("hero.cta_secondary")}
                <ArrowDown className="size-4" />
              </a>
            </Button>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 pt-10 border-t border-navy/10">
            {[
              { v: t("hero.metric1_value"), l: t("hero.metric1_label") },
              { v: t("hero.metric2_value"), l: t("hero.metric2_label") },
              { v: t("hero.metric3_value"), l: t("hero.metric3_label") },
            ].map((m, i) => (
              <div key={i}>
                <div className="text-2xl md:text-3xl font-extrabold text-navy tabular-nums tracking-tighter">{m.v}</div>
                <div className="text-[10px] md:text-xs font-bold text-navy/40 uppercase tracking-widest mt-1">{m.l}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Glassmorphism Funnel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="lg:col-span-5 relative h-[520px] hidden lg:flex items-center justify-center"
        >
          <div className="relative w-full h-full flex flex-col items-center justify-center gap-3">
            {/* Funnel stack */}
            <div className="glass-panel w-80 h-24 rounded-2xl flex items-center justify-center border-t-2 border-t-cyan/40">
              <span className="text-[10px] font-extrabold text-navy/50 uppercase tracking-widest">Top of Funnel</span>
            </div>
            <div className="glass-panel w-60 h-20 rounded-2xl flex items-center justify-center border-t-2 border-t-cyan/60 shadow-cyan/30">
              <span className="text-[10px] font-extrabold text-navy/60 uppercase tracking-widest">AI Qualified</span>
            </div>
            <div className="glass-panel w-40 h-16 rounded-2xl flex items-center justify-center border-t-2 border-t-lime/70 shadow-lime">
              <span className="text-[10px] font-extrabold text-navy/80 uppercase tracking-widest">Ready to Close</span>
            </div>

            {/* Vertical particle stream */}
            <div className="absolute inset-0 pointer-events-none">
              {[
                { l: "48%", d: "0s", c: "bg-cyan" },
                { l: "52%", d: "0.8s", c: "bg-lime" },
                { l: "50%", d: "1.6s", c: "bg-cyan" },
                { l: "46%", d: "2.4s", c: "bg-lime" },
                { l: "54%", d: "3.2s", c: "bg-cyan" },
              ].map((p, i) => (
                <div
                  key={i}
                  className={`absolute top-10 size-1.5 rounded-full ${p.c} animate-flow shadow-cyan`}
                  style={{ left: p.l, animationDelay: p.d }}
                />
              ))}
            </div>

            {/* Floating performance card */}
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 glass-panel p-5 rounded-2xl w-56 shadow-navy-soft border-l-2 border-l-lime">
              <div className="flex items-end gap-1 h-16 mb-3">
                {[40, 55, 45, 70, 85, 100].map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${i >= 4 ? (i === 5 ? "bg-lime" : "bg-cyan/60") : "bg-navy/10"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="text-[9px] font-bold uppercase text-navy/40 tracking-widest">Conversion Rate</div>
              <div className="text-xl font-extrabold text-navy tabular-nums">+142.8%</div>
            </div>

            {/* Floating status pill */}
            <div className="absolute -left-2 top-12 glass-panel px-4 py-2.5 rounded-full flex items-center gap-2 shadow-glass">
              <div className="size-1.5 rounded-full bg-lime animate-pulse-soft" />
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-navy">Live · 24 leads/min</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
