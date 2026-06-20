/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#09090b",
          card: "#121214",
          cardBorder: "#27272a",
          green: "#10b981", // Safe
          blue: "#3b82f6",  // Interactive
          red: "#ef4444",   // High Risk
          neonGlow: "rgba(16, 185, 129, 0.15)",
          blueGlow: "rgba(59, 130, 246, 0.15)",
          redGlow: "rgba(239, 68, 68, 0.15)"
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glowPulse 2s infinite alternate',
      },
      keyframes: {
        glowPulse: {
          '0%': { boxShadow: '0 0 5px rgba(59, 130, 246, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)' }
        }
      }
    },
  },
  plugins: [],
}
