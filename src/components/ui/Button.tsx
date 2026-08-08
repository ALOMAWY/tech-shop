import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "copper" | "mint" | "blue" | "purple" | "pink" | "ghost";

const VARIANTS: Record<ButtonVariant, string> = {
  copper: "bg-copper text-on-accent hover:brightness-105",
  mint: "bg-mint text-on-accent hover:brightness-105",
  blue: "bg-blue text-on-accent hover:brightness-105",
  purple: "bg-purple text-on-accent hover:brightness-105",
  pink: "bg-pink text-on-accent hover:brightness-105",
  ghost: "bg-transparent text-text border border-line hover:border-copper hover:text-copper",
};

export function buttonClasses(variant: ButtonVariant = "copper", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-[6px] px-5 py-2.5 text-sm font-medium transition-[filter,transform,color,border-color] duration-200 cursor-pointer",
    "active:translate-y-px active:scale-[.98]",
    "focus-visible:outline-2 focus-visible:outline-copper focus-visible:outline-offset-2",
    VARIANTS[variant],
    className,
  );
}

type ButtonProps = {
  variant?: ButtonVariant;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ variant = "copper", className, ...props }: ButtonProps) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}

type ButtonLinkProps = {
  variant?: ButtonVariant;
  children?: ReactNode;
} & AnchorHTMLAttributes<HTMLAnchorElement>;

export function ButtonLink({ variant = "copper", className, ...props }: ButtonLinkProps) {
  return <a className={buttonClasses(variant, className)} {...props} />;
}