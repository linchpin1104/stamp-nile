import { pretendard } from '@/styles/fonts';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { cn } from '@/lib/utils';
import { LanguageAttributeHandler } from '@/components/language-attribute-handler';

export const metadata = {
  title: 'STAMP',
  description: 'Guidance and support for your parenting journey.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <LanguageAttributeHandler />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          pretendard.variable
        )}
      >
        <Providers>
          <div className="relative flex min-h-dvh flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}