// apps/web/src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter, Nunito_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const nunitoSans = Nunito_Sans({ 
  subsets: ['latin'],
  variable: '--font-nunito-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MathQuest Florida - Turn Test Jitters into Daily Wins',
  description: 'AI-powered gamified math tutor for SAT and Florida college readiness exams',
  keywords: ['SAT prep', 'math tutor', 'PERT exam', 'Florida education', 'AI tutor'],
  authors: [{ name: 'MathQuest Florida' }],
  openGraph: {
    title: 'MathQuest Florida',
    description: 'Transform math anxiety into daily achievement',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${nunitoSans.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
