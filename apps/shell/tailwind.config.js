/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}", "../../packages/design-system/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sovereign: {
          900: "var(--color-sovereign-900)",
          800: "var(--color-sovereign-800)",
          700: "var(--color-sovereign-700)",
        },
        accent: { 500: "var(--color-accent-500)" },
        surface: "var(--color-surface)",
        "surface-contrast": "var(--color-surface-contrast)",
        border: "var(--color-border)",
      },
      borderRadius: { md: "var(--radius-md)" },
      fontFamily: { sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};
