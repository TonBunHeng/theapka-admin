/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: {
            50: '#FBF8F1',
            100: '#F6F0E0',
            200: '#EBDDBA',
            300: '#DEC58F',
            400: '#D4AF37', // signature soft gold
            500: '#B89325',
            600: '#947318',
            700: '#715412',
            800: '#4F380C',
            900: '#2E2006',
          },
          emerald: {
            50: '#F0F9F5',
            100: '#DDF0E7',
            200: '#BEDFCF',
            300: '#93C7AF',
            400: '#61A88B',
            500: '#39886C',
            600: '#246B53',
            700: '#1B5E4A',
            800: '#144638',
            900: '#0F342A', // signature deep emerald
            950: '#071F19',
          },
          cream: '#FAF7F0',
        },
      },
      fontFamily: {
        sans: ['"Kantumruy Pro"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      transitionDuration: {
        DEFAULT: '200ms',
      },
      keyframes: {
        modalBackdrop: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalContent: {
          '0%': { opacity: '0', transform: 'scale(0.94) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        drawerSlide: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        popupScale: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(-6px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        toastSlide: {
          '0%': { opacity: '0', transform: 'translateY(16px) scale(0.95)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'modal-backdrop': 'modalBackdrop 220ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'modal-content': 'modalContent 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'drawer-slide': 'drawerSlide 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'popup-scale': 'popupScale 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-slide': 'toastSlide 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};

