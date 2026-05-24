import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";

export const metadata: Metadata = {
  title: "Termos de Uso — Mateus Pires",
  description: "Termos de uso dos serviços e aplicativos de Mateus Pires.",
};

const sections = [
  {
    title: "1. Aceitação dos termos",
    content: `Ao acessar ou utilizar nossos serviços, você concorda com estes Termos de Uso. Caso não concorde com qualquer parte destes termos, você não deve utilizar nossos serviços. Reservamos o direito de atualizar estes termos a qualquer momento, e o uso continuado dos serviços após as alterações constitui sua aceitação.`,
  },
  {
    title: "2. Descrição dos serviços",
    content: `Oferecemos serviços de desenvolvimento de software, inteligência artificial e consultoria tecnológica. Os serviços podem incluir aplicações web, APIs, agentes de IA e outros produtos digitais. A disponibilidade e as funcionalidades dos serviços podem ser alteradas a qualquer momento sem aviso prévio.`,
  },
  {
    title: "3. Uso permitido",
    content: `Você pode usar nossos serviços apenas para fins legais e de acordo com estes termos. É expressamente proibido: usar os serviços para qualquer finalidade ilegal ou não autorizada; tentar acessar sistemas ou dados sem permissão; transmitir vírus ou código malicioso; interferir na integridade ou desempenho dos serviços; coletar dados de outros usuários sem consentimento.`,
  },
  {
    title: "4. Conta e segurança",
    content: `Se você criar uma conta, é responsável por manter a confidencialidade de suas credenciais e por todas as atividades realizadas em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado. Não nos responsabilizamos por perdas decorrentes do uso não autorizado de sua conta por terceiros.`,
  },
  {
    title: "5. Propriedade intelectual",
    content: `Todo o conteúdo dos serviços — incluindo textos, código, interfaces, logotipos e marcas — é de propriedade de Mateus Silveira Pires ou de seus licenciadores, protegido pelas leis de propriedade intelectual. É vedada a reprodução, distribuição ou criação de obras derivadas sem autorização expressa por escrito.`,
  },
  {
    title: "6. Conteúdo do usuário",
    content: `Ao enviar conteúdo para nossos serviços, você nos concede uma licença não exclusiva, irrevogável, mundial e livre de royalties para usar, reproduzir e distribuir esse conteúdo no âmbito dos serviços. Você declara que possui todos os direitos necessários sobre o conteúdo enviado e que ele não viola direitos de terceiros.`,
  },
  {
    title: "7. Limitação de responsabilidade",
    content: `Os serviços são fornecidos "no estado em que se encontram", sem garantias de qualquer tipo. Na máxima extensão permitida pela lei, não seremos responsáveis por danos indiretos, incidentais, especiais ou consequentes decorrentes do uso ou da impossibilidade de usar os serviços, mesmo que tenhamos sido avisados sobre a possibilidade de tais danos.`,
  },
  {
    title: "8. Indenização",
    content: `Você concorda em nos indenizar e isentar de qualquer responsabilidade por reclamações, danos, perdas, custos e despesas (incluindo honorários advocatícios razoáveis) decorrentes: do seu uso dos serviços; da violação destes termos; da violação de direitos de terceiros; ou de qualquer conteúdo que você submeta.`,
  },
  {
    title: "9. Rescisão",
    content: `Podemos suspender ou encerrar seu acesso aos serviços a qualquer momento, com ou sem motivo, sem aviso prévio. Você pode encerrar sua conta a qualquer momento. Após a rescisão, as disposições que, por sua natureza, devem sobreviver continuarão em vigor, incluindo as seções de propriedade intelectual e limitação de responsabilidade.`,
  },
  {
    title: "10. Lei aplicável e foro",
    content: `Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Quaisquer disputas decorrentes destes termos serão submetidas ao foro da comarca de Brasília/DF, com renúncia expressa a qualquer outro, por mais privilegiado que seja.`,
  },
  {
    title: "11. Contato",
    content: `Para dúvidas sobre estes Termos de Uso, entre em contato:\n\nMateus Silveira Pires\nmateus.dev.ti@gmail.com`,
  },
];

export default function TermsPage() {
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
            Termos de Uso
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Última atualização: 23 de maio de 2026
          </p>
        </div>

        {/* Intro */}
        <p style={{ color: "var(--text-soft)", fontSize: 16, lineHeight: 1.8, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
          Estes Termos de Uso estabelecem as condições para utilização dos serviços, aplicativos e produtos desenvolvidos por Mateus Silveira Pires. Leia atentamente antes de usar qualquer serviço.
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
          <Link href="/privacy" style={{ color: "var(--accent)", fontSize: 14, textDecoration: "none" }}>
            Política de Privacidade
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
