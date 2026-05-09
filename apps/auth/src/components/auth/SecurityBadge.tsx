import { ShieldCheck } from 'lucide-react';

const SecurityBadge = () => (
  <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
    <ShieldCheck className="w-4 h-4 text-emerald-400" />
    <span className="text-xs font-medium text-muted-foreground">
      Ambiente Seguro • Criptografia SSL 256-bit
    </span>
  </div>
);

export default SecurityBadge;
