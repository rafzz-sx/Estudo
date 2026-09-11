"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/stores/auth-store";
import { useStudySessionStore } from "@/stores/study-session-store";

interface AmigoEstudando {
  id: string;
  apelido: string;
  avatar_url: string | null;
  concurso: string | null;
  duracao_segundos: number;
  minutos_estudo: number;
  iniciada_em: string;
}

interface RadarData {
  amigos: AmigoEstudando[];
  total: number;
  usuario_estudando: boolean;
  sincronia_ativa: boolean;
}

export function RadarSoldadosAoVivo() {
  const router = useRouter();
  const [radar, setRadar] = useState<RadarData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const isActiveStore = useStudySessionStore((s) => s.isActive);
  const isPausedStore = useStudySessionStore((s) => s.isPaused);
  const sincroniaEsquadraoStore = useStudySessionStore((s) => s.sincroniaEsquadrao);

  const carregarRadar = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/estudo/amigos-estudando");
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setRadar(json.data);
        }
      }
    } catch (e) {
      // Silencioso em caso de offline
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregarRadar();

    // Atualiza a cada 30s apenas com a aba visível
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        carregarRadar();
      }
    }, 30000);

    const aoVoltarAba = () => {
      if (document.visibilityState === "visible") {
        carregarRadar();
      }
    };
    document.addEventListener("visibilitychange", aoVoltarAba);

    const aoAtivarSincronia = () => carregarRadar();
    window.addEventListener("batcaverna_sincronia_ativada", aoAtivarSincronia);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", aoVoltarAba);
      window.removeEventListener("batcaverna_sincronia_ativada", aoAtivarSincronia);
    };
  }, [carregarRadar]);

  // Se ainda estiver carregando pela primeira vez, não pisca nada
  if (carregando && !radar) return null;

  const amigos = radar?.amigos || [];
  const temAmigosEstudando = amigos.length > 0;
  const usuarioEstudandoAgora = (radar?.usuario_estudando || isActiveStore) && !isPausedStore;
  const sincroniaAtiva = (radar?.sincronia_ativa || sincroniaEsquadraoStore) && usuarioEstudandoAgora && temAmigosEstudando;

  const handleEntrarNoCombate = () => {
    // 1. Procurar última trilha salva
    const ultimaTrilha = localStorage.getItem("batcaverna_ultima_trilha");
    const destino = ultimaTrilha || "/concursos";

    // 2. Disparar sinal de atividade de estudo para iniciar cronômetro
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("batcaverna_study_activity"));
    }

    router.push(destino);
  };

  // Se não há nenhum amigo estudando, exibe uma linha ultra discreta de prontidão
  if (!temAmigosEstudando) {
    return (
      <div className="rounded-2xl border border-bat-border/50 bg-bat-bg-card/40 px-4 py-2.5 flex items-center justify-between gap-3 text-xs text-bat-text-muted transition-all">
        <div className="flex items-center gap-2 min-w-0">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500/60" />
          </span>
          <span className="font-mono text-[11px] uppercase tracking-wider text-bat-text-secondary">
            Radar de Esquadrão
          </span>
          <span className="text-bat-border">·</span>
          <span className="truncate text-[11px]">
            Nenhum amigo em combate agora. Inicie seus estudos para convocá-los (+10% XP)!
          </span>
        </div>

        <Link
          href="/concursos"
          className="shrink-0 text-[11px] font-bold text-bat-gold-400 hover:text-bat-gold-300 transition-colors flex items-center gap-1 no-underline"
        >
          <span>Ligar Cronômetro</span>
          <span>→</span>
        </Link>
      </div>
    );
  }

  // Se houver amigos estudando agora: WIDGET TÁTICO AO VIVO COM AURA PULSANTE
  return (
    <div className="relative overflow-hidden rounded-2xl border border-bat-gold-400/30 bg-gradient-to-r from-bat-gold-400/10 via-bat-bg-card to-bat-bg-card p-4 sm:p-5 shadow-[0_0_25px_rgba(245,197,24,0.08)] animate-in fade-in duration-300">
      {/* Luz ambiente dourada de fundo */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-bat-gold-400/15 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Esquerda: Identificação do Radar e Soldados */}
        <div className="space-y-2.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>RADAR AO VIVO</span>
            </div>

            {sincroniaAtiva ? (
              <span className="px-2.5 py-0.5 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/40 text-bat-gold-400 text-[11px] font-extrabold flex items-center gap-1 animate-pulse shadow-[0_0_12px_rgba(245,197,24,0.4)]">
                <span>⚔️</span>
                <span>SINCRONIA DE ESQUADRÃO ATIVA (+10% XP)</span>
              </span>
            ) : (
              <span className="text-[11px] text-bat-text-muted">
                {amigos.length === 1 ? "1 soldado combatendo" : `${amigos.length} soldados combatendo`}
              </span>
            )}
          </div>

          {/* Lista de Avatares com Auréola Verde/Dourada Pulsando */}
          <div className="flex flex-wrap items-center gap-3">
            {amigos.map((amigo) => (
              <div
                key={amigo.id}
                className="flex items-center gap-2.5 bg-bat-bg-secondary/80 border border-bat-border hover:border-bat-gold-400/40 rounded-xl px-3 py-1.5 transition-all group"
                title={`${amigo.apelido} estudando há ${amigo.minutos_estudo} min${amigo.concurso ? ` rumo à ${amigo.concurso}` : ""}`}
              >
                {/* Avatar com Auréola Pulsando */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-bat-gold-400/60 ring-2 ring-emerald-500/70 ring-offset-1 ring-offset-black animate-pulse flex items-center justify-center bg-bat-bg-elevated font-bold text-xs text-bat-gold-400">
                    {amigo.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={amigo.avatar_url}
                        alt={amigo.apelido}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      amigo.apelido.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  {/* Ponto verde status no avatar */}
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-black" />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-bat-text truncate max-w-[120px] sm:max-w-[160px]">
                      {amigo.apelido}
                    </span>
                    {amigo.concurso && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30">
                        {amigo.concurso}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <span>🟢</span>
                    <span>estudando há {amigo.minutos_estudo} min</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Direita: Ação Rápida */}
        <div className="shrink-0 flex items-center gap-2">
          {usuarioEstudandoAgora ? (
            <div className="px-4 py-2.5 rounded-xl bg-bat-bg-secondary border border-bat-gold-400/30 text-right">
              <p className="text-[10px] text-bat-text-muted">Status do seu combate</p>
              <p className="text-xs font-bold text-bat-gold-400 flex items-center gap-1.5 justify-end">
                <span>⚡</span>
                <span>Ganhando +10% de XP Juntos</span>
              </p>
            </div>
          ) : (
            <button
              onClick={handleEntrarNoCombate}
              type="button"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-bat-gold-400 to-amber-500 hover:from-bat-gold-300 hover:to-amber-400 text-black font-extrabold text-xs shadow-[0_0_20px_rgba(245,197,24,0.3)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⚔️</span>
              <span>Entrar no Combate (+10% XP)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
