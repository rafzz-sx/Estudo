"use client";

import { useState } from "react";
import { QuadroFigura } from "./QuadroFigura";
import { Distratores, type ExplicacaoAlternativa } from "./Distratores";

export interface PassoResolucao {
  titulo: string;
  conteudo: string;
  formula?: string | null;
}

/**
 * Gabarito comentado.
 *
 * A regra de ouro aqui é: o aluno não pode sair só sabendo a letra. Quando
 * a questão exige cálculo ou dedução, a resolução aparece quebrada em
 * passos numerados, respondendo "por que fez isso?" em cada etapa. Quando
 * é interpretação, a explicação corrida basta e não inventamos passos.
 */
export function ResolucaoGabarito({
  respostaCorreta,
  explicacao,
  explicacaoAlternativas,
  alternativas,
  passos,
  figuraDescricao,
  figuraSvg,
  precisaResolucao,
  alternativaEscolhida,
  revisao,
}: {
  respostaCorreta: string;
  explicacao?: string | null;
  explicacaoAlternativas?: Record<
    string,
    ExplicacaoAlternativa | string
  > | null;
  alternativas?: { letra: string; texto: string }[];
  passos?: PassoResolucao[] | null;
  figuraDescricao?: string | null;
  figuraSvg?: string | null;
  precisaResolucao?: boolean;
  alternativaEscolhida?: string | null;
  revisao?: {
    agendada_para: string | null;
    aprendida: boolean;
    entrou_na_fila: boolean;
  } | null;
}) {
  const [passoAberto, setPassoAberto] = useState<number | null>(0);
  const temPassos = Array.isArray(passos) && passos.length > 0;

  return (
    <div className="mt-5 rounded-2xl border border-bat-gold-400/30 bg-bat-bg-secondary/50 p-5">
      {/* ═══ Cabeçalho ═══ */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="heading flex items-center gap-2 text-base font-bold text-bat-gold-400">
          <span>📖</span> Gabarito comentado
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-bat-text-muted">Resposta oficial</span>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-bat-success/40 bg-bat-success/15 text-sm font-extrabold text-bat-success">
            {respostaCorreta}
          </span>
        </div>
      </div>

      {alternativaEscolhida && alternativaEscolhida !== respostaCorreta && (
        <p className="mb-4 rounded-xl border border-bat-error/25 bg-bat-error/10 px-3 py-2 text-xs text-bat-text-secondary">
          Você marcou <strong className="text-bat-error">{alternativaEscolhida}</strong>.
          Compare o raciocínio abaixo com o que você fez — o ponto exato em que
          os dois caminhos se separam é o que precisa entrar no seu caderno de erros.
        </p>
      )}

      <QuadroFigura
        descricao={figuraDescricao}
        svg={figuraSvg}
        titulo="Figura de apoio da resolução"
      />

      {/* ═══ Resolução passo a passo ═══ */}
      {temPassos ? (
        <div className="space-y-2">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
            Resolução passo a passo
          </p>

          {passos!.map((passo, i) => {
            const aberto = passoAberto === i;
            return (
              <div
                key={i}
                className="overflow-hidden rounded-xl border border-bat-border bg-bat-bg-card"
              >
                <button
                  onClick={() => setPassoAberto(aberto ? null : i)}
                  className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bat-bg-elevated"
                  aria-expanded={aberto}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold transition-colors ${
                      aberto
                        ? "bg-bat-gold-400 text-black"
                        : "bg-bat-bg-secondary text-bat-gold-400"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 text-sm font-semibold text-bat-text">
                    {passo.titulo}
                  </span>
                  <span
                    className={`text-bat-text-muted transition-transform ${
                      aberto ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </button>

                {aberto && (
                  <div className="border-t border-bat-border/60 px-4 py-3 pl-14">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                      {passo.conteudo}
                    </p>
                    {passo.formula && passo.formula !== passo.conteudo && (
                      <pre className="mt-3 overflow-x-auto rounded-lg border border-bat-gold-400/20 bg-black/40 px-3 py-2 font-mono text-sm text-bat-gold-400">
                        {passo.formula}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {explicacao && (
            <details className="mt-3 rounded-xl border border-bat-border bg-bat-bg-card/60 px-4 py-3">
              <summary className="cursor-pointer text-xs font-semibold text-bat-text-secondary">
                Ver o comentário oficial da banca
              </summary>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                {explicacao}
              </p>
            </details>
          )}
        </div>
      ) : explicacao ? (
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
            Por que essa é a resposta
          </p>
          <p className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
            {explicacao}
          </p>
        </div>
      ) : (
        <p className="rounded-xl border border-bat-warning/25 bg-bat-warning/10 px-4 py-3 text-sm text-bat-text-secondary">
          Esta questão ainda não tem comentário detalhado cadastrado. Se ela te
          deixou em dúvida, abra um ticket em <strong>Suporte</strong> pedindo a
          resolução — priorizamos as mais pedidas.
        </p>
      )}

      {/* Por que cada alternativa errada atrai */}
      <Distratores
        explicacoes={explicacaoAlternativas}
        respostaCorreta={respostaCorreta}
        alternativaEscolhida={alternativaEscolhida}
        alternativas={alternativas}
      />

      {/* Aviso honesto quando a questão é de cálculo mas ainda não tem passos */}
      {precisaResolucao && !temPassos && explicacao && (
        <p className="mt-4 rounded-xl border border-bat-info/25 bg-bat-info/10 px-4 py-2.5 text-xs text-bat-text-secondary">
          💡 Questão de cálculo: a resolução detalhada passo a passo desta
          ainda está sendo escrita. O comentário acima traz o caminho oficial.
        </p>
      )}

      {/* Repetição espaçada: quando esta questão volta */}
      {revisao && (revisao.agendada_para || revisao.aprendida) && (
        <p className="mt-4 flex items-start gap-2 rounded-xl border border-bat-purple-500/25 bg-bat-purple-950/20 px-4 py-2.5 text-xs leading-relaxed text-bat-text-secondary">
          <span className="text-sm">🔁</span>
          <span>
            {revisao.aprendida ? (
              <>
                <strong className="text-bat-gold-400">Ciclo concluído.</strong>{" "}
                Você acertou esta questão em todas as revisões — ela sai da fila.
              </>
            ) : (
              <>
                <strong className="text-bat-gold-400">
                  Agendada para revisão.
                </strong>{" "}
                Esta questão volta para você em{" "}
                {formatarQuando(revisao.agendada_para)}. Errar e nunca mais
                rever é o que faz o mesmo assunto derrubar de novo na prova.
              </>
            )}
          </span>
        </p>
      )}
    </div>
  );
}

/** "amanhã", "3 dias", "21 dias" — a partir de uma data ISO. */
function formatarQuando(data: string | null): string {
  if (!data) return "breve";
  const alvo = new Date(`${data}T00:00:00`);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const dias = Math.round((alvo.getTime() - hoje.getTime()) / 86_400_000);
  if (dias <= 0) return "hoje mesmo";
  if (dias === 1) return "1 dia";
  return `${dias} dias`;
}
