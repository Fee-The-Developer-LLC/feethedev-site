'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { track, type TrackedEvent } from '@/lib/track';

/**
 * Fires `data-track` click events for any descendant link or button, e.g.
 * `<a data-track="portfolio_site_click" data-track-project="aaron-draper">`.
 * Optionally fires one `view` event the first time the block scrolls into
 * view. Server components stay server components: they only add attributes.
 */
export function TrackEvents({
  children,
  view,
  className,
}: {
  children: ReactNode;
  view?: {
    event: TrackedEvent;
    product?: string;
    project?: string;
    source?: string;
  };
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const viewKey = view ? JSON.stringify(view) : null;

  useEffect(() => {
    const node = ref.current;
    if (!node || !viewKey) return;
    const payload = JSON.parse(viewKey) as NonNullable<typeof view>;
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          const { event, ...props } = payload;
          track(event, props);
          observer.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [viewKey]);

  function onClick(event: React.MouseEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>(
      '[data-track]',
    );
    if (!target || !ref.current?.contains(target)) return;
    track(target.dataset.track as TrackedEvent, {
      product: target.dataset.trackProduct,
      project: target.dataset.trackProject,
      source: target.dataset.trackSource,
    });
  }

  return (
    // Click tracking is delegated from real links and buttons inside.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div ref={ref} className={className} onClick={onClick}>
      {children}
    </div>
  );
}
