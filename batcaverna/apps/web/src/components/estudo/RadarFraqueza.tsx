"use client";

import Link from "next/link";

/**
 * Radar de fraqueza.
 *
 * Cruza os dois números que a plataforma sempre teve e nunca juntou: quanto o
 * aluno erra em cada assunto e quanto aquele assunto cai na prova.
 *
 * Separados, nenhum dos dois orienta. "Você acerta 40% em Números Complexos"
 * não diz nada se o assunto caiu 6 vezes em 10 anos. "Geometria Plana tem 134
 * questões" não diz nada se o aluno já acerta 90%.
 *
 * A barra de prioridade é o que o aluno olha primeiro, então ela precisa
 * significar uma coisa só: onde a próxima hora rende mais ponto.
 */

export interface AssuntoRadar {
  assunto_id: string;
  assunto: string;
  materia: string;
  materia_emoji: string | null;
  questoes_no_concurso: number;
  respondidas: number;
  acertos: number;
  taxa: number;
  prioridade: number;
  situacao: "critico" | "atencao" | "dominado" | "nao_testado";
  confiavel: boolean;
  teoria_id: string | null;
  teoria_titulo: string | null;
}

const SITUACAO: Record<
  AssuntoRadar["situacao"],
  { cor: string; rotulo: string }
> = {
  critico: { cor: "#EF4444", rotulo: "Crítico" },
  atencao: { cor: "#F97316", rotulo: "Atenção" },
  dominado: { cor: "#22C55E", rotulo: "Dominado" },
  nao_testado: { cor: "#6B7280", rotulo: "Não testado" },
};

export function RadarFraqueza({
  fracos,
  pontosCegos,
  sigla,
  totalAssuntos,
  dominados,
}: {
  fracos: AssuntoRadar[];
  pontosCegos: AssuntoRadar[];
  sigla: string;
  totalAssuntos: number;
  dominados: number;
}) {
  const nadaAinda = fracos.length === 0 && pontosCegos.length === 0;

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="heading text-lg text-bat-text">
          Seus pontos fracos no {sigla}
        </h2>
        <Link
          href={`/concursos/${sigla.toLowerCase()}/assuntos`}
          className="text-xs text-bat-gold-400 no-underline hover:underline"
        >
          ver todos os {totalAssuntos} assuntos →
        </Link>
      </div>

      <p className="mb-4 text-xs leading-relaxed text-bat-text-secondary">
        A ordem cruza <strong>o quanto você erra</strong> com{" "}
        <strong>o quanto o assunto cai no {sigla}</strong>. Errar num assunto
        que quase não aparece na prova custa pouco; errar no que mais cai custa
        a vaga.
      </p>

      {nadaAinda ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-8 text-center">
          <p className="text-3xl">🧭</p>
          <p className="mt-2 text-sm font-bold text-bat-text">
            Ainda não tenho o que apontar
          </p>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-bat-text-muted">
            Responda umas 20 questões do {sigla} e este radar passa a mostrar,
            assunto por assunto, onde vale investir seu tempo.
          </p>
          <Link
            href={`/questoes?concurso=${sigla}`}
            className="btn-primary mt-4 inline-block px-5 py-2.5 text-xs no-underline"
          >
            Começar a resolver
          </Link>
        </div>
      ) : (
        <div className="space-y-2.5">
          {fracos.map((a) => {
            const s = SITUACAO[a.situacao];
            return (
              <article
                key={a.assunto_id}
                className="group rounded-xl border border-bat-border bg-bat-bg-card p-4 transition-all hover:border-bat-gold-400/40"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-base">{a.materia_emoji ?? "📚"}</span>
                    <Link
                      href={`/questoes?concurso=${sigla}&assunto_id=${a.assunto_id}`}
                      className="truncate text-sm font-semibold text-bat-text no-underline transition-colors hover:text-bat-gold-400"
                    >
                      {a.assunto}
                    </Link>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold"
                      style={{ color: s.cor, background: `${s.cor}1A` }}
                    >
                      {s.rotulo}
                    </span>
                  </div>

                  <span className="shrink-0 text-[11px] text-bat-text-muted">
                    {a.materia}
                  </span>
                </div>

                {/* Barra de prioridade */}
                <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-bat-bg-secondary">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${a.prioridade}%`, background: s.cor }}
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-bat-text-muted">
                  <span>
                    <strong className="text-bat-text-secondary">
                      {a.questoes_no_concurso}
                    </strong>{" "}
                    questões no {sigla}
                  </span>
                  {a.respondidas > 0 ? (
                    <span>
                      você acertou{" "}
                      <strong style={{ color: s.cor }}>
                        {a.acertos}/{a.respondidas}
                      </strong>{" "}
                      ({a.taxa}%)
                    </span>
                  ) : (
                    <span>você ainda não respondeu nenhuma</span>
                  )}
                  {/* Honestidade sobre a amostra: com 3 respostas o número
                      ainda é chute, e dizer isso evita o aluno reorganizar a
                      semana em cima de ruído. */}
                  {a.respondidas > 0 && !a.confiavel && (
                    <span className="italic">amostra pequena</span>
                  )}
                </div>

                {/* Apontar a fraqueza sem oferecer o remédio é metade do
                    trabalho. São dois caminhos separados de propósito: quem
                    erra muito precisa LER antes de resolver mais, e quem já
                    leu quer ir direto para as questões. */}
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <Link
                    href={`/questoes?concurso=${sigla}&assunto_id=${a.assunto_id}`}
                    className="rounded-lg border border-bat-gold-400/30 bg-bat-gold-400/10 px-2.5 py-1 text-[11px] font-semibold text-bat-gold-400 no-underline transition-colors hover:bg-bat-gold-400/20"
                  >
                    ⚔️ Resolver questões
                  </Link>
                  {a.teoria_id && (
                    <Link
                      href={`/concursos/${sigla.toLowerCase()}/trilha?teoria=${a.teoria_id}`}
                      className="rounded-lg border border-bat-info/30 bg-bat-info/10 px-2.5 py-1 text-[11px] text-bat-info no-underline transition-colors hover:bg-bat-info/20"
                      title={a.teoria_titulo ?? undefined}
                    >
                      📖 Ler a teoria antes
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ═══ Pontos cegos ═══ */}
      {pontosCegos.length > 0 && (
        <div className="mt-5 rounded-2xl border border-bat-info/25 bg-bat-info/5 p-5">
          <h3 className="heading text-sm font-bold text-bat-text">
            🕳️ Assuntos que você nunca abriu
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-bat-text-secondary">
            Caem no {sigla} e você ainda não respondeu nenhuma questão deles. É
            o tipo de buraco que só aparece no dia da prova.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {pontosCegos.map((a) => (
              <Link
                key={a.assunto_id}
                href={`/questoes?concurso=${sigla}&assunto_id=${a.assunto_id}`}
                className="rounded-lg border border-bat-border bg-bat-bg-card px-3 py-1.5 text-xs text-bat-text-secondary no-underline transition-all hover:border-bat-gold-400/40 hover:text-bat-text"
              >
                {a.materia_emoji} {a.assunto}
                <span className="ml-1.5 text-[10px] text-bat-text-muted">
                  {a.questoes_no_concurso}q
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {dominados > 0 && (
        <p className="mt-3 text-center text-[11px] text-bat-text-muted">
          {dominados} {dominados === 1 ? "assunto já dominado" : "assuntos já dominados"} — esses
          ficam de fora da lista de propósito.
        </p>
      )}
    </section>
  );
}
