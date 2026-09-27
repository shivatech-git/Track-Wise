/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FBFAF9",
        surface: "#FFFFFF",
        ink: "#15171C",
        muted: "#6E7178",
        line: "#E8E5DF",
        accent: "#16624F",
        "accent-soft": "#E6F0EC",
        stage: {
          saved: "#64748B",
          applied: "#3B6FB0",
          interviewing: "#16624F",
          offer: "#B8862B",
          rejected: "#A8654A",
        },
      },
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
        display: ["Georgia", "ui-serif", "serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(21,23,28,0.04), 0 1px 3px rgba(21,23,28,0.06)",
        lift: "0 8px 24px rgba(21,23,28,0.10)",
      },
    },
  },
  plugins: [],
};
