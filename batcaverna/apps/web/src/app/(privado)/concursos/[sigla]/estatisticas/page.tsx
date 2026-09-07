"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/stores/auth-store";
import { formatarTempoLegivel } from "@/stores/study-session-store";

interface MateriaStat {
  materia: string;
  emoji: string;
  respondidas: number;
  acertos: number;
  taxa: number;
  tempo_segundos: number;
}

interface Estatisticas {
  concurso: { sigla: string; nome: string; emoji: string | null; cor_tema: string | null };
  resumo: {
    respondidas: number;
    acertos: number;
    erros: number;
    taxa: number;
    total_disponivel: number;
    cobertura: number;
  };
  por_materia: MateriaStat[];
  evolucao: { dia: string; total: number; acertos: number; taxa: number }[];
  pontos_fracos: MateriaStat[];
  pontos_fortes: MateriaStat[];
}

function corDaTaxa(taxa: number): string {
  if (taxa >= 75) return "#22C55E";
  if (taxa >= 60) return "#F5C518";
  return "#EF4444";
}

export default function EstatisticasConcursoPage() {
  const params = useParams();
  const sigla = String(params?.sigla ?? "").toUpperCase();

  const [dados, setDados] = useState<Estatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchWithAuth(`/api/concursos/${sigla}/estatisticas`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setDados(json.data);
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  }, [sigla]);

  if (carregando) return <div className="skeleton h-96 w-full rounded-3xl" />;

  if (!dados) {
    return (
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
        <p className="text-bat-text-secondary">
          Não consegui carregar suas estatísticas de {sigla}.
        </p>
      </div>
    );
  }

  const { resumo, por_materia, evolucao, pontos_fracos, pontos_fortes } = dados;
  const cor = dados.concurso.cor_tema ?? "#F5C518";

  // Sem histórico: mostra um estado vazio útil em vez de gráficos zerados.
  if (resumo.respondidas === 0) {
    return (
      <div>
        <Link
          href={`/concursos/${sigla.toLowerCase()}`}
          className="mb-4 inline-flex items-center gap-1.5 text-xs text-bat-text-muted no-underline hover:text-bat-gold-400"
        >
          ← Voltar ao {sigla}
        </Link>
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">📊</span>
          <h1 className="heading mb-2 text-lg text-bat-text">
            Você ainda não respondeu questões de {sigla}
          </h1>
          <p className="mx-auto mb-5 max-w-md text-sm text-bat-text-secondary">
            Assim que resolver as primeiras questões, esta tela mostra seu
            acerto por matéria, a evolução ao longo dos dias e onde você está
            perdendo mais pontos.
            {resumo.total_disponivel > 0 &&
              ` Há ${resumo.total_disponivel.toLocaleString("pt-BR")} questões esperando.`}
          </p>
          <Link
            href={`/questoes?concurso=${sigla}`}
            className="btn-primary inline-block px-6 py-3 no-underline"
          >
            Começar agora →
          </Link>
        </div>
      </div>
    );
  }

  const maxDia = Math.max(...evolucao.map((e) => e.total), 1);

  return (
    <div className="space-y-6">
      <Link
        href={`/concursos/${sigla.toLowerCase()}`}
        className="inline-flex items-center gap-1.5 text-xs text-bat-text-muted no-underline hover:text-bat-gold-400"
      >
        ← Voltar ao {sigla}
      </Link>

      <header>
        <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
          <span>{dados.concurso.emoji ?? "📊"}</span>
          Suas estatísticas no {dados.concurso.sigla}
        </h1>
        <p className="mt-1 text-sm text-bat-text-secondary">{dados.concurso.nome}</p>
      </header>

      {/* ═══ RESUMO ═══ */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Cartao
          rotulo="Respondidas"
          valor={resumo.respondidas.toLocaleString("pt-BR")}
          sub={`de ${resumo.total_disponivel.toLocaleString("pt-BR")} disponíveis`}
        />
        <Cartao
          rotulo="Taxa de acerto"
          valor={`${resumo.taxa}%`}
          sub={`${resumo.acertos} acertos · ${resumo.erros} erros`}
          cor={corDaTaxa(resumo.taxa)}
        />
        <Cartao
          rotulo="Cobertura do banco"
          valor={`${resumo.cobertura}%`}
          sub="do total de questões deste concurso"
          cor={cor}
        />
        <Cartao
          rotulo="Matérias tocadas"
          valor={String(por_materia.length)}
          sub="com pelo menos 1 questão"
        />
      </div>

      {/* ═══ POR MATÉRIA ═══ */}
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <h2 className="heading mb-4 text-lg text-bat-text">Desempenho por matéria</h2>
        <div className="space-y-3.5">
          {por_materia.map((m) => (
            <div key={m.materia}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-bat-text">
                  <span>{m.emoji}</span>
                  {m.materia}
                </span>
                <span className="flex items-center gap-3 text-xs">
                  <span className="text-bat-text-muted">
                    {m.acertos}/{m.respondidas}
                  </span>
                  <span
                    className="font-bold"
                    style={{ color: corDaTaxa(m.taxa) }}
                  >
                    {m.taxa}%
                  </span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-bat-bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${m.taxa}%`,
                    background: corDaTaxa(m.taxa),
                  }}
                />
              </div>
              {m.tempo_segundos > 0 && (
                <p className="mt-1 text-[10px] text-bat-text-muted">
                  {formatarTempoLegivel(m.tempo_segundos)} nesta matéria
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══ FORTES E FRACOS ═══ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Painel
          titulo="Onde você está perdendo pontos"
          emoji="🎯"
          vazio="Nenhuma matéria abaixo de 60% com amostra suficiente. Bom sinal."
          itens={pontos_fracos}
          rodape="Só entram matérias com 10+ questões respondidas — abaixo disso a taxa não é confiável."
          acao={(m) => (
            <Link
              href={`/questoes?concurso=${sigla}&materia=${encodeURIComponent(m.materia)}`}
              className="text-[11px] font-bold text-bat-gold-400 no-underline hover:underline"
            >
              Treinar →
            </Link>
          )}
        />
        <Painel
          titulo="Seus pontos fortes"
          emoji="💪"
          vazio="Continue resolvendo: com 10+ questões numa matéria ela aparece aqui."
          itens={pontos_fortes}
          rodape="Mantenha o nível com revisões espaçadas, mas invista o tempo novo nas matérias fracas."
        />
      </div>

      {/* ═══ EVOLUÇÃO ═══ */}
      {evolucao.length > 1 && (
        <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
          <h2 className="heading mb-1 text-lg text-bat-text">Últimos 30 dias</h2>
          <p className="mb-4 text-xs text-bat-text-muted">
            Altura da barra = questões respondidas · cor = taxa de acerto do dia
          </p>
          <div className="flex h-36 items-end gap-1 overflow-x-auto">
            {evolucao.map((e) => (
              <div
                key={e.dia}
                className="group relative flex min-w-[10px] flex-1 flex-col justify-end"
                title={`${e.dia}: ${e.acertos}/${e.total} (${e.taxa}%)`}
              >
                <div
                  className="rounded-t transition-all group-hover:opacity-80"
                  style={{
                    height: `${Math.max(6, (e.total / maxDia) * 100)}%`,
                    background: corDaTaxa(e.taxa),
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Auxiliares ──────────────────────────────────────────────
function Cartao({
  rotulo,
  valor,
  sub,
  cor,
}: {
  rotulo: string;
  valor: string;
  sub?: string;
  cor?: string;
}) {
  return (
    <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-4">
      <p className="mb-1 text-xs text-bat-text-muted">{rotulo}</p>
      <p
        className="heading text-2xl font-bold"
        style={{ color: cor ?? "var(--bat-text, #fff)" }}
      >
        {valor}
      </p>
      {sub && <p className="mt-1 text-[11px] text-bat-text-secondary">{sub}</p>}
    </div>
  );
}

function Painel({
  titulo,
  emoji,
  itens,
  vazio,
  rodape,
  acao,
}: {
  titulo: string;
  emoji: string;
  itens: MateriaStat[];
  vazio: string;
  rodape?: string;
  acao?: (m: MateriaStat) => React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
      <h2 className="heading mb-3 flex items-center gap-2 text-base text-bat-text">
        <span>{emoji}</span> {titulo}
      </h2>

      {itens.length === 0 ? (
        <p className="py-4 text-sm text-bat-text-muted">{vazio}</p>
      ) : (
        <ul className="space-y-2.5">
          {itens.map((m) => (
            <li
              key={m.materia}
              className="flex items-center justify-between rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-3.5 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm text-bat-text">
                <span>{m.emoji}</span>
                {m.materia}
              </span>
              <span className="flex items-center gap-3">
                <span
                  className="text-sm font-bold"
                  style={{ color: corDaTaxa(m.taxa) }}
                >
                  {m.taxa}%
                </span>
                {acao?.(m)}
              </span>
            </li>
          ))}
        </ul>
      )}

      {rodape && (
        <p className="mt-3 border-t border-bat-border/50 pt-2.5 text-[10px] leading-relaxed text-bat-text-muted">
          {rodape}
        </p>
      )}
    </section>
  );
}
