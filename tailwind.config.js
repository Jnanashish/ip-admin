/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2e57e8",
        "primary-hover": "#2449c8",
        "primary-foreground": "#ffffff",
        secondary: "#5a7dfd",
        background: "#f4faff",
        foreground: "#121212",
        "text-secondary": "#3b3b3b",
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        border: "#e2e8f0",
        input: "#e2e8f0",
        ring: "#2e57e8",
        destructive: "#ff3333",
        "destructive-foreground": "#ffffff",
        accent: "#f1f5f9",
        "accent-foreground": "#0f172a",
        card: "#ffffff",
        "card-foreground": "#121212",
        "header-blue": "#0069ff",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      screens: {
        xs: "480px",
        sm: "600px",
        md: "768px",
        lg: "900px",
        xl: "1200px",
      },
      fontFamily: {
        sans: ["Lato", "sans-serif"],
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        ibm: ['"IBM Plex Sans"', "sans-serif"],
        sora: ["Sora", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
