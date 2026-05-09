import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Settings2 } from "lucide-react";
import { NavBar } from "@/components/ls/NavBar";
import { Footer } from "@/components/ls/Footer";
import { Button } from "@/components/ls/Button";
import { SEO } from "@/components/ls/SEO";
import { openPreferences } from "@/lib/consent";

const Privacy = () => {
  const { t, i18n } = useTranslation();
  const isEn = i18n.language?.startsWith("en");
  const path = isEn ? "/privacy" : "/privacidade";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: t("privacy.meta_title"),
    description: t("privacy.meta_description"),
    inLanguage: isEn ? "en" : "pt-BR",
    url: `https://leadseller.com.br${path}`,
  };

  const sections = t("privacy.sections", { returnObjects: true }) as { title: string; body: string }[];
  const cookies = t("privacy.cookie_table.rows", { returnObjects: true }) as {
    category: string; purpose: string; retention: string; required: string;
  }[];

  return (
    <div className="min-h-screen bg-surface">
      <SEO
        path={path}
        ptPath="/privacidade"
        enPath="/privacy"
        title={t("privacy.meta_title")}
        description={t("privacy.meta_description")}
        jsonLd={jsonLd}
      />
      <NavBar onOpenDemo={() => { /* not used here */ }} />
      <main className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-navy/60 hover:text-cyan transition-colors mb-8"
        >
          <ArrowLeft className="size-3.5" />
          {t("privacy.back")}
        </Link>

        <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-cyan mb-3">
          {t("privacy.kicker")}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-navy">
          {t("privacy.title")}
        </h1>
        <p className="mt-4 text-navy/60 text-base leading-relaxed">{t("privacy.intro")}</p>
        <p className="mt-2 text-xs text-navy/40">
          {t("privacy.last_updated")}: <strong className="text-navy/70">{t("privacy.last_updated_date")}</strong>
        </p>

        <div className="mt-12 space-y-10">
          {sections.map((s, i) => (
            <section key={i}>
              <h2 className="text-xl font-extrabold text-navy mb-3">
                <span className="text-cyan mr-2">{String(i + 1).padStart(2, "0")}.</span>{s.title}
              </h2>
              <p className="text-navy/70 leading-relaxed text-sm whitespace-pre-line">{s.body}</p>
            </section>
          ))}

          <section>
            <h2 className="text-xl font-extrabold text-navy mb-4">
              <span className="text-cyan mr-2">{String(sections.length + 1).padStart(2, "0")}.</span>
              {t("privacy.cookie_table.title")}
            </h2>
            <p className="text-sm text-navy/70 leading-relaxed mb-4">{t("privacy.cookie_table.intro")}</p>
            <div className="overflow-x-auto rounded-xl border border-navy/10 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-navy/[0.03] text-[10px] font-extrabold uppercase tracking-widest text-navy/60">
                  <tr>
                    <th className="text-left px-4 py-3">{t("privacy.cookie_table.col_category")}</th>
                    <th className="text-left px-4 py-3">{t("privacy.cookie_table.col_purpose")}</th>
                    <th className="text-left px-4 py-3">{t("privacy.cookie_table.col_retention")}</th>
                    <th className="text-left px-4 py-3">{t("privacy.cookie_table.col_required")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy/5">
                  {cookies.map((row, i) => (
                    <tr key={i} className="text-navy/75">
                      <td className="px-4 py-3 font-bold text-navy">{row.category}</td>
                      <td className="px-4 py-3">{row.purpose}</td>
                      <td className="px-4 py-3">{row.retention}</td>
                      <td className="px-4 py-3">{row.required}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5">
              <Button variant="outline" size="sm" onClick={openPreferences}>
                <Settings2 className="size-3.5" />
                {t("privacy.manage_preferences")}
              </Button>
            </div>
          </section>

          <section className="rounded-2xl border border-navy/10 bg-white p-6">
            <h2 className="text-xl font-extrabold text-navy mb-2">{t("privacy.dpo.title")}</h2>
            <p className="text-sm text-navy/70 leading-relaxed">{t("privacy.dpo.intro")}</p>
            <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-[10px] font-extrabold uppercase tracking-widest text-navy/50">{t("privacy.dpo.name_label")}</dt>
                <dd className="mt-1 font-bold text-navy">{t("privacy.dpo.name")}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-extrabold uppercase tracking-widest text-navy/50">{t("privacy.dpo.email_label")}</dt>
                <dd className="mt-1">
                  <a href={`mailto:${t("privacy.dpo.email")}`} className="font-bold text-navy underline decoration-cyan/60 underline-offset-2 hover:decoration-cyan">
                    {t("privacy.dpo.email")}
                  </a>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-[10px] font-extrabold uppercase tracking-widest text-navy/50">{t("privacy.dpo.address_label")}</dt>
                <dd className="mt-1 text-navy/75">{t("privacy.dpo.address")}</dd>
              </div>
            </dl>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
