import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-control font-medium " +
  "transition-[background-color,border-color,color,transform] disabled:pointer-events-none disabled:opacity-50 " +
  "active:translate-y-px";

const variants: Record<Variant, string> = {
  primary: "bg-brand text-white shadow-control hover:bg-brand-600 active:bg-brand-700",
  secondary:
    "border border-hairline bg-surface text-ink shadow-control hover:border-brand/40 hover:text-brand active:bg-brand-soft/60",
  ghost: "text-ink hover:bg-brand-soft/70 active:bg-brand-soft",
  light:
    "bg-white/12 text-white backdrop-blur-sm border border-white/25 hover:bg-white/20 active:bg-white/28",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-label",
  md: "h-11 px-4 text-body",
  lg: "h-12 px-5 text-body",
};

function classes(variant: Variant, size: Size, className?: string) {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(" ");
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button type={type} className={classes(variant, size, className)} {...rest}>
      {children}
    </button>
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link className={classes(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}
