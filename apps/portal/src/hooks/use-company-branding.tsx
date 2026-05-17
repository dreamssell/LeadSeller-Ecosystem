import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import defaultLogo from "@/assets/leadseller-logo.png";

type Branding = { name: string; logoUrl: string };

const Ctx = createContext<Branding>({ name: "Lead Seller", logoUrl: defaultLogo });

export const CompanyBrandingProvider = ({ children }: { children: ReactNode }) => {
  const [branding, setBranding] = useState<Branding>({ name: "Lead Seller", logoUrl: defaultLogo });

  const load = async () => {
    const { data } = await supabase
      .from("company_settings")
      .select("name, logo_url")
      .eq("id", 1)
      .maybeSingle();
    if (data) {
      setBranding({
        name: data.name || "Lead Seller",
        logoUrl: data.logo_url || defaultLogo,
      });
    }
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("company_settings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "company_settings" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return <Ctx.Provider value={branding}>{children}</Ctx.Provider>;
};

export const useCompanyBranding = () => useContext(Ctx);
