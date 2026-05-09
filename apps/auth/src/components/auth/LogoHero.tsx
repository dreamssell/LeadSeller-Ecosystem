import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

const LogoHero = () => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    className="text-center mb-8"
  >
    <div className="flex items-center justify-center gap-3 mb-2">
      <img src={logo} alt="Lead Seller" className="w-10 h-10 object-contain" />
      <h1 className="text-3xl font-bold text-gradient-primary">Lead Seller</h1>
    </div>
    <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase">
      Acesso Exclusivo para Clientes
    </p>
  </motion.div>
);

export default LogoHero;
