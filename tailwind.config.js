/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#2563EB', // Deep blue (primary) - blue-600
        'primary-50': '#EFF6FF', // Very light blue (50-level shade) - blue-50
        'primary-100': '#DBEAFE', // Light blue (100-level shade) - blue-100
        'primary-500': '#3B82F6', // Medium blue (500-level shade) - blue-500
        'primary-700': '#1D4ED8', // Dark blue (700-level shade) - blue-700
        'primary-900': '#1E3A8A', // Very dark blue (900-level shade) - blue-900

        // Secondary Colors
        'secondary': '#64748B', // Sophisticated slate (secondary) - slate-500
        'secondary-50': '#F8FAFC', // Very light slate (50-level shade) - slate-50
        'secondary-100': '#F1F5F9', // Light slate (100-level shade) - slate-100
        'secondary-200': '#E2E8F0', // Light slate (200-level shade) - slate-200
        'secondary-300': '#CBD5E1', // Medium light slate (300-level shade) - slate-300
        'secondary-400': '#94A3B8', // Medium slate (400-level shade) - slate-400
        'secondary-600': '#475569', // Dark slate (600-level shade) - slate-600
        'secondary-700': '#334155', // Darker slate (700-level shade) - slate-700
        'secondary-800': '#1E293B', // Very dark slate (800-level shade) - slate-800
        'secondary-900': '#0F172A', // Darkest slate (900-level shade) - slate-900

        // Accent Colors
        'accent': '#0EA5E9', // Vibrant sky blue (accent) - sky-500
        'accent-50': '#F0F9FF', // Very light sky blue (50-level shade) - sky-50
        'accent-100': '#E0F2FE', // Light sky blue (100-level shade) - sky-100
        'accent-200': '#BAE6FD', // Light sky blue (200-level shade) - sky-200
        'accent-400': '#38BDF8', // Medium sky blue (400-level shade) - sky-400
        'accent-600': '#0284C7', // Dark sky blue (600-level shade) - sky-600
        'accent-700': '#0369A1', // Darker sky blue (700-level shade) - sky-700

        // Background Colors
        'background': '#FAFAFA', // Warm off-white (background) - neutral-50
        'surface': '#FFFFFF', // Pure white (surface) - white

        // Text Colors
        'text-primary': '#1E293B', // Rich charcoal (text primary) - slate-800
        'text-secondary': '#64748B', // Muted slate (text secondary) - slate-500

        // Status Colors
        'success': '#059669', // Professional emerald (success) - emerald-600
        'success-50': '#ECFDF5', // Very light emerald (50-level shade) - emerald-50
        'success-100': '#D1FAE5', // Light emerald (100-level shade) - emerald-100
        'success-500': '#10B981', // Medium emerald (500-level shade) - emerald-500
        'success-700': '#047857', // Dark emerald (700-level shade) - emerald-700

        'warning': '#D97706', // Warm amber (warning) - amber-600
        'warning-50': '#FFFBEB', // Very light amber (50-level shade) - amber-50
        'warning-100': '#FEF3C7', // Light amber (100-level shade) - amber-100
        'warning-500': '#F59E0B', // Medium amber (500-level shade) - amber-500
        'warning-700': '#B45309', // Dark amber (700-level shade) - amber-700

        'error': '#DC2626', // Clear red (error) - red-600
        'error-50': '#FEF2F2', // Very light red (50-level shade) - red-50
        'error-100': '#FEE2E2', // Light red (100-level shade) - red-100
        'error-500': '#EF4444', // Medium red (500-level shade) - red-500
        'error-700': '#B91C1C', // Dark red (700-level shade) - red-700

        // Border Colors
        'border': 'rgba(148, 163, 184, 0.2)', // Minimal border color - slate-400 with opacity
        'border-light': 'rgba(148, 163, 184, 0.1)', // Lighter border color - slate-400 with lower opacity
      },
      fontFamily: {
        'heading': ['Inter', 'system-ui', 'sans-serif'], // Modern geometric sans-serif - Inter
        'body': ['Inter', 'system-ui', 'sans-serif'], // Consistent with headings - Inter
        'caption': ['Inter', 'system-ui', 'sans-serif'], // Visual consistency for UI labels - Inter
        'data': ['JetBrains Mono', 'Consolas', 'monospace'], // Monospace for technical data - JetBrains Mono
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      fontWeight: {
        'normal': '400',
        'medium': '500',
        'semibold': '600',
      },
      borderRadius: {
        'none': '0',
        'sm': '0.125rem',
        'DEFAULT': '0.25rem',
        'md': '0.375rem',
        'lg': '0.5rem',
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        'full': '9999px',
        'card': '8px', // Standard for cards
        'element': '4px', // Standard for smaller elements
      },
      boxShadow: {
        'elevation-1': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'elevation-2': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'elevation-3': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'elevation-4': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'elevation-5': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'elevation-6': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'ease-out': 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        'ease-in-out': 'cubic-bezier(0.4, 0.0, 0.2, 1)',
      },
      transitionDuration: {
        '150': '150ms',
        '200': '200ms',
        '250': '250ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
        '600': '600ms',
      },
      spacing: {
        '18': '4.5rem',
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      zIndex: {
        '900': '900',
        '1000': '1000',
        '1050': '1050',
        '1100': '1100',
        '1200': '1200',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-down': 'slideDown 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-gentle': 'pulseGentle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGentle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}