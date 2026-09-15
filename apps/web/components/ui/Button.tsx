import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

const VARIANTS: Record<string, string> = {
  primary: "bg-ink text-panel hover:opacity-80",
  secondary: "border border-line text-ink hover:bg-line/10",
};

const Button = ({ variant = "primary", className = "", children, ...props }: ButtonProps) => {
  return (
    <button
      className={`rounded-sm px-6 py-3 text-sm font-bold uppercase tracking-wide transition-opacity disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
