import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TL;DR Mail — Decode Official Mail',
    short_name: 'TL;DR Mail',
    description: 'Snap a photo of confusing official mail to get 6th-grade explanations, deadlines, and local help.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#2563eb',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
