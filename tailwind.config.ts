import type { Config } from "tailwindcss";

/**
 * CampusKit design tokens.
 * Everything visual in the app should come from here rather than one-off hex values.
 */
/**
 * Colors that need to flip between light/dark are CSS variables (defined in
 * globals.css under `:root` and `.dark`) wrapped in `rgb(var(--x) / <alpha-value>)`
 * — the standard Tailwind pattern for dark-mode-via-class without having to
 * touch every component that uses `bg-canvas`, `text-ink`, etc. Brand purple
 * stays a flat hex since it doesn't change between themes.
 */
function withOpacity(variable: string) {
  return `rgb(var(${variable}) / <alpha-value>)`;
}

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./data/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#635BFF",
          600: "#5A52F0",
          700: "#4C45D9",
          soft: withOpacity("--color-brand-soft"),
        },
        violet: {
          accent: "#8B5CF6",
        },
        canvas: withOpacity("--color-canvas"),
        surface: withOpacity("--color-surface"),
        ink: withOpacity("--color-ink"),
        muted: withOpacity("--color-muted"),
        hairline: withOpacity("--color-hairline"),
        success: "#16A34A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Compact, product-style scale rather than landing-page sizes.
        meta: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.01em" }],
        label: ["0.8125rem", { lineHeight: "1.125rem" }],
        body: ["0.9375rem", { lineHeight: "1.5rem" }],
        title: ["1.0625rem", { lineHeight: "1.5rem", letterSpacing: "-0.01em" }],
        section: ["1.5rem", { lineHeight: "1.875rem", letterSpacing: "-0.02em" }],
        display: ["2rem", { lineHeight: "2.25rem", letterSpacing: "-0.025em" }],
      },
      borderRadius: {
        control: "10px",
        card: "14px",
        panel: "18px",
      },
      boxShadow: {
        control: "0 1px 2px rgba(17, 24, 39, 0.05)",
        lift: "0 6px 20px -8px rgba(17, 24, 39, 0.16)",
        note: "0 10px 30px -12px rgba(17, 24, 39, 0.28)",
      },
      maxWidth: {
        shell: "1180px",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};

export default config;
