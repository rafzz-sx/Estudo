"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";

const TIPOS_FEEDBACK = [
  {
    id: "depoimento",
    icone: "🌟",
    titulo: "Depoimento",
    subtitulo: "Compartilhe sua experiência e apareça na página inicial da Caverna",
  },
  {
    id: "opiniao",
    icone: "💬",
    titulo: "Opinião Geral",
    subtitulo: "Conte o que você está achando da plataforma",
  },
  {
    id: "ideia",
    icone: "💡",
    titulo: "Sugestão / Ideia",
    subtitulo: "O que você gostaria de ver implementado?",
  },
  {
    id: "bug",
    icone: "🐛",
    titulo: "Reportar Problema",
    subtitulo: "Encontrou alguma falha ou inconsistência?",
  },
];

export default function FeedbackPage() {
  const user = useAuthStore((state) => state.user);

  const [tipo, setTipo] = useState("depoimento");
  const [nota, setNota] = useState(5);
  const [hoverNota, setHoverNota] = useState<number | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [autorizaVitrine, setAutorizaVitrine] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const texto = mensagem.trim();
    if (texto.length < 10) {
      setErro("Por favor, escreva uma mensagem com pelo menos 10 caracteres.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetchWithAuth("/api/feedback", {
        method: "POST",
        body: JSON.stringify({
          tipo,
          nota,
          mensagem: texto,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setEnviado(true);
        setMensagem("");
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
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* ═══ CABEÇALHO ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🦇</span>
            <h1 className="heading text-2xl sm:text-3xl text-bat-text font-bold">
              Feedback & <span className="text-bat-gold-400">Depoimentos</span>
            </h1>
          </div>
          <p className="text-sm text-bat-text-secondary max-w-xl leading-relaxed">
            Sua opinião forja as próximas melhorias da BatCaverna. Depoimentos com avaliação em estrelas
            podem ser selecionados pelos administradores para a vitrine pública da plataforma!
          </p>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-bat-gold-400/10 to-transparent pointer-events-none" />
      </div>

      {/* ═══ FEEDBACK ENVIADO COM SUCESSO ═══ */}
      {enviado ? (
        <div className="bg-bat-bg-card border border-bat-gold-400/30 rounded-2xl p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-bat-gold-400/20 text-bat-gold-400 text-3xl flex items-center justify-center mx-auto border border-bat-gold-400/40">
            ✓
          </div>
          <h2 className="heading text-xl text-bat-text font-bold">
            Muito obrigado, {user?.apelido || user?.nome || "Soldado"}!
          </h2>
          <p className="text-sm text-bat-text-secondary max-w-md mx-auto leading-relaxed">
            Seu feedback foi registrado no sistema. Se for um depoimento e for aprovado pelos administradores,
            ele aparecerá em destaque na página inicial da BatCaverna!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-xl border border-bat-border text-bat-text hover:border-bat-gold-400/40 text-sm font-semibold transition-all cursor-pointer"
            >
              Enviar outro feedback
            </button>
            <Link
              href="/dashboard"
              className="btn-primary px-6 py-2.5 text-sm font-bold no-underline inline-block"
            >
              Voltar ao Plano de Hoje ⚡
            </Link>
          </div>
        </div>
      ) : (
        /* ═══ FORMULÁRIO ═══ */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seletor de Tipo */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
            <label className="heading text-xs uppercase tracking-wider text-bat-text-muted font-bold block">
              1. Qual o tipo de feedback?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIPOS_FEEDBACK.map((t) => {
                const ativo = tipo === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipo(t.id)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      ativo
                        ? "bg-bat-gold-400/10 border-bat-gold-400 text-bat-text shadow-[0_0_12px_rgba(245,197,24,0.15)]"
                        : "bg-bat-bg-secondary/60 border-bat-border text-bat-text-muted hover:border-bat-gold-400/30 hover:text-bat-text"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 mb-1">
                      <span className="text-xl">{t.icone}</span>
                      <span className="font-bold text-sm text-bat-text">{t.titulo}</span>
                    </div>
                    <p className="text-xs text-bat-text-secondary leading-relaxed pl-7">
                      {t.subtitulo}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Avaliação em Estrelas (se depoimento ou opinião) */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-3">
            <label className="heading text-xs uppercase tracking-wider text-bat-text-muted font-bold block">
              2. Sua nota geral para a plataforma
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverNota(null)}>
                {[1, 2, 3, 4, 5].map((estrela) => {
                  const preenchida = (hoverNota !== null ? hoverNota : nota) >= estrela;
                  return (
                    <button
                      key={estrela}
                      type="button"
                      onMouseEnter={() => setHoverNota(estrela)}
                      onClick={() => setNota(estrela)}
                      className="text-3xl transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                      aria-label={`Nota ${estrela}`}
                    >
                      <span className={preenchida ? "text-bat-gold-400 drop-shadow-[0_0_8px_rgba(245,197,24,0.5)]" : "text-bat-border"}>
                        ★
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="text-sm font-bold text-bat-gold-400">
                {nota === 5 && "Excelente! (5/5)"}
                {nota === 4 && "Muito bom (4/5)"}
                {nota === 3 && "Bom (3/5)"}
                {nota === 2 && "Regular (2/5)"}
                {nota === 1 && "Precisa melhorar (1/5)"}
              </span>
            </div>
          </div>

          {/* Mensagem */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-3">
            <div className="flex justify-between items-center">
              <label className="heading text-xs uppercase tracking-wider text-bat-text-muted font-bold block">
                3. Sua mensagem / depoimento
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
                  ? "Conte como a BatCaverna te ajuda na sua preparação militar ou no ENEM..."
                  : tipo === "bug"
                  ? "Descreva onde o problema aconteceu e o que você estava fazendo..."
                  : tipo === "ideia"
                  ? "Explique como sua sugestão tornaria os estudos melhores..."
                  : "Escreva suas observações gerais..."
              }
              className="w-full bg-bat-bg-primary border border-bat-border rounded-xl p-4 text-sm text-bat-text placeholder-bat-text-muted focus:outline-none focus:border-bat-gold-400 transition-colors resize-y min-h-[120px]"
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
                  Autorizo o uso do meu depoimento, nota e nome de guerra (<strong>{user?.apelido || user?.nome || "Soldado"}</strong>) na página pública da BatCaverna.
                </span>
              </label>
            )}
          </div>

          {/* Erro */}
          {erro && (
            <div className="p-4 rounded-xl bg-bat-error/10 border border-bat-error/30 text-bat-error text-xs font-semibold">
              ⚠️ {erro}
            </div>
          )}

          {/* Botão de Envio */}
          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-bat-border text-bat-text-muted hover:text-bat-text text-sm font-semibold transition-colors no-underline"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={enviando || mensagem.trim().length < 10}
              className="btn-primary py-3 px-8 text-sm font-bold disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {enviando ? "Enviando..." : "Enviar Feedback 🦇"}
            </button>
          </div>
        </form>
      )}

      {/* ═══ CARD EXPLICATIVO DA VITRINE ═══ */}
      <div className="bg-bat-bg-secondary/40 border border-bat-border/60 rounded-2xl p-5 text-xs text-bat-text-muted space-y-2">
        <p className="font-bold text-bat-text flex items-center gap-2">
          <span>🛡️</span>
          <span>Como funciona a vitrine de depoimentos?</span>
        </p>
        <p className="leading-relaxed">
          Para garantir a segurança e a idoneidade da plataforma, os depoimentos enviados passam por moderação dos
          administradores da BatCaverna. Somente comentários construtivos e avaliações reais de soldados cadastrados
          são aprovados para a página inicial.
        </p>
      </div>
    </div>
  );
}
