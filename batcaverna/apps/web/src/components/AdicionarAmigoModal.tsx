"use client";

import { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdicionarAmigoModal({ isOpen, onClose, onSuccess }: Props) {
  const [apelido, setApelido] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: "sucesso" | "erro"; texto: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apelido.trim()) return;

    setLoading(true);
    setMensagem(null);

    try {
      const res = await fetch("/api/amizades/solicitar-por-apelido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apelido: apelido.trim() }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMensagem({
          tipo: "sucesso",
          texto: json.message || `Solicitação enviada com sucesso para ${apelido}!`,
        });
        setApelido("");
        if (onSuccess) onSuccess();
      } else {
        setMensagem({
          tipo: "erro",
          texto: json.error || "Não foi possível enviar a solicitação.",
        });
      }
    } catch {
      setMensagem({
        tipo: "erro",
        texto: "Erro de conexão ao enviar solicitação.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-bat-bg-card border-2 border-bat-gold-400/50 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-bat-bg-secondary text-bat-text-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-bat-gold-400/15 border border-bat-gold-400/30 flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <h3 className="heading text-lg font-bold text-bat-text">Adicionar Amigo</h3>
            <p className="text-xs text-bat-text-secondary">
              Conecte-se com soldados digitando o apelido de combate
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-bat-text-muted uppercase tracking-wider block mb-1.5">
              Apelido (Nome de Guerra)
            </label>
            <div className="relative">
              <input
                type="text"
                value={apelido}
                onChange={(e) => {
                  setApelido(e.target.value);
                  setMensagem(null);
                }}
                placeholder="Ex: Caveira99, SoldadoSilva..."
                className="input-field text-sm font-mono text-bat-gold-400 pl-10"
                autoFocus
                required
              />
              <span className="absolute left-3.5 top-3 text-bat-text-muted text-sm">🦇</span>
            </div>
            <p className="text-[11px] text-bat-text-muted mt-1.5 leading-relaxed">
              Dica: O apelido pode ser consultado no perfil do soldado ou informado diretamente por ele.
            </p>
          </div>

          {/* Feedback */}
          {mensagem && (
            <div
              className={`p-3 rounded-xl text-xs font-medium ${
                mensagem.tipo === "sucesso"
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/15 border border-red-500/30 text-red-300"
              }`}
            >
              {mensagem.tipo === "sucesso" ? "✓ " : "⚠️ "}
              {mensagem.texto}
            </div>
          )}

          <div className="flex gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-bat-bg-secondary border border-bat-border text-xs font-semibold text-bat-text-muted hover:text-bat-text transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !apelido.trim()}
              className="btn-primary flex-1 py-2.5 px-5 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>{loading ? "Enviando..." : "Enviar Solicitação"}</span>
              <span>⚡</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
