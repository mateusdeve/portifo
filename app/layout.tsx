import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mateus Pires — Desenvolvedor Full Stack",
  description:
    "Portfólio de Mateus Pires, desenvolvedor full stack com 7+ anos construindo aplicações web — do front-end ao back-end. Especialista em React, Next.js e IA.",
  keywords: [
    "Mateus Pires",
    "portfólio",
    "desenvolvedor full stack",
    "React",
    "Next.js",
    "TypeScript",
    "Node.js",
    "IA",
    "agentes de IA",
  ],
  authors: [{ name: "Mateus Pires" }],
  creator: "Mateus Pires",
  openGraph: {
    title: "Mateus Pires — Desenvolvedor Full Stack",
    description:
      "Conheça projetos, habilidades e experiências de Mateus Pires em desenvolvimento web e IA.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mateus Pires — Desenvolvedor Full Stack",
    description:
      "Projetos, habilidades e experiências em desenvolvimento web e IA por Mateus Pires.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400;1,9..144,500&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
