import { motion } from 'framer-motion';

interface ProgressBarProps {
  step: number;
}

const ProgressBar = ({ step }: ProgressBarProps) => (
  <div className="h-1 bg-muted rounded-t-lg overflow-hidden">
    <motion.div
      className="h-full bg-primary rounded-full"
      initial={{ width: '50%' }}
      animate={{ width: step === 1 ? '50%' : '100%' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    />
  </div>
);

export default ProgressBar;
