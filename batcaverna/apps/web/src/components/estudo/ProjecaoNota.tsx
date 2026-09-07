"use client";

import Link from "next/link";

/**
 * "Quanto falta para a nota de corte" — e onde estão os pontos que faltam.
 *
 * A plataforma tinha as três peças e não cruzava nenhuma: desempenho por
 * matéria, peso de cada matéria na prova e a faixa histórica de aprovação.
 * Cruzando, estatística vira plano.
 *
 * A régua é honesta de propósito: a faixa de corte NÃO é promessa, e a tela
 * diz isso. Prometer um número que muda todo ano seria pior que não mostrar
 * nada — o aluno tomaria decisão de estudo em cima de uma certeza falsa.
 */

interface Lacuna {
  materia_id: string;
  materia: string;
  emoji: string | null;
  peso_percentual: number;
  taxa_acerto: number;
  respondidas: number;
  pontos_perdidos: number;
  amostra_fraca: boolean;
}

export interface ProjecaoDados {
  nota_projetada: number;
  referencia: number;
  ressalva_referencia: string;
  faltam: number;
  atingiu: boolean;
  lacunas: Lacuna[];
  base_respostas: number;
  base_fraca: boolean;
  origem_pesos: "edital" | "banco";
}

export function ProjecaoNota({
  dados,
  sigla,
}: {
  dados: ProjecaoDados;
  sigla: string;
}) {
  const { nota_projetada, referencia, faltam, atingiu, lacunas } = dados;

  // A régua vai de 0 a 100, mas só o trecho útil é desenhado: comprimir a
  // faixa inteira num card estreito esconde justamente a diferença que
  // importa. O piso acompanha o menor dos dois valores.
  const piso = Math.max(0, Math.min(nota_projetada, referencia) - 15);
  const teto = Math.min(100, Math.max(nota_projetada, referencia) + 15);
  const emEscala = (v: number) => ((v - piso) / (teto - piso)) * 100;

  // As matérias que, somadas, respondem por metade do que falta. É o corte
  // que transforma uma lista de nove matérias em "comece por estas duas".
  const prioritarias: Lacuna[] = [];
  let acumulado = 0;
  const metade = lacunas.reduce((a, l) => a + l.pontos_perdidos, 0) / 2;
  for (const l of lacunas) {
    if (acumulado >= metade && prioritarias.length >= 1) break;
    prioritarias.push(l);
    acumulado += l.pontos_perdidos;
    if (prioritarias.length >= 3) break;
  }

  return (
    <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
      <header className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="heading text-base font-bold text-bat-text">
          🎯 Quanto falta para o corte do {sigla}
        </h2>
        <span className="text-xs text-bat-text-muted">
          base: {dados.base_respostas} questões respondidas
        </span>
      </header>

      {/* ═══ Régua ═══ */}
      <div className="mb-2 flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-bat-text-muted">
            Sua projeção
          </p>
          <p
            className={`heading text-3xl font-extrabold tabular-nums ${
              atingiu ? "text-bat-success" : "text-bat-gold-400"
            }`}
          >
            {nota_projetada.toFixed(0)}
            <span className="text-base font-bold text-bat-text-muted">/100</span>
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-bat-text-muted">
            Faixa histórica
          </p>
          <p className="heading text-xl font-bold tabular-nums text-bat-text-secondary">
            {referencia}
          </p>
        </div>
      </div>

      <div className="relative mb-1 h-2.5 overflow-hidden rounded-full bg-bat-bg-secondary">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            atingiu ? "bg-bat-success" : "bg-bat-gold-400"
          }`}
          style={{ width: `${Math.max(2, Math.min(100, emEscala(nota_projetada)))}%` }}
        />
        {/* Marca do corte */}
        <div
          className="absolute top-0 h-full w-0.5 bg-bat-text"
          style={{ left: `${Math.max(0, Math.min(100, emEscala(referencia)))}%` }}
          aria-hidden="true"
        />
      </div>

      <p className="mb-4 text-sm">
        {atingiu ? (
          <span className="font-medium text-bat-success">
            Você está dentro da faixa. Agora é manter e ampliar a margem.
          </span>
        ) : (
          <span className="text-bat-text-secondary">
            Faltam{" "}
            <strong className="text-bat-gold-400">
              {faltam.toFixed(1)} pontos
            </strong>{" "}
            para a faixa histórica de aprovação.
          </span>
        )}
      </p>

      {/* ═══ Onde estão os pontos ═══ */}
      {!atingiu && prioritarias.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-bold text-bat-text">
            {prioritarias.length === 1
              ? "O ponto está aqui:"
              : "Os pontos estão aqui:"}
          </p>

          <ul className="space-y-2">
            {prioritarias.map((l) => (
              <li
                key={l.materia_id}
                className="flex items-center gap-3 rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-3 py-2"
              >
                <span className="shrink-0 text-lg">{l.emoji ?? "📘"}</span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-bat-text">
                    {l.materia}
                  </p>
                  <p className="text-xs text-bat-text-muted">
                    {l.peso_percentual}% da prova · você acerta{" "}
                    {l.taxa_acerto.toFixed(0)}%
                    {l.amostra_fraca && (
                      <span className="text-bat-text-muted">
                        {" "}
                        · amostra pequena
                      </span>
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="heading text-base font-bold tabular-nums text-bat-error">
                    −{l.pontos_perdidos.toFixed(1)}
                  </p>
                  <p className="text-[10px] text-bat-text-muted">pontos</p>
                </div>
              </li>
            ))}
          </ul>

          <Link
            href={`/questoes?concurso=${sigla}&materia=${encodeURIComponent(
              prioritarias[0].materia
            )}`}
            className="btn-primary mt-3 inline-block px-4 py-2 text-sm no-underline"
          >
            Atacar {prioritarias[0].materia} →
          </Link>
        </div>
      )}

      {/* ═══ Ressalvas ═══
          Aparecem sempre. O número só é útil se o aluno souber o que ele é —
          e o que ele não é. */}
      <div className="space-y-1 border-t border-bat-border pt-3 text-[11px] leading-relaxed text-bat-text-muted">
        {dados.base_fraca && (
          <p className="text-bat-gold-400/90">
            ⚠️ Base ainda pequena ({dados.base_respostas} questões). A projeção
            vai ficar mais confiável conforme você resolve mais.
          </p>
        )}
        <p>
          A nota é a sua taxa de acerto <strong>ponderada pelo peso de cada
          matéria na prova</strong> — não a média simples.{" "}
          {dados.origem_pesos === "banco"
            ? "Os pesos vêm da distribuição real das provas oficiais já cadastradas."
            : "Os pesos vêm do edital cadastrado."}
        </p>
        <p>
          A faixa de {referencia} é <strong>referência histórica, não
          promessa</strong>: {dados.ressalva_referencia}. Em vários desses
          concursos o corte sai da classificação e do número de vagas, e muda
          todo ano.
        </p>
      </div>
    </section>
  );
}
