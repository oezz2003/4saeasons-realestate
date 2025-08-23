import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { PageTransitionProvider } from '@/components/layout/page-transition-provider';
import { ThemeProvider } from '@/components/layout/theme-provider';
import ClientClickSpark from '@/components/client-click-spark';

export const metadata: Metadata = {
  title: 'Four Seasons Real Estate Hub',
  description: 'Your premier destination for finding the perfect property.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased'
        )}
        suppressHydrationWarning
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <ClientClickSpark>
            <div className="relative flex min-h-dvh flex-col bg-background">
              <Header />
              <PageTransitionProvider>
                  {children}
              </PageTransitionProvider>
              <Footer />
            </div>
            <Toaster />
          </ClientClickSpark>
        </ThemeProvider>
      </body>
    </html>
  );
}
