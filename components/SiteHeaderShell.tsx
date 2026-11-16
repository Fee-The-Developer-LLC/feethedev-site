'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';

/**
 * Wraps the site header. On the home page the header floats over the globe
 * hero (fixed, see-through) so the globe reads as one piece with it, then
 * turns solid once the visitor scrolls. Every other page keeps the sticky,
 * solid header.
 */
export function SiteHeaderShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const overHero = pathname === '/';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overHero]);

  const base = 'top-0 z-50 transition-colors duration-300';
  const solid = 'border-b border-white/10 bg-background/90 backdrop-blur-xl';
  const clear = 'border-b border-transparent bg-transparent';

  const className = overHero
    ? `fixed inset-x-0 ${base} ${scrolled ? solid : clear}`
    : `sticky ${base} ${solid}`;

  return <header className={className}>{children}</header>;
}
