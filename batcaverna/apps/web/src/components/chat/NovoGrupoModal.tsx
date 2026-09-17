"use client";

import { useState } from "react";

export interface AmigoSelecionavel {
  id: string;
  apelido: string;
  avatar_url?: string | null;
  selecionado: boolean;
}

interface NovoGrupoModalProps {
  aberto: boolean;
  onClose: () => void;
  amigos: AmigoSelecionavel[];
  onToggleAmigo: (id: string) => void;
  onCriarGrupo: (nome: string) => Promise<void>;
  criando: boolean;
}

export function NovoGrupoModal({
  aberto,
  onClose,
  amigos,
  onToggleAmigo,
  onCriarGrupo,
  criando,
}: NovoGrupoModalProps) {
  const [nomeGrupo, setNomeGrupo] = useState("");

  if (!aberto) return null;

  const totalSelecionados = amigos.filter((a) => a.selecionado).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomeGrupo.trim() || totalSelecionados === 0 || criando) return;
    await onCriarGrupo(nomeGrupo.trim());
    setNomeGrupo("");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-x-4 top-[10%] sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[420px] max-h-[80vh] overflow-y-auto bg-bat-bg-card border border-bat-border rounded-2xl shadow-2xl z-50 p-6 animate-in fade-in-50 zoom-in-95">
        <div className="flex items-center justify-between mb-4">
          <h3 className="heading text-lg text-bat-text font-bold">⚔️ Criar Grupo de Estudo</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-bat-bg-secondary text-bat-text-muted hover:text-bat-text flex items-center justify-center text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-bat-text-secondary font-semibold mb-1.5">
              Nome do Grupo
            </label>
            <input
              type="text"
              value={nomeGrupo}
              onChange={(e) => setNomeGrupo(e.target.value)}
              placeholder="Ex: Squad EEAR 2026"
              maxLength={100}
              className="w-full bg-bat-bg-primary border border-bat-border rounded-xl px-4 py-2.5 text-sm text-bat-text placeholder:text-bat-text-muted focus:border-bat-gold-400/60 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-bat-text-secondary font-semibold mb-1.5">
              Selecionar Amigos ({totalSelecionados} selecionados)
            </label>
            {amigos.length === 0 ? (
              <p className="text-xs text-bat-text-muted py-4 text-center">
                Você ainda não tem amigos aceitos. Adicione amigos primeiro!
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto custom-scrollbar">
                {amigos.map((amigo) => (
                  <label
                    key={amigo.id}
                    className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all border ${
                      amigo.selecionado
                        ? "bg-bat-gold-400/10 border-bat-gold-400/30"
                        : "bg-bat-bg-secondary border-transparent hover:border-bat-border"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={amigo.selecionado}
                      onChange={() => onToggleAmigo(amigo.id)}
                      className="accent-[#F5C518] w-4 h-4"
                    />
                    <span className="text-sm text-bat-text font-medium">{amigo.apelido}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={criando || !nomeGrupo.trim() || totalSelecionados === 0}
            className="w-full btn-primary py-3 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {criando ? "Criando..." : `⚔️ Criar Grupo (${totalSelecionados + 1} membros)`}
          </button>
        </form>
      </div>
    </>
  );
}
