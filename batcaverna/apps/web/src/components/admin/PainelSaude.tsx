"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

interface Checagem {
  nome: string;
  ok: boolean;
  detalhe: string;
  critico: boolean;
}

interface Telemetria {
  latencia_db_ms: number;
  status_latencia: "excelente" | "estavel" | "lenta";
  sessoes_ativas: number;
  usuarios_online: number;
  respostas_24h: number;
  tickets_abertos: number;
  feedbacks_pendentes: number;
  usuarios_total: number;
  questoes_total: number;
  memoria_heap_mb: number;
  uptime_segundos: number;
}

function formatarUptime(segundos: number): string {
  if (!segundos || segundos <= 0) return "0s";
  const d = Math.floor(segundos / 86400);
  const h = Math.floor((segundos % 86400) / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${segundos % 60}s`;
}

export function PainelSaude() {
  const [checagens, setChecagens] = useState<Checagem[]>([]);
  const [telemetria, setTelemetria] = useState<Telemetria | null>(null);
  const [saudavel, setSaudavel] = useState(true);
  const [criticos, setCriticos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [verificadoEm, setVerificadoEm] = useState<string | null>(null);
  const [autoAtualizar, setAutoAtualizar] = useState(false);

  const rodar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    setErro(null);
    try {
      const res = await fetchWithAuth("/api/admin/saude");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setChecagens(json.data.checagens || []);
      setTelemetria(json.data.telemetria || null);
      setSaudavel(json.data.saudavel);
      setCriticos(json.data.problemas_criticos);
      setVerificadoEm(json.data.verificado_em);
    } catch {
      setErro("Não foi possível carregar a telemetria ao vivo da plataforma.");
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, []);

  useEffect(() => {
    rodar();
  }, [rodar]);

  // Auto-atualização periódica a cada 10s se ativada
  useEffect(() => {
    if (!autoAtualizar) return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        rodar(true);
      }
    }, 10000);
    return () => clearInterval(timer);
  }, [autoAtualizar, rodar]);

  const scoreIntegridade = Math.max(
    0,
    Math.round(
      ((checagens.filter((c) => c.ok).length) / Math.max(1, checagens.length)) * 100
    )
  );

  return (
    <div className="space-y-6">
      {/* ═══ CABEÇALHO HERO COM CONTROLES AO VIVO ═══ */}
      <div className="flex flex-wrap items-start justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-bat-bg-card border border-bat-border shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Radar Operacional & Telemetria em Tempo Real</span>
          </div>
          <h2 className="heading text-xl sm:text-2xl font-black text-bat-text">
            Saúde & Métricas <span className="text-bat-gold-400">ao Vivo</span>
          </h2>
          <p className="text-xs text-bat-text-secondary max-w-2xl leading-relaxed">
            Monitoramento de latência do Supabase, sessões ativas, integridade de migrations e consumo do servidor.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setAutoAtualizar((prev) => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
              autoAtualizar
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm"
                : "bg-bat-bg-secondary text-bat-text-muted hover:text-bat-text border-bat-border"
            }`}
            title="Sincroniza automaticamente a cada 10 segundos"
          >
            <span className={`w-2 h-2 rounded-full ${autoAtualizar ? "bg-emerald-400 animate-ping" : "bg-bat-border"}`} />
            <span>{autoAtualizar ? "Ao Vivo (10s)" : "Ativar Ao Vivo"}</span>
          </button>

          <button
            onClick={() => rodar(false)}
            disabled={carregando}
            className="btn-primary py-2 px-4 text-xs font-bold shrink-0 disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <span>🔄</span>
            <span>{carregando ? "Medindo..." : "Verificar Agora"}</span>
          </button>
        </div>
      </div>

      {erro && (
        <div className="p-4 rounded-2xl bg-bat-error/10 border border-bat-error/30 text-bat-error text-xs font-semibold flex items-center gap-2">
          <span>⚠️</span>
          <span>{erro}</span>
        </div>
      )}

      {/* ═══ TELEMETRIA AO VIVO (COCKPIT DE MÉTRICAS) ═══ */}
      {telemetria && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Latência do Banco */}
          <div className="p-4 rounded-2xl bg-bat-bg-card border border-bat-border shadow-sm space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-mono font-bold text-bat-text-muted uppercase tracking-wider block">
              Latência Supabase
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-bat-gold-400">
                {telemetria.latencia_db_ms}
              </span>
              <span className="text-xs text-bat-text-muted font-mono">ms</span>
            </div>
            <span
              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                telemetria.status_latencia === "excelente"
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : telemetria.status_latencia === "estavel"
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-red-500/15 text-red-400 border border-red-500/30"
              }`}
            >
              {telemetria.status_latencia}
            </span>
          </div>

          {/* Soldados Estudando Agora */}
          <div className="p-4 rounded-2xl bg-bat-bg-card border border-bat-border shadow-sm space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-mono font-bold text-bat-text-muted uppercase tracking-wider block">
              Sessões Ativas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
                {telemetria.sessoes_ativas}
              </span>
              <span className="text-xs text-bat-text-muted">estudando</span>
            </div>
            <span className="text-[10px] text-bat-text-muted block">
              {telemetria.usuarios_online} usuários online (5m)
            </span>
          </div>

          {/* Carga de Respostas 24h */}
          <div className="p-4 rounded-2xl bg-bat-bg-card border border-bat-border shadow-sm space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-mono font-bold text-bat-text-muted uppercase tracking-wider block">
              Respostas (24h)
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                {telemetria.respostas_24h.toLocaleString("pt-BR")}
              </span>
            </div>
            <span className="text-[10px] text-bat-text-muted block">
              processadas hoje
            </span>
          </div>

          {/* Demandas Pendentes */}
          <div className="p-4 rounded-2xl bg-bat-bg-card border border-bat-border shadow-sm space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-mono font-bold text-bat-text-muted uppercase tracking-wider block">
              Fila de Suporte
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
                {telemetria.tickets_abertos}
              </span>
              <span className="text-xs text-bat-text-muted">tickets</span>
            </div>
            <span className="text-[10px] text-bat-text-muted block">
              {telemetria.feedbacks_pendentes} feedback(s) novos
            </span>
          </div>

          {/* Saúde & Servidor */}
          <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-bat-bg-card border border-bat-border shadow-sm space-y-1 relative overflow-hidden">
            <span className="text-[10px] font-mono font-bold text-bat-text-muted uppercase tracking-wider block">
              Uptime do Servidor
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-purple-400">
                {formatarUptime(telemetria.uptime_segundos)}
              </span>
            </div>
            <span className="text-[10px] text-bat-text-muted block font-mono">
              Heap: {telemetria.memoria_heap_mb} MB
            </span>
          </div>
        </div>
      )}

      {/* ═══ CARD DE STATUS GERAL DA INSTALAÇÃO ═══ */}
      {!carregando && !erro && (
        <div
          className={`rounded-3xl border p-5 sm:p-6 shadow-lg transition-all ${
            saudavel
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "border-bat-error/50 bg-bat-error/10"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <h3
                className={`heading text-lg sm:text-xl font-black flex items-center gap-2 ${
                  saudavel ? "text-emerald-400" : "text-bat-error"
                }`}
              >
                <span>{saudavel ? "✅" : "🚨"}</span>
                <span>
                  {saudavel
                    ? "Plataforma 100% Íntegra · Todos os Módulos Prontos"
                    : `${criticos} ${criticos === 1 ? "Problema Crítico Detectado" : "Problemas Críticos Detectados"}`}
                </span>
              </h3>
              <p className="text-xs text-bat-text-secondary max-w-2xl leading-relaxed">
                {saudavel
                  ? "Todas as migrações, índices, tabelas protegidas por RLS e views de moderação estão devidamente sincronizadas com o banco."
                  : "Existe inconsistência de schema no Supabase. Verifique os itens vermelhos abaixo para rodar a migration pendente."}
              </p>
            </div>

            <div className="text-right">
              <span className="text-3xl font-black font-mono text-bat-text">
                {scoreIntegridade}%
              </span>
              <span className="text-[10px] text-bat-text-muted block uppercase font-bold tracking-wider">
                Score de Integridade
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LISTA DE CHECAGENS DETALHADAS ═══ */}
      <div className="bg-bat-bg-card border border-bat-border rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-bat-border/60 pb-3">
          <h3 className="heading text-xs font-bold uppercase tracking-wider text-bat-text flex items-center gap-2">
            <span>🛡️</span>
            <span>Checklist Detalhado de Migrações & Schemas ({checagens.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-bat-text-muted">
            {checagens.filter((c) => c.ok).length} aprovadas / {checagens.length}
          </span>
        </div>

        {carregando ? (
          <div className="space-y-2.5">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-14 rounded-2xl bg-bat-bg-primary animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {checagens.map((c) => (
              <div
                key={c.nome}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                  c.ok
                    ? "border-bat-border/80 bg-bat-bg-primary/80"
                    : c.critico
                    ? "border-bat-error/50 bg-bat-error/10 shadow-sm"
                    : "border-amber-500/40 bg-amber-500/5"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg shrink-0">
                    {c.ok ? "✅" : c.critico ? "🚨" : "⚠️"}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-bat-text">{c.nome}</span>
                      {!c.critico && (
                        <span className="rounded-md bg-bat-bg-secondary px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-bat-text-muted border border-bat-border">
                          Opcional
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-bat-text-secondary mt-0.5 leading-relaxed">
                      {c.detalhe}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg uppercase ${
                    c.ok
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-red-500/10 text-red-400 border border-red-500/20"
                  }`}
                >
                  {c.ok ? "Operacional" : c.critico ? "Crítico" : "Aviso"}
                </span>
              </div>
            ))}
          </div>
        )}

        {verificadoEm && (
          <p className="text-center text-[10px] text-bat-text-muted font-mono pt-2">
            Última medição registrada em {new Date(verificadoEm).toLocaleString("pt-BR")}
          </p>
        )}
      </div>
    </div>
  );
}
