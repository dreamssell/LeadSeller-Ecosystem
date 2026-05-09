import React from 'react';
import { Fingerprint, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmailStepProps {
  email: string;
  setEmail: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
}

const EmailStep = ({ email, setEmail, isLoading, error, onSubmit }: EmailStepProps) => (
  <motion.form
    key="email-step"
    initial={{ opacity: 0, x: -30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 30 }}
    transition={{ duration: 0.3 }}
    onSubmit={onSubmit}
    className="space-y-6"
  >
    <div className="text-center space-y-2">
      <h2 className="text-xl font-bold text-foreground">Identifique-se</h2>
      <p className="text-sm text-muted-foreground">
        Insira seu E-mail cadastrado ou seu ID para iniciar a sessão segura.
      </p>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">E-mail ou ID</label>
        <div className="relative">
          <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-foreground placeholder:text-muted-foreground"
            placeholder="seu@email.com"
            disabled={isLoading}
          />
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-destructive text-sm"
        >
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={isLoading || !email}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Verificando Credenciais...
          </>
        ) : (
          <>
            Continuar
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  </motion.form>
);

export default EmailStep;
