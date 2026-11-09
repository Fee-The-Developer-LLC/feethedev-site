/** Fee The Developer theme for every Clerk sign-in, sign-up and account UI. */
export const clerkAppearance = {
  variables: {
    colorPrimary: '#F3F6FA',
    colorPrimaryForeground: '#05070B',
    colorBackground: '#0B1018',
    colorForeground: '#F3F6FA',
    colorMutedForeground: '#91A0B7',
    colorInput: '#05070B',
    colorInputForeground: '#F3F6FA',
    colorNeutral: '#F3F6FA',
    colorBorder: 'rgba(255,255,255,0.14)',
    colorDanger: '#FF6B35',
    borderRadius: '0.9rem',
    fontFamily: 'var(--font-sans), system-ui, sans-serif',
  },
  elements: {
    card: 'shadow-[0_28px_100px_rgba(0,0,0,0.55)] border border-white/10',
    formButtonPrimary:
      'uppercase tracking-[0.14em] font-extrabold shadow-[0_0_36px_rgba(37,120,255,0.35)]',
    footer: 'bg-[#0B1018]',
  },
} as const;
