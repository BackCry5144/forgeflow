/** @type {import('tailwindcss').Config} */
import designTokens from './src/design-tokens.json';

// UXON 디자인 토큰 변환
const uxonColors = designTokens.uxon.color;
const uxonSpacing = designTokens.uxon.spacing;
const uxonRadius = designTokens.uxon.radius;

export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // UXON Design System Colors
        uxon: {
          blue: uxonColors.blue,
          green: uxonColors.green,
          red: uxonColors.red,
          orange: uxonColors.orange,
          yellow: uxonColors.yellow,
          indigo: uxonColors.indigo,
          teal: uxonColors.teal,
          neutral: uxonColors.neutral,
          brown: uxonColors.brown,
        },
        // Shadcn/ui 기본 색상 (UXON 토큰 매핑)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: uxonColors.blue[500],
          50: uxonColors.blue[50],
          100: uxonColors.blue[100],
          200: uxonColors.blue[200],
          300: uxonColors.blue[300],
          400: uxonColors.blue[400],
          500: uxonColors.blue[500],
          600: uxonColors.blue[600],
          700: uxonColors.blue[700],
          800: uxonColors.blue[800],
          900: uxonColors.blue[900],
          foreground: uxonColors.base.white,
        },
        secondary: {
          DEFAULT: uxonColors.neutral[100],
          foreground: uxonColors.neutral[900],
        },
        destructive: {
          DEFAULT: uxonColors.red[500],
          foreground: uxonColors.base.white,
        },
        success: {
          DEFAULT: uxonColors.green[500],
          foreground: uxonColors.base.white,
        },
        warning: {
          DEFAULT: uxonColors.orange[500],
          foreground: uxonColors.base.white,
        },
        muted: {
          DEFAULT: uxonColors.neutral[100],
          foreground: uxonColors.neutral[600],
        },
        accent: {
          DEFAULT: uxonColors.indigo[500],
          foreground: uxonColors.base.white,
        },
        popover: {
          DEFAULT: uxonColors.base.white,
          foreground: uxonColors.neutral[900],
        },
        card: {
          DEFAULT: uxonColors.base.white,
          foreground: uxonColors.neutral[900],
        },
      },
      spacing: {
        // UXON 추가 spacing (기본 Tailwind spacing 유지하면서 추가)
        'uxon-0': uxonSpacing['0'],
        'uxon-2': uxonSpacing['2'],
        'uxon-4': uxonSpacing['4'],
        'uxon-6': uxonSpacing['6'],
        'uxon-8': uxonSpacing['8'],
        'uxon-12': uxonSpacing['12'],
        'uxon-16': uxonSpacing['16'],
        'uxon-20': uxonSpacing['20'],
        'uxon-24': uxonSpacing['24'],
        'uxon-30': uxonSpacing['30'],
      },
      borderRadius: {
        ...uxonRadius,
        lg: uxonRadius['12'],
        md: uxonRadius['8'],
        sm: uxonRadius['4'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
