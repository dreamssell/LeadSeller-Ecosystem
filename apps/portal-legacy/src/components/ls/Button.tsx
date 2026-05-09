import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-extrabold tracking-tight transition-all duration-300 ease-[var(--ease-out-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-lime text-navy shadow-lime hover:translate-y-[-2px] hover:shadow-[0_12px_36px_-4px_hsl(var(--lime)/0.55)] active:translate-y-0",
        secondary:
          "bg-white text-navy border border-navy/10 hover:border-navy/30 hover:shadow-glass",
        outline:
          "border-2 border-cyan text-cyan bg-transparent hover:bg-cyan/10",
        dark:
          "bg-navy text-white hover:bg-navy/90 shadow-navy-soft",
        ghost:
          "text-navy hover:bg-navy/5",
      },
      size: {
        sm: "h-9 px-4 text-xs uppercase tracking-widest",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-10 text-base",
        xl: "h-16 px-12 text-lg",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
