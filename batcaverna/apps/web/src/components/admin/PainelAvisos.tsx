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

interface ConcursoOpcao {
  id: string;
  sigla: string;
  nome: string;
}

const TIPOS = [
  { valor: "info", rotulo: "ℹ️ Informativo", cor: "#3B82F6", icone: "ℹ️" },
  { valor: "atualizacao", rotulo: "🚀 Atualização", cor: "#22C55E", icone: "🚀" },
  { valor: "alerta", rotulo: "⚠️ Alerta", cor: "#F5C518", icone: "⚠️" },
  { valor: "manutencao", rotulo: "🔧 Manutenção", cor: "#F97316", icone: "🔧" },
  { valor: "sucesso", rotulo: "✅ Boa notícia", cor: "#22C55E", icone: "✅" },
];

const DURACOES = [
  { horas: 6, rotulo: "6 horas" },
  { horas: 24, rotulo: "1 dia" },
  { horas: 72, rotulo: "3 dias" },
  { horas: 168, rotulo: "1 semana" },
  { horas: 720, rotulo: "30 dias" },
  { horas: 0, rotulo: "Sem prazo (permanente até o usuário apagar)" },
];

export function PainelAvisos() {
  const [avisos, setAvisos] = useState<Aviso[]>([]);
  const [concursos, setConcursos] = useState<ConcursoOpcao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{ tipo: "ok" | "erro"; msg: string } | null>(null);

  const [form, setForm] = useState({
    titulo: "",
    mensagem: "",
    tipo: "info",
    concurso_alvo: "todos",
    duracao_horas: 72,
    link_acao: "",
    texto_botao: "Acessar Agora",
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

  useEffect(() => {
    carregar();
    fetchWithAuth("/api/concursos")
      .then((r) => r.json())
      .then((j) => {
        if (j.success && Array.isArray(j.data)) setConcursos(j.data);
      })
      .catch(() => {});
  }, []);

  const enviar = async () => {
    if (form.titulo.trim().length < 3 || form.mensagem.trim().length < 3) {
      setResultado({ tipo: "erro", msg: "Preencha título e mensagem para disparar." });
      return;
    }

    const alvoConcurso =
      form.concurso_alvo === "todos"
        ? "TODOS os usuários da plataforma"
        : `Apenas alunos que estudam para: ${form.concurso_alvo}`;

    const prazo =
      form.duracao_horas > 0
        ? DURACOES.find((d) => d.horas === form.duracao_horas)?.rotulo
        : "sem prazo";

    if (
      !confirm(
        `Confirmar envio de aviso?\n\nDestinatários: ${alvoConcurso}\nTítulo: "${form.titulo}"\nValidade: ${prazo}`
      )
    ) {
      return;
    }

    setEnviando(true);
    setResultado(null);
    try {
      const res = await fetchWithAuth("/api/admin/avisos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        setResultado({ tipo: "ok", msg: json.message || "Aviso enviado com sucesso!" });
        setForm({
          titulo: "",
          mensagem: "",
          tipo: "info",
          concurso_alvo: "todos",
          duracao_horas: 72,
          link_acao: "",
          texto_botao: "Acessar Agora",
        });
        carregar();
      } else {
        setResultado({ tipo: "erro", msg: json.error || "Erro ao disparar aviso." });
      }
    } catch {
      setResultado({ tipo: "erro", msg: "Falha de conexão com a API de avisos." });
    } finally {
      setEnviando(false);
    }
  };

  const revogar = async (id: string) => {
    if (!confirm("Revogar este aviso? Ele será removido da caixa de todos os usuários.")) {
      return;
    }
    await fetchWithAuth(`/api/admin/avisos?id=${id}`, { method: "DELETE" }).catch(
      () => undefined
    );
    carregar();
  };

  const tipoAtual = TIPOS.find((t) => t.valor === form.tipo) || TIPOS[0];

  return (
    <div className="space-y-6">
      {/* ═══ COMPOSITOR DE AVISOS ═══ */}
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bat-border/60 pb-4">
          <div>
            <h2 className="heading text-xl text-bat-text flex items-center gap-2">
              <span>📢</span> Mural & Central de Avisos Táticos
            </h2>
            <p className="text-xs text-bat-text-muted mt-1">
              Dispare notificações na caixa de entrada dos estudantes com segmentação por concurso ou alcance global.
            </p>
          </div>
        </div>

        {resultado && (
          <div
            className={`p-4 rounded-xl text-xs flex items-center justify-between gap-3 border font-bold ${
              resultado.tipo === "ok"
                ? "bg-bat-success/10 border-bat-success/30 text-bat-success"
                : "bg-bat-error/10 border-bat-error/30 text-bat-error"
            }`}
          >
            <span>{resultado.msg}</span>
            <button
              onClick={() => setResultado(null)}
              className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Segmentação & Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-bat-text-secondary block mb-1.5">
                🎯 Destinatários (Segmentação por Concurso)
              </label>
              <select
                value={form.concurso_alvo}
                onChange={(e) => setForm({ ...form, concurso_alvo: e.target.value })}
                className="input-field w-full text-xs bg-bat-bg-primary"
              >
                <option value="todos">🌐 Todos os Usuários da Plataforma</option>
                {concursos.map((c) => (
                  <option key={c.id} value={c.sigla}>
                    🎯 Somente Alunos da {c.sigla} ({c.nome})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-bat-text-secondary block mb-1.5">
                ⏱️ Duração do Aviso na Caixa
              </label>
              <select
                value={form.duracao_horas}
                onChange={(e) =>
                  setForm({ ...form, duracao_horas: Number(e.target.value) })
                }
                className="input-field w-full text-xs bg-bat-bg-primary"
              >
                {DURACOES.map((d) => (
                  <option key={d.horas} value={d.horas}>
                    {d.rotulo}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tipo do Aviso */}
          <div>
            <label className="text-xs font-bold text-bat-text-secondary block mb-1.5">
              Categoria / Visual do Alerta
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS.map((t) => (
                <button
                  key={t.valor}
                  type="button"
                  onClick={() => setForm({ ...form, tipo: t.valor })}
                  className={`cursor-pointer rounded-xl border px-3.5 py-1.5 text-xs font-bold transition-all ${
                    form.tipo === t.valor
                      ? "text-bat-text shadow-[0_0_12px_rgba(245,197,24,0.2)]"
                      : "border-bat-border bg-bat-bg-secondary text-bat-text-secondary hover:text-bat-text"
                  }`}
                  style={
                    form.tipo === t.valor
                      ? { borderColor: `${t.cor}88`, background: `${t.cor}25` }
                      : undefined
                  }
                >
                  {t.rotulo}
                </button>
              ))}
            </div>
          </div>

          {/* Título */}
          <div>
            <label className="text-xs font-bold text-bat-text-secondary block mb-1">
              Título do Aviso *
            </label>
            <input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              maxLength={200}
              placeholder="Ex.: Novo Simulado Oficial do ENEM Dia 2 disponível com TRI calibrada"
              className="input-field w-full text-xs"
              required
            />
          </div>

          {/* Mensagem */}
          <div>
            <label className="text-xs font-bold text-bat-text-secondary block mb-1">
              Mensagem Detalhada *
            </label>
            <textarea
              value={form.mensagem}
              onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
              rows={3}
              placeholder="Explique com detalhes o comunicado para os alunos..."
              className="input-field w-full text-xs resize-y"
              required
            />
          </div>

          {/* Link de Ação (CTA) Opcional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-bat-bg-primary border border-bat-border">
            <div>
              <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                🔗 Botão de Ação (CTA Opcional)
              </label>
              <input
                value={form.link_acao}
                onChange={(e) => setForm({ ...form, link_acao: e.target.value })}
                placeholder="Ex.: /simulado ou /novidades ou https://..."
                className="input-field w-full text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-bat-text-secondary block mb-1">
                Texto do Botão
              </label>
              <input
                value={form.texto_botao}
                onChange={(e) => setForm({ ...form, texto_botao: e.target.value })}
                placeholder="Ex.: Fazer Simulado Agora"
                className="input-field w-full text-xs"
                disabled={!form.link_acao}
              />
            </div>
          </div>

          {/* Prévia ao Vivo */}
          {(form.titulo || form.mensagem) && (
            <div className="rounded-xl border border-bat-gold-400/30 bg-bat-bg-primary/90 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-bat-gold-400">
                  👁️ Prévia em tempo real na caixa do aluno
                </span>
                <span className="text-[10px] font-mono text-bat-text-muted">
                  {form.concurso_alvo === "todos" ? "🌐 Todos os Alunos" : `🎯 Alvo: ${form.concurso_alvo}`}
                </span>
              </div>
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-bat-bg-card border border-bat-border">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-bat-border bg-bat-bg-secondary text-lg">
                  {tipoAtual.icone}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-bat-text">
                    {form.titulo || "(sem título)"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-bat-text-secondary whitespace-pre-line">
                    {form.mensagem || "(sem mensagem)"}
                  </p>
                  {form.link_acao && (
                    <div className="mt-2.5">
                      <span className="inline-block px-3 py-1 text-[11px] font-bold rounded-lg bg-bat-gold-400 text-black shadow">
                        {form.texto_botao || "Acessar Agora"} ↗
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end">
            <button
              onClick={enviar}
              disabled={enviando}
              className="btn-primary px-6 py-2.5 text-xs font-bold cursor-pointer shadow-[0_0_15px_rgba(245,197,24,0.3)] disabled:opacity-40"
            >
              {enviando
                ? "Disparando..."
                : form.concurso_alvo === "todos"
                ? "📢 Disparar para Todos os Alunos"
                : `🎯 Disparar para Alunos da ${form.concurso_alvo}`}
            </button>
          </div>
        </div>
      </section>

      {/* ═══ HISTÓRICO DE AVISOS ═══ */}
      <section className="rounded-2xl border border-bat-border bg-bat-bg-card p-6 shadow-xl">
        <h3 className="heading mb-4 text-sm font-bold uppercase tracking-wider text-bat-text-secondary flex items-center gap-2">
          <span>📜</span> Histórico de Avisos Disparados
        </h3>

        {carregando ? (
          <div className="skeleton h-28 rounded-xl" />
        ) : avisos.length === 0 ? (
          <div className="p-8 text-center text-xs text-bat-text-muted bg-bat-bg-primary rounded-xl border border-bat-border">
            Nenhum aviso transmitido ainda.
          </div>
        ) : (
          <ul className="divide-y divide-bat-border/50">
            {avisos.map((a) => (
              <li key={a.id} className="flex items-start justify-between gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-bold text-bat-text">{a.titulo}</p>
                    {a.expira_em && a.expirado ? (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-bat-text-muted/20 text-bat-text-muted">
                        Expirado
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-bat-success/20 text-bat-success font-bold">
                        🟢 Ativo na Caixa
                      </span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-xs text-bat-text-secondary leading-relaxed">
                    {a.mensagem}
                  </p>
                  <p className="mt-1.5 text-[11px] text-bat-text-muted font-mono flex items-center gap-2">
                    <span>📅 {new Date(a.criado_em).toLocaleString("pt-BR")}</span>
                    <span>·</span>
                    <span className="text-bat-gold-400 font-bold">👥 {a.total_destinatarios} soldados notificados</span>
                    <span>·</span>
                    <span>
                      {a.expira_em
                        ? a.expirado
                          ? "expirado"
                          : `expira em ${new Date(a.expira_em).toLocaleDateString("pt-BR")}`
                        : "permanente"}
                    </span>
                  </p>
                </div>

                {a.ativo && !a.expirado && (
                  <button
                    onClick={() => revogar(a.id)}
                    className="shrink-0 cursor-pointer rounded-lg border border-bat-error/30 bg-bat-error/10 px-3 py-1.5 text-xs font-bold text-bat-error transition-colors hover:bg-bat-error/20"
                    title="Excluir da caixa de todos os alunos"
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
