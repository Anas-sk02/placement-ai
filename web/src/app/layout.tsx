import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'PlaceMint AI — College Placement & Deadline Intelligence',
  description:
    'AI-powered college placement organizer that monitors Telegram recruitment groups, extracts drives, tests eligibility, and sends urgent deadline alerts.',
  keywords: [
    'placement portal',
    'college placements',
    'telegram placement bot',
    'deadline tracker',
    'campus recruitment',
    'placement ai',
  ],
  authors: [{ name: 'PlaceMint AI' }],
};

export const viewport: Viewport = {
  themeColor: '#0b0f19',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body>{children}</body>
    </html>
  );
}
