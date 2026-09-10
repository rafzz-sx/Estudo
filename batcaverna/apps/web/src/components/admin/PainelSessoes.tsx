"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

interface UsuarioPainel {
  id: string;
  nome: string;
  apelido: string;
  email: string;
  role: string;
  nivel_atual: number;
  xp_total: number;
  streak_dias: number;
  combo_atual: number;
  total_questoes_respondidas: number;
  taxa_acerto: number;
  criado_em: string;
  ultimo_login_em: string | null;
  sessao_segundos_restantes: number | null;
  sessao_expirada: boolean;
  online: boolean;
  tempo_uso_plataforma: number;
  tempo_estudo: number;
  email_verified: boolean;
}

interface Metricas {
  total_usuarios: number;
  online_agora: number;
  novos_24h: number;
  total_questoes: number;
  total_respostas: number;
  tickets_abertos: number;
  feedbacks_novos: number;
}

/** "3h 42min" a partir de segundos; "expirada" quando negativo. */
function restanteLegivel(segundos: number | null): string {
  if (segundos === null) return "—";
  if (segundos <= 0) return "expirada";
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

function tempoLegivel(segundos: number): string {
  if (!segundos) return "0min";
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return h > 0 ? `${h}h ${m}min` : `${m}min`;
}

type Ordem = "recentes" | "xp" | "questoes" | "sessao" | "uso";

/**
 * Sessões, logins e análise por usuário.
 *
 * O pedido central aqui é o "quanto falta para o login automático acabar":
 * a coluna Sessão mostra o tempo restante do token de acesso de cada
 * usuário, para o admin saber quem está prestes a ser deslogado.
 */
export function PainelSessoes() {
  const [usuarios, setUsuarios] = useState<UsuarioPainel[]>([]);
  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("recentes");
  const [soOnline, setSoOnline] = useState(false);

  const carregar = () => {
    fetchWithAuth("/api/admin/painel")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setUsuarios(json.data.usuarios);
          setMetricas(json.data.metricas);
        }
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  };

  useEffect(() => {
    carregar();
    // O tempo restante muda a cada segundo; recarregar a cada 60s mantém a
    // coluna útil sem martelar o banco.
    const t = setInterval(carregar, 60_000);
    return () => clearInterval(t);
  }, []);

  const termo = busca.trim().toLowerCase();
  const visiveis = usuarios
    .filter((u) => !soOnline || u.online)
    .filter(
      (u) =>
        !termo ||
        u.apelido?.toLowerCase().includes(termo) ||
        u.nome?.toLowerCase().includes(termo) ||
        u.email?.toLowerCase().includes(termo)
    )
    .sort((a, b) => {
      switch (ordem) {
        case "xp":
          return b.xp_total - a.xp_total;
        case "questoes":
          return b.total_questoes_respondidas - a.total_questoes_respondidas;
        case "uso":
          return b.tempo_uso_plataforma - a.tempo_uso_plataforma;
        case "sessao":
          return (
            (b.sessao_segundos_restantes ?? -1) -
            (a.sessao_segundos_restantes ?? -1)
          );
        default:
          return (
            new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime()
          );
      }
    });

  if (carregando) return <div className="skeleton h-96 rounded-2xl" />;

  return (
    <div className="space-y-5">
      {/* ═══ MÉTRICAS ═══ */}
      {metricas && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metrica rotulo="Usuários" valor={metricas.total_usuarios} />
          <Metrica
            rotulo="Online agora"
            valor={metricas.online_agora}
            cor="#22C55E"
          />
          <Metrica rotulo="Novos em 24h" valor={metricas.novos_24h} cor="#3B82F6" />
          <Metrica
            rotulo="Respostas totais"
            valor={metricas.total_respostas}
            cor="#F5C518"
          />
        </div>
      )}

      {/* ═══ CONTROLES ═══ */}
      <div className="flex flex-wrap gap-3">
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por apelido, nome ou e-mail..."
          className="input-field min-w-0 flex-1 text-sm"
        />
        <select
          value={ordem}
          onChange={(e) => setOrdem(e.target.value as Ordem)}
          className="input-field shrink-0 text-sm"
        >
          <option value="recentes">Mais recentes</option>
          <option value="xp">Maior XP</option>
          <option value="questoes">Mais questões</option>
          <option value="uso">Mais tempo na plataforma</option>
          <option value="sessao">Sessão mais longa</option>
        </select>
        <label className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-bat-border bg-bat-bg-card px-3.5 py-2">
          <input
            type="checkbox"
            checked={soOnline}
            onChange={(e) => setSoOnline(e.target.checked)}
            className="accent-bat-gold-400"
          />
          <span className="text-xs text-bat-text-secondary">Só online</span>
        </label>
      </div>

      {/* ═══ VISUALIZAÇÃO MOBILE (Cards sem rolagem lateral) ═══ */}
      <div className="sm:hidden space-y-3">
        {visiveis.length === 0 ? (
          <p className="py-8 text-center text-xs text-bat-text-muted bg-bat-bg-card rounded-2xl border border-bat-border">
            Nenhum usuário com esses filtros.
          </p>
        ) : (
          visiveis.map((u) => (
            <div
              key={u.id}
              className="p-4 rounded-xl border border-bat-border bg-bat-bg-card space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {u.online && (
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 animate-pulse"
                        title="Online agora"
                      />
                    )}
                    <p className="font-bold text-bat-text text-sm truncate">{u.apelido}</p>
                    {u.role === "admin" && (
                      <span className="rounded bg-bat-gold-400/20 px-1.5 text-[9px] font-bold text-bat-gold-400">
                        ADMIN
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-bat-text-muted truncate mt-0.5">{u.email}</p>
                </div>

                <span
                  className="rounded-lg px-2 py-0.5 text-[10px] font-bold shrink-0"
                  style={
                    u.sessao_segundos_restantes === null
                      ? { color: "#64748B" }
                      : u.sessao_expirada
                      ? { color: "#EF4444", background: "#EF444415" }
                      : u.sessao_segundos_restantes < 3600
                      ? { color: "#F97316", background: "#F9731615" }
                      : { color: "#22C55E", background: "#22C55E15" }
                  }
                >
                  {restanteLegivel(u.sessao_segundos_restantes)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-bat-border/40 text-center font-mono text-[11px]">
                <div className="p-2 rounded-lg bg-bat-bg-primary border border-bat-border/50">
                  <span className="text-bat-text-muted block text-[10px]">Nível</span>
                  <span className="font-bold text-bat-gold-400">Nv. {u.nivel_atual}</span>
                </div>
                <div className="p-2 rounded-lg bg-bat-bg-primary border border-bat-border/50">
                  <span className="text-bat-text-muted block text-[10px]">Questões</span>
                  <span className="font-bold text-bat-text">{u.total_questoes_respondidas}</span>
                </div>
                <div className="p-2 rounded-lg bg-bat-bg-primary border border-bat-border/50">
                  <span className="text-bat-text-muted block text-[10px]">Acerto</span>
                  <span
                    className="font-bold"
                    style={{
                      color:
                        u.taxa_acerto >= 70
                          ? "#22C55E"
                          : u.taxa_acerto >= 50
                          ? "#F5C518"
                          : u.taxa_acerto > 0
                          ? "#EF4444"
                          : undefined,
                    }}
                  >
                    {u.total_questoes_respondidas > 0 ? `${u.taxa_acerto}%` : "—"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-bat-text-muted pt-1 border-t border-bat-border/30 font-mono">
                <span>🔥 Streak: {u.streak_dias > 0 ? `${u.streak_dias}d` : "0"}</span>
                <span>Estudo: {tempoLegivel(u.tempo_estudo)}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ═══ VISUALIZAÇÃO DESKTOP (Tabela) ═══ */}
      <div className="hidden sm:block overflow-x-auto rounded-2xl border border-bat-border bg-bat-bg-card">
        <table className="w-full min-w-[880px] text-sm">
          <thead>
            <tr className="border-b border-bat-border text-left">
              <Th>Usuário</Th>
              <Th>Nível / XP</Th>
              <Th>Questões</Th>
              <Th>Acerto</Th>
              <Th>Streak</Th>
              <Th>Tempo na plataforma</Th>
              <Th>Último login</Th>
              <Th>Sessão restante</Th>
            </tr>
          </thead>
          <tbody>
            {visiveis.map((u) => (
              <tr
                key={u.id}
                className="border-b border-bat-border/40 transition-colors hover:bg-bat-bg-elevated/40"
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    {u.online && (
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-emerald-400"
                        title="Online agora"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 truncate font-medium text-bat-text">
                        {u.apelido}
                        {u.role === "admin" && (
                          <span className="rounded bg-bat-gold-400/20 px-1.5 text-[9px] font-bold text-bat-gold-400">
                            ADMIN
                          </span>
                        )}
                        {!u.email_verified && (
                          <span
                            className="text-[10px] text-bat-warning"
                            title="E-mail não verificado"
                          >
                            ⚠
                          </span>
                        )}
                      </p>
                      <p className="truncate text-[11px] text-bat-text-muted">
                        {u.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-3 py-2.5 text-bat-text-secondary">
                  Nv. {u.nivel_atual}
                  <span className="ml-1 text-[11px] text-bat-text-muted">
                    {u.xp_total.toLocaleString("pt-BR")} XP
                  </span>
                </td>

                <td className="px-3 py-2.5 text-bat-text-secondary">
                  {u.total_questoes_respondidas.toLocaleString("pt-BR")}
                </td>

                <td className="px-3 py-2.5">
                  <span
                    className="font-medium"
                    style={{
                      color:
                        u.taxa_acerto >= 70
                          ? "#22C55E"
                          : u.taxa_acerto >= 50
                          ? "#F5C518"
                          : u.taxa_acerto > 0
                          ? "#EF4444"
                          : undefined,
                    }}
                  >
                    {u.total_questoes_respondidas > 0 ? `${u.taxa_acerto}%` : "—"}
                  </span>
                </td>

                <td className="px-3 py-2.5 text-bat-text-secondary">
                  {u.streak_dias > 0 ? `🔥 ${u.streak_dias}` : "—"}
                </td>

                <td className="px-3 py-2.5 text-bat-text-secondary">
                  {tempoLegivel(u.tempo_uso_plataforma)}
                  <span className="ml-1 text-[11px] text-bat-text-muted">
                    ({tempoLegivel(u.tempo_estudo)} estudando)
                  </span>
                </td>

                <td className="px-3 py-2.5 text-[11px] text-bat-text-muted">
                  {u.ultimo_login_em
                    ? new Date(u.ultimo_login_em).toLocaleString("pt-BR")
                    : "nunca"}
                </td>

                <td className="px-3 py-2.5">
                  <span
                    className="rounded-lg px-2 py-1 text-xs font-medium"
                    style={
                      u.sessao_segundos_restantes === null
                        ? { color: "#64748B" }
                        : u.sessao_expirada
                        ? { color: "#EF4444", background: "#EF444415" }
                        : u.sessao_segundos_restantes < 3600
                        ? { color: "#F97316", background: "#F9731615" }
                        : { color: "#22C55E", background: "#22C55E15" }
                    }
                  >
                    {restanteLegivel(u.sessao_segundos_restantes)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {visiveis.length === 0 && (
          <p className="py-10 text-center text-sm text-bat-text-muted">
            Nenhum usuário com esses filtros.
          </p>
        )}
      </div>

      <p className="text-[11px] text-bat-text-muted">
        A coluna <strong>Sessão restante</strong> mostra quanto falta para o
        token de acesso automático expirar (padrão: 10 horas a partir do
        login). Depois disso o usuário é levado de volta ao login, a menos que
        o refresh token renove a sessão antes.
      </p>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wider text-bat-text-muted">
      {children}
    </th>
  );
}

function Metrica({
  rotulo,
  valor,
  cor,
}: {
  rotulo: string;
  valor: number;
  cor?: string;
}) {
  return (
    <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-4">
      <p className="mb-1 text-xs text-bat-text-muted">{rotulo}</p>
      <p className="heading text-2xl font-bold" style={{ color: cor }}>
        {valor.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}
