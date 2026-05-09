import React from 'react';
import { Lock, ArrowRight, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface PasswordStepProps {
  email: string;
  userName: string;
  avatarUrl?: string | null;
  password: string;
  setPassword: (value: string) => void;
  showPassword: boolean;
  toggleShowPassword: () => void;
  isLoading: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const PasswordStep = ({
  email,
  userName,
  avatarUrl,
  password,
  setPassword,
  showPassword,
  toggleShowPassword,
  isLoading,
  error,
  onSubmit,
  onBack,
}: PasswordStepProps) => (
  <motion.form
    key="password-step"
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -30 }}
    transition={{ duration: 0.3 }}
    onSubmit={onSubmit}
    className="space-y-6"
  >
    {/* User avatar & welcome */}
    <div className="flex items-center gap-4">
      <div className="relative">
        <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden ring-2 ring-primary/30">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={userName}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <span className="text-xl font-bold text-primary">
              {userName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center ring-2 ring-card">
          <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">Bem-vindo de volta,</p>
        <p className="text-lg font-bold text-foreground truncate">{userName}</p>
      </div>
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-primary hover:underline"
      >
        Alterar
      </button>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-muted-foreground">Senha</label>
          <button type="button" className="text-xs text-primary hover:underline">
            Esqueceu a senha?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl py-4 pl-12 pr-12 outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all font-medium text-foreground tracking-widest placeholder:text-muted-foreground"
            placeholder="••••••••"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
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
        disabled={isLoading || !password}
        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-4 rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Autenticando Sessão...
          </>
        ) : (
          <>
            Acessar Vault
            <ArrowRight className="w-5 h-5" />
          </>
        )}
      </button>
    </div>
  </motion.form>
);

export default PasswordStep;
