"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Fila de moderação do chat.
 *
 * A regra que organizou esta tela: quem modera abre o painel com uma
 * pergunta — "tem algo que eu precise ver AGORA?" — e a resposta tem que
 * estar na primeira linha, sem clique. A aba antiga respondia
 * "aqui estão as 50 conversas mais recentes", que não é a mesma pergunta.
 *
 * Por isso: crítica no topo, o texto da mensagem visível sem abrir nada, e
 * o autor, o destinatário e a reincidência lado a lado.
 */

interface ItemFila {
  mensagem_id: string;
  conversa_id: string;
  enviado_em: string;
  tipo: string;
  conteudo_texto: string | null;
  tem_midia: boolean;
  gravidade_moderacao: "critica" | "alta" | "media" | "baixa" | null;
  categorias_moderacao: string[] | null;
  termos_detectados: string[] | null;
  revisada_em: string | null;
  decisao_moderacao: string | null;
  autor_id: string;
  autor_apelido: string;
  autor_nome: string;
  autor_email: string;
  autor_ativo: boolean;
  destinatario_id: string;
  destinatario_apelido: string;
  destinatario_nome: string;
  total_do_autor: number;
}

const ESTILO_GRAVIDADE: Record<string, { cor: string; rotulo: string; emoji: string }> = {
  critica: { cor: "#EF4444", rotulo: "Crítica", emoji: "🚨" },
  alta: { cor: "#F97316", rotulo: "Alta", emoji: "⚠️" },
  media: { cor: "#F5C518", rotulo: "Média", emoji: "⚡" },
  baixa: { cor: "#6B7280", rotulo: "Baixa", emoji: "•" },
};

const ROTULO_CATEGORIA: Record<string, string> = {
  ameaca: "Ameaça",
  sexual: "Conteúdo sexual",
  aliciamento: "Possível aliciamento",
  discriminacao: "Discriminação",
  autolesao: "Sinal de autolesão",
  drogas: "Drogas",
  assedio: "Ofensa direcionada",
  palavrao: "Palavrão",
};

const DECISOES = [
  { valor: "sem_problema", rotulo: "Sem problema", desc: "O filtro errou. Tira a marca." },
  { valor: "advertido", rotulo: "Adverti o aluno", desc: "Conversei com quem escreveu." },
  { valor: "suspenso", rotulo: "Suspendi a conta", desc: "Ação tomada em Contas & Apelidos." },
  { valor: "em_apuracao", rotulo: "Em apuração", desc: "Caso aberto, ainda decidindo." },
];

export function PainelModeracao() {
  const [fila, setFila] = useState<ItemFila[]>([]);
  const [resumo, setResumo] = useState({ pendentes: 0, criticas: 0, altas: 0 });
  const [estado, setEstado] = useState<"pendentes" | "revisadas" | "todas">("pendentes");
  const [gravidade, setGravidade] = useState<string>("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const qs = new URLSearchParams({ estado });
      if (gravidade) qs.set("gravidade", gravidade);

      const res = await fetchWithAuth(`/api/admin/moderacao?${qs}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error);
      setFila(json.data.fila);
      setResumo(json.data.resumo);
    } catch {
      setErro("Não consegui carregar a fila. Confira se a migration 010 já rodou.");
    } finally {
      setCarregando(false);
    }
  }, [estado, gravidade]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const decidir = async (mensagemId: string, decisao: string) => {
    setSalvando(mensagemId);
    try {
      const res = await fetchWithAuth("/api/admin/moderacao", {
        method: "PUT",
        body: JSON.stringify({ mensagem_id: mensagemId, decisao }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      await carregar();
    } catch {
      setErro("Não consegui registrar a decisão.");
    } finally {
      setSalvando(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* ═══ Cabeçalho ═══ */}
      <div>
        <h2 className="heading text-xl text-bat-text">Fila de Moderação</h2>
        <p className="mt-1 text-xs leading-relaxed text-bat-text-secondary">
          Mensagens que o filtro automático marcou, das mais graves para as
          menos. Cada linha mostra <strong>quem escreveu</strong>,{" "}
          <strong>o que escreveu</strong> e <strong>para quem</strong> — o
          filtro não bloqueia nada, só chama uma pessoa para olhar.
        </p>
      </div>

      {/* ═══ Contadores ═══ */}
      <div className="grid grid-cols-3 gap-3">
        <Contador rotulo="Pendentes" valor={resumo.pendentes} />
        <Contador rotulo="Críticas" valor={resumo.criticas} cor="#EF4444" />
        <Contador rotulo="Altas" valor={resumo.altas} cor="#F97316" />
      </div>

      {resumo.criticas > 0 && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-xs leading-relaxed text-red-200">
          🚨 <strong>{resumo.criticas}</strong>{" "}
          {resumo.criticas === 1 ? "mensagem crítica aguarda" : "mensagens críticas aguardam"}{" "}
          revisão. Esta categoria reúne ameaça, conteúdo sexual, possível
          aliciamento e sinal de autolesão. Nesta última, a resposta certa
          costuma ser oferecer ajuda, não punir.
        </div>
      )}

      {/* ═══ Filtros ═══ */}
      <div className="flex flex-wrap gap-2">
        {(["pendentes", "revisadas", "todas"] as const).map((e) => (
          <button
            key={e}
            onClick={() => setEstado(e)}
            className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
              estado === e
                ? "border-bat-gold-400/50 bg-bat-gold-400/10 text-bat-gold-400"
                : "border-bat-border bg-bat-bg-secondary text-bat-text-muted hover:text-bat-text"
            }`}
          >
            {e === "pendentes" ? "Pendentes" : e === "revisadas" ? "Já revisadas" : "Todas"}
          </button>
        ))}

        <span className="mx-1 w-px bg-bat-border" />

        <button
          onClick={() => setGravidade("")}
          className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs transition-all ${
            !gravidade
              ? "border-bat-gold-400/50 bg-bat-gold-400/10 text-bat-gold-400"
              : "border-bat-border bg-bat-bg-secondary text-bat-text-muted"
          }`}
        >
          Qualquer gravidade
        </button>
        {Object.entries(ESTILO_GRAVIDADE).map(([chave, info]) => (
          <button
            key={chave}
            onClick={() => setGravidade(chave)}
            className="cursor-pointer rounded-lg border px-3 py-1.5 text-xs transition-all"
            style={
              gravidade === chave
                ? { borderColor: `${info.cor}80`, background: `${info.cor}1A`, color: info.cor }
                : { borderColor: "var(--color-bat-border)", color: "#6B7280" }
            }
          >
            {info.emoji} {info.rotulo}
          </button>
        ))}
      </div>

      {erro && (
        <p className="rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-3 text-xs text-bat-error">
          {erro}
        </p>
      )}

      {/* ═══ Fila ═══ */}
      {carregando ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      ) : fila.length === 0 ? (
        <div className="rounded-xl border border-bat-border bg-bat-bg-primary p-10 text-center">
          <p className="text-3xl">🕊️</p>
          <p className="mt-2 text-sm font-bold text-bat-text">Nada na fila</p>
          <p className="mt-1 text-xs text-bat-text-muted">
            {estado === "pendentes"
              ? "Nenhuma mensagem aguardando revisão."
              : "Nenhuma mensagem neste filtro."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {fila.map((m) => {
            const g = ESTILO_GRAVIDADE[m.gravidade_moderacao ?? "baixa"];
            const reincidente = m.total_do_autor > 1;

            return (
              <article
                key={m.mensagem_id}
                className="rounded-xl border bg-bat-bg-primary p-4"
                style={{ borderColor: `${g.cor}55` }}
              >
                {/* Linha 1: gravidade, categorias, data */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-lg px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                    style={{ background: `${g.cor}22`, color: g.cor }}
                  >
                    {g.emoji} {g.rotulo}
                  </span>
                  {(m.categorias_moderacao ?? []).map((c) => (
                    <span
                      key={c}
                      className="rounded-lg border border-bat-border bg-bat-bg-secondary px-2 py-0.5 text-[10px] text-bat-text-secondary"
                    >
                      {ROTULO_CATEGORIA[c] ?? c}
                    </span>
                  ))}
                  <span className="ml-auto text-[10px] text-bat-text-muted">
                    {new Date(m.enviado_em).toLocaleString("pt-BR")}
                  </span>
                </div>

                {/* Linha 2: quem → para quem */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-bold text-bat-gold-400">{m.autor_apelido}</span>
                  <span className="text-bat-text-muted">({m.autor_nome})</span>
                  {!m.autor_ativo && (
                    <span className="rounded bg-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-400">
                      conta desativada
                    </span>
                  )}
                  {reincidente && (
                    <span
                      className="rounded bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-400"
                      title="Total de mensagens já sinalizadas deste autor"
                    >
                      {m.total_do_autor}ª sinalização
                    </span>
                  )}
                  <span className="text-bat-text-muted">→</span>
                  <span className="font-semibold text-bat-text">{m.destinatario_apelido}</span>
                </div>

                {/* Linha 3: o que foi escrito */}
                <blockquote className="rounded-lg border-l-2 border-bat-border bg-bat-bg-card px-3 py-2 text-xs leading-relaxed text-bat-text">
                  {m.conteudo_texto || (
                    <span className="italic text-bat-text-muted">
                      {m.tipo === "audio" ? "🎤 Mensagem de voz" : "📷 Imagem"} — sem texto
                    </span>
                  )}
                  {m.tem_midia && m.conteudo_texto && (
                    <span className="mt-1 block text-[10px] text-bat-text-muted">
                      + anexo de mídia
                    </span>
                  )}
                </blockquote>

                {(m.termos_detectados ?? []).length > 0 && (
                  <p className="mt-1.5 text-[10px] text-bat-text-muted">
                    Casou com: {(m.termos_detectados ?? []).join(" · ")}
                  </p>
                )}

                {/* Linha 4: decisão */}
                {m.revisada_em ? (
                  <p className="mt-3 text-[11px] text-bat-text-muted">
                    ✓ Revisada em {new Date(m.revisada_em).toLocaleDateString("pt-BR")} ·{" "}
                    <strong className="text-bat-text-secondary">
                      {DECISOES.find((d) => d.valor === m.decisao_moderacao)?.rotulo ??
                        m.decisao_moderacao}
                    </strong>
                  </p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {DECISOES.map((d) => (
                      <button
                        key={d.valor}
                        onClick={() => decidir(m.mensagem_id, d.valor)}
                        disabled={salvando === m.mensagem_id}
                        title={d.desc}
                        className="cursor-pointer rounded-lg border border-bat-border bg-bat-bg-secondary px-2.5 py-1 text-[11px] text-bat-text-secondary transition-all hover:border-bat-gold-400/40 hover:text-bat-text disabled:opacity-40"
                      >
                        {d.rotulo}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Contador({
  rotulo,
  valor,
  cor,
}: {
  rotulo: string;
  valor: number;
  cor?: string;
}) {
  return (
    <div className="rounded-xl border border-bat-border bg-bat-bg-primary px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-bat-text-muted">
        {rotulo}
      </p>
      <p
        className="heading text-2xl font-extrabold"
        style={{ color: cor ?? undefined }}
      >
        {valor}
      </p>
    </div>
  );
}
