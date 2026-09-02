"use client";

import { useState, useEffect } from "react";

interface SoldadoEncontrado {
  id: string;
  nome: string | null;
  apelido: string;
  avatar_url: string | null;
  nivel_atual: number;
  titulo_nivel: string;
  concursos: string[];
  amizade_status: "aceita" | "pendente" | "bloqueada" | null;
  amizade_id: string | null;
  sou_solicitante: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AdicionarAmigoModal({ isOpen, onClose, onSuccess }: Props) {
  const [busca, setBusca] = useState("");
  const [resultados, setResultados] = useState<SoldadoEncontrado[]>([]);
  const [loading, setLoading] = useState(false);
  const [enviandoPara, setEnviandoPara] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Busca com debounce conforme o usuário digita
  useEffect(() => {
    if (!isOpen) {
      setBusca("");
      setResultados([]);
      setMensagemSucesso(null);
      setErro(null);
      return;
    }

    const termo = busca.trim();
    if (termo.length < 2) {
      setResultados([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/amizades/buscar-soldados?apelido=${encodeURIComponent(termo)}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success) {
            setResultados(json.data || []);
          }
        }
      } catch {
        setErro("Falha ao buscar soldados. Verifique sua conexão.");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [busca, isOpen]);

  const handleEnviarSolicitacao = async (soldado: SoldadoEncontrado) => {
    setEnviandoPara(soldado.id);
    setErro(null);
    setMensagemSucesso(null);

    try {
      const res = await fetch("/api/amizades/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id_destinatario: soldado.id }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setMensagemSucesso(`Solicitação de amizade enviada para ${soldado.apelido}! ⚡`);
        setResultados((prev) =>
          prev.map((s) =>
            s.id === soldado.id
              ? { ...s, amizade_status: "pendente", sou_solicitante: true }
              : s
          )
        );
        if (onSuccess) onSuccess();
      } else {
        setErro(json.error || "Não foi possível enviar a solicitação.");
      }
    } catch {
      setErro("Erro ao enviar solicitação.");
    } finally {
      setEnviandoPara(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-lg bg-bat-bg-card border border-bat-border rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-bat-bg-secondary text-bat-text-muted hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          ✕
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3.5 mb-5 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-bat-gold-400/15 border border-bat-gold-400/30 flex items-center justify-center text-2xl flex-shrink-0">
            👥
          </div>
          <div>
            <h3 className="heading text-xl font-bold text-bat-text">Adicionar Amigo</h3>
            <p className="text-xs text-bat-text-secondary">
              Localize o soldado pelo apelido para convidá-lo ao seu esquadrão
            </p>
          </div>
        </div>

        {/* Input de Busca */}
        <div className="mb-4">
          <label className="text-xs font-bold text-bat-text-muted uppercase tracking-wider block mb-1.5">
            Buscar por Apelido ou Nome
          </label>
          <div className="relative">
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Digite o apelido (ex: Caveira, Silva, Lobo)..."
              className="w-full bg-bat-bg-primary border border-bat-border rounded-2xl px-4 py-3 pl-11 text-sm text-bat-text placeholder:text-bat-text-muted focus:border-bat-gold-400/60 focus:outline-none transition-all font-mono"
              autoFocus
            />
            <span className="absolute left-4 top-3.5 text-sm text-bat-text-muted">🔍</span>
            {loading && (
              <span className="absolute right-4 top-3.5 text-xs text-bat-gold-400 animate-spin">
                ⏳
              </span>
            )}
          </div>
          <p className="text-[11px] text-bat-text-muted mt-1.5">
            Dica: Digite pelo menos 2 caracteres para listar todos os combatentes com esse apelido.
          </p>
        </div>

        {/* Feedback de Status */}
        {mensagemSucesso && (
          <div className="mb-3 p-3 rounded-xl text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 animate-in fade-in">
            ✓ {mensagemSucesso}
          </div>
        )}
        {erro && (
          <div className="mb-3 p-3 rounded-xl text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-300 animate-in fade-in">
            ⚠️ {erro}
          </div>
        )}

        {/* Lista de Resultados de Soldados */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[160px] max-h-[300px]">
          {busca.trim().length < 2 ? (
            <div className="py-12 text-center text-bat-text-muted text-xs">
              <span className="text-3xl block mb-2 opacity-60">🦇</span>
              Digite o apelido acima para ver a lista de soldados disponíveis.
            </div>
          ) : loading ? (
            <div className="py-12 text-center text-bat-text-muted text-xs">
              <span className="text-2xl block mb-2 animate-bounce">⚡</span>
              Buscando soldados no banco da BatCaverna...
            </div>
          ) : resultados.length === 0 ? (
            <div className="py-10 text-center text-bat-text-muted text-xs bg-bat-bg-primary/50 rounded-2xl border border-bat-border/40 p-6">
              <span className="text-3xl block mb-2">🔍</span>
              Nenhum soldado encontrado com o termo "<span className="text-bat-text font-bold">{busca}</span>".
            </div>
          ) : (
            resultados.map((soldado) => {
              const jaEhAmigo = soldado.amizade_status === "aceita";
              const pendente = soldado.amizade_status === "pendente";
              const enviando = enviandoPara === soldado.id;

              return (
                <div
                  key={soldado.id}
                  className="p-3.5 rounded-2xl bg-bat-bg-primary border border-bat-border/80 hover:border-bat-gold-400/40 transition-all flex items-center justify-between gap-3"
                >
                  {/* Foto e Info */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-bat-bg-secondary border border-bat-border flex items-center justify-center font-bold text-bat-gold-400 overflow-hidden flex-shrink-0 text-base shadow-inner">
                      {soldado.avatar_url ? (
                        <img src={soldado.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        soldado.apelido?.[0]?.toUpperCase() || "S"
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-bat-text truncate">
                          {soldado.apelido}
                        </span>
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/20">
                          Nv. {soldado.nivel_atual}
                        </span>
                      </div>
                      <p className="text-[11px] text-bat-text-muted truncate">
                        {soldado.nome ? `${soldado.nome} • ` : ""}{soldado.titulo_nivel}
                      </p>
                      {soldado.concursos.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {soldado.concursos.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-bat-bg-secondary text-bat-text-secondary border border-bat-border"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botão de Ação */}
                  <div className="flex-shrink-0">
                    {jaEhAmigo ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                        <span>✓</span> Amigos
                      </span>
                    ) : pendente ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-bat-gold-400 bg-bat-gold-400/15 border border-bat-gold-400/30 px-3 py-1.5 rounded-xl">
                        <span>⏳</span> Solicitado
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnviarSolicitacao(soldado)}
                        disabled={enviando}
                        className="btn-primary py-1.5 px-3.5 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
                      >
                        <span>{enviando ? "Enviando..." : "+ Conectar"}</span>
                        {!enviando && <span>⚡</span>}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Rodapé */}
        <div className="pt-4 mt-3 border-t border-bat-border/50 flex justify-end">
          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl bg-bat-bg-secondary border border-bat-border text-xs font-semibold text-bat-text-muted hover:text-bat-text transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
