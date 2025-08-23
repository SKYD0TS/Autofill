import SessionWrapper from "@/components/Wrapper/SessionWrapper";
import ToastProvider from '@/components/ToastProvider';
import "./globals.css"; // Import global styles

import { Metadata } from 'next';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://autofill.site'),
  title: 'Autofill - Isi Google Form Otomatis dalam 1 Klik',
  description: 'Isi Google Form secara otomatis. Cepat, aman, dan fleksibel.',
  keywords: 'autofill google form, isi otomatis, kuesioner cepat',
  openGraph: {
    title: 'Autofill - Isi Google Form Otomatis dalam 1 Klik',
    description: 'Isi Google Form secara otomatis. Cepat, aman, dan fleksibel.',
    url: '/',
    siteName: 'Autofill',
    images: [
      {
        url: '/images/og-home.jpg', // ✅ Will be resolved relative to metadataBase
        width: 1200,
        height: 630,
        alt: 'Autofill - Isi Google Form Otomatis',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@autofill_id',
    creator: '@autofill_id',
    title: 'Autofill - Isi Google Form Otomatis dalam 1 Klik',
    description: 'Isi Google Form secara otomatis. Cepat, aman, dan fleksibel.',
    image: '/images/og-home.jpg', // ✅ Also resolved correctly
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="favicon.ico"></link>
      </head>
      <body suppressHydrationWarning>
          <SessionWrapper>
            <ToastProvider />
            {children}
          </SessionWrapper>
      </body>
    </html>
  );
}
