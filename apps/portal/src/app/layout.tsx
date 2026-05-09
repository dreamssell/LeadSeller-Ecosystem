import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadSeller | O Ecossistema Completo de Vendas e IA",
  description: "Transforme seu atendimento com CRM inteligente, ligações VoIP, WhatsApp e Agentes Autônomos de IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className={`${inter.variable} antialiased selection:bg-primary-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
