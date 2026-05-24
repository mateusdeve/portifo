import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/app/components/LegalPage";

export const metadata: Metadata = {
  title: "Exclusão de Dados — Mateus Pires",
  description: "Solicite a exclusão dos seus dados pessoais dos serviços de Mateus Pires.",
};

const steps = [
  {
    number: "01",
    title: "Identifique-se",
    description: "Envie um e-mail a partir do endereço cadastrado no serviço do qual deseja excluir seus dados.",
  },
  {
    number: "02",
    title: "Informe o serviço",
    description: "Indique o nome do aplicativo ou serviço (ex.: Clipy Agente) e o ID de usuário, se disponível.",
  },
  {
    number: "03",
    title: "Confirme a solicitação",
    description: "Você receberá um e-mail de confirmação em até 48 horas. A exclusão será concluída em até 30 dias.",
  },
];

export default function DeleteDataPage() {
  return (
    <LegalPage>
    <main style={{ minHeight: "100vh", background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-sans)" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 120px" }}>

        {/* Back */}
        <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "var(--muted)", fontSize: 14, textDecoration: "none", marginBottom: 48, transition: "color .2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-2)")}
          onMouseLeave={e => (e.currentTarget.style.color = "var(--muted)")}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Voltar
        </Link>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <span style={{ fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--accent)", fontWeight: 600, display: "block", marginBottom: 16 }}>
            Seus direitos
          </span>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem, 5vw, 3rem)", fontWeight: 500, lineHeight: 1.15, marginBottom: 16 }}>
            Exclusão de dados
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>
            Em conformidade com a LGPD (Lei 13.709/2018) e com a política de dados da Meta Platforms
          </p>
        </div>

        {/* Intro */}
        <p style={{ color: "var(--text-soft)", fontSize: 16, lineHeight: 1.8, marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid var(--border)" }}>
          Você tem o direito de solicitar a exclusão completa de seus dados pessoais dos nossos sistemas. Ao fazer isso, todos os dados associados à sua conta serão permanentemente removidos e não poderão ser recuperados.
        </p>

        {/* What gets deleted */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", marginBottom: 20 }}>
            O que será excluído
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "Informações de perfil e conta",
              "Histórico de uso e interações",
              "Dados de autenticação (incluindo login via Facebook/Meta)",
              "Preferências e configurações",
              "Qualquer conteúdo gerado ou enviado",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "14px 18px", background: "var(--bg-elev)", borderRadius: 10, border: "1px solid var(--border)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span style={{ color: "var(--text-soft)", fontSize: 15 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Steps */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", marginBottom: 24 }}>
            Como solicitar a exclusão
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {steps.map((step) => (
              <div key={step.number} style={{ display: "flex", gap: 20 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--accent)", fontWeight: 600, minWidth: 28, paddingTop: 2 }}>
                  {step.number}
                </span>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ color: "var(--text-soft)", fontSize: 15, lineHeight: 1.7 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "32px", background: "var(--bg-elev)", borderRadius: 16, border: "1px solid var(--border)", marginBottom: 56 }}>
          <h2 style={{ fontSize: 17, fontWeight: 600, color: "var(--text)", marginBottom: 8 }}>
            Solicitar exclusão agora
          </h2>
          <p style={{ color: "var(--muted)", fontSize: 14, lineHeight: 1.7, marginBottom: 24 }}>
            Envie um e-mail com o assunto <strong style={{ color: "var(--text-soft)" }}>"Solicitação de exclusão de dados"</strong> para o endereço abaixo. Responderemos em até 48 horas.
          </p>
          <a
            href="mailto:mateus.dev.ti@gmail.com?subject=Solicitação de exclusão de dados"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 24px",
              background: "var(--accent)",
              color: "#fff",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            mateus.dev.ti@gmail.com
          </a>
        </div>

        {/* Notice */}
        <div style={{ padding: "20px 24px", background: "rgba(22,163,74,.06)", borderRadius: 10, border: "1px solid rgba(22,163,74,.2)", marginBottom: 56 }}>
          <p style={{ color: "var(--text-soft)", fontSize: 14, lineHeight: 1.7 }}>
            <strong style={{ color: "var(--accent-2)" }}>Atenção:</strong> A exclusão de dados é irreversível. Após a conclusão do processo, não será possível recuperar nenhuma informação associada à sua conta. Dados anonimizados ou agregados podem ser mantidos para fins estatísticos, sem identificação pessoal.
          </p>
        </div>

        {/* Footer links */}
        <div style={{ paddingTop: 40, borderTop: "1px solid var(--border)", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <Link href="/privacy" style={{ color: "var(--accent)", fontSize: 14, textDecoration: "none" }}>
            Política de Privacidade
          </Link>
          <Link href="/terms" style={{ color: "var(--accent)", fontSize: 14, textDecoration: "none" }}>
            Termos de Uso
          </Link>
        </div>
      </div>
    </main>
    </LegalPage>
  );
}
