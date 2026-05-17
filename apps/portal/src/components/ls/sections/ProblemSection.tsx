import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, TrendingDown } from "lucide-react";
import { SectionHeading } from "@/components/ls/SectionHeading";

export const ProblemSection = () => {
  const { t } = useTranslation();

  const cards = [
    { icon: Clock, m: t("problem.card1_metric"), title: t("problem.card1_title"), desc: t("problem.card1_desc") },
    { icon: AlertTriangle, m: t("problem.card2_metric"), title: t("problem.card2_title"), desc: t("problem.card2_desc") },
    { icon: TrendingDown, m: t("problem.card3_metric"), title: t("problem.card3_title"), desc: t("problem.card3_desc") },
  ];

  return (
    <section className="relative py-28 md:py-36 bg-navy overflow-hidden">
      <div className="absolute inset-0 bg-grid-navy opacity-[0.03]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 size-[800px] rounded-full blur-[120px] bg-cyan/5 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading
          variant="dark"
          kicker={t("problem.kicker")}
          title={t("problem.title")}
          subtitle={t("problem.subtitle")}
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group relative rounded-2xl p-8 bg-white/[0.03] border border-white/10 backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-500 hover:-translate-y-1"
              >
                <div className="size-11 rounded-xl bg-cyan/10 border border-cyan/20 flex items-center justify-center mb-6">
                  <Icon className="size-5 text-cyan" />
                </div>
                <div className="text-5xl font-extrabold text-white tabular-nums tracking-tighter mb-2">
                  {c.m}
                </div>
                <h3 className="text-lg font-extrabold text-white mb-3">{c.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{c.desc}</p>
                <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
