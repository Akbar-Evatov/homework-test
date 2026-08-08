import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

const variantClasses: Record<Variant, string> = {
  primary: "rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50",
  secondary:
    "rounded-lg font-medium bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:opacity-50",
  danger: "text-red-600 hover:underline disabled:opacity-50",
  ghost: "text-slate-600 hover:underline disabled:opacity-50",
};

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={`${variantClasses[variant]} ${className}`} />;
}
