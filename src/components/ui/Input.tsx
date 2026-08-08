import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-[6px] border border-line-soft bg-bg px-3.5 py-2.5 font-sans text-sm text-text placeholder:text-text-2/70",
        "transition-[border-color,box-shadow] duration-200",
        "focus:border-copper focus:outline-none focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--copper)_22%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}

type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  htmlFor?: string;
  children: ReactNode;
};

export function Field({ label, hint, htmlFor, children }: FieldProps) {
  return (
    <div className="mb-3.5">
      {label ? (
        <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium">
          {label}
        </label>
      ) : null}
      {children}
      {hint ? <p className="mt-2 text-xs text-text-2">{hint}</p> : null}
    </div>
  );
}