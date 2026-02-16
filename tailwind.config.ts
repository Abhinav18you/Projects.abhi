import type { Config } from 'tailwindcss';

export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        abyss: '#020202',
        neon: '#39ff14',
        neonSoft: '#99ff66',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 10px rgba(57, 255, 20, 0.35), 0 0 30px rgba(57, 255, 20, 0.15)',
        'glass-inset': 'inset 0 1px 0 0 rgba(255,255,255,0.05)',
        'premium-glow': '0 0 40px rgba(0, 255, 65, 0.15)',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { boxShadow: '0 0 0 rgba(57, 255, 20, 0.1)' },
          '50%': { boxShadow: '0 0 24px rgba(57, 255, 20, 0.45)' },
        },
      },
      animation: {
        pulseNeon: 'pulseNeon 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
