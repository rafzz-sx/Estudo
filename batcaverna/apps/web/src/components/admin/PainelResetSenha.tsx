"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

interface SolicitacaoReset {
  id: string;
  motivo: string | null;
  status: string;
  criado_em: string;
  resolvida_em: string | null;
  user_nome: string;
  user_apelido: string;
  user_email: string;
  user_id: string;
}

export function PainelResetSenha() {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoReset[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [processando, setProcessando] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<{
    id: string;
    senha: string;
    nome: string;
    email: string;
  } | null>(null);

  const carregar = () => {
    setCarregando(true);
    fetchWithAuth("/api/admin/reset-senha")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setSolicitacoes(json.data);
        }
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregar();
  }, []);

  const redefinirSenha = async (solicitacao: SolicitacaoReset) => {
    if (
      !confirm(
        `Tem certeza que deseja redefinir a senha de ${solicitacao.user_nome} (${solicitacao.user_email})?\n\nUma senha temporária será gerada.`
      )
    )
      return;

    setProcessando(solicitacao.id);
    try {
      const res = await fetchWithAuth("/api/admin/reset-senha", {
        method: "POST",
        body: JSON.stringify({
          solicitacao_id: solicitacao.id,
          user_id: solicitacao.user_id,
        }),
      });
      const json = await res.json();

      if (json.success) {
        setSenhaGerada({
          id: solicitacao.id,
          senha: json.data.senha_temporaria,
          nome: json.data.user_nome,
          email: json.data.user_email,
        });

        // Atualizar lista
        setSolicitacoes((atual) =>
          atual.map((s) =>
            s.id === solicitacao.id ? { ...s, status: "resolvida" } : s
          )
        );
      } else {
        alert(json.error || "Erro ao redefinir senha");
      }
    } catch {
      alert("Erro de conexão");
    } finally {
      setProcessando(null);
    }
  };

  const copiarSenha = (senha: string) => {
    navigator.clipboard.writeText(senha);
    alert("Senha copiada para a área de transferência!");
  };

  const pendentes = solicitacoes.filter((s) => s.status === "pendente");
  const resolvidas = solicitacoes.filter((s) => s.status !== "pendente");

  return (
    <div className="space-y-5">
      <h2 className="heading text-xl text-bat-text">
        🔑 Redefinições de Senha
      </h2>

      {/* Senha gerada modal */}
      {senhaGerada && (
        <div className="rounded-2xl border-2 border-bat-gold-400/50 bg-bat-gold-400/10 p-6">
          <h3 className="heading text-lg text-bat-gold-400 mb-3">
            ✅ Senha Redefinida com Sucesso!
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-bat-text">
              <strong>Aluno:</strong> {senhaGerada.nome}
            </p>
            <p className="text-sm text-bat-text">
              <strong>E-mail:</strong> {senhaGerada.email}
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="text-sm text-bat-text-secondary">
                Senha temporária:
              </span>
              <code className="bg-black/30 px-4 py-2 rounded-lg text-bat-gold-400 font-mono text-lg font-bold tracking-wider select-all">
                {senhaGerada.senha}
              </code>
              <button
                onClick={() => copiarSenha(senhaGerada.senha)}
                className="cursor-pointer rounded-lg border border-bat-gold-400/40 bg-bat-gold-400/15 px-3 py-1.5 text-xs font-bold text-bat-gold-400 hover:bg-bat-gold-400/25 transition-colors"
              >
                📋 Copiar
              </button>
            </div>
            <p className="text-xs text-bat-text-muted mt-2">
              ⚠️ Envie esta senha para o aluno pelo WhatsApp, e-mail pessoal ou
              outro meio. O aluno deve trocar a senha após o primeiro login.
            </p>
          </div>
          <button
            onClick={() => setSenhaGerada(null)}
            className="cursor-pointer mt-4 text-xs text-bat-text-muted hover:text-bat-text"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Solicitações pendentes */}
      <div>
        <h3 className="text-sm font-bold text-bat-text-secondary mb-3">
          Pendentes ({pendentes.length})
        </h3>
        {carregando ? (
          <div className="space-y-2">
            {[0, 1].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : pendentes.length === 0 ? (
          <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-8 text-center">
            <span className="mb-2 block text-3xl">✅</span>
            <p className="text-sm text-bat-text-secondary">
              Nenhuma solicitação de redefinição pendente.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {pendentes.map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-bat-gold-400/30 bg-bat-gold-400/5 p-4"
              >
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="text-sm font-bold text-bat-text">
                    {s.user_nome}
                  </span>
                  <span className="text-xs text-bat-text-muted">
                    @{s.user_apelido}
                  </span>
                  <span className="text-xs text-bat-text-muted">
                    {s.user_email}
                  </span>
                  <span className="ml-auto text-[11px] text-bat-text-muted">
                    {new Date(s.criado_em).toLocaleString("pt-BR")}
                  </span>
                </div>

                {s.motivo && (
                  <p className="text-sm text-bat-text-secondary mb-3 italic">
                    &ldquo;{s.motivo}&rdquo;
                  </p>
                )}

                <button
                  onClick={() => redefinirSenha(s)}
                  disabled={processando === s.id}
                  className="cursor-pointer rounded-lg border border-bat-gold-400/40 bg-bat-gold-400/15 px-4 py-1.5 text-xs font-bold text-bat-gold-400 hover:bg-bat-gold-400/25 transition-colors disabled:opacity-40"
                >
                  {processando === s.id
                    ? "Gerando..."
                    : "🔑 Redefinir Senha"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Histórico de resolvidas */}
      {resolvidas.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-bat-text-secondary mb-3">
            Histórico ({resolvidas.length})
          </h3>
          <ul className="space-y-1.5">
            {resolvidas.slice(0, 20).map((s) => (
              <li
                key={s.id}
                className="rounded-xl border border-bat-border bg-bat-bg-card p-3 opacity-60"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-bat-text">
                    {s.user_nome}
                  </span>
                  <span className="text-[11px] text-bat-text-muted">
                    {s.user_email}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                      s.status === "resolvida"
                        ? "bg-emerald-400/15 text-emerald-400"
                        : "bg-red-400/15 text-red-400"
                    }`}
                  >
                    {s.status}
                  </span>
                  <span className="ml-auto text-[10px] text-bat-text-muted">
                    {s.resolvida_em
                      ? new Date(s.resolvida_em).toLocaleString("pt-BR")
                      : new Date(s.criado_em).toLocaleString("pt-BR")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
