import type { Config } from 'tailwindcss';

/**
 * Aether signal system (see DESIGN.md). The legacy token names (`greenglow`,
 * `redglow`, `electric`, `cyan`) are kept so every page picks up the new
 * palette without a class rename; new work should prefer `void`, `card`,
 * `plasma`, `emerald`, `coral` and the `font-display` / `font-mono` families.
 */
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.css',
  ],
  theme: {
    extend: {
      colors: {
        void: '#05070E',
        card: '#0A0D18',
        background: '#05070E',
        panel: '#0A0D18',
        muted: '#94A3B8',
        steel: '#64748B',
        line: 'rgba(255,255,255,0.08)',
        silver: '#F3F6FA',
        plasma: '#00F0FF',
        emerald: '#10B981',
        coral: '#FF6B4A',
        redglow: '#FF6B4A',
        greenglow: '#10B981',
        electric: '#3B82F6',
        cyan: '#00F0FF',
        cobalt: '#2F80ED',
      },
      boxShadow: {
        electric: '0 0 24px rgba(0,240,255,0.35)',
        plasma: '0 0 20px rgba(0,240,255,0.5)',
        aura: '0 0 32px -4px rgba(0,240,255,0.18)',
        float:
          '0 20px 48px -10px rgba(0,0,0,0.8), 0 0 24px rgba(0,240,255,0.2)',
        green: '0 0 24px rgba(16,185,129,0.35)',
        red: '0 0 32px rgba(255,107,74,0.28)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: [
          'var(--font-display)',
          'var(--font-sans)',
          'ui-sans-serif',
          'sans-serif',
        ],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'ftd-grid':
          'linear-gradient(rgba(255,255,255,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.045) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};

export default config;
