"use client";

import { useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * "Acho que esta questão está errada."
 *
 * As 3.247 questões vieram de extração automática de PDF. Extração de PDF
 * erra, e gabarito errado é o pior defeito que uma plataforma de estudo pode
 * ter: questão ausente o aluno não estuda; gabarito errado ele ESTUDA, e
 * aprende errado com a confiança de quem foi conferir a resposta.
 *
 * Quem acabou de resolver a questão com atenção e discorda é o melhor
 * detector de erro que existe aqui. Até agora esse sinal era descartado.
 *
 * ─── Duas decisões de desenho ─────────────────────────────────────────
 *
 * 1. Fica DISCRETO e fechado. Um botão grande "contestar" ao lado do
 *    gabarito convida a contestar por frustração, e a fila passa a medir
 *    quem errou em vez de o que está errado.
 *
 * 2. Pede o motivo escrito, com mínimo. É o filtro que separa "refiz a conta
 *    e dá 12, não 14" de "essa questão tá errada". O primeiro é utilizável;
 *    o segundo só ocupa a fila.
 *
 * Aparece só depois de responder — quem não resolveu não tem o que contestar.
 */

const TIPOS = [
  { chave: "gabarito", rotulo: "O gabarito está errado" },
  { chave: "enunciado", rotulo: "O enunciado está incompleto ou truncado" },
  { chave: "alternativa", rotulo: "Uma alternativa está cortada ou repetida" },
  { chave: "figura", rotulo: "Depende de uma figura que não dá para entender" },
  { chave: "explicacao", rotulo: "A explicação não bate com o gabarito" },
] as const;

const MOTIVO_MINIMO = 15;

const LETRAS = ["A", "B", "C", "D", "E"] as const;

export function ContestarGabarito({
  questaoId,
  respostaCorreta,
}: {
  questaoId: string;
  respostaCorreta: string;
}) {
  const [aberto, setAberto] = useState(false);
  const [tipo, setTipo] = useState<string>("gabarito");
  const [motivo, setMotivo] = useState("");
  const [sugerida, setSugerida] = useState<string>("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pronto, setPronto] = useState<string | null>(null);

  const faltam = MOTIVO_MINIMO - motivo.trim().length;

  const enviar = async () => {
    setEnviando(true);
    setErro(null);
    try {
      const res = await fetchWithAuth(`/api/questoes/${questaoId}/contestar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo,
          motivo: motivo.trim(),
          alternativa_sugerida: sugerida || undefined,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setErro(json.error ?? "Não consegui registrar.");
        return;
      }

      setPronto(
        json.message ??
          "Contestação registrada. Você recebe a resposta aqui mesmo."
      );
    } catch {
      setErro("Falha de conexão ao registrar a contestação.");
    } finally {
      setEnviando(false);
    }
  };

  if (pronto) {
    return (
      <p className="mt-4 rounded-xl border border-bat-success/25 bg-bat-success/10 px-4 py-3 text-sm text-bat-success">
        ✅ {pronto}
      </p>
    );
  }

  if (!aberto) {
    return (
      <button
        onClick={() => setAberto(true)}
        className="mt-4 cursor-pointer text-left text-xs text-bat-text-muted underline decoration-dotted underline-offset-4 transition-colors hover:text-bat-text-secondary"
      >
        Refez a conta e continua discordando? Contestar esta questão
      </button>
    );
  }

  return (
    <div className="mt-4 rounded-xl border border-bat-border bg-bat-bg-secondary p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h4 className="heading text-sm font-bold text-bat-text">
            Contestar esta questão
          </h4>
          <p className="mt-1 text-xs leading-relaxed text-bat-text-muted">
            O gabarito atual é <strong>{respostaCorreta}</strong>. Contestar não
            muda a resposta — abre um caso para alguém conferir. Quanto mais
            preciso o seu motivo, mais rápido isso acontece.
          </p>
        </div>
        <button
          onClick={() => setAberto(false)}
          aria-label="Fechar"
          className="cursor-pointer text-lg leading-none text-bat-text-muted transition-colors hover:text-bat-text"
        >
          ×
        </button>
      </div>

      <label className="mb-1 block text-xs text-bat-text-muted">
        O que está errado
      </label>
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="input-field mb-3 w-full text-sm"
      >
        {TIPOS.map((t) => (
          <option key={t.chave} value={t.chave}>
            {t.rotulo}
          </option>
        ))}
      </select>

      {tipo === "gabarito" && (
        <>
          <label className="mb-1 block text-xs text-bat-text-muted">
            Qual você defende? (opcional)
          </label>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {LETRAS.map((l) => (
              <button
                key={l}
                onClick={() => setSugerida(sugerida === l ? "" : l)}
                disabled={l === respostaCorreta}
                title={
                  l === respostaCorreta
                    ? "É o gabarito atual — é dele que você discorda"
                    : undefined
                }
                className={`h-8 w-8 cursor-pointer rounded-lg text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
                  sugerida === l
                    ? "bg-bat-gold-400 text-black"
                    : "bg-bat-bg-card text-bat-text-secondary hover:bg-bat-bg-elevated"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </>
      )}

      <label className="mb-1 block text-xs text-bat-text-muted">
        Por quê? Mostre a conta, ou aponte o trecho.
      </label>
      <textarea
        value={motivo}
        onChange={(e) => setMotivo(e.target.value)}
        rows={4}
        maxLength={1500}
        placeholder="Ex.: aplicando Girard, a soma das raízes é -b/a = 6, e nenhuma alternativa dá 6 além da C. O gabarito aponta a B."
        className="input-field w-full resize-y text-sm"
      />

      <div className="mt-1 flex items-center justify-between text-[11px] text-bat-text-muted">
        <span>
          {faltam > 0
            ? `faltam ${faltam} caracteres`
            : `${motivo.trim().length} caracteres`}
        </span>
        <span>{1500 - motivo.length} restantes</span>
      </div>

      {erro && (
        <p className="mt-2 rounded-lg border border-bat-error/30 bg-bat-error/10 px-3 py-2 text-xs text-bat-error">
          {erro}
        </p>
      )}

      <button
        onClick={enviar}
        disabled={enviando || faltam > 0}
        className="btn-primary mt-3 w-full text-sm disabled:cursor-not-allowed disabled:opacity-40"
      >
        {enviando ? "Registrando…" : "Enviar contestação"}
      </button>
    </div>
  );
}
