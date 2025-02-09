import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Navigation } from '@/components/ui/navigation';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AvaxSlap - Web3 PvP Slap Battles',
  description: 'Challenge Web3 influencers to a slap battle!',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navigation />
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}