import { ButtonHTMLAttributes } from "react";

type ToolButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const VARIANT_STYLES: Record<string, string> = {
  primary:
    "min-h-11 rounded-lg border border-brand-400/50 bg-brand-600/35 px-4 py-2 font-medium text-slate-100 shadow-soft hover:bg-brand-600/55 disabled:opacity-50",
  secondary:
    "min-h-11 rounded-lg border border-slate-500/60 bg-slate-700/55 px-4 py-2 font-medium text-slate-100 shadow-soft hover:bg-slate-600/65 disabled:opacity-50",
};

const ToolButton = ({
  variant = "primary",
  className = "",
  children,
  ...rest
}: ToolButtonProps) => (
  <button className={`${VARIANT_STYLES[variant]} ${className}`} {...rest}>
    {children}
  </button>
);

export default ToolButton;
