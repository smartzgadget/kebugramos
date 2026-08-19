export function SearchField(props: React.InputHTMLAttributes<HTMLInputElement>) {
  const { style, ...rest } = props;
  return <input {...rest} style={{ border: "1px solid var(--color-border)", borderRadius: 8, padding: "8px 12px", fontSize: 14, width: "100%", ...style }} />;
}
