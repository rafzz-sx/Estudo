"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";

interface FeedbackItem {
  id: string;
  tipo: "depoimento" | "opiniao" | "ideia" | "bug";
  nota: number | null;
  mensagem: string;
  aprovado_para_vitrine: boolean;
  lido_por_admin: boolean;
  criado_em: string;
}

const TIPOS_FEEDBACK = [
  {
    id: "depoimento",
    icone: "🌟",
    titulo: "Depoimento de Aluno",
    subtitulo: "Compartilhe sua jornada e concorra ao destaque na vitrine oficial da BatCaverna",
  },
  {
    id: "opiniao",
    icone: "💬",
    titulo: "Opinião Geral",
    subtitulo: "Conte o que você está achando da usabilidade, materiais e funcionalidades",
  },
  {
    id: "ideia",
    icone: "💡",
    titulo: "Sugestão / Ideia",
    subtitulo: "O que podemos criar ou aprimorar para turbinar seus estudos?",
  },
  {
    id: "bug",
    icone: "🐛",
    titulo: "Reportar Problema",
    subtitulo: "Encontrou alguma inconsistência, questão com erro ou travamento?",
  },
];

const AREAS_PLATAFORMA = [
  { id: "geral", label: "Geral / Plataforma", icone: "🦇" },
  { id: "questoes", label: "Banco de Questões", icone: "🎯" },
  { id: "simulados", label: "Simulados & Cronômetro", icone: "⏱️" },
  { id: "caderno", label: "Caderno de Erros", icone: "📓" },
  { id: "musica", label: "Arsenal de Música", icone: "🎧" },
  { id: "chat", label: "Chat & Amigos", icone: "💬" },
  { id: "mobile", label: "App Mobile / Performance", icone: "📱" },
];

export default function FeedbackPage() {
  const user = useAuthStore((state) => state.user);

  const [abaAtiva, setAbaAtiva] = useState<"novo" | "historico">("novo");
  const [tipo, setTipo] = useState<"depoimento" | "opiniao" | "ideia" | "bug">("depoimento");
  const [areaSelecionada, setAreaSelecionada] = useState("geral");
  const [nota, setNota] = useState(5);
  const [hoverNota, setHoverNota] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [autorizaVitrine, setAutorizaVitrine] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Histórico pessoal
  const [meusFeedbacks, setMeusFeedbacks] = useState<FeedbackItem[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  const carregarHistorico = useCallback(async () => {
    setCarregandoHistorico(true);
    try {
      const res = await fetchWithAuth("/api/feedback?meus=1");
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMeusFeedbacks(json.data);
      }
    } catch (e) {
      console.warn("Erro ao carregar histórico de feedback:", e);
    } finally {
      setCarregandoHistorico(false);
    }
  }, []);

  useEffect(() => {
    carregarHistorico();
  }, [carregarHistorico]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const texto = mensagem.trim();
    if (texto.length < 10) {
      setErro("Por favor, escreva uma mensagem com pelo menos 10 caracteres.");
      return;
    }

    // Monta texto com tag de área se não for geral
    const textoFinal =
      areaSelecionada !== "geral"
        ? `[${AREAS_PLATAFORMA.find((a) => a.id === areaSelecionada)?.label || areaSelecionada}] ${texto}`
        : texto;

    setEnviando(true);
    try {
      const res = await fetchWithAuth("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          tipo,
          nota: tipo === "bug" ? null : nota,
          mensagem: textoFinal,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEnviado(true);
        setMensagem("");
        carregarHistorico();
      } else {
        setErro(json.error || "Não foi possível enviar o feedback. Tente novamente.");
      }
    } catch {
      setErro("Erro de conexão ao enviar feedback.");
    } finally {
      setEnviando(false);
    }
  };

  const resetForm = () => {
    setEnviado(false);
    setMensagem("");
    setErro(null);
    setNota(5);
    setAreaSelecionada("geral");
  };

  const getTipoFormatado = (t: string) => {
    const item = TIPOS_FEEDBACK.find((x) => x.id === t);
    return {
      titulo: item?.titulo || "Feedback",
      icone: item?.icone || "💬",
    };
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* ═══ CABEÇALHO HERO ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bat-gold-400/10 border border-bat-gold-400/30 text-bat-gold-400 text-xs font-bold tracking-wide uppercase">
            <span>🛡️</span>
            <span>Central de Voz & Melhoria Contínua</span>
          </div>

          <h1 className="heading text-2xl sm:text-4xl text-bat-text font-black tracking-tight">
            Sua Voz Forja a <span className="text-bat-gold-400">BatCaverna</span>
          </h1>

          <p className="text-sm sm:text-base text-bat-text-secondary max-w-2xl leading-relaxed">
            Aqui sua opinião chega diretamente aos criadores da plataforma. Compartilhe seu depoimento para
            inspirar outros soldados na vitrine oficial ou aponte o que precisa ser ajustado.
          </p>

          {/* Abas de Navegação */}
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={() => setAbaAtiva("novo")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                abaAtiva === "novo"
                  ? "bg-bat-gold-400 text-black shadow-lg shadow-bat-gold-400/20"
                  : "bg-bat-bg-secondary text-bat-text-muted hover:text-bat-text hover:bg-bat-bg-tertiary border border-bat-border"
              }`}
            >
              <span>✍️</span>
              <span>Enviar Feedback</span>
            </button>

            <button
              onClick={() => setAbaAtiva("historico")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
                abaAtiva === "historico"
                  ? "bg-bat-gold-400 text-black shadow-lg shadow-bat-gold-400/20"
                  : "bg-bat-bg-secondary text-bat-text-muted hover:text-bat-text hover:bg-bat-bg-tertiary border border-bat-border"
              }`}
            >
              <span>📜</span>
              <span>Meus Envios</span>
              {meusFeedbacks.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                    abaAtiva === "historico"
                      ? "bg-black/20 text-black"
                      : "bg-bat-gold-400/20 text-bat-gold-400"
                  }`}
                >
                  {meusFeedbacks.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Efeito luminoso de fundo */}
        <div className="absolute right-0 top-0 bottom-0 w-2/5 bg-gradient-to-l from-bat-gold-400/10 via-bat-gold-400/5 to-transparent pointer-events-none" />
      </div>

      {/* ═══ ABA: MEUS ENVIOS & HISTÓRICO ═══ */}
      {abaAtiva === "historico" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="heading text-base font-bold text-bat-text flex items-center gap-2">
              <span>📋</span>
              <span>Acompanhamento dos Seus Feedbacks</span>
            </h2>
            <button
              onClick={carregarHistorico}
              disabled={carregandoHistorico}
              className="text-xs text-bat-gold-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>🔄</span>
              <span>{carregandoHistorico ? "Atualizando..." : "Atualizar Status"}</span>
            </button>
          </div>

          {carregandoHistorico && meusFeedbacks.length === 0 ? (
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-12 text-center text-bat-text-muted text-sm">
              Carregando seus feedbacks enviados...
            </div>
          ) : meusFeedbacks.length === 0 ? (
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-12 text-center space-y-4">
              <span className="text-4xl block">📬</span>
              <h3 className="heading text-lg font-bold text-bat-text">Nenhum feedback enviado ainda</h3>
              <p className="text-xs sm:text-sm text-bat-text-secondary max-w-md mx-auto leading-relaxed">
                Você ainda não enviou nenhum comentário, depoimento ou reporte. Sua opinião é essencial para
                evoluirmos a caverna!
              </p>
              <button
                onClick={() => setAbaAtiva("novo")}
                className="btn-primary py-2.5 px-6 text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>✍️</span>
                <span>Escrever Primeiro Feedback</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {meusFeedbacks.map((fb) => {
                const info = getTipoFormatado(fb.tipo);
                return (
                  <div
                    key={fb.id}
                    className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 space-y-3 hover:border-bat-gold-400/30 transition-all shadow-md"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl p-2 rounded-xl bg-bat-bg-secondary border border-bat-border">
                          {info.icone}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-bat-text">{info.titulo}</span>
                          <span className="text-[11px] text-bat-text-muted block">
                            Enviado em {new Date(fb.criado_em).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {fb.aprovado_para_vitrine ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,197,24,0.2)]">
                            <span>⭐</span>
                            <span>Aprovado na Vitrine Pública</span>
                          </span>
                        ) : fb.lido_por_admin ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                            <span>👀</span>
                            <span>Analisado pela Moderação</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                            <span>⏳</span>
                            <span>Recebido · Na Fila de Análise</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Estrelas se houver */}
                    {fb.nota && (
                      <div className="flex items-center gap-1.5 text-bat-gold-400 text-sm">
                        {Array.from({ length: fb.nota }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                        <span className="text-xs text-bat-text-muted font-mono ml-1 font-semibold">
                          ({fb.nota}/5)
                        </span>
                      </div>
                    )}

                    {/* Mensagem */}
                    <div className="p-3.5 rounded-xl bg-bat-bg-secondary/60 border border-bat-border/50 text-xs sm:text-sm text-bat-text leading-relaxed whitespace-pre-wrap">
                      {fb.mensagem}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ ABA: NOVO FEEDBACK ═══ */}
      {abaAtiva === "novo" && (
        <>
          {enviado ? (
            <div className="bg-bat-bg-card border border-bat-gold-400/40 rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-2xl animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-bat-gold-400/20 text-bat-gold-400 text-4xl flex items-center justify-center mx-auto border-2 border-bat-gold-400/60 shadow-[0_0_20px_rgba(245,197,24,0.3)]">
                ✓
              </div>
              <h2 className="heading text-2xl text-bat-text font-black">
                Muito obrigado, Soldado {user?.apelido || user?.nome || ""}!
              </h2>
              <p className="text-sm text-bat-text-secondary max-w-lg mx-auto leading-relaxed">
                Seu feedback foi registrado e indexado com sucesso. Nossos administradores analisam
                cada retorno com máxima seriedade para lapidar sua experiência até a aprovação.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <button
                  onClick={resetForm}
                  className="px-6 py-3 rounded-xl border border-bat-border text-bat-text hover:border-bat-gold-400/40 text-xs sm:text-sm font-bold transition-all cursor-pointer"
                >
                  Enviar Outro Feedback
                </button>
                <button
                  onClick={() => setAbaAtiva("historico")}
                  className="btn-primary px-6 py-3 text-xs sm:text-sm font-bold cursor-pointer"
                >
                  Ver Meus Envios 📜
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. SELETOR DE TIPO */}
              <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
                <label className="heading text-xs uppercase tracking-wider text-bat-text-muted font-bold block">
                  1. Qual o foco principal do feedback?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {TIPOS_FEEDBACK.map((t) => {
                    const ativo = tipo === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTipo(t.id as any)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          ativo
                            ? "bg-bat-gold-400/10 border-bat-gold-400 text-bat-text shadow-[0_0_16px_rgba(245,197,24,0.18)]"
                            : "bg-bat-bg-secondary/60 border-bat-border text-bat-text-muted hover:border-bat-gold-400/30 hover:text-bat-text"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="text-2xl">{t.icone}</span>
                          <span className="font-bold text-sm text-bat-text">{t.titulo}</span>
                        </div>
                        <p className="text-xs text-bat-text-secondary leading-relaxed pl-8">
                          {t.subtitulo}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. ÁREA DA PLATAFORMA (TAGS) */}
              <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-3">
                <label className="heading text-xs uppercase tracking-wider text-bat-text-muted font-bold block">
                  2. A qual área da plataforma isso se refere?
                </label>
                <div className="flex flex-wrap gap-2">
                  {AREAS_PLATAFORMA.map((area) => {
                    const selecionada = areaSelecionada === area.id;
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => setAreaSelecionada(area.id)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border ${
                          selecionada
                            ? "bg-bat-gold-400/20 border-bat-gold-400 text-bat-gold-400 shadow-sm"
                            : "bg-bat-bg-secondary/60 border-bat-border text-bat-text-muted hover:text-bat-text hover:border-bat-gold-400/30"
                        }`}
                      >
                        <span>{area.icone}</span>
                        <span>{area.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. AVALIAÇÃO EM ESTRELAS (SE NÃO FOR BUG) */}
              {tipo !== "bug" && (
                <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="heading text-xs uppercase tracking-wider text-bat-text-muted font-bold block">
                      3. Sua nota para a experiência na plataforma
                    </label>
                    <span className="text-xs font-bold text-bat-gold-400 font-mono">
                      {nota === 5 && "⭐ 5/5 · Excelente / Impecável"}
                      {nota === 4 && "⭐ 4/5 · Muito Bom"}
                      {nota === 3 && "⭐ 3/5 · Bom / Satisfatório"}
                      {nota === 2 && "⭐ 2/5 · Regular"}
                      {nota === 1 && "⭐ 1/5 · Precisa Melhorar"}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-2" onMouseLeave={() => setHoverNota(null)}>
                      {[1, 2, 3, 4, 5].map((estrela) => {
                        const preenchida = (hoverNota !== null ? hoverNota : nota) >= estrela;
                        return (
                          <button
                            key={estrela}
                            type="button"
                            onMouseEnter={() => setHoverNota(estrela)}
                            onClick={() => setNota(estrela)}
                            className="text-3xl sm:text-4xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                            aria-label={`Nota ${estrela}`}
                          >
                            <span
                              className={
                                preenchida
                                  ? "text-bat-gold-400 drop-shadow-[0_0_10px_rgba(245,197,24,0.6)]"
                                  : "text-bat-border/60"
                              }
                            >
                              ★
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. MENSAGEM / DEPOIMENTO */}
              <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-3">
                <div className="flex justify-between items-center">
                  <label className="heading text-xs uppercase tracking-wider text-bat-text-muted font-bold block">
                    {tipo === "bug" ? "3. Descreva a falha encontrada" : "4. Sua mensagem detalhada"}
                  </label>
                  <span className="text-[11px] text-bat-text-muted font-mono">
                    {mensagem.length} / 4000 caracteres
                  </span>
                </div>

                <textarea
                  rows={5}
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value.slice(0, 4000))}
                  placeholder={
                    tipo === "depoimento"
                      ? "Ex: A BatCaverna transformou meu ritmo de estudos para a ESA. O banco de questões com resoluções comentadas e o simulado me deram a confiança que faltava..."
                      : tipo === "bug"
                      ? "Ex: Ao abrir o simulado pelo celular na questão 14, o botão de avançar ficou sobreposto ao teclado..."
                      : tipo === "ideia"
                      ? "Ex: Seria excelente se tivéssemos um botão de modo foco com timer Pomodoro integrado ao arsenal de música..."
                      : "Escreva suas considerações com franqueza..."
                  }
                  className="w-full bg-bat-bg-primary border border-bat-border rounded-xl p-4 text-sm text-bat-text placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400 transition-colors resize-y min-h-[130px]"
                />

                {tipo === "depoimento" && (
                  <label className="flex items-center gap-3 pt-2 text-xs text-bat-text-secondary cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autorizaVitrine}
                      onChange={(e) => setAutorizaVitrine(e.target.checked)}
                      className="rounded border-bat-border text-bat-gold-400 focus:ring-bat-gold-400"
                    />
                    <span>
                      Autorizo o uso do meu depoimento, nota e apelido (
                      <strong className="text-bat-gold-400">{user?.apelido || user?.nome || "Soldado"}</strong>
                      ) na vitrine pública da BatCaverna.
                    </span>
                  </label>
                )}
              </div>

              {/* ═══ PRÉVIA EM TEMPO REAL DA VITRINE (SE FOR DEPOIMENTO) ═══ */}
              {tipo === "depoimento" && (
                <div className="bg-bat-bg-secondary/40 border border-bat-border/80 rounded-2xl p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-bat-text-muted uppercase tracking-wider flex items-center gap-1.5">
                      <span>👁️</span>
                      <span>Prévia em Tempo Real · Como aparecerá na Vitrine Oficial</span>
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-bat-gold-400/20 text-bat-gold-400 font-bold border border-bat-gold-400/30">
                      Vitrine Oficial
                    </span>
                  </div>

                  <div className="p-5 rounded-2xl bg-bat-bg-card border border-bat-gold-400/30 shadow-[0_0_16px_rgba(245,197,24,0.08)] space-y-3 relative overflow-hidden">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-bat-bg-tertiary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 text-base overflow-hidden shrink-0">
                        {user?.avatar_url ? (
                          <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (user?.apelido || user?.nome || "S")[0]?.toUpperCase()
                        )}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-bat-text flex items-center gap-1.5">
                          <span>{user?.apelido || user?.nome || "Soldado BatCaverna"}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-bat-bg-primary text-bat-gold-400 border border-bat-gold-400/20 font-bold">
                            Aluno Verificado 🦇
                          </span>
                        </h4>
                        <div className="flex items-center gap-1 text-bat-gold-400 text-xs mt-0.5">
                          {Array.from({ length: nota }).map((_, i) => (
                            <span key={i}>★</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-bat-text-secondary italic leading-relaxed whitespace-pre-wrap">
                      "{mensagem.trim() || "Seu depoimento em destaque aqui..."}"
                    </p>
                  </div>
                </div>
              )}

              {/* Erro */}
              {erro && (
                <div className="p-4 rounded-xl bg-bat-error/10 border border-bat-error/30 text-bat-error text-xs font-semibold">
                  ⚠️ {erro}
                </div>
              )}

              {/* Ações */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/dashboard"
                  className="px-5 py-2.5 rounded-xl border border-bat-border text-bat-text-muted hover:text-bat-text text-sm font-semibold transition-colors no-underline"
                >
                  Cancelar
                </Link>
                <button
                  type="submit"
                  disabled={enviando || mensagem.trim().length < 10}
                  className="btn-primary py-3 px-8 text-sm font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-bat-gold-400/20"
                >
                  {enviando ? "Enviando..." : "Enviar Feedback à Caverna 🦇"}
                </button>
              </div>
            </form>
          )}

          {/* Card explicativo */}
          <div className="bg-bat-bg-card/40 border border-bat-border/60 rounded-2xl p-5 text-xs text-bat-text-muted space-y-2">
            <p className="font-bold text-bat-text flex items-center gap-2">
              <span>🛡️</span>
              <span>Transparência e Moderação BatCaverna</span>
            </p>
            <p className="leading-relaxed">
              Todos os relatos enviados são avaliados pelo nosso time. Depoimentos autênticos são exibidos
              na página inicial como inspiração aos novos alunos, e relatos de problemas técnicos são
              imediatamente encaminhados para a equipe de desenvolvimento para correção.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
