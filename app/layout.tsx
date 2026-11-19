import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SWRegister } from '@/components/SWRegister';

const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const metadata: Metadata = {
  title: 'Arabic Reading — Sight-Reading Trainer',
  description: 'Learn to read Arabic by sight, not by page order.',
  manifest: `${BASE}/manifest.json`,
  applicationName: 'Arabic Reading',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Arabic Reading' },
  icons: { icon: `${BASE}/icons/icon-192.png` },
};

export const viewport: Viewport = {
  themeColor: '#0f766e',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap"
        />
      </head>
      <body>
        {children}
        <SWRegister />
      </body>
    </html>
  );
}
