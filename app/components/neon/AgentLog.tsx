"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  NEON_AGENT_LOG_EVENT,
  type AgentLogGroup,
  type AgentLogKind,
  type AgentLogPayload,
} from "./agentLogBus";

type LogMessage = {
  id: string;
  time: string;
  kind: AgentLogKind;
  fullText: string;
  shownText: string;
  isStreaming: boolean;
};

function formatTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function AgentLog() {
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);

  const queueRef = useRef<AgentLogPayload[]>([]);
  const streamingRef = useRef(false);
  const intervalRef = useRef<number | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const FUNNY_LINES = useMemo(() => {
    const emojiPool = ["🤖", "😅", "👀", "✨", "🧠", "🚀", "🔥", "🎯", "🧩", "🛠️"];
    const welcomeTexts = [
      "Bem vindo...",
      "Bem vindo de volta. Sim, você ainda está aqui.",
      "Carregando neural core... (quase)",
      "Você entrou no modo neon. Boa sorte.",
      "Reiniciando a magia. Por favor aguarde.",
      "Oi. Eu também tenho sentimentos (mentira).",
    ];
    const teamTexts = [
      "haha, você ainda tá ai?",
      "time 1 ativado. Agora respira.",
      "Team clicado. Vamos trabalhar um pouco (mentira).",
      "Gostou? Mostra pros outros.",
      "Abrindo workflow do time. Segura essa.",
      "Time selecionado: bora pra ação.",
      "Você clicou. O sistema percebeu.",
      "Equipe formada. Agora chama o resto.",
      "Deu certo. Eu acho.",
      "Time -> workflow: conectando neurônios...",
      "Conferindo membros... (spoiler: são foda)",
      "Time escolhido. O resto é história.",
      "Team acionado. Sem pânico.",
      "Ok ok, você clicou mesmo. Valeu.",
      "Time com energia neon. Bzzzt.",
      "Hora de organizar. Sem planilha, por favor.",
      "Abrindo o painel dos times. Com glitter.",
      "Team. Sim. Eu registrei.",
      "Bora lá. Times na pista.",
      "Seu clique foi registrado no livro-razão.",
      "Time: ativando modo 'importante'.",
      "Você tocou em Team. Eu respondi. Olha só.",
      "Tá, agora vamos fingir que é ciência.",
      "Equipe pronta. Ajustando o caos.",
      "Team clicado: sucesso absoluto.",
      "Ok, ok. Não julgo seu clique.",
      "Team: bora fazer bonito.",
      "Time escolhido. Próximo passo: vibes.",
    ];
    const timesTexts = [
      "gostou mesmo? meus times tão em ta aqui ainda",
      "Mostrando times... (sim, eu gosto de você)",
      "Times ativados. Agora vem a parte boa.",
      "Meus times estão prontos. Quase.",
      "Carregando pipeline de times... shhh",
      "Times -> workflow: conectando as peças.",
      "Você quer ver times? Então vê.",
      "Clique em Times: o caos ficou organizado.",
      "Meus times já estão alinhados. Quase.",
      "Mostrando talentos. Sem drama.",
      "Times em ação. Eu observei.",
      "Ok, agora é com times. Respira de novo.",
      "Times clicados. Preparando narrativa.",
      "Abrindo o workflow dos times (com humor).",
      "Times na tela. Balanço neon ativado.",
      "Vocês são incríveis. (todos) 😄",
      "Times: quase sincronizados.",
      "Você clicou Times. Eu registrei isso também.",
      "Mostrando times: porque sim.",
      "Times -> conectando futuro.",
      "Times escolhidos. Próximo: brilho.",
      "Time2? Não. Times. Plural. 😏",
      "A fila dos times está andando.",
      "Times: ativando modo 'ficar bonito'.",
      "Mostrando talentos. Pronto pro show.",
      "Cliquei de volta na sua clique. Metaverso.",
      "Times: ok, ok... gostei.",
      "Mostrando times: você me conquistou.",
    ];
    const genericTexts = [
      "evento capturado. registrado. (e eu achei fofo)",
      "ok. clique entendido. executando...",
      "sistema piscou. você também.",
      "o universo deu play.",
      "deu certo de novo. (como sempre)",
    ];

    const pick = <T,>(arr: T[], idx: number) => arr[idx % arr.length];
    const lines: { group: AgentLogGroup; text: string; emoji: string; kind: AgentLogKind }[] =
      [];

    // Geramos ~100 entradas para atender ao pedido.
    const make = (group: AgentLogGroup, list: string[], count: number, kind: AgentLogKind) => {
      for (let i = 0; i < count; i++) {
        lines.push({
          group,
          text: pick(list, i + 3),
          emoji: pick(emojiPool, i + 7),
          kind,
        });
      }
    };

    make("welcome", welcomeTexts, 12, "neon");
    make("team", teamTexts, 44, "info");
    make("times", timesTexts, 44, "success");
    make("generic", genericTexts, 6, "info");

    return lines;
  }, []);

  const pickLine = useCallback(
    (group: AgentLogGroup): { text: string; emoji: string; kind: AgentLogKind } => {
      const candidates = FUNNY_LINES.filter((l) => l.group === group);
      if (candidates.length === 0) {
        return { text: "ok...", emoji: "🤖", kind: "info" };
      }
      const idx = Math.floor(Math.random() * candidates.length);
      return {
        text: candidates[idx]!.text,
        emoji: candidates[idx]!.emoji,
        kind: candidates[idx]!.kind,
      };
    },
    [FUNNY_LINES],
  );

  const enqueue = useCallback((payload: AgentLogPayload) => {
    queueRef.current.push(payload);
    // Se não está streaming, inicia imediatamente.
    if (!streamingRef.current) {
      streamingRef.current = true;
      const next = queueRef.current.shift();
      if (!next) {
        streamingRef.current = false;
        return;
      }
      const startedAt = new Date();
      const time = formatTime(startedAt);

      const group = next.group ?? "generic";
      const picked = pickLine(group);
      const kind = next.kind ?? picked.kind;

      const rawText = next.text ?? picked.text;
      const finalEmoji = next.emoji ?? picked.emoji;
      const fullText = finalEmoji ? `${rawText} ${finalEmoji}` : rawText;

      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      setMessages((prev) => {
        const trimmed = prev.slice(-45);
        return [
          ...trimmed,
          {
            id,
            time,
            kind,
            fullText,
            shownText: "",
            isStreaming: true,
          },
        ];
      });

      setStreamingId(id);

      const tokens = fullText.split(/(\s+)/);
      let i = 0;
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }

      intervalRef.current = window.setInterval(() => {
        i++;
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== id) return m;
            const shownText = tokens.slice(0, i).join("");
            const done = i >= tokens.length;
            return { ...m, shownText, isStreaming: !done };
          }),
        );

        if (i >= tokens.length) {
          if (intervalRef.current) window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          setStreamingId(null);
          streamingRef.current = false;

          const following = queueRef.current.shift();
          if (following) {
            enqueue(following);
          }
        }
      }, 90);
    }
  }, [pickLine]);

  useEffect(() => {
    enqueue({ group: "welcome" });
    const handler = (event: Event) => {
      const custom = event as CustomEvent<AgentLogPayload>;
      enqueue(custom.detail ?? {});
    };
    window.addEventListener(NEON_AGENT_LOG_EVENT, handler);
    return () => {
      window.removeEventListener(NEON_AGENT_LOG_EVENT, handler);
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [enqueue]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
  }, [messages.length, streamingId]);

  const timeClassForKind = (kind: AgentLogKind) => {
    switch (kind) {
      case "neon":
        return "text-tertiary";
      case "success":
        return "text-primary-dim";
      case "warn":
        return "text-secondary-dim";
      case "error":
        return "text-error-dim";
      default:
        return "text-primary-dim";
    }
  };

  return (
    <div className="bg-[#0e0e0e] border-t border-surface-container-high p-4 h-64 overflow-hidden flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-sm text-primary">
          terminal
        </span>
        <span className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
          Agent log
        </span>
      </div>

      <div
        className="flex-1 space-y-2 overflow-y-auto font-mono text-[11px] text-on-surface-variant/80"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        <style>
          {`
            /* Chrome, Edge, and Safari */
            .agent-log-scroll::-webkit-scrollbar {
              width: 0 !important;
              background: transparent !important;
            }
          `}
        </style>
        {/* Add a className for scoping the style to this div */}
        <div className="agent-log-scroll" style={{ height: "100%" }}>
          {/* Contents will come here */}
        </div>
        {messages.length === 0 ? null : (
          <>
            {messages.map((m) => (
              <p key={m.id} className="wrap-break-word whitespace-pre-wrap">
                <span className={timeClassForKind(m.kind)}>{m.time}</span>{" "}
                {m.shownText}
                {m.isStreaming && (
                  <span className="h-4 w-1 bg-primary/40 animate-pulse inline-block ml-1 align-middle" />
                )}
              </p>
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

