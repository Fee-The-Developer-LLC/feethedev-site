import type { MetadataRoute } from 'next';
import { services } from '@/lib/services';
import { siteConfig } from '@/lib/site-config';

type Entry = MetadataRoute.Sitemap[number];

const pages: [
  path: string,
  priority: number,
  frequency: Entry['changeFrequency'],
][] = [
  ['', 1, 'weekly'],
  ['/services', 0.9, 'monthly'],
  ['/pricing', 0.9, 'monthly'],
  ['/work', 0.9, 'monthly'],
  ['/stack', 0.8, 'monthly'],
  ['/switch', 0.8, 'monthly'],
  ['/start', 0.8, 'monthly'],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    ...pages.map(([path, priority, changeFrequency]) => ({
      url: `${siteConfig.siteUrl}${path}`,
      lastModified,
      changeFrequency,
      priority,
    })),
    ...services.map((service) => ({
      url: `${siteConfig.siteUrl}${service.href}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
