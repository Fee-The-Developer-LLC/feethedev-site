import Image from 'next/image';
import type { ReactNode } from 'react';

export function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main
      id="main-content"
      className="relative flex min-h-[80vh] items-center overflow-hidden py-16"
    >
      <Image
        src="/library/video/hero-globe-poster.webp"
        alt=""
        aria-hidden="true"
        fill
        sizes="100vw"
        className="object-cover opacity-20"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/60" />
      <div className="shell relative z-10 grid items-center gap-12 lg:grid-cols-2">
        <div className="max-w-xl space-y-5">
          <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="text-lg leading-8 text-slate-300">{description}</p>
        </div>
        <div className="flex justify-center lg:justify-end">{children}</div>
      </div>
    </main>
  );
}
