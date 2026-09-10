"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { fetchWithAuth } from "@/stores/auth-store";

interface Bizu {
  id: string;
  titulo: string;
  conteudo: string;
  nivel_impacto: string;
  exemplo_pratico: string | null;
  favoritado: boolean;
  assuntos: {
    id: string;
    nome: string;
    materias: { id: string; nome: string; icone_emoji: string | null } | null;
  } | null;
}

const IMPACTOS = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "alto", rotulo: "🔥 Alto impacto" },
  { valor: "util", rotulo: "💡 Útil" },
  { valor: "avancado", rotulo: "🎓 Avançado" },
];

const CORES_IMPACTO: Record<string, { cor: string; rotulo: string }> = {
  alto: { cor: "#EF4444", rotulo: "Alto impacto" },
  util: { cor: "#F5C518", rotulo: "Útil" },
  avancado: { cor: "#A855F7", rotulo: "Avançado" },
};

function Bizus() {
  const params = useSearchParams();

  const [filtros, setFiltros] = useState({
    concurso: params.get("concurso") ?? "todos",
    materia: params.get("materia") ?? "todas",
    impacto: "todos",
    busca: "",
    favoritos: false,
  });

  const [bizus, setBizus] = useState<Bizu[]>([]);
  const [materias, setMaterias] = useState<{ id: string; nome: string; icone_emoji: string | null }[]>([]);
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(true);

  // Matérias disponíveis (reaproveita a rota de filtros das questões)
  useEffect(() => {
    fetchWithAuth(
      `/api/questoes/filtros?concurso=${encodeURIComponent(filtros.concurso)}`
    )
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setMaterias(json.data.materias);
      })
      .catch(() => undefined);
  }, [filtros.concurso]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const qs = new URLSearchParams({
        concurso: filtros.concurso,
        materia: filtros.materia,
        impacto: filtros.impacto,
        per_page: "50",
      });
      if (filtros.busca.trim().length >= 3) qs.set("busca", filtros.busca.trim());
      if (filtros.favoritos) qs.set("favoritos", "1");

      const res = await fetchWithAuth(`/api/bizus?${qs}`);
      const json = await res.json();
      if (json.success) {
        setBizus(json.data.items);
        setTotal(json.data.total);
      }
    } catch {
      /* estado vazio cobre o erro */
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => {
    const t = setTimeout(carregar, 250);
    return () => clearTimeout(t);
  }, [carregar]);

  const favoritar = async (b: Bizu) => {
    setBizus((atual) =>
      atual.map((x) =>
        x.id === b.id ? { ...x, favoritado: !x.favoritado } : x
      )
    );
    await fetchWithAuth(`/api/bizus/${b.id}/favoritar`, {
      method: "POST",
    }).catch(() => undefined);
  };

  return (
    <div>
      <header className="mb-6">
        <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
          <span>💡</span> Bizus
        </h1>
        <p className="mt-1 text-sm text-bat-text-secondary">
          Macetes, atalhos e armadilhas recorrentes das bancas — o que economiza
          tempo na hora da prova.
          {total > 0 && ` ${total} bizu${total !== 1 ? "s" : ""} disponível(is).`}
        </p>
      </header>

      {/* ═══ FILTROS ═══ */}
      <div className="mb-5 flex flex-wrap gap-2.5 sm:gap-3">
        <input
          value={filtros.busca}
          onChange={(e) => setFiltros({ ...filtros, busca: e.target.value })}
          placeholder="Buscar bizu por macete, tema ou fórmula..."
          className="input-field min-w-0 w-full sm:w-auto sm:flex-1 text-sm"
        />
        <select
          value={filtros.materia}
          onChange={(e) => setFiltros({ ...filtros, materia: e.target.value })}
          className="input-field w-full sm:w-auto shrink-0 text-sm"
        >
          <option value="todas">Todas as matérias</option>
          {materias.map((m) => (
            <option key={m.id} value={m.nome}>
              {m.icone_emoji} {m.nome}
            </option>
          ))}
        </select>
        <select
          value={filtros.impacto}
          onChange={(e) => setFiltros({ ...filtros, impacto: e.target.value })}
          className="input-field w-full sm:w-auto shrink-0 text-sm"
        >
          {IMPACTOS.map((i) => (
            <option key={i.valor} value={i.valor}>
              {i.rotulo}
            </option>
          ))}
        </select>
        <label className="flex w-full sm:w-auto shrink-0 cursor-pointer items-center justify-center gap-2 rounded-xl border border-bat-border bg-bat-bg-card px-3.5 py-2 hover:border-bat-gold-400/40 transition-colors">
          <input
            type="checkbox"
            checked={filtros.favoritos}
            onChange={(e) =>
              setFiltros({ ...filtros, favoritos: e.target.checked })
            }
            className="accent-bat-gold-400"
          />
          <span className="text-xs font-medium text-bat-text-secondary">⭐ Favoritos</span>
        </label>
      </div>

      {/* ═══ LISTA ═══ */}
      {carregando ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-40 rounded-2xl" />
          ))}
        </div>
      ) : bizus.length === 0 ? (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">💡</span>
          <h2 className="heading mb-2 text-lg text-bat-text">
            {filtros.favoritos
              ? "Você ainda não favoritou nenhum bizu"
              : "Nenhum bizu com esses filtros"}
          </h2>
          <p className="mx-auto mb-5 max-w-md text-sm text-bat-text-secondary">
            {filtros.favoritos
              ? "Toque na estrela de um bizu para guardá-lo aqui e revisar antes da prova."
              : "Afrouxe os filtros ou explore outra matéria. Novos bizus entram junto com o conteúdo teórico de cada tema."}
          </p>
          <Link
            href="/questoes"
            className="btn-secondary inline-block px-5 py-2.5 no-underline"
          >
            Ir para as questões
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {bizus.map((b) => {
            const impacto = CORES_IMPACTO[b.nivel_impacto] ?? CORES_IMPACTO.util;
            return (
              <article
                key={b.id}
                className="rounded-2xl border border-bat-border bg-bat-bg-card p-5 transition-colors hover:border-bat-gold-400/30"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{
                        color: impacto.cor,
                        borderColor: `${impacto.cor}44`,
                        background: `${impacto.cor}15`,
                      }}
                    >
                      {impacto.rotulo}
                    </span>
                    {b.assuntos?.materias?.nome && (
                      <span className="rounded-lg bg-bat-bg-secondary px-2.5 py-0.5 text-[11px] text-bat-text-muted">
                        {b.assuntos.materias.icone_emoji} {b.assuntos.materias.nome}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => favoritar(b)}
                    className="shrink-0 cursor-pointer text-lg transition-transform hover:scale-110"
                    aria-label={b.favoritado ? "Desfavoritar" : "Favoritar"}
                  >
                    {b.favoritado ? "⭐" : "☆"}
                  </button>
                </div>

                <h3 className="heading mb-2 text-base font-bold text-bat-text">
                  {b.titulo}
                </h3>
                <p className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
                  {b.conteudo}
                </p>

                {b.exemplo_pratico && (
                  <div className="mt-3 rounded-xl border border-bat-border bg-bat-bg-secondary/50 px-3.5 py-2.5">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                      Na prática
                    </p>
                    <p className="whitespace-pre-line font-mono text-xs leading-relaxed text-bat-gold-400">
                      {b.exemplo_pratico}
                    </p>
                  </div>
                )}

                {b.assuntos?.nome && (
                  <p className="mt-3 text-[11px] text-bat-text-muted">
                    {b.assuntos.nome}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function BizusPage() {
  return (
    <Suspense fallback={<div className="skeleton h-96 w-full rounded-2xl" />}>
      <Bizus />
    </Suspense>
  );
}
