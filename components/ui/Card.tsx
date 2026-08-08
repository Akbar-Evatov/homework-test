import { HTMLAttributes } from "react";

export default function Card({ className = "", ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={`rounded-xl border border-slate-200 bg-white ${className}`} />
  );
}
