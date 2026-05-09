import { HelpCircle } from 'lucide-react';

const CardFooter = () => (
  <div className="px-6 py-4 border-t border-border">
    <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground">
      <HelpCircle className="w-4 h-4" />
      <span>Não possui acesso?</span>
      <a href="#" className="text-primary font-medium hover:underline">
        Entre em contato conosco!
      </a>
    </div>
  </div>
);

export default CardFooter;
