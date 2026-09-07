"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Onde você está em relação a quem resolveu muito.
 *
 * O ranking mostra ADVERSÁRIOS — quem está na sua frente e por quanto. Isso
 * motiva quem já está bem colocado e desanima o resto, que é a maioria por
 * definição. Esta seção mostra o ALVO, e o alvo diz o caminho: o grupo de
 * comparação é definido por VOLUME de questões, não por talento. "Quem
 * resolveu 300 acerta 78%" é um convite; "você é o 84º" não é.
 *
 * Nada aqui identifica ninguém: só médias, e só de grupos com pelo menos
 * cinco alunos. Quem desligou "aparecer no ranking" também não entra.
 */

interface ComparacaoMateria {
  materia_id: string;
  materia: string;
  emoji: string | null;
  taxa_dedicados: number;
  alunos_no_grupo: number;
  media_questoes_grupo: number;
  sua_taxa: number;
  suas_questoes: number;
  diferenca: number;
}

export function ComparacaoTurma({ sigla }: { sigla?: string }) {
  const [materias, setMaterias] = useState<ComparacaoMateria[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    const qs = sigla ? `?concurso=${encodeURIComponent(sigla)}` : "";

    fetchWithAuth(`/api/estudo/comparacao${qs}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelado && json.success) setMaterias(json.data.materias ?? []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [sigla]);

  // Sem grupo publicável (plataforma nova, concurso com poucos alunos) a
  // seção simplesmente não aparece. Melhor ausente que inventada.
  if (carregando || materias.length === 0) return null;

  const grupo = materias[0];

  return (
    <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
      <header className="mb-1">
        <h2 className="heading text-base font-bold text-bat-text">
          📈 Onde você está em relação a quem resolve muito
        </h2>
        <p className="mt-1 text-xs text-bat-text-muted">
          Alunos que resolveram {grupo.media_questoes_grupo}+ questões da
          matéria. Médias anônimas, nunca nomes.
        </p>
      </header>

      <ul className="mt-4 space-y-3">
        {materias.map((m) => {
          // Escala local: a diferença entre 61% e 78% some se a barra for de
          // 0 a 100 num card estreito.
          const piso = Math.max(0, Math.min(m.sua_taxa, m.taxa_dedicados) - 12);
          const teto = Math.min(100, Math.max(m.sua_taxa, m.taxa_dedicados) + 12);
          const pos = (v: number) => ((v - piso) / (teto - piso)) * 100;

          const atras = m.diferenca > 1;
          const frente = m.diferenca < -1;

          return (
            <li key={m.materia_id}>
              <div className="mb-1 flex items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-bat-text">
                  {m.emoji ?? "📘"} {m.materia}
                </span>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    atras
                      ? "text-bat-gold-400"
                      : frente
                      ? "text-bat-success"
                      : "text-bat-text-muted"
                  }`}
                >
                  {atras && `${m.diferenca.toFixed(0)} pontos atrás`}
                  {frente && `${Math.abs(m.diferenca).toFixed(0)} à frente`}
                  {!atras && !frente && "empatado"}
                </span>
              </div>

              <div className="relative h-2 overflow-hidden rounded-full bg-bat-bg-secondary">
                <div
                  className="h-full rounded-full bg-bat-gold-400/70"
                  style={{ width: `${Math.max(2, Math.min(100, pos(m.sua_taxa)))}%` }}
                />
                <div
                  className="absolute top-0 h-full w-0.5 bg-bat-success"
                  style={{
                    left: `${Math.max(0, Math.min(100, pos(m.taxa_dedicados)))}%`,
                  }}
                  aria-hidden="true"
                />
              </div>

              <p className="mt-1 text-[11px] text-bat-text-muted">
                você <strong className="text-bat-text">{m.sua_taxa.toFixed(0)}%</strong>{" "}
                em {m.suas_questoes} questões · o grupo{" "}
                <strong className="text-bat-success">
                  {m.taxa_dedicados.toFixed(0)}%
                </strong>{" "}
                ({m.alunos_no_grupo} alunos)
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 border-t border-bat-border pt-3 text-[11px] leading-relaxed text-bat-text-muted">
        O que separa os dois números quase sempre é <strong>volume</strong>, não
        talento: o grupo chegou lá resolvendo mais. É o tipo de distância que se
        fecha com constância.
      </p>
    </section>
  );
}
