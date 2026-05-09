import { ShieldCheck, Lock } from 'lucide-react';

const PageFooter = () => (
  <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground mt-8">
    <div className="flex items-center gap-1.5">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      <span>LGPD Compliance</span>
    </div>
    <span className="text-border">|</span>
    <div className="flex items-center gap-1.5">
      <Lock className="w-3.5 h-3.5 text-primary" />
      <span>Suporte em horário comercial</span>
    </div>
  </div>
);

export default PageFooter;
