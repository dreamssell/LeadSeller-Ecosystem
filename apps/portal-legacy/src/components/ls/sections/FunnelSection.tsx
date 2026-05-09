import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/ls/SectionHeading";

export const FunnelSection = () => {
  const { t } = useTranslation();

  const steps = [
    { label: t("funnel.step1_label"), title: t("funnel.step1_title"), desc: t("funnel.step1_desc"), w: "w-full", color: "border-t-cyan/30" },
    { label: t("funnel.step2_label"), title: t("funnel.step2_title"), desc: t("funnel.step2_desc"), w: "w-3/4", color: "border-t-cyan/60" },
    { label: t("funnel.step3_label"), title: t("funnel.step3_title"), desc: t("funnel.step3_desc"), w: "w-1/2", color: "border-t-lime" },
  ];

  return (
    <section id="funnel" className="relative py-28 md:py-36 bg-gradient-to-b from-surface to-[hsl(218_40%_96%)] overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading kicker={t("funnel.kicker")} title={t("funnel.title")} subtitle={t("funnel.subtitle")} />

        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual funnel */}
          <div className="relative h-[500px] flex flex-col items-center justify-center gap-5">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className={`glass-panel ${s.w} h-28 rounded-2xl flex items-center justify-center border-t-4 ${s.color} shadow-navy-soft`}
              >
                <div className="text-center">
                  <div className="text-[10px] font-extrabold uppercase tracking-widest text-navy/40 mb-1">
                    {s.label}
                  </div>
                  <div className="text-base font-extrabold text-navy">{s.title}</div>
                </div>
              </motion.div>
            ))}

            {/* Particles flowing through */}
            <div className="absolute inset-0 pointer-events-none">
              {[
                { l: "30%", d: "0s", c: "bg-navy/30" },
                { l: "45%", d: "0.6s", c: "bg-cyan" },
                { l: "55%", d: "1.2s", c: "bg-cyan" },
                { l: "65%", d: "1.8s", c: "bg-lime" },
                { l: "50%", d: "2.4s", c: "bg-lime" },
              ].map((p, i) => (
                <div
                  key={i}
                  className={`absolute top-0 size-2 rounded-full ${p.c} animate-flow shadow-cyan`}
                  style={{ left: p.l, animationDelay: p.d, animationDuration: "5s" }}
                />
              ))}
            </div>
          </div>

          {/* Text descriptions */}
          <div className="space-y-10">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="flex gap-5"
              >
                <div className="shrink-0 size-12 rounded-xl bg-navy text-white flex items-center justify-center font-extrabold text-lg shadow-navy-soft">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-cyan mb-1">
                    {s.label}
                  </div>
                  <h3 className="text-xl font-extrabold text-navy mb-2">{s.title}</h3>
                  <p className="text-navy/70 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
