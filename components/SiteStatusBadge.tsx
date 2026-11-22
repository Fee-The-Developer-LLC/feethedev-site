import { cn } from '@/lib/utils';
import type { ShowroomSite } from '@/lib/showroom';

/** "Live" for launched client sites, "Preview · In progress" otherwise. */
export function SiteStatusBadge({
  status,
  className,
}: {
  status: ShowroomSite['status'];
  className?: string;
}) {
  const live = status === 'live';
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em]',
        live
          ? 'border-greenglow/40 text-greenglow'
          : 'border-amber-300/40 text-amber-200',
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'h-1.5 w-1.5 rounded-full',
          live
            ? 'bg-greenglow shadow-[0_0_10px_rgba(20,232,180,.8)]'
            : 'bg-amber-300',
        )}
      />
      {live ? 'Live' : 'Preview · In progress'}
    </span>
  );
}
