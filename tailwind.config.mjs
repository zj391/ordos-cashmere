/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,md,mdx}'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
        primary: {
          DEFAULT: 'hsl(var(--primary) / <alpha-value>)',
          foreground: 'hsl(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary) / <alpha-value>)',
          foreground: 'hsl(var(--secondary-foreground) / <alpha-value>)',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive) / <alpha-value>)',
          foreground: 'hsl(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted) / <alpha-value>)',
          foreground: 'hsl(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent) / <alpha-value>)',
          foreground: 'hsl(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover) / <alpha-value>)',
          foreground: 'hsl(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT: 'hsl(var(--card) / <alpha-value>)',
          foreground: 'hsl(var(--card-foreground) / <alpha-value>)',
        },
        brand: {
          cream: '#F7F3EC',
          sand: '#E0D5C4',
          camel: '#A98B5F',
          chocolate: '#4B3A2B',
          ink: '#1C1813',
          gold: '#AD8A5C',
          red: '#9E3128',
          // Extended warm-beige palette for inline-hex replacements (2026-08-26
          // audit): these cover the 6 hex values that were duplicated across
          // 89 component instances. Each value matches the exact hex it replaces
          // so visual output is byte-identical.
          sandwarm: '#F5F0E7',   // bg-[#F5F0E7] (29×) — hero sections, CTAs
          shell: '#F8F5EF',      // bg-[#F8F5EF] (5×) — footer bg, base layer
          mist: '#FBF8F2',       // bg-[#FBF8F2] (2×) — proof band, soft section
          bone: '#F4EFE6',       // bg-[#F4EFE6] (1×) — single hero variant
          goldhi: '#D8B787',     // text-[#D8B787] (2×) — bright gold accent
          whatsapp: '#25D366',   // bg-[#25D366] (1×) — WhatsApp CTA
          wechat: '#07C160',     // bg-[#07C160] (1×) — WeChat CTA
          sandhi: '#E8DFD0',     // to-[#E8DFD0] (2×) — gradient endpoint in blog + category hero
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // 2026-08-20 motion design tokens — 让 utility class 也走 CSS vars
      // duration-150/350/700 用 .duration-fast/normal/slow 名
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
      },
      transitionTimingFunction: {
        luxury: 'var(--ease-luxury)',
        soft: 'var(--ease-soft)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
