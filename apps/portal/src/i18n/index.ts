import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ptBR from "./locales/pt-BR.json";
import en from "./locales/en.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      "pt-BR": { translation: ptBR },
      pt: { translation: ptBR },
      en: { translation: en },
    },
    fallbackLng: "pt-BR",
    supportedLngs: ["pt-BR", "pt", "en"],
    interpolation: { escapeValue: false },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "leadseller_lang",
      caches: ["localStorage"],
    },
  });

// Force PT-BR as default if nothing stored
if (!localStorage.getItem("leadseller_lang")) {
  i18n.changeLanguage("pt-BR");
}

export default i18n;
