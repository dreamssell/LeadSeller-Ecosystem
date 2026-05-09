import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { HardDrive, ShieldCheck, Network } from "lucide-react";
import { SectionHeading } from "@/components/ls/SectionHeading";

export const AdvantagesSection = () => {
  const { t } = useTranslation();

  const items = [
    { icon: HardDrive, title: t("advantages.drive_title"), desc: t("advantages.drive_desc"), accent: "lime" as const },
    { icon: ShieldCheck, title: t("advantages.security_title"), desc: t("advantages.security_desc"), accent: "cyan" as const },
    { icon: Network, title: t("advantages.ecosystem_title"), desc: t("advantages.ecosystem_desc"), accent: "navy" as const },
  ];

  return (
    <section id="advantages" className="relative py-28 md:py-36 bg-surface overflow-hidden">
      <div className="absolute bottom-0 right-1/4 size-[600px] rounded-full blur-[120px]" style={{ background: "var(--gradient-lime-glow)" }} />

      <div className="relative mx-auto max-w-7xl px-6">
        <SectionHeading kicker={t("advantages.kicker")} title={t("advantages.title")} subtitle={t("advantages.subtitle")} />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((it, i) => {
            const Icon = it.icon;
            const featured = it.accent === "lime";
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`group relative rounded-2xl p-8 transition-all duration-500 hover:-translate-y-1 ${
                  featured
                    ? "bg-navy text-white shadow-navy-soft border border-navy"
                    : "bg-white border border-navy/10 hover:border-navy/20 hover:shadow-glass"
                }`}
              >
                {featured && (
                  <div className="absolute -top-3 left-8 px-3 py-1 rounded-full bg-lime text-navy text-[10px] font-extrabold uppercase tracking-widest shadow-lime">
                    Diferencial
                  </div>
                )}
                <div className={`size-12 rounded-xl flex items-center justify-center mb-6 ${
                  featured ? "bg-lime/20 text-lime" : it.accent === "cyan" ? "bg-cyan/10 text-cyan" : "bg-navy/5 text-navy"
                }`}>
                  <Icon className="size-6" />
                </div>
                <h3 className={`text-xl font-extrabold mb-3 ${featured ? "text-white" : "text-navy"}`}>
                  {it.title}
                </h3>
                <p className={`text-sm leading-relaxed ${featured ? "text-white/70" : "text-navy/65"}`}>
                  {it.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
