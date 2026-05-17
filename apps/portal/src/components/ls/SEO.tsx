import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";

const SITE_URL = "https://leadseller.com.br";

interface SEOProps {
  /** Path of the current page (e.g. "/", "/privacidade") */
  path?: string;
  /** Override default title */
  title?: string;
  /** Override default description */
  description?: string;
  /** Path for the English alternate (defaults to same path) */
  enPath?: string;
  /** Path for the PT-BR alternate (defaults to same path) */
  ptPath?: string;
  /** Optional JSON-LD object (will be stringified) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Centralized SEO: title, meta description, canonical, hreflang and optional JSON-LD.
 * Renders into <head> via react-helmet-async.
 */
export const SEO = ({ path = "/", title, description, enPath, ptPath, jsonLd }: SEOProps) => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("en") ? "en" : "pt-BR";
  const canonical = `${SITE_URL}${path}`;
  const ptHref = `${SITE_URL}${ptPath ?? path}`;
  const enHref = `${SITE_URL}${enPath ?? path}`;

  return (
    <Helmet>
      <html lang={lang} />
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang="pt-BR" href={ptHref} />
      <link rel="alternate" hrefLang="en" href={enHref} />
      <link rel="alternate" hrefLang="x-default" href={ptHref} />
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={lang === "en" ? "en_US" : "pt_BR"} />
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};
