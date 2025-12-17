import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GabaritandoIA',
  description: 'Seu assistente de estudos inteligente',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GabaritandoIA',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className="antialiased font-sans bg-gray-50 text-gray-900"
        suppressHydrationWarning
      >
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
