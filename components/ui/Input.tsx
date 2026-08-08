import { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 ${className}`}
    />
  );
}
