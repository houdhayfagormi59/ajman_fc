import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ajman Coach Pro — Player Management',
  description: 'Professional football player management for coaches in Ajman, UAE.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
