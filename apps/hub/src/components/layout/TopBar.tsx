import { Sun, Moon, Bell, Search, Menu, Globe, LogIn, CalendarPlus, Building2, Check } from 'lucide-react';
import { useThemeContext } from '@/contexts/ThemeContext';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopBarProps {
  title: string;
  subtitle?: string;
  onOpenMenu?: () => void;
}

export function TopBar({ title, subtitle, onOpenMenu }: TopBarProps) {
  const { theme, toggleTheme } = useThemeContext();
  const { user } = useAuth();
  const { tenants, activeTenant, setActiveTenantId } = useTenant();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('avatar_url, display_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!cancelled && data) {
        setAvatarUrl(data.avatar_url);
        setDisplayName(data.display_name || user.email || '');
      }
    };
    load();
    // refresh when profile updates elsewhere
    const handler = () => load();
    window.addEventListener('profile:updated', handler);
    return () => {
      cancelled = true;
      window.removeEventListener('profile:updated', handler);
    };
  }, [user]);

  const initials = (displayName || user?.email || 'LS')
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-14 md:h-16 border-b border-border bg-card/60 backdrop-blur-md flex items-center justify-between px-3 md:px-6 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onOpenMenu}
          className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5 text-foreground" />
        </button>
        <div className="min-w-0 flex items-center gap-4">
          <div className="min-w-0">
            <h2 className="text-base md:text-lg font-semibold text-foreground truncate">{title}</h2>
            {subtitle && <p className="text-xs text-muted-foreground truncate hidden sm:block">{subtitle}</p>}
          </div>

          <div className="hidden md:block w-px h-6 bg-border mx-2" />

          {/* Workspace Switcher */}
          {activeTenant && (
            <DropdownMenu>
              <DropdownMenuTrigger className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary transition-colors outline-none">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium truncate max-w-[150px]">{activeTenant.company_name}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">Workspaces</DropdownMenuLabel>
                {tenants.map(t => (
                  <DropdownMenuItem key={t.id} onClick={() => setActiveTenantId(t.id)} className="flex items-center justify-between cursor-pointer">
                    <span className="truncate">{t.company_name}</span>
                    {t.id === activeTenant.id && <Check className="w-4 h-4 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 md:gap-2">
        {/* Mobile Workspace Switcher */}
        {activeTenant && (
          <DropdownMenu>
            <DropdownMenuTrigger className="md:hidden p-2 rounded-xl hover:bg-secondary transition-colors">
              <Building2 className="w-5 h-5 text-primary" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
              {tenants.map(t => (
                <DropdownMenuItem key={t.id} onClick={() => setActiveTenantId(t.id)} className="flex items-center justify-between">
                  <span className="truncate">{t.company_name}</span>
                  {t.id === activeTenant.id && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <button className="hidden md:inline-flex p-2.5 rounded-xl hover:bg-secondary transition-colors">
          <Search className="w-4 h-4 text-muted-foreground" />
        </button>
        <button className="hidden md:inline-flex p-2.5 rounded-xl hover:bg-secondary transition-colors relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <motion.button
          onClick={toggleTheme}
          className="hidden md:inline-flex p-2.5 rounded-xl hover:bg-secondary transition-colors"
          whileTap={{ scale: 0.9, rotate: 180 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-muted-foreground" />
          ) : (
            <Moon className="w-4 h-4 text-muted-foreground" />
          )}
        </motion.button>

        <Avatar className="w-8 h-8 ml-1 shrink-0 ring-2 ring-primary/20 cursor-pointer hover:ring-primary/40 transition-all">
          <AvatarImage src={avatarUrl || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
