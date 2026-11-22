import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fee The Developer',
    short_name: 'Fee The Developer',
    description: 'Veteran-owned software and AI automation company.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0A0A0A',
    theme_color: '#0A0A0A',
    icons: [
      { src: '/brand/ftd-icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/brand/ftd-icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
