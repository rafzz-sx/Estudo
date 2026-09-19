"use client";
import { MathText } from "@/components/MathText";

/**
 * Explicação das alternativas erradas.
 *
 * Saber que a resposta é "C" não impede errar a próxima questão do mesmo
 * tipo. O que impede é entender por que a "B" era atraente — porque as
 * bancas reaproveitam as mesmas famílias de distrator prova após prova.
 *
 * Quando a questão ainda não tem esse conteúdo cadastrado, o componente
 * não inventa nada: ele mostra o padrão genérico da armadilha que o aluno
 * marcou, se conhecido, ou simplesmente não aparece.
 */

export interface ExplicacaoAlternativa {
  texto: string;
  armadilha?: string | null;
}

/** Espelha a tabela `tipos_armadilha` (migration 005). */
export const ARMADILHAS: Record<
  string,
  { nome: string; descricao: string; emoji: string }
> = {
  inversao: {
    nome: "Inversão da relação",
    descricao: "Troca causa por consequência, ou inverte a ordem de uma proporção.",
    emoji: "🔄",
  },
  dado_errado: {
    nome: "Usa o dado errado",
    descricao: "O cálculo está certo, mas partiu de um número que não era o pedido.",
    emoji: "🔢",
  },
  conta_parcial: {
    nome: "Para no meio da conta",
    descricao: "Resultado de uma etapa intermediária apresentado como final.",
    emoji: "➗",
  },
  generalizacao: {
    nome: "Generalização indevida",
    descricao: "Estende ao todo o que o texto disse sobre uma parte.",
    emoji: "🌐",
  },
  fora_do_texto: {
    nome: "Verdadeiro, mas não está no texto",
    descricao: "Afirmação correta no mundo real que o texto não sustenta.",
    emoji: "📄",
  },
  senso_comum: {
    nome: "Apela ao senso comum",
    descricao: "A resposta que parece certa antes de ler com atenção.",
    emoji: "💭",
  },
  unidade: {
    nome: "Erro de unidade",
    descricao: "Resposta certa na grandeza errada: cm em vez de cm².",
    emoji: "📏",
  },
  sinal: {
    nome: "Troca de sinal",
    descricao: "Resultado com o sinal invertido.",
    emoji: "➖",
  },
  termo_parecido: {
    nome: "Termo parecido",
    descricao: "Conceito vizinho que se confunde com o cobrado.",
    emoji: "🔤",
  },
  literal: {
    nome: "Leitura literal",
    descricao: "Interpreta ao pé da letra o que estava em sentido figurado.",
    emoji: "🎭",
  },
};

export function Distratores({
  explicacoes,
  respostaCorreta,
  alternativaEscolhida,
  alternativas,
}: {
  explicacoes?: Record<string, ExplicacaoAlternativa | string> | null;
  respostaCorreta: string;
  alternativaEscolhida?: string | null;
  alternativas?: { letra: string; texto: string }[];
}) {
  if (!explicacoes || Object.keys(explicacoes).length === 0) return null;

  const normalizar = (
    v: ExplicacaoAlternativa | string
  ): ExplicacaoAlternativa =>
    typeof v === "string" ? { texto: v } : v;

  // A que o aluno marcou vem primeiro: é a que ele precisa entender agora.
  const letras = Object.keys(explicacoes).sort((a, b) => {
    if (a === alternativaEscolhida) return -1;
    if (b === alternativaEscolhida) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="mt-4">
      <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
        Por que as outras atraem
      </p>

      <div className="space-y-2">
        {letras.map((letra) => {
          const info = normalizar(explicacoes[letra]);
          const ehCorreta = letra === respostaCorreta;
          const foiEscolhida = letra === alternativaEscolhida;
          const armadilha = info.armadilha
            ? ARMADILHAS[info.armadilha]
            : null;

          const textoAlternativa = alternativas?.find(
            (a) => a.letra === letra
          )?.texto;

          return (
            <div
              key={letra}
              className={`rounded-xl border px-4 py-3 ${
                ehCorreta
                  ? "border-bat-success/35 bg-bat-success/8"
                  : foiEscolhida
                  ? "border-bat-error/40 bg-bat-error/8"
                  : "border-bat-border bg-bat-bg-secondary/40"
              }`}
            >
              <div className="mb-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-extrabold ${
                    ehCorreta
                      ? "bg-bat-success/20 text-bat-success"
                      : foiEscolhida
                      ? "bg-bat-error/20 text-bat-error"
                      : "bg-bat-bg-card text-bat-text-muted"
                  }`}
                >
                  {letra}
                </span>

                {ehCorreta && (
                  <span className="text-[11px] font-bold text-bat-success">
                    ✓ resposta correta
                  </span>
                )}
                {foiEscolhida && !ehCorreta && (
                  <span className="text-[11px] font-bold text-bat-error">
                    ← você marcou esta
                  </span>
                )}

                {armadilha && !ehCorreta && (
                  <span
                    className="rounded-md border border-bat-warning/30 bg-bat-warning/10 px-2 py-0.5 text-[10px] font-bold text-bat-warning"
                    title={armadilha.descricao}
                  >
                    {armadilha.emoji} {armadilha.nome}
                  </span>
                )}
              </div>

              {textoAlternativa && (
                <p className="mb-1.5 text-xs italic text-bat-text-muted">
                  "<MathText>{textoAlternativa}</MathText>"
                </p>
              )}

              <p className="text-sm leading-relaxed text-bat-text-secondary">
                <MathText>{info.texto}</MathText>
              </p>
            </div>
          );
        })}
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-bat-text-muted">
        💡 As bancas reaproveitam as mesmas famílias de distrator. Reconhecer o
        padrão vale mais do que decorar esta questão.
      </p>
    </div>
  );
}
