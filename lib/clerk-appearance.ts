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

/**
 * Copy for the first step of each flow, shared by the popup and the full-page
 * routes. Later steps (verification, password reset, MFA) keep Clerk's own
 * wording so they stay accurate for whichever methods are enabled.
 */
export const clerkLocalization = {
  signIn: {
    start: {
      title: 'Welcome back.',
      subtitle: 'Sign in to your Fee The Developer account.',
      actionText: 'New here?',
      actionLink: 'Create an account',
    },
  },
  signUp: {
    start: {
      title: 'Create your free account.',
      subtitle: 'Get offers first and check out faster.',
      actionText: 'Already have an account?',
      actionLink: 'Sign in',
    },
  },
} as const;

/**
 * Inside the popup the form sits on the dialog panel, so Clerk's own card
 * chrome is flattened. The start-step "switch flow" footer is hidden because
 * the dialog renders its own switch that stays in place instead of navigating
 * to /sign-in or /sign-up. Recovery links ("Use another method", "Having
 * trouble?") stay visible.
 */
export const clerkDialogAppearance = {
  // Style objects rather than utility classes so they win over Clerk's own
  // emotion styles regardless of stylesheet order.
  elements: {
    rootBox: { width: '100%' },
    cardBox: {
      width: '100%',
      maxWidth: 'none',
      boxShadow: 'none',
      border: 0,
      borderRadius: 0,
    },
    card: {
      background: 'transparent',
      boxShadow: 'none',
      border: 0,
      paddingLeft: 0,
      paddingRight: 0,
    },
    footer: { background: 'transparent' },
    footerAction__signUp: { display: 'none' },
    footerAction__signIn: { display: 'none' },
  },
} as const;
