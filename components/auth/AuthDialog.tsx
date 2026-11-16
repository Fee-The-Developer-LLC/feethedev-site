'use client';

import {
  ClerkFailed,
  ClerkLoaded,
  ClerkLoading,
  SignIn,
  SignUp,
  UNSAFE_PortalProvider,
  useAuth,
} from '@clerk/nextjs';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';
import { clerkDialogAppearance } from '@/lib/clerk-appearance';
import { DEFAULT_AUTH_DESTINATION, safeReturnPath } from '@/lib/safe-redirect';

export type AuthMode = 'sign-in' | 'sign-up';

type OpenOptions = {
  /** Element to return focus to when the dialog closes. */
  trigger?: HTMLElement | null;
  /** Internal path to continue to after authenticating. */
  redirectTo?: string;
};

type AuthDialogContextValue = {
  open: (mode: AuthMode, options?: OpenOptions) => void;
};

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

/**
 * Clerk's prebuilt components normally route their sub-steps (verification,
 * password reset, MFA) through the URL. "virtual" keeps those steps in memory,
 * which is what Clerk's own modal uses. It is accepted at runtime but missing
 * from the public prop types, hence the cast. Provider returns (OAuth, email
 * links) still land on the full-page /sign-in and /sign-up routes because
 * ClerkProvider is given those URLs.
 */
const virtualRouting = { routing: 'virtual' } as unknown as {
  routing?: 'hash';
};

const AUTO_PROMPT_KEY = 'ftd:signup-prompt-shown';
const AUTO_PROMPT_DELAY_MS = 8_000;
const AUTO_PROMPT_PATHS = new Set(['/', '/services']);

const DIALOG_LABEL: Record<AuthMode, string> = {
  'sign-in': 'Sign in to Fee The Developer',
  'sign-up': 'Create your free Fee The Developer account',
};

/**
 * Owns the single branded sign-in / sign-up dialog. Render it inside
 * ClerkProvider only; without Clerk keys the triggers stay plain links.
 */
export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<AuthMode | null>(null);
  const [redirectTo, setRedirectTo] = useState(safeReturnPath(undefined));
  // Bumped on every open and mode switch so Clerk's form remounts empty.
  const [formKey, setFormKey] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const scrollRef = useRef(0);
  const { isLoaded, isSignedIn } = useAuth();
  const pathname = usePathname();
  // Clerk can sit in "loading" indefinitely when its script or API is
  // unreachable; after a grace period offer the full-page route instead.
  const [loadStalled, setLoadStalled] = useState(false);

  const open = useCallback((next: AuthMode, options: OpenOptions = {}) => {
    triggerRef.current =
      options.trigger ??
      (document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null);
    setRedirectTo(safeReturnPath(options.redirectTo));
    setFormKey((key) => key + 1);
    setMode(next);
  }, []);

  const close = useCallback(() => setMode(null), []);

  const switchTo = useCallback((next: AuthMode) => {
    setFormKey((key) => key + 1);
    setMode(next);
  }, []);

  const isOpen = mode !== null;

  // Open/close the native modal, lock page scroll, and restore scroll and
  // focus when it closes.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = document.documentElement;

    if (isOpen && !dialog.open) {
      scrollRef.current = window.scrollY;
      root.style.overflow = 'hidden';
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }

    if (!isOpen) {
      if (root.style.overflow === 'hidden') {
        root.style.overflow = '';
        window.scrollTo({ top: scrollRef.current, behavior: 'instant' });
      }
      const trigger = triggerRef.current;
      triggerRef.current = null;
      if (trigger?.isConnected) trigger.focus({ preventScroll: true });
    }
  }, [isOpen]);

  // Release the scroll lock if the provider unmounts while open.
  useEffect(
    () => () => {
      document.documentElement.style.overflow = '';
    },
    [],
  );

  // Clerk navigates to the destination after success; close behind it.
  useEffect(() => {
    if (isSignedIn) setMode(null);
  }, [isSignedIn]);

  useEffect(() => {
    setMode(null);
  }, [pathname]);

  useEffect(() => {
    setLoadStalled(false);
    if (mode === null || isLoaded) return;
    const timer = window.setTimeout(() => setLoadStalled(true), 10_000);
    return () => window.clearTimeout(timer);
  }, [mode, isLoaded]);

  // One-time sign-up invite: signed-out visitors on Home or Services see the
  // sign-up popup once, a few seconds after landing. Remembered per browser.
  useEffect(() => {
    if (!isLoaded || isSignedIn || isOpen) return;
    if (!AUTO_PROMPT_PATHS.has(pathname ?? '')) return;
    try {
      if (window.localStorage.getItem(AUTO_PROMPT_KEY)) return;
    } catch {
      return;
    }
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(AUTO_PROMPT_KEY, String(Date.now()));
      } catch {
        // Storage blocked: still show it this once.
      }
      open('sign-up', { trigger: null });
    }, AUTO_PROMPT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [isLoaded, isSignedIn, isOpen, pathname, open]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <dialog
        ref={dialogRef}
        aria-label={mode ? DIALOG_LABEL[mode] : undefined}
        className="auth-dialog"
        onCancel={(event) => {
          // Let Escape close Clerk's own popovers (e.g. a country picker)
          // before it closes the dialog.
          if (
            dialogRef.current?.querySelector(
              '[role="listbox"], [role="menu"], [aria-expanded="true"]',
            )
          ) {
            event.preventDefault();
            return;
          }
          event.preventDefault();
          close();
        }}
        onClose={close}
        // Clicking the backdrop deliberately does nothing: a stray click must
        // not throw away a verification code in progress.
      >
        {mode && (
          <div ref={portalRef} className="auth-dialog__frame">
            <aside className="auth-dialog__brand">
              <Image
                src="/library/video/hero-globe-poster.webp"
                alt=""
                fill
                sizes="360px"
                className="object-cover opacity-[0.18]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0B1018]/40 via-[#0B1018]/70 to-[#0B1018]" />
              <div className="relative flex h-full flex-col">
                <Image
                  src="/brand/ftd-wordmark-header.webp"
                  alt=""
                  width={250}
                  height={112}
                  className="h-12 w-auto self-start"
                />
                <p className="mt-10 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-greenglow" />
                  Free account
                </p>
                <p className="mt-4 text-3xl font-extrabold leading-tight text-white">
                  Your next build starts here.
                </p>
                <p className="mt-4 text-base leading-7 text-slate-300">
                  One account for your projects, requests, and checkout.
                </p>
                <p className="mt-auto pt-10 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Build. Automate. Create. Scale.
                </p>
              </div>
            </aside>

            <section className="auth-dialog__form">
              <div className="flex items-start justify-between gap-4">
                <Image
                  src="/brand/ftd-wordmark-header.webp"
                  alt="Fee The Developer"
                  width={250}
                  height={112}
                  className="h-9 w-auto md:invisible"
                />
                <button
                  type="button"
                  onClick={close}
                  aria-label="Close"
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 text-xl text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow"
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>

              <UNSAFE_PortalProvider getContainer={() => portalRef.current}>
                <ClerkLoading>
                  {loadStalled ? (
                    <LoadFailed mode={mode} redirectTo={redirectTo} />
                  ) : (
                    <div
                      role="status"
                      className="flex min-h-[18rem] items-center justify-center gap-3 text-sm text-slate-300"
                    >
                      <span
                        aria-hidden="true"
                        className="auth-dialog__spinner h-5 w-5 rounded-full border-2 border-white/20 border-t-greenglow"
                      />
                      Loading secure sign-in…
                    </div>
                  )}
                </ClerkLoading>
                <ClerkFailed>
                  {mode && <LoadFailed mode={mode} redirectTo={redirectTo} />}
                </ClerkFailed>
                <ClerkLoaded>
                  <div className="mt-2">
                    {mode === 'sign-in' ? (
                      <SignIn
                        key={`sign-in-${formKey}`}
                        {...virtualRouting}
                        appearance={clerkDialogAppearance}
                        forceRedirectUrl={redirectTo}
                        signUpForceRedirectUrl={redirectTo}
                        signUpUrl="/sign-up"
                      />
                    ) : (
                      <SignUp
                        key={`sign-up-${formKey}`}
                        {...virtualRouting}
                        appearance={clerkDialogAppearance}
                        forceRedirectUrl={redirectTo}
                        signInForceRedirectUrl={redirectTo}
                        signInUrl="/sign-in"
                      />
                    )}
                  </div>
                  <p className="mt-4 border-t border-white/10 pt-5 text-center text-sm text-slate-300">
                    {mode === 'sign-in'
                      ? 'New here? '
                      : 'Already have an account? '}
                    <button
                      type="button"
                      onClick={() =>
                        switchTo(mode === 'sign-in' ? 'sign-up' : 'sign-in')
                      }
                      className="inline-flex min-h-11 items-center font-bold text-cyan underline underline-offset-4 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-greenglow"
                    >
                      {mode === 'sign-in' ? 'Create an account' : 'Sign in'}
                    </button>
                  </p>
                </ClerkLoaded>
              </UNSAFE_PortalProvider>
            </section>
          </div>
        )}
      </dialog>
    </AuthDialogContext.Provider>
  );
}

/** Full-page fallback URL, carrying a validated return destination. */
function authHref(mode: AuthMode, redirectTo?: string) {
  const base = mode === 'sign-in' ? '/sign-in' : '/sign-up';
  const destination = safeReturnPath(redirectTo);
  return destination === DEFAULT_AUTH_DESTINATION
    ? base
    : `${base}?redirect_url=${encodeURIComponent(destination)}`;
}

function LoadFailed({
  mode,
  redirectTo,
}: {
  mode: AuthMode;
  redirectTo: string;
}) {
  return (
    <div role="alert" className="py-10 text-sm leading-6">
      <p className="text-base font-bold text-white">Sign-in could not load.</p>
      <p className="mt-2 text-slate-300">
        Check your connection and try again, or use the full page.
      </p>
      <a
        href={authHref(mode, redirectTo)}
        className="mt-5 inline-flex min-h-11 items-center rounded-full bg-silver px-5 text-xs font-extrabold uppercase tracking-[0.12em] text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-greenglow"
      >
        {mode === 'sign-in' ? 'Open sign-in page' : 'Open sign-up page'}
      </a>
    </div>
  );
}

/**
 * A real link to /sign-in or /sign-up that opens the popup instead on a plain
 * click. New-tab clicks, no-JS visitors and pages without the provider (no
 * Clerk keys) get the full-page route.
 */
export function AuthTrigger({
  mode,
  redirectTo,
  className,
  children,
}: {
  mode: AuthMode;
  redirectTo?: string;
  className?: string;
  children: ReactNode;
}) {
  const dialog = useContext(AuthDialogContext);
  const href = authHref(mode, redirectTo);

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (
      !dialog ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    dialog.open(mode, { trigger: event.currentTarget, redirectTo });
  }

  return (
    <a
      href={href}
      onClick={handleClick}
      aria-haspopup={dialog ? 'dialog' : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
