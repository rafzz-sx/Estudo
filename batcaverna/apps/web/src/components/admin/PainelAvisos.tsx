"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

interface Aviso {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  criado_em: string;
  expira_em: string | null;
  ativo: boolean;
  expirado: boolean;
  total_destinatarios: number;
}

const TIPOS = [
  { valor: "info", rotulo: "ℹ️ Informativo", cor: "#3B82F6" },
  { valor: "atualizacao", rotulo: "🚀 Atualização", cor: "#22C55E" },
  { valor: "alerta", rotulo: "⚠️ Alerta", cor: "#F5C518" },
  { valor: "manutencao", rotulo: "🔧 Manutenção", cor: "#F97316" },
  { valor: "sucesso", rotulo: "✅ Boa notícia", cor: "#22C55E" },
];

const DURACOES = [
  { horas: 6, rotulo: "6 horas" },
  { horas: 24, rotulo: "1 dia" },
  { horas: 72, rotulo: "3 dias" },
  { horas: 168, rotulo: "1 semana" },
  { horas: 720, rotulo: "30 dias" },
  { horas: 0, rotulo: "Sem prazo (até o usuário apagar)" },
];

/**
 * Disparo de aviso universal.
 *
 * O admin escreve uma vez e a mensagem entra na caixa de notificações de
 * todos os usuários, com o prazo de validade que ele escolher — passado o
 * prazo, o aviso some sozinho sem precisar de limpeza manual.
 */
export function PainelAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const [form, setForm] = useState({
    titulo: "",
    mensagem: "",
    tipo: "info",
    duracao_horas: 72,
  });

  const carregar = () => {
    fetchWithAuth("/api/admin/avisos")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setAvisos(json.data);
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  };

  useEffect(carregar, []);

  const enviar = async () => {
    if (form.titulo.trim().length < 3 || form.mensagem.trim().length < 3) {
      setResultado("Preencha título e mensagem.");
      return;
    }

    const alvo =
      form.duracao_horas > 0
        ? DURACOES.find((d) => d.horas === form.duracao_horas)?.rotulo
        : "sem prazo";

    if (
      !confirm(
        `Enviar este aviso para TODOS os usuários?\n\n"${form.titulo}"\n\nDuração na caixa: ${alvo}`
      )
    ) {
      return;
    }

    setEnviando(true);
    setResultado(null);
    try {
      const res = await fetchWithAuth("/api/admin/avisos", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setResultado(json.success ? json.message : json.error);
      if (json.success) {
        setForm({ titulo: "", mensagem: "", tipo: "info", duracao_horas: 72 });
        carregar();
      }
    } catch {
      setResultado("Falha de conexão ao enviar.");
    } finally {
      setEnviando(false);
    }
  };

  const revogar = async (id: string) => {
    if (!confirm("Revogar este aviso? Ele some da caixa de todos os usuários.")) {
      return;
    }
    await fetchWithAuth(`/api/admin/avisos?id=${id}`, { method: "DELETE" }).catch(
      () => undefined
    );
    carregar();
  };

  return (
    <div className="space-y-6">
      {/* ═══ COMPOSITOR ═══ */}
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <h2 className="heading mb-1 text-xl text-bat-text">
          Enviar aviso para todos
        </h2>
        <p className="mb-4 text-xs text-bat-text-muted">
          Cria uma notificação na caixa de cada usuário da plataforma.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs text-bat-text-muted">
              Tipo
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.valor}
                  onClick={() => setForm({ ...form, tipo: t.valor })}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    form.tipo === t.valor
                      ? "text-bat-text"
                      : "border-bat-border bg-bat-bg-secondary text-bat-text-secondary"
                  }`}
                  style={
                    form.tipo === t.valor
                      ? { borderColor: `${t.cor}66`, background: `${t.cor}22` }
                      : undefined
                  }
                >
                  {t.rotulo}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-bat-text-muted">
              Título
            </label>
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              maxLength={200}
              placeholder="Ex.: Novas 500 questões da EEAR no banco"
              className="input-field"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-bat-text-muted">
              Mensagem
            </label>
            <textarea
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              rows={3}
              placeholder="Escreva o aviso como ele vai aparecer para o aluno."
              className="input-field w-full resize-none"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-bat-text-muted">
              Quanto tempo o aviso fica na caixa de notificações
            </label>
            <select
              value={form.duracao_horas}
              onChange={(e) =>
                setForm({ ...form, duracao_horas: Number(e.target.value) })
              }
              className="input-field"
            >
              {DURACOES.map((d) => (
                <option key={d.horas} value={d.horas}>
                  {d.rotulo}
                </option>
              ))}
            </select>
          </div>

          {/* Prévia */}
          {(form.titulo || form.mensagem) && (
            <div className="rounded-xl border border-bat-border bg-bat-bg-secondary/50 p-3.5">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                Prévia na caixa do aluno
              </p>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-bat-border bg-bat-bg-card text-base">
                  🚀
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-bat-text">
                    {form.titulo || "(sem título)"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-bat-text-secondary">
                    {form.mensagem || "(sem mensagem)"}
                  </p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={enviar}
            disabled={enviando}
            className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40"
          >
            {enviando ? "Enviando..." : "📢 Disparar para todos"}
          </button>

          {resultado && (
            <p className="rounded-xl border border-bat-border bg-bat-bg-secondary/60 px-4 py-2.5 text-sm text-bat-text-secondary">
              {resultado}
            </p>
          )}
        </div>
      </section>

      {/* ═══ HISTÓRICO ═══ */}
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <h3 className="heading mb-3 text-sm font-bold uppercase tracking-wider text-bat-text-secondary">
          Avisos disparados
        </h3>

        {carregando ? (
          <div className="skeleton h-24 rounded-xl" />
        ) : avisos.length === 0 ? (
          <p className="py-4 text-sm text-bat-text-muted">
            Nenhum aviso enviado ainda.
          </p>
        ) : (
          <ul className="divide-y divide-bat-border/50">
            {avisos.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-bat-text">{a.titulo}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-bat-text-secondary">
                    {a.mensagem}
                  </p>
                  <p className="mt-1 text-[11px] text-bat-text-muted">
                    {new Date(a.criado_em).toLocaleString("pt-BR")} ·{" "}
                    {a.total_destinatarios} destinatário(s) ·{" "}
                    {a.expira_em
                      ? a.expirado
                        ? "expirado"
                        : `expira ${new Date(a.expira_em).toLocaleString("pt-BR")}`
                      : "sem prazo"}
                  </p>
                </div>

                {a.ativo && !a.expirado && (
                  <button
                    onClick={() => revogar(a.id)}
                    className="shrink-0 cursor-pointer rounded-lg border border-bat-error/25 bg-bat-error/10 px-3 py-1.5 text-xs font-bold text-bat-error transition-colors hover:bg-bat-error/20"
                  >
                    Revogar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
