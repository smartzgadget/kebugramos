import * as React from "react";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14, width: "100%", ...props.style }} />;
}
export function SearchField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <Input {...props} placeholder={props.placeholder ?? "Search"} aria-label={props["aria-label"] ?? "Search"} />;
}
