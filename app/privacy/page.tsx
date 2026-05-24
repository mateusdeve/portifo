import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidade — Mateus Pires",
  description: "Política de privacidade dos serviços e aplicativos de Mateus Pires.",
};

const sections = [
  {
    title: "1. Informações que coletamos",
    content: `Podemos coletar informações que você nos fornece diretamente, como nome, endereço de e-mail e outras informações de contato ao preencher formulários ou entrar em contato conosco. Também podemos coletar automaticamente certas informações quando você usa nossos serviços, incluindo dados de uso, endereço IP e informações do dispositivo.`,
  },
  {
    title: "2. Como usamos suas informações",
    content: `As informações coletadas são utilizadas para: fornecer, manter e melhorar nossos serviços; comunicar-nos com você sobre atualizações e novidades; cumprir obrigações legais; e prevenir fraudes e garantir a segurança dos nossos sistemas. Não vendemos, alugamos nem compartilhamos seus dados pessoais com terceiros para fins comerciais.`,
  },
  {
    title: "3. Compartilhamento de informações",
    content: `Suas informações pessoais não serão compartilhadas com terceiros, exceto: quando necessário para fornecer os serviços solicitados; quando exigido por lei ou ordem judicial; para proteger nossos direitos legais; ou com seu consentimento explícito. Prestadores de serviços terceirizados que nos auxiliam na operação estão sujeitos a acordos de confidencialidade.`,
  },
  {
    title: "4. Armazenamento e segurança",
    content: `Seus dados são armazenados em servidores seguros e protegidos por medidas técnicas e organizacionais adequadas. Utilizamos criptografia, controle de acesso e monitoramento contínuo para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.`,
  },
  {
    title: "5. Cookies e tecnologias similares",
    content: `Podemos utilizar cookies e tecnologias similares para melhorar sua experiência, analisar o uso dos nossos serviços e personalizar conteúdo. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar a funcionalidade de alguns serviços.`,
  },
  {
    title: "6. Seus direitos (LGPD)",
    content: `Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018), você tem o direito de: confirmar a existência de tratamento de dados; acessar seus dados; corrigir dados incompletos ou desatualizados; solicitar a anonimização, bloqueio ou eliminação de dados desnecessários; solicitar a portabilidade dos dados; revogar o consentimento a qualquer momento; e obter informações sobre com quem seus dados são compartilhados.`,
  },
  {
    title: "7. Retenção de dados",
    content: `Mantemos seus dados pessoais pelo tempo necessário para cumprir as finalidades descritas nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Quando os dados não forem mais necessários, serão excluídos de forma segura.`,
  },
  {
    title: "8. Menores de idade",
    content: `Nossos serviços não são direcionados a menores de 13 anos. Não coletamos intencionalmente informações pessoais de crianças. Se você acredita que coletamos dados de um menor, entre em contato conosco imediatamente para que possamos tomar as medidas cabíveis.`,
  },
  {
    title: "9. Alterações nesta política",
    content: `Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas por e-mail ou através de aviso em destaque em nossos serviços. O uso continuado dos serviços após as alterações constitui sua aceitação da nova política.`,
  },
  {
    title: "10. Contato",
    content: `Para exercer seus direitos, tirar dúvidas ou apresentar reclamações relacionadas ao tratamento de seus dados pessoais, entre em contato com nosso Encarregado de Proteção de Dados:\n\nMateus Silveira Pires\nmateus.dev.ti@gmail.com\nQsf 13 casa 207, Taguatinga Sul — Brasília/DF, CEP 72025630`,
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage>
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 120px" }}>

        {/* Back */}
        <Link href="/" className="legal-back" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, textDecoration: "none", marginBottom: 48 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600, display: "block", marginBottom: 16 }}>
            Legal
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 500, lineHeight: 1.15, marginBottom: 16 }}>
            Política de Privacidade
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Última atualização: 23 de maio de 2026
          </p>
        </div>

        {/* Intro */}
        <p style={{ color: "var(--text-soft)", fontSize: 16, lineHeight: 1.8, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
          Esta Política de Privacidade descreve como Mateus Silveira Pires coleta, usa e protege suas informações pessoais ao utilizar nossos serviços e aplicativos. Ao usar nossos serviços, você concorda com as práticas descritas neste documento.
        </p>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {sections.map((section) => (
            <div key={section.title}>
              <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", marginBottom: 12 }}>
                {section.title}
              </h2>
              <p style={{ color: "var(--text-soft)", fontSize: 15, lineHeight: 1.8, whiteSpace: "pre-line" }}>
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--border)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/terms" style={{ color: "var(--accent)", fontSize: 14, textDecoration: "none" }}>
            Termos de Uso
          </Link>
          <Link href="/delete-data" style={{ color: "var(--accent)", fontSize: 14, textDecoration: "none" }}>
            Exclusão de dados
          </Link>
        </div>
      </div>
    </main>
    </LegalPage>
  );
}
