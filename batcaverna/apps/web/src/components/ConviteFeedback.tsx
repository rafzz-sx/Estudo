"use client";

import { useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Convite de feedback por tempo de uso.
 *
 * Conta o tempo TOTAL (não contínuo) que a pessoa passou na plataforma e,
 * ao cruzar 1h e depois 3h, abre um convite. O usuário pode responder,
 * adiar por três dias ou pedir para nunca mais ver.
 *
 * O relógio só corre com a aba visível — deixar a plataforma aberta numa
 * aba de fundo não deveria contar como uso.
 */

const INTERVALO_HEARTBEAT = 60_000; // 1 minuto

const TIPOS = [
  { valor: "opiniao", rotulo: "💬 O que achei", desc: "Impressões gerais" },
  { valor: "bug", rotulo: "🐛 Encontrei um bug", desc: "Algo quebrado" },
  { valor: "ideia", rotulo: "💡 Tenho uma ideia", desc: "Sugestão de melhoria" },
];

export function ConviteFeedback() {
  const [aberto, setAberto] = useState(false);
  const [marco, setMarco] = useState<number | null>(null);
  const [tipo, setTipo] = useState("opiniao");
  const [nota, setNota] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const segundosAcumulados = useRef(0);

  // ─── Heartbeat de tempo de uso ─────────────────────────────
  useEffect(() => {
    let ativo = true;

    const enviarHeartbeat = async () => {
      if (segundosAcumulados.current < 30) return;

      const segundos = segundosAcumulados.current;
      segundosAcumulados.current = 0;

      try {
        await fetchWithAuth("/api/usuarios/me/tempo-uso", {
          method: "POST",
          body: JSON.stringify({ segundos }),
        });

        // Depois de somar, verifica se cruzou um marco.
        const res = await fetchWithAuth("/api/usuarios/me/tempo-uso");
        const json = await res.json();
        if (ativo && json.success && json.data.pedir_feedback) {
          setMarco(json.data.marco_horas);
          setAberto(true);
        }
      } catch {
        // Sem conexão: o tempo volta para o acumulador na próxima rodada.
        segundosAcumulados.current += segundos;
      }
    };

    const tick = setInterval(() => {
      if (document.visibilityState === "visible") {
        segundosAcumulados.current += INTERVALO_HEARTBEAT / 1000;
      }
    }, INTERVALO_HEARTBEAT);

    // Envia a cada 5 minutos, para não gerar uma requisição por minuto.
    const envio = setInterval(enviarHeartbeat, 5 * INTERVALO_HEARTBEAT);

    // Salva o que sobrou ao fechar a aba.
    const aoSair = () => {
      if (segundosAcumulados.current >= 30) {
        navigator.sendBeacon?.(
          "/api/usuarios/me/tempo-uso",
          new Blob(
            [JSON.stringify({ segundos: segundosAcumulados.current })],
            { type: "application/json" }
          )
        );
      }
    };
    window.addEventListener("pagehide", aoSair);

    return () => {
      ativo = false;
      clearInterval(tick);
      clearInterval(envio);
      window.removeEventListener("pagehide", aoSair);
    };
  }, []);

  // ─── Ações ─────────────────────────────────────────────────
  const responder = async (acao: "adiar" | "nunca_mais") => {
    setAberto(false);
    await fetchWithAuth("/api/feedback", {
      method: "POST",
      body: JSON.stringify({ acao, marco_horas: marco }),
    }).catch(() => undefined);
  };

  const enviar = async () => {
    if (mensagem.trim().length < 5) return;
    setEnviando(true);
    try {
      const res = await fetchWithAuth("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          tipo,
          nota: nota || undefined,
          mensagem,
          marco_horas: marco,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEnviado(true);
        setTimeout(() => setAberto(false), 2200);
      }
    } finally {
      setEnviando(false);
    }
  };

  if (!aberto) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,24rem)] animate-in slide-in-from-bottom-5">
      <div className="overflow-hidden rounded-2xl border-2 border-bat-gold-400/40 bg-bat-bg-card shadow-[0_0_30px_rgba(245,197,24,0.2)]">
        {enviado ? (
          <div className="p-6 text-center">
            <span className="mb-2 block text-3xl">🦇</span>
            <p className="text-sm font-bold text-bat-gold-400">
              Obrigado pelo retorno!
            </p>
            <p className="mt-1 text-xs text-bat-text-secondary">
              Ele vai direto para quem cuida da plataforma.
            </p>
          </div>
        ) : (
          <>
            <header className="flex items-start justify-between gap-3 border-b border-bat-border bg-bat-bg-secondary/50 px-4 py-3">
              <div>
                <p className="text-sm font-bold text-bat-text">
                  Você já passou {marco === 1 ? "1 hora" : `${marco} horas`} na caverna
                </p>
                <p className="mt-0.5 text-[11px] text-bat-text-muted">
                  Conta pra gente como está sendo?
                </p>
              </div>
              <button
                onClick={() => responder("adiar")}
                className="shrink-0 cursor-pointer text-bat-text-muted hover:text-bat-text"
                aria-label="Fechar"
              >
                ✕
              </button>
            </header>

            <div className="space-y-3 p-4">
              {/* Tipo */}
              <div className="grid grid-cols-3 gap-1.5">
                {TIPOS.map((t) => (
                  <button
                    key={t.valor}
                    onClick={() => setTipo(t.valor)}
                    className={`cursor-pointer rounded-lg border px-2 py-2 text-[11px] transition-all ${
                      tipo === t.valor
                        ? "border-bat-gold-400/50 bg-bat-gold-400/10 text-bat-gold-400"
                        : "border-bat-border bg-bat-bg-secondary text-bat-text-secondary"
                    }`}
                    title={t.desc}
                  >
                    {t.rotulo}
                  </button>
                ))}
              </div>

              {/* Nota */}
              {tipo === "opiniao" && (
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setNota(n)}
                      className="cursor-pointer text-2xl transition-transform hover:scale-110"
                      aria-label={`Nota ${n}`}
                    >
                      {n <= nota ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
              )}

              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={3}
                placeholder={
                  tipo === "bug"
                    ? "O que aconteceu? Em que tela?"
                    : tipo === "ideia"
                    ? "O que você gostaria de ver por aqui?"
                    : "O que está funcionando bem e o que poderia melhorar?"
                }
                className="input-field w-full resize-none text-sm"
              />

              <div className="flex gap-2">
                <button
                  onClick={enviar}
                  disabled={enviando || mensagem.trim().length < 5}
                  className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-40"
                >
                  {enviando ? "Enviando..." : "Enviar"}
                </button>
                <button
                  onClick={() => responder("adiar")}
                  className="btn-secondary px-3 py-2.5 text-xs"
                  title="Perguntar de novo em 3 dias"
                >
                  Mais tarde
                </button>
              </div>

              <button
                onClick={() => responder("nunca_mais")}
                className="w-full cursor-pointer text-center text-[11px] text-bat-text-muted transition-colors hover:text-bat-text-secondary"
              >
                Não quero mais receber esse convite
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
