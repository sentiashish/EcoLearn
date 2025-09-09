/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Netflix Brand Colors
        netflix: {
          red: 'var(--color-netflix-red)',
          'red-dark': 'var(--color-netflix-red-dark)',
          'red-light': 'var(--color-netflix-red-light)',
        },
        // Primary Colors
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          950: 'var(--color-primary-950)',
        },
        // Background Colors
        background: {
          primary: 'var(--color-background-primary)',
          secondary: 'var(--color-background-secondary)',
          tertiary: 'var(--color-background-tertiary)',
          elevated: 'var(--color-background-elevated)',
          modal: 'var(--color-background-modal)',
          card: 'var(--color-background-card)',
          hover: 'var(--color-background-hover)',
        },
        // Text Colors
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          muted: 'var(--color-text-muted)',
          disabled: 'var(--color-text-disabled)',
          inverse: 'var(--color-text-inverse)',
        },
        // Accent Colors
        accent: {
          gold: 'var(--color-accent-gold)',
          blue: 'var(--color-accent-blue)',
          green: 'var(--color-accent-green)',
          orange: 'var(--color-accent-orange)',
          purple: 'var(--color-accent-purple)',
        },
        // Border Colors
        border: {
          primary: 'var(--color-border-primary)',
          secondary: 'var(--color-border-secondary)',
          tertiary: 'var(--color-border-tertiary)',
          focus: 'var(--color-border-focus)',
          hover: 'var(--color-border-hover)',
        },
      },
      fontFamily: {
        primary: 'var(--font-primary)',
        secondary: 'var(--font-secondary)',
        mono: 'var(--font-mono)',
      },
      fontSize: {
        'xs': 'var(--font-size-xs)',
        'sm': 'var(--font-size-sm)',
        'base': 'var(--font-size-base)',
        'lg': 'var(--font-size-lg)',
        'xl': 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)',
        '6xl': 'var(--font-size-6xl)',
        '7xl': 'var(--font-size-7xl)',
        '8xl': 'var(--font-size-8xl)',
      },
      spacing: {
        '0': 'var(--space-0)',
        '1': 'var(--space-1)',
        '2': 'var(--space-2)',
        '3': 'var(--space-3)',
        '4': 'var(--space-4)',
        '5': 'var(--space-5)',
        '6': 'var(--space-6)',
        '8': 'var(--space-8)',
        '10': 'var(--space-10)',
        '12': 'var(--space-12)',
        '16': 'var(--space-16)',
        '20': 'var(--space-20)',
        '24': 'var(--space-24)',
        '32': 'var(--space-32)',
        '40': 'var(--space-40)',
        '48': 'var(--space-48)',
        '56': 'var(--space-56)',
        '64': 'var(--space-64)',
      },
      borderRadius: {
        'none': 'var(--radius-none)',
        'sm': 'var(--radius-sm)',
        'base': 'var(--radius-base)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        '3xl': 'var(--radius-3xl)',
        'full': 'var(--radius-full)',
      },
      boxShadow: {
        'netflix': 'var(--shadow-card)',
        'netflix-hover': 'var(--shadow-card-hover)',
        'netflix-modal': 'var(--shadow-modal)',
        'netflix-hero': 'var(--shadow-hero)',
      },
      transitionDuration: {
        '75': 'var(--duration-75)',
        '100': 'var(--duration-100)',
        '150': 'var(--duration-150)',
        '200': 'var(--duration-200)',
        '300': 'var(--duration-300)',
        '500': 'var(--duration-500)',
        '700': 'var(--duration-700)',
        '1000': 'var(--duration-1000)',
      },
      transitionTimingFunction: {
        'netflix': 'var(--ease-netflix)',
        'bounce': 'var(--ease-bounce)',
      },
      zIndex: {
        'dropdown': 'var(--z-dropdown)',
        'sticky': 'var(--z-sticky)',
        'fixed': 'var(--z-fixed)',
        'modal-backdrop': 'var(--z-modal-backdrop)',
        'modal': 'var(--z-modal)',
        'popover': 'var(--z-popover)',
        'tooltip': 'var(--z-tooltip)',
        'toast': 'var(--z-toast)',
      },
      backgroundImage: {
        'netflix-gradient': 'var(--gradient-hero)',
        'netflix-card': 'var(--gradient-card)',
        'netflix-button': 'var(--gradient-button)',
        'netflix-shimmer': 'var(--gradient-shimmer)',
      },
      height: {
        'hero': 'var(--size-hero-height)',
      },
      width: {
        'card': 'var(--size-card-width)',
        'poster': 'var(--size-poster-width)',
        'modal': 'var(--size-modal-width)',
      },
      maxWidth: {
        'modal': 'var(--size-modal-max-width)',
      },
    },
  },
  plugins: [
    function({ addUtilities }) {
      const newUtilities = {
        '.netflix-card': {
          backgroundColor: 'var(--color-background-card)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-card)',
          transition: 'var(--transition-netflix)',
        },
        '.netflix-card:hover': {
          transform: 'scale(1.05)',
          boxShadow: 'var(--shadow-card-hover)',
        },
        '.netflix-button': {
          background: 'var(--gradient-button)',
          color: 'var(--color-text-primary)',
          border: 'none',
          borderRadius: 'var(--radius-button)',
          padding: 'var(--space-3) var(--space-6)',
          fontWeight: 'var(--font-weight-semibold)',
          transition: 'var(--transition-fast)',
          cursor: 'pointer',
        },
        '.netflix-button:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 'var(--shadow-lg)',
        },
        '.netflix-transition': {
          transition: 'var(--transition-netflix)',
        },
        '.focus-visible': {
          outline: '2px solid var(--color-border-focus)',
          outlineOffset: '2px',
        },
      }
      addUtilities(newUtilities)
    }
  ],
}