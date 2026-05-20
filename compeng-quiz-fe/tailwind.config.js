/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // ============================================================
      // DESIGN SYSTEM — Editorial Tech Brutalism
      // Palette: Monochrome warm + single amber accent
      // ============================================================
      colors: {
        // Neutrals — warm-tinted untuk feel "paper / editorial"
        ink: {
          50:  '#FAFAF7',
          100: '#F4F3EE',
          200: '#E8E6DC',
          300: '#D4D1C2',
          400: '#A8A496',
          500: '#74716A',
          600: '#52504A',
          700: '#363530',
          800: '#1F1E1B',
          900: '#0F0F0D',
          950: '#080806',
        },
        // Amber accent — satu warna, dipakai dengan disiplin
        flame: {
          50:  '#FFF8EB',
          100: '#FFEDC9',
          200: '#FFD98D',
          300: '#FFBF52',
          400: '#FFA31F',
          500: '#F58A00',
          600: '#D86F00',
          700: '#B05500',
          800: '#8A4400',
          900: '#5C2D00',
        },
        // Semantic
        success: '#1F7A4D',
        warning: '#C67700',
        danger:  '#B91C1C',
        info:    '#1E5F8F',
      },

      fontFamily: {
        // Display: editorial serif berani
        display: ['"Fraunces"', 'Georgia', 'serif'],
        // Sans: geometric clean untuk UI
        sans: ['"Geist"', '"Inter"', 'system-ui', 'sans-serif'],
        // Mono: untuk kode, PIN, angka teknis
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },

      fontSize: {
        // Editorial scale — tight tracking pada display
        'hero':       ['clamp(3.5rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.04em', fontWeight: '500' }],
        'display-xl': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '0.98', letterSpacing: '-0.03em', fontWeight: '500' }],
        'display':    ['clamp(2rem, 3.5vw, 3rem)', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '500' }],
        'eyebrow':    ['0.6875rem', { lineHeight: '1', letterSpacing: '0.18em', fontWeight: '600' }],
      },

      letterSpacing: {
        'tightest': '-0.05em',
        'editorial': '-0.035em',
      },

      borderRadius: {
        'xs': '2px',
        'sm': '4px',
        'md': '6px',
        'lg': '10px',
        'xl': '16px',
      },

      boxShadow: {
        // Brutalist hard shadows
        'brutal-sm': '3px 3px 0 0 currentColor',
        'brutal':    '5px 5px 0 0 currentColor',
        'brutal-lg': '8px 8px 0 0 currentColor',
        // Soft editorial shadows
        'soft':      '0 1px 2px rgba(15,15,13,0.04), 0 4px 16px rgba(15,15,13,0.06)',
        'soft-lg':   '0 2px 4px rgba(15,15,13,0.04), 0 12px 32px rgba(15,15,13,0.08)',
        'inner-line': 'inset 0 0 0 1px rgba(15,15,13,0.08)',
      },

      animation: {
        'fade-in':      'fadeIn 0.5s ease-out forwards',
        'slide-up':     'slideUp 0.6s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-in':     'slideIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'marquee':      'marquee 40s linear infinite',
        'pulse-ring':   'pulseRing 2s cubic-bezier(0.4,0,0.6,1) infinite',
        'blink':        'blink 1.2s ease-in-out infinite',
        'shimmer':      'shimmer 2s linear infinite',
        'count-pop':    'countPop 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        pulseRing: {
          '0%':   { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(2)',   opacity: '0' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.3' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        countPop: {
          '0%':   { transform: 'scale(0.5)', opacity: '0' },
          '60%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },

      backgroundImage: {
        'grid-light':  'linear-gradient(rgba(15,15,13,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,15,13,0.04) 1px, transparent 1px)',
        'grid-dark':   'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
        'noise':       "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },

      backgroundSize: {
        'grid':   '48px 48px',
        'grid-sm': '24px 24px',
      },
    },
  },
  plugins: [],
}
