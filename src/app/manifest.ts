import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'nia mobility Kenya',
    short_name: 'nia mobility',
    description: "Kenya's trusted marketplace connecting verified drivers and vehicle partners in Nairobi and across Kenya.",
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#102A43',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
