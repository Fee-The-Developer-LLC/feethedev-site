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
  ['/start', 0.8, 'monthly'],
  ['/credentials', 0.7, 'monthly'],
  ['/devil-to-developer', 0.7, 'weekly'],
  ['/apprenticeship', 0.7, 'weekly'],
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
