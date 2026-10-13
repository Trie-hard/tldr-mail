import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'TL;DR Mail — Decode Official Mail',
    short_name: 'TL;DR Mail',
    description: 'Snap a photo of confusing official mail to get 6th-grade explanations, deadlines, and local help.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f3efe6',
    theme_color: '#1a4d3e',
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
