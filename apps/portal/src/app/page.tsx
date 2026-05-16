import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-6 lg:p-24">
      {/* Background Animated Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 glass rounded-3xl p-8 lg:p-16 max-w-5xl w-full flex flex-col items-center text-center space-y-8 shadow-2xl border border-white/10">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary-300 text-sm font-medium tracking-wide mb-4">
          <span className="flex w-2 h-2 rounded-full bg-primary-400 mr-2 animate-pulse"></span>
          O Ecossistema Definitivo de Vendas
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-bold tracking-tight text-white drop-shadow-lg">
          Transforme Leads em <br className="hidden lg:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-400">
            Clientes Fofos e Fiéis
          </span>
        </h1>
        
        <p className="text-lg lg:text-xl text-gray-300 max-w-2xl font-light leading-relaxed">
          Automação de CRM, Ligações autônomas via VoIP e WhatsApp, e Agentes de Inteligência Artificial trabalhando por você 24 horas por dia.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <Link href="http://localhost:5173" className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white transition-all duration-200 bg-primary-600 border border-transparent rounded-full hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 shadow-[0_0_40px_-10px_rgba(124,58,237,0.5)]">
            Acessar Conta
            <svg className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
          </Link>
          <Link href="#features" className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-gray-300 transition-all duration-200 glass rounded-full hover:text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600">
            Conheça os Agentes IA
          </Link>
        </div>
      </div>

      <div className="relative z-10 mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {/* Feature Cards */}
        {[
          { title: "Voz e VoIP", desc: "Ligações 100% autônomas geridas por IA para qualificação e SDR." },
          { title: "WhatsApp 360", desc: "Integração Meta Oficial & UAZ para fluxos dinâmicos." },
          { title: "CRM Nativo", desc: "Gestão inteligente de funil com Supabase no backend." }
        ].map((feature, i) => (
          <div key={i} className="glass p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300 cursor-default">
            <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
