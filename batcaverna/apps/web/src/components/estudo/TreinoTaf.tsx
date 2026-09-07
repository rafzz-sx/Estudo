"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Diário de treino do TAF.
 *
 * A tela do TAF mostrava só a tabela de índices mínimos. Isso informa, não
 * treina. A diferença entre saber que precisa correr 2.400 metros e saber que
 * hoje você correu 2.180 — 220 a menos, mas 300 a mais que há dois meses — é
 * a diferença entre uma tabela e um preparo.
 *
 * Em concurso militar o TAF elimina: quem gabarita a escrita e não faz a
 * corrida não entra.
 */

interface Marca {
  id: string;
  valor: number;
  data_treino: string;
  observacao: string | null;
}

interface Serie {
  exercicio: string;
  unidade: string;
  maior_melhor: boolean;
  marcas: Marca[];
  melhor: number;
  primeira: number;
  ultima: number;
  evolucao: number;
  total: number;
}

export interface ExercicioDisponivel {
  exercicio: string;
  unidade: string;
  minimo_aprovacao: string;
}

/**
 * Prova de tempo: aqui o número MENOR é o melhor desempenho.
 * Sem esta distinção o gráfico mostraria evolução ao contrário para quem
 * corre 100 metros mais rápido a cada semana.
 */
function menorEhMelhor(exercicio: string, unidade: string): boolean {
  const e = exercicio.toLowerCase();
  const u = unidade.toLowerCase();
  if (u.includes("segundo") || u.includes("minuto")) {
    // "Flexão na barra (isometria)" é medida em segundos e aí MAIOR é melhor:
    // a pessoa se sustenta o máximo de tempo possível.
    if (e.includes("isometr") || e.includes("sustenta")) return false;
    return true;
  }
  return false;
}

/** Extrai o número do texto do edital ("2.400 m", "12 repetições"). */
function metaNumerica(texto: string): number | null {
  const limpo = texto.replace(/\./g, "").replace(",", ".");
  const m = limpo.match(/\d+(\.\d+)?/);
  return m ? Number(m[0]) : null;
}

export function TreinoTaf({
  sigla,
  exercicios,
  cor = "#F97316",
}: {
  sigla: string;
  exercicios: ExercicioDisponivel[];
  cor?: string;
}) {
  const [series, setSeries] = useState<Serie[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Lista sem repetição: o edital traz o mesmo exercício para os dois sexos.
  const opcoes = useMemo(() => {
    const vistos = new Map<string, ExercicioDisponivel>();
    for (const e of exercicios) {
      if (!vistos.has(e.exercicio)) vistos.set(e.exercicio, e);
    }
    return [...vistos.values()];
  }, [exercicios]);

  const [form, setForm] = useState({ exercicio: "", valor: "", observacao: "" });

  useEffect(() => {
    if (!form.exercicio && opcoes.length) {
      setForm((f) => ({ ...f, exercicio: opcoes[0].exercicio }));
    }
  }, [opcoes, form.exercicio]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetchWithAuth(
        `/api/taf/registros?concurso=${encodeURIComponent(sigla)}`
      );
      const json = await res.json();
      if (json.success) setSeries(json.data.series);
    } catch {
      /* sem treino registrado é um estado válido */
    } finally {
      setCarregando(false);
    }
  }, [sigla]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const registrar = async () => {
    const escolhido = opcoes.find((o) => o.exercicio === form.exercicio);
    const valor = Number(form.valor.replace(",", "."));

    if (!escolhido || !Number.isFinite(valor) || valor <= 0) {
      setErro("Informe a marca que você fez hoje.");
      return;
    }

    setSalvando(true);
    setErro(null);
    try {
      const res = await fetchWithAuth("/api/taf/registros", {
        method: "POST",
        body: JSON.stringify({
          concurso: sigla,
          exercicio: escolhido.exercicio,
          unidade: escolhido.unidade,
          valor,
          maior_melhor: !menorEhMelhor(escolhido.exercicio, escolhido.unidade),
          observacao: form.observacao || null,
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      setForm((f) => ({ ...f, valor: "", observacao: "" }));
      await carregar();
    } catch {
      setErro("Não consegui salvar. Tente de novo.");
    } finally {
      setSalvando(false);
    }
  };

  const apagar = async (id: string) => {
    await fetchWithAuth(`/api/taf/registros?id=${id}`, { method: "DELETE" });
    carregar();
  };

  return (
    <section className="mt-6 rounded-2xl border border-bat-border bg-bat-bg-card p-5">
      <h2 className="heading text-lg text-bat-text">🏋️ Meu treino</h2>
      <p className="mt-1 text-xs leading-relaxed text-bat-text-secondary">
        Registre a marca de cada treino e acompanhe a distância até o índice do
        edital. A tabela acima diz onde você precisa chegar; isto aqui diz onde
        você está.
      </p>

      {/* ═══ Formulário ═══ */}
      <div className="mt-4 grid gap-3 rounded-xl border border-bat-border bg-bat-bg-primary p-4 sm:grid-cols-[2fr_1fr_auto]">
        <div>
          <label className="mb-1 block text-[11px] text-bat-text-muted">
            Exercício
          </label>
          <select
            value={form.exercicio}
            onChange={(e) => setForm({ ...form, exercicio: e.target.value })}
            className="input-field text-sm"
          >
            {opcoes.map((o) => (
              <option key={o.exercicio} value={o.exercicio}>
                {o.exercicio}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[11px] text-bat-text-muted">
            Sua marca hoje
            {(() => {
              const o = opcoes.find((x) => x.exercicio === form.exercicio);
              return o ? ` (${o.unidade})` : "";
            })()}
          </label>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            placeholder="0"
            className="input-field text-sm"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={registrar}
            disabled={salvando || !form.valor}
            className="btn-primary w-full px-5 py-2.5 text-xs disabled:opacity-40 sm:w-auto"
          >
            {salvando ? "Salvando..." : "Registrar"}
          </button>
        </div>
      </div>

      {erro && (
        <p className="mt-2 text-xs text-bat-error">{erro}</p>
      )}

      {/* ═══ Séries ═══ */}
      {carregando ? (
        <div className="skeleton mt-4 h-32 rounded-xl" />
      ) : series.length === 0 ? (
        <p className="mt-4 rounded-xl border border-bat-border bg-bat-bg-primary px-4 py-6 text-center text-xs text-bat-text-muted">
          Nenhuma marca registrada ainda. A primeira já vale — é dela que sai a
          linha de base.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {series.map((s) => {
            const doEdital = opcoes.find((o) => o.exercicio === s.exercicio);
            const meta = doEdital ? metaNumerica(doEdital.minimo_aprovacao) : null;
            const atingiu =
              meta !== null &&
              (s.maior_melhor ? s.melhor >= meta : s.melhor <= meta);

            const escala = Math.max(s.melhor, meta ?? 0, ...s.marcas.map((m) => m.valor));

            return (
              <div
                key={s.exercicio}
                className="rounded-xl border border-bat-border bg-bat-bg-primary p-4"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-sm font-bold text-bat-text">{s.exercicio}</h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-bat-text-muted">
                      melhor:{" "}
                      <strong style={{ color: cor }}>
                        {s.melhor} {s.unidade}
                      </strong>
                    </span>
                    {s.total >= 2 && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                        style={{
                          color: s.evolucao > 0 ? "#22C55E" : "#6B7280",
                          background: s.evolucao > 0 ? "#22C55E1A" : "transparent",
                        }}
                      >
                        {s.evolucao > 0 ? "+" : ""}
                        {s.evolucao.toFixed(0)} desde a 1ª
                      </span>
                    )}
                  </div>
                </div>

                {/* Meta do edital */}
                {meta !== null && (
                  <p className="mt-1 text-[11px] text-bat-text-muted">
                    Índice do edital: <strong>{doEdital?.minimo_aprovacao}</strong>{" "}
                    {atingiu ? (
                      <span className="font-bold text-bat-success">
                        · você já atingiu ✓
                      </span>
                    ) : (
                      <span className="text-bat-warning">
                        · faltam{" "}
                        {Math.abs(meta - s.melhor).toFixed(0)} {s.unidade}
                      </span>
                    )}
                  </p>
                )}

                {/* Barras por treino */}
                <div className="mt-3 flex h-16 items-end gap-1">
                  {s.marcas.slice(-24).map((m) => (
                    <div
                      key={m.id}
                      className="group relative flex-1"
                      title={`${new Date(`${m.data_treino}T00:00:00`).toLocaleDateString("pt-BR")}: ${m.valor} ${s.unidade}${m.observacao ? ` — ${m.observacao}` : ""}`}
                    >
                      <div
                        className="w-full rounded-t transition-opacity group-hover:opacity-70"
                        style={{
                          height: `${Math.max(6, (m.valor / escala) * 62)}px`,
                          background:
                            meta !== null &&
                            (s.maior_melhor ? m.valor >= meta : m.valor <= meta)
                              ? "#22C55E"
                              : cor,
                        }}
                      />
                    </div>
                  ))}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-bat-text-muted">
                  <span>
                    {s.total} {s.total === 1 ? "treino" : "treinos"} registrados
                  </span>
                  <button
                    onClick={() => apagar(s.marcas[s.marcas.length - 1].id)}
                    className="cursor-pointer transition-colors hover:text-bat-error"
                  >
                    apagar o último
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
