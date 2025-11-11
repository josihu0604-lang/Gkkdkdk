import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PerformanceMonitor } from '../components/PerformanceMonitor';
import "../../styles/globals.css";

export function generateStaticParams() {
  return [{ locale: 'ko' }, { locale: 'zh-CN' }, { locale: 'ja-JP' }];
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <PerformanceMonitor />
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
