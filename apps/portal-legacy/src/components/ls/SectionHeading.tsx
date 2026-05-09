import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  kicker?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
  variant?: "light" | "dark";
  className?: string;
}

export const SectionHeading = ({
  kicker,
  title,
  subtitle,
  align = "center",
  variant = "light",
  className,
}: SectionHeadingProps) => {
  const isDark = variant === "dark";
  return (
    <div
      className={cn(
        "flex flex-col gap-5 max-w-3xl",
        align === "center" && "mx-auto text-center items-center",
        className
      )}
    >
      {kicker && (
        <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-cyan">
          {kicker}
        </span>
      )}
      <h2
        className={cn(
          "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-balance",
          isDark ? "text-white" : "text-navy"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "text-lg md:text-xl leading-relaxed max-w-2xl text-pretty",
            isDark ? "text-white/70" : "text-navy/70"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
