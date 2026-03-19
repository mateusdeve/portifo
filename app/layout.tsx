import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfólio Mateus Pires",
  description:
    "Portfólio de Mateus Pires, desenvolvedor focado em criar interfaces modernas, performáticas e experiências digitais de alta qualidade.",
  keywords: [
    "Mateus Pires",
    "portfólio",
    "desenvolvedor front-end",
    "React",
    "Next.js",
    "TypeScript",
    "web design",
  ],
  authors: [{ name: "Mateus Pires" }],
  creator: "Mateus Pires",
  openGraph: {
    title: "Portfólio Mateus Pires",
    description:
      "Conheça projetos, habilidades e experiências de Mateus Pires em desenvolvimento web.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Portfólio Mateus Pires",
    description:
      "Projetos, habilidades e experiências em desenvolvimento web por Mateus Pires.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className="dark h-full antialiased"
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body text-on-surface selection:bg-primary selection:text-on-primary">
        {children}
      </body>
    </html>
  );
}
