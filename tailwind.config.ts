import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        "lines-dark": "#3E3F4E",
        "lines-light": "#E4EBFA",
        "primary-light": "#A8A4FF",
        "v-dark-grey": "#20212C",
        "dark-grey": "#2B2C37",
        "mid-grey": "#828FA3",
        "grey-highlight": "#9797971a",
        "light-grey": "#F4F7FD",
        danger: "#EA5555",
        "danger-light": "#FF9898"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      keyframes: {
        scroll: {
          to: {
            transform: "translate(calc(-50% - 0.5rem))"
          }
        },
        spotlight: {
          "0%": {
            opacity: "0",
            transform: "translate(-72%, -62%) scale(0.5)"
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%,-40%) scale(1)"
          }
        },
        moveHorizontal: {
          "0%": {
            transform: "translateX(-50%) translateY(-10%)"
          },
          "50%": {
            transform: "translateX(50%) translateY(10%)"
          },
          "100%": {
            transform: "translateX(-50%) translateY(-10%)"
          }
        },
        moveInCircle: {
          "0%": {
            transform: "rotate(0deg)"
          },
          "50%": {
            transform: "rotate(180deg)"
          },
          "100%": {
            transform: "rotate(360deg)"
          }
        },
        moveVertical: {
          "0%": {
            transform: "translateY(-50%)"
          },
          "50%": {
            transform: "translateY(50%)"
          },
          "100%": {
            transform: "translateY(-50%)"
          }
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "collapse-input": {
          "0%": { height: "2.5rem", opacity: "1", "margin-bottom": ".75rem" },
          "85%": { height: ".5rem", opacity: "0", "margin-bottom": ".15rem" },
          "100%": { height: "0", opacity: "0", "margin-bottom": "0" }
        },
        "background-float": {
          "0%": { transform: "translate(0, 0)" },
          "20%": { transform: "translate(10px, 15px)" },
          "40%": { transform: "translate(-10px, -10px) scale(1.1)" },
          "60%": { transform: "translate(0, 0) scale(1.05)" },
          "80%": { transform: "translate(5px, -5px) scale(1.1)" },
          "100%": { transform: "translate(0, 0) scale(1)" }
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        }
      },
      animation: {
        scroll:
          "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
        spotlight: "spotlight 2s ease .75s 1 forwards",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        first: "moveVertical 30s ease infinite",
        second: "moveInCircle 20s reverse infinite",
        third: "moveInCircle 40s linear infinite",
        fourth: "moveHorizontal 40s ease infinite",
        fifth: "moveInCircle 20s ease infinite",
        "spin-slow": "spin 16s linear infinite",
        "collapse-input": "collapse-input .25s ease-in-out",
        "expand-input": "collapse-input .25s ease-in-out reverse",
        "fade-in": "fade-in .15s ease-out forwards"
      },
      boxShadow: {
        "menu-dark": "0 1rem 3rem -1rem rgba(59,130,246,.2)",
        menu: "0 1rem 3rem -1rem rgba(0,0,0,.3)"
      },
      width: {
        86: "21.5rem",
        120: "30rem"
      },
      fontFamily: {
        jakarta: ["Plus Jakarta Sans", "sans-serif"]
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
} satisfies Config;

// function addVariablesForColors({ addBase, theme }: any) {
//   let allColors = flattenColorPalette(theme('colors'))
//   let newVars = Object.fromEntries(
//     Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
//   )
//   addBase({
//     ':root': newVars,
//   })
// }

export default config;
