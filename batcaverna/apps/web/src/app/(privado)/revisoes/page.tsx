"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { QuadroFigura } from "@/components/questoes/QuadroFigura";
import {
  ResolucaoGabarito,
  type PassoResolucao,
} from "@/components/questoes/ResolucaoGabarito";

interface QuestaoRevisao {
  id: string;
  texto_base: string | null;
  enunciado: string;
  alternativas: { letra: string; texto: string }[];
  ano: number | null;
  dificuldade: string;
  numero_original: string | null;
  figura_descricao: string | null;
  figura_svg: string | null;
  precisa_resolucao: boolean;
  concursos: { sigla: string; emoji: string | null; cor_tema: string | null } | null;
  materias: { nome: string; icone_emoji: string | null } | null;
  assuntos: { nome: string } | null;
  revisao: {
    etapa: number;
    agendada_para: string;
    vencida: boolean;
    total_erros: number;
    total_revisoes: number;
    intervalo_atual: number | null;
  };
}

interface Resultado {
  correta: boolean;
  resposta_correta: string;
  explicacao: string | null;
  explicacao_alternativas: any;
  resolucao_passos: PassoResolucao[] | null;
  figura_descricao: string | null;
  figura_svg: string | null;
  precisa_resolucao: boolean;
  revisao: {
    agendada_para: string | null;
    etapa: number | null;
    aprendida: boolean;
    entrou_na_fila: boolean;
  } | null;
  xp_ganho: number;
  xp_total: number;
  nivel: { nivel: number; titulo: string };
  frase_motivacional: string | null;
}

const ETAPAS = ["1 dia", "3 dias", "7 dias", "21 dias"];

export default function RevisoesPage() {
  const updateUser = useAuthStore((s) => s.updateUser);

  const [itens, setItens] = useState<QuestaoRevisao[]>([]);
  const [contadores, setContadores] = useState({
    vencidas: 0,
    agendadas_futuras: 0,
    aprendidas: 0,
  });
  const [indice, setIndice] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [enviando, setEnviando] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const res = await fetchWithAuth("/api/revisoes");
      const json = await res.json();
      if (json.success) {
        setItens(json.data.itens);
        setContadores({
          vencidas: json.data.vencidas,
          agendadas_futuras: json.data.agendadas_futuras,
          aprendidas: json.data.aprendidas,
        });
        setIndice(0);
        setEscolhida(null);
        setResultado(null);
      }
    } catch {
      /* estado vazio cobre */
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const questao = itens[indice];

  const responder = async () => {
    if (!escolhida || !questao || enviando || resultado) return;
    setEnviando(true);
    try {
      const res = await fetchWithAuth(`/api/questoes/${questao.id}/responder`, {
        method: "POST",
        body: JSON.stringify({ resposta_dada: escolhida }),
      });
      const json = await res.json();
      if (json.success) {
        setResultado(json.data);
        updateUser({
          xp_total: json.data.xp_total,
          nivel_atual: json.data.nivel.nivel,
          combo_atual: json.data.novo_combo,
        });
        window.dispatchEvent(
          new CustomEvent("batcaverna_xp_ganho", {
            detail: {
              xp: json.data.xp_ganho,
              totalXp: json.data.xp_total,
              motivo: json.data.correta
                ? "Revisão espaçada concluída! 🔁"
                : "Revisão registrada — essa volta amanhã",
            },
          })
        );
      }
    } finally {
      setEnviando(false);
    }
  };

  const proxima = () => {
    setEscolhida(null);
    setResultado(null);
    if (indice + 1 < itens.length) setIndice(indice + 1);
    else carregar();
  };

  const tirarDaFila = async () => {
    if (!questao) return;
    if (!confirm("Tirar esta questão do ciclo de revisões? Ela não volta mais.")) return;
    await fetchWithAuth(`/api/revisoes?questao_id=${questao.id}`, {
      method: "DELETE",
    }).catch(() => undefined);
    proxima();
  };

  // ═══════════ ESTADOS VAZIOS ═══════════
  if (carregando) return <div className="skeleton h-96 w-full rounded-2xl" />;

  if (!questao) {
    return (
      <div>
        <Cabecalho contadores={contadores} />
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
          <span className="mb-3 block text-4xl">
            {contadores.agendadas_futuras > 0 ? "🎯" : "🦇"}
          </span>
          <h2 className="heading mb-2 text-lg text-bat-text">
            {contadores.agendadas_futuras > 0
              ? "Nada vencido por hoje"
              : "Sua fila de revisão está vazia"}
          </h2>
          <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-bat-text-secondary">
            {contadores.agendadas_futuras > 0 ? (
              <>
                Você já revisou tudo que venceu.{" "}
                <strong className="text-bat-gold-400">
                  {contadores.agendadas_futuras} questões
                </strong>{" "}
                voltam nos próximos dias — a ideia é justamente não revisar
                antes da hora.
              </>
            ) : (
              <>
                As questões que você errar entram aqui automaticamente e voltam
                em 1, 3, 7 e 21 dias. É o intervalo que faz o conteúdo grudar.
              </>
            )}
          </p>
          <Link href="/questoes" className="btn-primary inline-block px-6 py-3 no-underline">
            Resolver questões novas →
          </Link>
        </div>
      </div>
    );
  }

  const isCorreta = resultado?.correta;

  return (
    <div>
      <Cabecalho contadores={contadores} />

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-bat-purple-500/25 bg-bat-purple-950/20 px-4 py-2.5">
        <p className="text-xs text-bat-text-secondary">
          🔁 Revisão {indice + 1} de {itens.length} · você já errou esta questão{" "}
          <strong className="text-bat-error">
            {questao.revisao.total_erros}x
          </strong>
          {questao.revisao.total_revisoes > 0 && (
            <> · {questao.revisao.total_revisoes} revisão(ões) feita(s)</>
          )}
        </p>
        <span className="shrink-0 rounded-md bg-bat-bg-card px-2 py-1 text-[10px] font-bold text-bat-purple-300">
          etapa {questao.revisao.etapa + 1}/4 · {ETAPAS[questao.revisao.etapa]}
        </span>
      </div>

      <article className="rounded-2xl border border-bat-border bg-bat-bg-card p-5 sm:p-6">
        <header className="mb-4 flex flex-wrap items-center gap-2 border-b border-bat-border/60 pb-3">
          <span className="rounded-lg border border-bat-gold-400/20 bg-bat-gold-400/10 px-2.5 py-1 text-xs font-bold text-bat-gold-400">
            {questao.concursos?.emoji} {questao.concursos?.sigla}
            {questao.ano ? ` — ${questao.ano}` : ""}
          </span>
          {questao.materias?.nome && (
            <span className="rounded-lg bg-bat-bg-secondary px-2.5 py-1 text-xs text-bat-text-muted">
              {questao.materias.icone_emoji} {questao.materias.nome}
            </span>
          )}
          {questao.assuntos?.nome && (
            <span className="rounded-lg bg-bat-bg-secondary px-2.5 py-1 text-xs text-bat-text-muted">
              {questao.assuntos.nome}
            </span>
          )}
        </header>

        {questao.texto_base && (
          <div className="mb-5 rounded-xl border-l-4 border-bat-gold-400/50 bg-bat-bg-secondary/50 px-4 py-3.5">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-bat-text-muted">
              Texto base
            </p>
            <div className="whitespace-pre-line text-sm leading-relaxed text-bat-text-secondary">
              {questao.texto_base}
            </div>
          </div>
        )}

        <QuadroFigura
          descricao={questao.figura_descricao}
          svg={questao.figura_svg}
        />

        <p className="mb-6 whitespace-pre-line text-base leading-relaxed text-bat-text">
          {questao.enunciado}
        </p>

        <div className="mb-6 space-y-3">
          {questao.alternativas?.map((alt) => {
            const correta = resultado?.resposta_correta === alt.letra;
            const marcada = escolhida === alt.letra;

            let estilo =
              "bg-bat-bg-secondary border-bat-border text-bat-text-secondary hover:border-bat-gold-400/30";
            if (resultado) {
              if (correta) {
                estilo = "bg-bat-success/10 border-bat-success/45 text-bat-success font-medium";
              } else if (marcada) {
                estilo = "bg-bat-error/10 border-bat-error/45 text-bat-error";
              } else {
                estilo = "bg-bat-bg-secondary border-bat-border text-bat-text-disabled opacity-50";
              }
            } else if (marcada) {
              estilo = "bg-bat-gold-400/10 border-bat-gold-400/45 text-bat-gold-400 font-medium";
            }

            return (
              <button
                key={alt.letra}
                onClick={() => !resultado && setEscolhida(alt.letra)}
                disabled={!!resultado}
                className={`flex w-full cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all ${estilo}`}
              >
                <span className="mt-px shrink-0 font-bold">{alt.letra})</span>
                <span className="whitespace-pre-line">{alt.texto}</span>
              </button>
            );
          })}
        </div>

        {!resultado ? (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={responder}
              disabled={!escolhida || enviando}
              className="btn-primary flex items-center justify-center gap-2 px-8 py-3 disabled:opacity-30 transition-all duration-150 active:scale-[0.98]"
            >
              {enviando && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-bat-bg border-r-transparent" />
              )}
              {enviando ? "Verificando..." : "Confirmar resposta"}
            </button>
            <button onClick={tirarDaFila} className="btn-secondary px-5 py-3 text-sm">
              Já sei essa, tirar da fila
            </button>
          </div>
        ) : (
          <div>
            <div
              className={`mb-4 rounded-xl border p-4 ${
                isCorreta
                  ? "border-bat-success/30 bg-bat-success/10"
                  : "border-bat-error/30 bg-bat-error/10"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p
                  className={`heading text-base font-bold ${
                    isCorreta ? "text-bat-success" : "text-bat-error"
                  }`}
                >
                  {isCorreta
                    ? resultado.revisao?.aprendida
                      ? "🎓 Aprendida! Ciclo completo."
                      : "✅ Acertou — próxima revisão mais distante"
                    : "❌ Ainda não. Ela volta amanhã."}
                </p>
                <span className="rounded-lg border border-bat-gold-400/25 bg-bat-gold-400/10 px-2.5 py-1 text-xs font-bold text-bat-gold-400">
                  +{resultado.xp_ganho} XP
                </span>
              </div>
              {resultado.frase_motivacional && (
                <p className="mt-2.5 text-sm italic leading-relaxed text-bat-text-secondary">
                  🦇 {resultado.frase_motivacional}
                </p>
              )}
            </div>

            <button onClick={proxima} className="btn-primary px-8 py-3">
              {indice + 1 < itens.length
                ? "Próxima revisão →"
                : "Concluir sessão de revisão"}
            </button>

            <ResolucaoGabarito
              respostaCorreta={resultado.resposta_correta}
              explicacao={resultado.explicacao}
              explicacaoAlternativas={resultado.explicacao_alternativas}
              alternativas={questao.alternativas}
              passos={resultado.resolucao_passos}
              figuraDescricao={resultado.figura_descricao}
              figuraSvg={resultado.figura_svg}
              precisaResolucao={resultado.precisa_resolucao}
              alternativaEscolhida={escolhida}
              revisao={resultado.revisao}
            />
          </div>
        )}
      </article>
    </div>
  );
}

function Cabecalho({
  contadores,
}: {
  contadores: { vencidas: number; agendadas_futuras: number; aprendidas: number };
}) {
  return (
    <header className="mb-5">
      <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
        <span>🔁</span> Revisão espaçada
      </h1>
      <p className="mt-1 text-sm text-bat-text-secondary">
        As questões que você errou voltam em 1, 3, 7 e 21 dias — o intervalo
        que a memória precisa para fixar de verdade.
      </p>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Contador rotulo="Para revisar hoje" valor={contadores.vencidas} cor="#F5C518" />
        <Contador rotulo="Agendadas" valor={contadores.agendadas_futuras} />
        <Contador rotulo="Já aprendidas" valor={contadores.aprendidas} cor="#22C55E" />
      </div>
    </header>
  );
}

function Contador({
  rotulo,
  valor,
  cor,
}: {
  rotulo: string;
  valor: number;
  cor?: string;
}) {
  return (
    <div className="rounded-xl border border-bat-border bg-bat-bg-card px-4 py-3">
      <p className="heading text-2xl font-bold" style={{ color: cor }}>
        {valor}
      </p>
      <p className="text-[11px] text-bat-text-muted">{rotulo}</p>
    </div>
  );
}
