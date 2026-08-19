import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost"; size?: "sm" | "md"; loading?: boolean };

export function Button({ variant = "primary", size = "md", loading, children, disabled, style, ...rest }: Props) {
  const bg = variant === "primary" ? "var(--color-sovereign-900)" : "var(--color-surface)";
  const color = variant === "primary" ? "white" : "var(--color-text-primary)";
  const pad = size === "sm" ? "6px 12px" : "10px 16px";
  return (
    <button
      disabled={disabled || loading}
      style={{ background: bg, color, border: variant === "ghost" ? "1px solid var(--color-border)" : "none", borderRadius: 8, padding: pad, fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, ...style }}
      {...rest}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
