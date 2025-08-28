import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from '@/components/layout/header'
import { PWAInstallPrompt } from '@/components/pwa/install-prompt'
import { PWAStatus } from '@/components/pwa/status'
import { cn } from '@/lib/utils'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get the correct base path for production
const isProd = process.env.NODE_ENV === 'production';
const basePath = isProd ? '/Zenless-Inflation-Watcher' : '';

export const metadata: Metadata = {
  title: "Zenless Zone Zero Battle Records",
  description: "Track and analyze your Zenless Zone Zero battle performance",
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ZZZ Records",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Zenless Zone Zero Battle Records",
    title: "ZZZ Battle Records",
    description: "Track and analyze your Zenless Zone Zero battle performance",
  },
  twitter: {
    card: "summary",
    title: "ZZZ Battle Records",
    description: "Track and analyze your Zenless Zone Zero battle performance",
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7c3aed',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ZZZ Records" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#7c3aed" />
        <link rel="apple-touch-icon" href={`${basePath}/icons/icon-192x192.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${basePath}/icons/icon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="16x16" href={`${basePath}/icons/icon-16x16.png`} />
        <link rel="mask-icon" href={`${basePath}/icons/safari-pinned-tab.svg`} color="#7c3aed" />
      </head>
      <body
        className={cn(
          `${geistSans.variable} ${geistMono.variable}`,
          'min-h-screen bg-background font-sans antialiased'
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <div className="container mx-auto py-12 px-4">
              {children}
            </div>
          </main>
          <PWAInstallPrompt />
          <PWAStatus />
        </div>
      </body>
    </html>
  );
}
