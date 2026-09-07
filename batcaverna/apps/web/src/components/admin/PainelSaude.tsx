"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Diagnóstico da instalação.
 *
 * Existe por causa de um padrão que se repetiu três vezes: uma migration não
 * rodou (ou abortou no meio), a tela ficou vazia, o `catch` da rota engoliu o
 * erro e ninguém soube por semanas.
 *
 * Abrir esta aba depois de todo deploy custa cinco segundos e responde a
 * pergunta que a plataforma não respondia sozinha: "o que está no ar está
 * inteiro?".
 */

interface Checagem {
  nome: string;
  ok: boolean;
  detalhe: string;
  critico: boolean;
}

export function PainelSaude() {
  const [checagens, setChecagens] = useState<Checagem[]>([]);
  const [saudavel, setSaudavel] = useState(true);
  const [criticos, setCriticos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [verificadoEm, setVerificadoEm] = useState<string | null>(null);

  const rodar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetchWithAuth("/api/admin/saude");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setChecagens(json.data.checagens);
      setSaudavel(json.data.saudavel);
      setCriticos(json.data.problemas_criticos);
      setVerificadoEm(json.data.verificado_em);
    } catch {
      setErro("Não consegui rodar o diagnóstico.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    rodar();
  }, [rodar]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="heading text-xl text-bat-text">Diagnóstico da instalação</h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-bat-text-secondary">
            Confere se cada migration realmente chegou ao banco. Rode depois de
            todo deploy e depois de colar SQL no Supabase — três vezes nesta
            plataforma uma migration abortou no meio, a tela ficou vazia e
            ninguém soube por semanas.
          </p>
        </div>
        <button
          onClick={rodar}
          disabled={carregando}
          className="btn-secondary shrink-0 px-4 py-2 text-xs disabled:opacity-40"
        >
          {carregando ? "Verificando..." : "Verificar de novo"}
        </button>
      </div>

      {erro && (
        <p className="rounded-xl border border-bat-error/30 bg-bat-error/10 px-4 py-3 text-xs text-bat-error">
          {erro}
        </p>
      )}

      {!carregando && !erro && (
        <div
          className={`rounded-xl border px-5 py-4 ${
            saudavel
              ? "border-bat-success/30 bg-bat-success/10"
              : "border-bat-error/40 bg-bat-error/10"
          }`}
        >
          <p
            className={`heading text-base font-bold ${
              saudavel ? "text-bat-success" : "text-bat-error"
            }`}
          >
            {saudavel
              ? "✅ Instalação íntegra"
              : `🚨 ${criticos} ${criticos === 1 ? "problema crítico" : "problemas críticos"}`}
          </p>
          {!saudavel && (
            <p className="mt-1 text-xs text-bat-text-secondary">
              Cada linha vermelha abaixo indica uma migration que não rodou ou
              abortou. Rode o arquivo correspondente no SQL Editor do Supabase.
            </p>
          )}
        </div>
      )}

      {carregando ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-12 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {checagens.map((c) => (
            <div
              key={c.nome}
              className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border px-4 py-3 ${
                c.ok
                  ? "border-bat-border bg-bat-bg-primary"
                  : c.critico
                  ? "border-bat-error/40 bg-bat-error/5"
                  : "border-bat-warning/30 bg-bat-warning/5"
              }`}
            >
              <span className="text-sm">
                {c.ok ? "✅" : c.critico ? "🚨" : "⚠️"}
              </span>
              <span className="text-xs font-semibold text-bat-text">{c.nome}</span>
              {!c.critico && (
                <span className="rounded bg-bat-bg-secondary px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-bat-text-muted">
                  opcional
                </span>
              )}
              <span className="ml-auto text-[11px] text-bat-text-secondary">
                {c.detalhe}
              </span>
            </div>
          ))}
        </div>
      )}

      {verificadoEm && (
        <p className="text-center text-[10px] text-bat-text-muted">
          Verificado em {new Date(verificadoEm).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
}
