import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ls/Button";

export const FinalCTASection = ({ onOpenDemo }: { onOpenDemo: () => void }) => {
  const { t } = useTranslation();

  return (
    <section className="relative py-28 md:py-40 bg-lime overflow-hidden">
      {/* Geometric accents */}
      <div className="absolute top-0 right-0 size-[500px] rounded-full bg-navy/5 blur-3xl -translate-y-1/3 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 size-[400px] rounded-full bg-cyan/10 blur-3xl translate-y-1/3 -translate-x-1/3" />
      <div className="absolute inset-0 bg-grid-navy opacity-30" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="relative mx-auto max-w-4xl px-6 text-center"
      >
        <h2 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-navy tracking-tight leading-[1.05] text-balance">
          {t("cta.title")}
        </h2>
        <p className="mt-8 text-xl text-navy/75 max-w-2xl mx-auto leading-relaxed text-pretty">
          {t("cta.subtitle")}
        </p>
        <div className="mt-12 flex justify-center">
          <Button variant="dark" size="xl" onClick={onOpenDemo} className="group">
            {t("cta.button")}
            <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </motion.div>
    </section>
  );
};
