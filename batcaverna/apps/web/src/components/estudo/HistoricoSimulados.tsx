"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Histórico de simulados.
 *
 * A tabela `simulados` guardava cada prova feita desde sempre e nada na
 * plataforma mostrava a série. O resultado de hoje, sozinho, num dia ruim só
 * machuca — "sua nota subiu de 42 para 61 em três meses" é o que segura
 * alguém num ano de preparação.
 */

interface Prova {
  id: string;
  tipo: string;
  sigla: string | null;
  emoji: string | null;
  cor: string | null;
  total_questoes: number;
  acertos: number;
  taxa: number;
  tempo_gasto_segundos: number | null;
  finalizado_em: string;
  referencia: number | null;
  referencia_nota: string | null;
  passaria: boolean | null;
}

interface Resumo {
  total: number;
  melhor: number;
  media: number;
  ultima: number;
  primeira: number;
  evolucao: number;
  aprovacoes: number;
  com_referencia: number;
}

const ROTULO_TIPO: Record<string, string> = {
  rapido: "Rápido",
  materia: "Por matéria",
  completo: "Prova completa",
  personalizado: "Personalizado",
  erros: "Refazer erros",
  oficial: "Formato da banca",
};

export function HistoricoSimulados({ concurso }: { concurso?: string }) {
  const [provas, setProvas] = useState<Prova[]>([]);
  const [cronologico, setCronologico] = useState<Prova[]>([]);
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const qs = concurso ? `?concurso=${encodeURIComponent(concurso)}` : "";
      const res = await fetchWithAuth(`/api/simulados/historico${qs}`);
      const json = await res.json();
      if (json.success) {
        setProvas(json.data.provas);
        setCronologico(json.data.cronologico ?? []);
        setResumo(json.data.resumo);
      }
    } catch {
      /* sem histórico é um estado válido, não um erro de tela */
    } finally {
      setCarregando(false);
    }
  }, [concurso]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  if (carregando) return <div className="skeleton h-64 w-full rounded-2xl" />;

  if (!resumo || provas.length === 0) {
    return (
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-8 text-center">
        <p className="text-3xl">⏱️</p>
        <p className="mt-2 text-sm font-bold text-bat-text">
          Nenhum simulado entregue ainda
        </p>
        <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-bat-text-muted">
          A partir do segundo simulado esta tela mostra a sua curva — é o
          número que faz sentido acompanhar numa preparação longa.
        </p>
        <Link
          href="/simulado"
          className="btn-primary mt-4 inline-block px-5 py-2.5 text-xs no-underline"
        >
          Fazer meu primeiro simulado
        </Link>
      </section>
    );
  }

  // Gráfico de barras: uma por prova, na ordem em que foram feitas.
  const maxTaxa = Math.max(100, ...cronologico.map((p) => p.taxa));

  return (
    <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="heading text-lg text-bat-text">Seus simulados</h2>
        <span className="text-xs text-bat-text-muted">
          {resumo.total} {resumo.total === 1 ? "prova entregue" : "provas entregues"}
        </span>
      </div>

      {/* ═══ Números ═══ */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Numero rotulo="Última" valor={`${resumo.ultima}%`} />
        <Numero rotulo="Melhor" valor={`${resumo.melhor}%`} cor="#22C55E" />
        <Numero rotulo="Média" valor={`${resumo.media}%`} />
        <Numero
          rotulo="Evolução"
          valor={`${resumo.evolucao > 0 ? "+" : ""}${resumo.evolucao} pts`}
          cor={resumo.evolucao > 0 ? "#22C55E" : resumo.evolucao < 0 ? "#F97316" : undefined}
        />
      </div>

      {/* ═══ Barras ═══ */}
      {cronologico.length >= 2 && (
        <div className="mb-5">
          <div className="flex h-32 items-end gap-1.5 overflow-x-auto pb-1">
            {cronologico.map((p) => (
              <div
                key={p.id}
                className="group relative flex min-w-[18px] flex-1 flex-col justify-end"
                title={`${new Date(p.finalizado_em).toLocaleDateString("pt-BR")} · ${p.acertos}/${p.total_questoes} (${p.taxa}%)`}
              >
                <div
                  className="w-full rounded-t transition-all duration-500 group-hover:opacity-80"
                  style={{
                    height: `${(p.taxa / maxTaxa) * 100}%`,
                    background:
                      p.passaria === true
                        ? "#22C55E"
                        : p.passaria === false
                        ? "#F97316"
                        : "#6B7280",
                    minHeight: 4,
                  }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-bat-text-muted">
            <span>
              {new Date(cronologico[0].finalizado_em).toLocaleDateString("pt-BR")}
            </span>
            <span>mais antigo → mais recente</span>
            <span>
              {new Date(
                cronologico[cronologico.length - 1].finalizado_em
              ).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
      )}

      {/* ═══ Nota de corte ═══ */}
      {resumo.com_referencia > 0 && (
        <div className="mb-5 rounded-xl border border-bat-border bg-bat-bg-primary px-4 py-3">
          <p className="text-xs leading-relaxed text-bat-text-secondary">
            🎯 Em{" "}
            <strong className="text-bat-gold-400">
              {resumo.aprovacoes} de {resumo.com_referencia}
            </strong>{" "}
            simulados você ficou acima da faixa histórica de aprovação.
          </p>
          <p className="mt-1.5 text-[10px] leading-relaxed text-bat-text-muted">
            Atenção: nota de corte <strong>não é fixa</strong>. Muda todo ano,
            muda por especialidade e, nesses concursos, costuma sair da
            classificação e do número de vagas — não de um mínimo absoluto. O
            que está aqui é faixa de referência para você ter um alvo, não uma
            promessa de aprovação.
          </p>
        </div>
      )}

      {/* ═══ Lista ═══ */}
      <div className="space-y-2">
        {provas.slice(0, 10).map((p) => (
          <div
            key={p.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-bat-border bg-bat-bg-primary px-4 py-2.5"
          >
            <span className="text-sm">{p.emoji ?? "📝"}</span>
            <span className="text-xs font-semibold text-bat-text">{p.sigla}</span>
            <span className="rounded bg-bat-bg-secondary px-1.5 py-0.5 text-[10px] text-bat-text-muted">
              {ROTULO_TIPO[p.tipo] ?? p.tipo}
            </span>
            <span className="text-xs text-bat-text-secondary">
              {p.acertos}/{p.total_questoes}
            </span>

            <span
              className="heading ml-auto text-sm font-bold"
              style={{
                color:
                  p.passaria === true
                    ? "#22C55E"
                    : p.passaria === false
                    ? "#F97316"
                    : undefined,
              }}
            >
              {p.taxa}%
            </span>

            {p.passaria !== null && (
              <span
                className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                style={{
                  color: p.passaria ? "#22C55E" : "#F97316",
                  background: p.passaria ? "#22C55E1A" : "#F973161A",
                }}
                title={`Faixa de referência do ${p.sigla}: ${p.referencia}% — ${p.referencia_nota}`}
              >
                {p.passaria ? "acima da faixa" : "abaixo da faixa"}
              </span>
            )}

            <span className="w-full text-[10px] text-bat-text-muted sm:w-auto">
              {new Date(p.finalizado_em).toLocaleDateString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function Numero({
  rotulo,
  valor,
  cor,
}: {
  rotulo: string;
  valor: string;
  cor?: string;
}) {
  return (
    <div className="rounded-xl border border-bat-border bg-bat-bg-primary px-3 py-2.5">
      <p className="text-[10px] uppercase tracking-wider text-bat-text-muted">
        {rotulo}
      </p>
      <p className="heading text-xl font-bold" style={{ color: cor ?? undefined }}>
        {valor}
      </p>
    </div>
  );
}
