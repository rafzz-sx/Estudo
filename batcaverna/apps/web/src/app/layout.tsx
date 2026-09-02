import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BatCaverna — Sua central de operações para concursos militares e ENEM",
  description:
    "Plataforma gamificada de estudos para EEAR, ESA, EAM, CN, EPCAR, EsPCEx, EFOMM, IME e ENEM. Banco de questões, simulados, bizus, ranking e muito mais.",
  keywords: [
    "concursos militares",
    "EEAR",
    "ESA",
    "EAM",
    "Colégio Naval",
    "EPCAR",
    "EsPCEx",
    "EFOMM",
    "IME",
    "ENEM",
    "banco de questões",
    "bizus",
    "simulados",
    "estudos",
    "BatCaverna",
  ],
  openGraph: {
    title: "BatCaverna — Central de Estudos para Concursos Militares",
    description:
      "Domine os concursos militares e o ENEM com a plataforma gamificada mais imersiva do Brasil.",
    type: "website",
    locale: "pt_BR",
    siteName: "BatCaverna",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0B0B0F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="BatCaverna" />
        <link rel="apple-touch-icon" href="/images/icon-192.png" />
      </head>
      <body className="antialiased">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.warn('SW registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
