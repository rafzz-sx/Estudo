"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Fila de Teoria: onde escrever rende mais.
 *
 * 57% das questões não têm texto de teoria vinculado. Escrever tudo é
 * inviável; escrever na ordem que der na cabeça é desperdício. Esta fila
 * ordena por FREQUÊNCIA × ERRO COLETIVO — o assunto que cai muito E derruba
 * geral é onde o texto que falta custa mais caro ao aluno.
 *
 * É a irmã da Fila de Resolução, que faz o mesmo com os gabaritos.
 */

interface Lacuna {
  assunto_id: string;
  assunto: string;
  materia: string;
  emoji: string | null;
  questoes: number;
  respostas: number;
  taxa_acerto: number | null;
  prioridade: number;
  alcance: number;
}

interface Resumo {
  com_teoria: number;
  sem_teoria: number;
  cobertura: number;
}

export function PainelLacunasTeoria() {
  const [lacunas, setLacunas] = useState<Lacuna[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [filtroMateria, setFiltroMateria] = useState("todas");

  useEffect(() => {
    let cancelado = false;

    fetchWithAuth("/api/admin/lacunas-teoria")
      .then((r) => r.json())
      .then((json) => {
        if (cancelado) return;
        if (json.success) {
          setLacunas(json.data.lacunas ?? []);
          setResumo(json.data.resumo ?? null);
        } else {
          setErro(json.error ?? "Não consegui montar a fila.");
        }
      })
      .catch(() => {
        if (!cancelado) setErro("Falha de conexão ao montar a fila.");
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const materias = ["todas", ...new Set(lacunas.map((l) => l.materia))].sort();
  const visiveis =
    filtroMateria === "todas"
      ? lacunas
      : lacunas.filter((l) => l.materia === filtroMateria);

  return (
    <div className="space-y-4">
      <header>
        <h2 className="heading text-lg font-bold text-bat-text">
          📝 Fila de Teoria
        </h2>
        <p className="mt-1 max-w-2xl text-xs text-bat-text-muted">
          Assuntos <strong>sem texto de teoria</strong>, ordenados por quanto
          caem nas provas × quanto os alunos erram neles. O primeiro da lista é
          o texto que alcança mais gente.
        </p>
      </header>

      {resumo && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-lg bg-bat-success/15 px-3 py-1.5 font-bold text-bat-success">
            {resumo.com_teoria} com teoria
          </span>
          <span className="rounded-lg bg-bat-gold-400/15 px-3 py-1.5 font-bold text-bat-gold-400">
            {resumo.sem_teoria} sem
          </span>
          <span className="rounded-lg bg-bat-bg-secondary px-3 py-1.5 text-bat-text-secondary">
            {resumo.cobertura}% de cobertura
          </span>
        </div>
      )}

      {erro && (
        <p className="rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-2.5 text-sm text-bat-error">
          {erro}
        </p>
      )}

      {carregando ? (
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : lacunas.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">✅</span>
          <p className="text-sm text-bat-text-secondary">
            Todo assunto com 5 ou mais questões já tem teoria. Nada na fila.
          </p>
        </div>
      ) : (
        <>
          {materias.length > 2 && (
            <div className="flex flex-wrap gap-1.5">
              {materias.map((m) => (
                <button
                  key={m}
                  onClick={() => setFiltroMateria(m)}
                  className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                    filtroMateria === m
                      ? "bg-bat-gold-400 text-black"
                      : "bg-bat-bg-secondary text-bat-text-secondary hover:bg-bat-bg-elevated"
                  }`}
                >
                  {m === "todas" ? "Todas" : m}
                </button>
              ))}
            </div>
          )}

          <ol className="space-y-2">
            {visiveis.map((l, i) => (
              <li
                key={l.assunto_id}
                className="flex items-center gap-3 rounded-xl border border-bat-border bg-bat-bg-card px-4 py-3"
              >
                <span className="w-6 shrink-0 text-center font-mono text-xs text-bat-text-muted">
                  {i + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-bat-text">
                    {l.emoji ?? "📘"} {l.assunto}
                  </p>
                  <p className="text-xs text-bat-text-muted">
                    {l.materia} · {l.questoes} questões no banco
                    {l.taxa_acerto !== null ? (
                      <>
                        {" "}
                        · alunos acertam{" "}
                        <strong
                          className={
                            l.taxa_acerto < 50
                              ? "text-bat-error"
                              : "text-bat-text-secondary"
                          }
                        >
                          {l.taxa_acerto}%
                        </strong>{" "}
                        em {l.respostas} respostas
                      </>
                    ) : (
                      " · ninguém respondeu ainda"
                    )}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="heading text-base font-bold tabular-nums text-bat-gold-400">
                    {l.prioridade}
                  </p>
                  <p className="text-[10px] text-bat-text-muted">prioridade</p>
                </div>

                <Link
                  href={`/questoes?assunto_id=${l.assunto_id}`}
                  className="shrink-0 rounded-lg border border-bat-border px-2.5 py-1.5 text-xs text-bat-text-secondary no-underline transition-colors hover:border-bat-gold-400/40 hover:text-bat-gold-400"
                  title="Ver as questões deste assunto"
                >
                  ver
                </Link>
              </li>
            ))}
          </ol>

          <p className="border-t border-bat-border pt-3 text-[11px] leading-relaxed text-bat-text-muted">
            A prioridade combina <strong>frequência</strong> (raiz quadrada, para
            um assunto de 134 questões não esmagar um de 30) com{" "}
            <strong>erro coletivo suavizado</strong> (assunto com poucas
            respostas não sobe ao topo por acaso). O texto entra pelos seeds em{" "}
            <code className="rounded bg-bat-bg-secondary px-1">
              supabase/seeds/teoria_*.sql
            </code>
            .
          </p>
        </>
      )}
    </div>
  );
}
