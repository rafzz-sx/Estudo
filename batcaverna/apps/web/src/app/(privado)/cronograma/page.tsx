"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/stores/auth-store";

interface ItemPlano {
  id: string;
  titulo: string;
  semana: number;
  data_alvo: string;
  minutos_alvo: number;
  tipo: string;
  peso: number;
  concluido: boolean;
  materias: { nome: string; icone_emoji: string | null } | null;
}

interface Plano {
  id: string;
  nome: string;
  data_prova: string;
  horas_por_semana: number;
  itens: ItemPlano[];
  total_itens: number;
  concluidos: number;
  progresso: number;
  dias_restantes: number;
  atrasados: number;
  hoje: ItemPlano[];
  concursos: { sigla: string; nome: string; emoji: string | null; cor_tema: string | null } | null;
}

interface ConcursoOpcao {
  id: string;
  sigla: string;
  nome: string;
  emoji: string | null;
  total_questoes: number;
}

const ICONE_TIPO: Record<string, string> = {
  estudar_teoria: "📖",
  resolver_questoes: "❓",
  revisar: "🔁",
  simulado: "⏱️",
};

const ROTULO_TIPO: Record<string, string> = {
  estudar_teoria: "Teoria",
  resolver_questoes: "Questões",
  revisar: "Revisão",
  simulado: "Simulado",
};

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export default function CronogramaPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [concursos, setConcursos] = useState<ConcursoOpcao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [semanaAberta, setSemanaAberta] = useState<number | null>(1);

  const [form, setForm] = useState({
    concurso: "",
    data_prova: "",
    horas_por_semana: 10,
    dias_semana: [1, 2, 3, 4, 5] as number[],
  });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [rPlanos, rConcursos] = await Promise.all([
        fetchWithAuth("/api/planos"),
        fetchWithAuth("/api/concursos"),
      ]);
      const jPlanos = await rPlanos.json();
      const jConcursos = await rConcursos.json();

      if (jPlanos.success) setPlanos(jPlanos.data);
      if (jConcursos.success) {
        const comQuestoes = jConcursos.data.filter(
          (c: ConcursoOpcao) => c.total_questoes > 0
        );
        setConcursos(comQuestoes);
        setForm((f) => ({ ...f, concurso: f.concurso || comQuestoes[0]?.sigla || "" }));
      }
    } catch {
      /* estado vazio cobre */
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const gerar = async () => {
    if (!form.concurso || !form.data_prova) {
      setErro("Escolha o concurso e a data da prova.");
      return;
    }
    setCriando(true);
    setErro(null);
    try {
      const res = await fetchWithAuth("/api/planos", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        await carregar();
      } else {
        setErro(json.error ?? "Não consegui gerar o cronograma.");
      }
    } catch {
      setErro("Falha de conexão ao gerar o cronograma.");
    } finally {
      setCriando(false);
    }
  };

  const alternarItem = async (plano: Plano, item: ItemPlano) => {
    setPlanos((ps) =>
      ps.map((p) =>
        p.id === plano.id
          ? {
              ...p,
              itens: p.itens.map((i) =>
                i.id === item.id ? { ...i, concluido: !i.concluido } : i
              ),
              concluidos: p.concluidos + (item.concluido ? -1 : 1),
            }
          : p
      )
    );
    await fetchWithAuth(`/api/planos/${plano.id}`, {
      method: "PATCH",
      body: JSON.stringify({ item_id: item.id, concluido: !item.concluido }),
    }).catch(() => undefined);
  };

  const arquivar = async (plano: Plano) => {
    if (!confirm(`Arquivar o cronograma "${plano.nome}"?`)) return;
    await fetchWithAuth(`/api/planos/${plano.id}`, { method: "DELETE" }).catch(
      () => undefined
    );
    carregar();
  };

  if (carregando) return <div className="skeleton h-96 w-full rounded-2xl" />;

  return (
    <div>
      <header className="mb-6">
        <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
          <span>🗓️</span> Cronograma
        </h1>
        <p className="mt-1 text-sm text-bat-text-secondary">
          O tempo de cada matéria é proporcional ao peso real dela na prova,
          medido pelas questões oficiais do concurso — não é chute.
        </p>
      </header>

      {erro && (
        <div className="mb-4 rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-3 text-sm text-bat-error">
          {erro}
        </div>
      )}

      {/* ═══ PLANOS ATIVOS ═══ */}
      {planos.map((plano) => {
        const semanas = [...new Set(plano.itens.map((i) => i.semana))].sort(
          (a, b) => a - b
        );

        return (
          <section
            key={plano.id}
            className="mb-6 overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card"
          >
            <header className="border-b border-bat-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="heading flex items-center gap-2 text-lg font-bold text-bat-text">
                    <span>{plano.concursos?.emoji ?? "🎯"}</span>
                    {plano.nome}
                  </h2>
                  <p className="mt-0.5 text-xs text-bat-text-muted">
                    Prova em{" "}
                    {new Date(`${plano.data_prova}T00:00:00`).toLocaleDateString(
                      "pt-BR"
                    )}{" "}
                    · {plano.horas_por_semana}h por semana
                  </p>
                </div>
                <button
                  onClick={() => arquivar(plano)}
                  className="shrink-0 cursor-pointer text-xs text-bat-text-muted hover:text-bat-error"
                >
                  Arquivar
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Mini
                  rotulo="Dias até a prova"
                  valor={String(plano.dias_restantes)}
                  cor={plano.dias_restantes < 30 ? "#EF4444" : "#F5C518"}
                />
                <Mini
                  rotulo="Progresso"
                  valor={`${plano.progresso}%`}
                  cor="#22C55E"
                />
                <Mini
                  rotulo="Tarefas"
                  valor={`${plano.concluidos}/${plano.total_itens}`}
                />
                <Mini
                  rotulo="Atrasadas"
                  valor={String(plano.atrasados)}
                  cor={plano.atrasados > 0 ? "#EF4444" : undefined}
                />
              </div>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-bat-bg-secondary">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${plano.progresso}%`,
                    background: plano.concursos?.cor_tema ?? "#F5C518",
                  }}
                />
              </div>
            </header>

            {/* ─── Hoje ─── */}
            {plano.hoje.length > 0 && (
              <div className="border-b border-bat-border bg-bat-gold-400/5 px-5 py-4">
                <p className="mb-2.5 text-xs font-bold uppercase tracking-wider text-bat-gold-400">
                  📌 Para hoje
                </p>
                <ul className="space-y-2">
                  {plano.hoje.map((item) => (
                    <Tarefa
                      key={item.id}
                      item={item}
                      onToggle={() => alternarItem(plano, item)}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* ─── Semanas ─── */}
            <div className="divide-y divide-bat-border/40">
              {semanas.map((semana) => {
                const itens = plano.itens.filter((i) => i.semana === semana);
                const feitos = itens.filter((i) => i.concluido).length;
                const aberta = semanaAberta === semana;

                return (
                  <div key={semana}>
                    <button
                      onClick={() => setSemanaAberta(aberta ? null : semana)}
                      className="flex w-full cursor-pointer items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-bat-bg-elevated/40"
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          feitos === itens.length
                            ? "bg-bat-success/20 text-bat-success"
                            : "bg-bat-bg-secondary text-bat-text-muted"
                        }`}
                      >
                        {feitos === itens.length ? "✓" : semana}
                      </span>
                      <span className="flex-1 text-sm font-medium text-bat-text">
                        Semana {semana}
                      </span>
                      <span className="text-xs text-bat-text-muted">
                        {feitos}/{itens.length}
                      </span>
                      <span
                        className={`text-bat-text-muted transition-transform ${
                          aberta ? "rotate-180" : ""
                        }`}
                      >
                        ▾
                      </span>
                    </button>

                    {aberta && (
                      <ul className="space-y-2 px-5 pb-4">
                        {itens.map((item) => (
                          <Tarefa
                            key={item.id}
                            item={item}
                            onToggle={() => alternarItem(plano, item)}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* ═══ GERADOR ═══ */}
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <h2 className="heading mb-1 text-lg text-bat-text">
          {planos.length ? "Criar outro cronograma" : "Montar seu cronograma"}
        </h2>
        <p className="mb-4 text-xs text-bat-text-muted">
          Informe a data da prova e quantas horas por semana você consegue
          estudar. O resto a plataforma calcula.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-bat-text-muted">
                Concurso
              </label>
              <select
                value={form.concurso}
                onChange={(e) => setForm({ ...form, concurso: e.target.value })}
                className="input-field"
              >
                {concursos.length === 0 && (
                  <option value="">Nenhum concurso com questões</option>
                )}
                {concursos.map((c) => (
                  <option key={c.id} value={c.sigla}>
                    {c.emoji} {c.sigla}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bat-text-muted">
                Data da prova
              </label>
              <input
                type="date"
                value={form.data_prova}
                min={new Date(Date.now() + 8 * 86_400_000)
                  .toISOString()
                  .slice(0, 10)}
                onChange={(e) => setForm({ ...form, data_prova: e.target.value })}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-bat-text-muted">
              Horas de estudo por semana:{" "}
              <strong className="text-bat-gold-400">
                {form.horas_por_semana}h
              </strong>
            </label>
            <input
              type="range"
              min={2}
              max={40}
              step={1}
              value={form.horas_por_semana}
              onChange={(e) =>
                setForm({ ...form, horas_por_semana: Number(e.target.value) })
              }
              className="w-full cursor-pointer"
              style={{ accentColor: "#F5C518" }}
            />
            <p className="mt-1 text-[11px] text-bat-text-muted">
              Seja realista. Um plano de 30h que você não cumpre rende menos que
              um de 10h que você cumpre.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-bat-text-muted">
              Dias em que você estuda
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DIAS.map((dia, i) => {
                const ativo = form.dias_semana.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() =>
                      setForm({
                        ...form,
                        dias_semana: ativo
                          ? form.dias_semana.filter((d) => d !== i)
                          : [...form.dias_semana, i].sort(),
                      })
                    }
                    className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      ativo
                        ? "border-bat-gold-400/40 bg-bat-gold-400/15 text-bat-gold-400"
                        : "border-bat-border bg-bat-bg-secondary text-bat-text-muted"
                    }`}
                  >
                    {dia}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={gerar}
            disabled={criando || !form.concurso || !form.data_prova}
            className="btn-primary px-6 py-3 text-sm disabled:opacity-40"
          >
            {criando ? "Montando cronograma..." : "🗓️ Gerar cronograma"}
          </button>
        </div>
      </section>

      {planos.length === 0 && (
        <p className="mt-4 text-center text-xs text-bat-text-muted">
          Já tem um caderno de erros?{" "}
          <Link href="/caderno" className="text-bat-gold-400 no-underline hover:underline">
            Ele entra no cronograma como revisão automática.
          </Link>
        </p>
      )}
    </div>
  );
}

function Tarefa({
  item,
  onToggle,
}: {
  item: ItemPlano;
  onToggle: () => void;
}) {
  const hoje = new Date().toISOString().slice(0, 10);
  const atrasada = !item.concluido && item.data_alvo < hoje;

  return (
    <li>
      <button
        onClick={onToggle}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all ${
          item.concluido
            ? "border-bat-success/30 bg-bat-success/8"
            : atrasada
            ? "border-bat-error/30 bg-bat-error/8"
            : "border-bat-border bg-bat-bg-secondary/50 hover:border-bat-gold-400/30"
        }`}
      >
        <span
          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${
            item.concluido
              ? "border-bat-success bg-bat-success text-black"
              : "border-bat-border bg-bat-bg-card text-transparent"
          }`}
        >
          ✓
        </span>

        <span className="shrink-0 text-base">{ICONE_TIPO[item.tipo] ?? "📘"}</span>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-sm ${
              item.concluido
                ? "text-bat-text-muted line-through"
                : "text-bat-text"
            }`}
          >
            {item.titulo}
          </p>
          <p className="text-[11px] text-bat-text-muted">
            {ROTULO_TIPO[item.tipo] ?? "Estudo"} ·{" "}
            {new Date(`${item.data_alvo}T00:00:00`).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
            })}
            {atrasada && (
              <span className="ml-1 font-bold text-bat-error">· atrasada</span>
            )}
          </p>
        </div>

        <span className="shrink-0 text-xs text-bat-text-muted">
          {item.minutos_alvo >= 60
            ? `${Math.floor(item.minutos_alvo / 60)}h${
                item.minutos_alvo % 60 ? ` ${item.minutos_alvo % 60}min` : ""
              }`
            : `${item.minutos_alvo}min`}
        </span>
      </button>
    </li>
  );
}

function Mini({
  rotulo,
  valor,
  cor,
}: {
  rotulo: string;
  valor: string;
  cor?: string;
}) {
  return (
    <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/40 px-3 py-2.5">
      <p className="heading text-lg font-bold" style={{ color: cor }}>
        {valor}
      </p>
      <p className="text-[10px] text-bat-text-muted">{rotulo}</p>
    </div>
  );
}
