import type { ReactNode } from 'react';
import { Body, Button, H1 } from '@/components/ui';

type Action = { label: string; href: string; secondary?: boolean };

export function InteriorHero({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
  actions: Action[];
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 py-20 sm:py-28">
      <div className="shell relative z-10">
        <div className="max-w-4xl space-y-7">
          <p className="status-chip text-cyan">{eyebrow}</p>
          <H1 className="text-balance text-5xl uppercase leading-[0.94] sm:text-6xl lg:text-7xl">
            {title}
          </H1>
          <Body className="max-w-2xl text-lg sm:text-xl">{description}</Body>
          <div className="flex flex-wrap gap-3 pt-2">
            {actions.map((action) => (
              <Button
                key={action.label}
                href={action.href}
                variant={action.secondary ? 'outline' : 'primary'}
                glow={action.secondary ? 'green' : 'gradient'}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
        {children ? <div className="mt-14">{children}</div> : null}
      </div>
    </section>
  );
}
