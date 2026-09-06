"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { fetchWithAuth } from "@/stores/auth-store";

interface TafItem {
  sexo: string;
  exercicio: string;
  unidade: string;
  minimo_aprovacao: string;
  faixa_etaria: string | null;
  observacao: string | null;
  ano_edital: number | null;
}

const ROTULO_SEXO: Record<string, { titulo: string; emoji: string; cor: string }> = {
  masculino: { titulo: "Masculino", emoji: "♂", cor: "#3B82F6" },
  feminino: { titulo: "Feminino", emoji: "♀", cor: "#EC4899" },
  ambos: { titulo: "Ambos os sexos", emoji: "⚧", cor: "#A855F7" },
};

export default function TafPage() {
  const params = useParams();
  const sigla = String(params?.sigla ?? "").toUpperCase();

  const [dados, setDados] = useState<{
    sigla: string;
    nome: string;
    emoji: string | null;
    cor_tema: string | null;
    taf: TafItem[];
  } | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchWithAuth(`/api/concursos/${sigla}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setDados(json.data);
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  }, [sigla]);

  if (carregando) {
    return <div className="skeleton h-96 w-full rounded-3xl" />;
  }

  if (!dados || dados.taf.length === 0) {
    return (
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
        <span className="mb-3 block text-4xl">🏃</span>
        <h1 className="heading mb-2 text-lg text-bat-text">
          TAF não cadastrado para {sigla}
        </h1>
        <p className="mx-auto mb-5 max-w-md text-sm text-bat-text-secondary">
          Este concurso não tem teste físico ou os índices ainda não foram
          cadastrados na plataforma.
        </p>
        <Link
          href={`/concursos/${sigla.toLowerCase()}`}
          className="btn-secondary inline-block px-5 py-2.5 no-underline"
        >
          ← Voltar ao concurso
        </Link>
      </div>
    );
  }

  const porSexo = dados.taf.reduce<Record<string, TafItem[]>>((acc, item) => {
    (acc[item.sexo] ??= []).push(item);
    return acc;
  }, {});

  const anoEdital = dados.taf.find((t) => t.ano_edital)?.ano_edital;

  return (
    <div>
      <Link
        href={`/concursos/${sigla.toLowerCase()}`}
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-bat-text-muted no-underline hover:text-bat-gold-400"
      >
        ← Voltar ao {dados.sigla}
      </Link>

      <header className="mb-6">
        <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
          <span>🏃</span> TAF — {dados.sigla}
        </h1>
        <p className="mt-1 text-sm text-bat-text-secondary">
          Índices mínimos do Teste de Aptidão Física
          {anoEdital ? ` conforme o edital de ${anoEdital}` : ""}.
        </p>
      </header>

      {/* Aviso honesto: as bancas mudam marcas de um ano para o outro */}
      <div className="mb-6 rounded-xl border border-bat-warning/25 bg-bat-warning/10 px-4 py-3">
        <p className="text-xs leading-relaxed text-bat-text-secondary">
          ⚠️ <strong className="text-bat-warning">Confira sempre o edital vigente.</strong>{" "}
          As Forças ajustam marcas e exercícios a cada certame. Use esta tabela
          como referência de treino, não como documento oficial.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {Object.entries(porSexo).map(([sexo, itens]) => {
          const meta = ROTULO_SEXO[sexo] ?? {
            titulo: sexo,
            emoji: "•",
            cor: "#F5C518",
          };

          return (
            <section
              key={sexo}
              className="overflow-hidden rounded-2xl border border-bat-border bg-bat-bg-card"
            >
              <div
                className="flex items-center gap-2 border-b border-bat-border px-5 py-3"
                style={{ background: `${meta.cor}12` }}
              >
                <span className="text-lg" style={{ color: meta.cor }}>
                  {meta.emoji}
                </span>
                <h2
                  className="heading text-sm font-bold uppercase tracking-wider"
                  style={{ color: meta.cor }}
                >
                  {meta.titulo}
                </h2>
                {itens[0]?.faixa_etaria && (
                  <span className="ml-auto text-[11px] text-bat-text-muted">
                    {itens[0].faixa_etaria}
                  </span>
                )}
              </div>

              <ul className="divide-y divide-bat-border/50">
                {itens.map((item, i) => (
                  <li key={i} className="px-5 py-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-bat-text">
                          {item.exercicio}
                        </p>
                        {item.observacao && (
                          <p className="mt-0.5 text-[11px] text-bat-text-muted">
                            {item.observacao}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p
                          className="heading text-base font-extrabold"
                          style={{ color: meta.cor }}
                        >
                          {item.minimo_aprovacao}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-bat-text-muted">
                          {item.unidade}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Dica de preparo */}
      <section className="mt-6 rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <h2 className="heading mb-3 text-sm font-bold uppercase tracking-wider text-bat-text-secondary">
          Como treinar para esses índices
        </h2>
        <ul className="space-y-2 text-sm leading-relaxed text-bat-text-secondary">
          <li>
            <strong className="text-bat-gold-400">Comece pelo diagnóstico.</strong>{" "}
            Faça cada exercício uma vez e anote o resultado. Você precisa saber a
            distância real até a marca mínima antes de montar qualquer plano.
          </li>
          <li>
            <strong className="text-bat-gold-400">Mire acima do mínimo.</strong>{" "}
            No dia da prova conta nervosismo, calor e cansaço acumulado. Treine
            para bater cerca de 20% acima do índice exigido.
          </li>
          <li>
            <strong className="text-bat-gold-400">Corrida é volume, barra é frequência.</strong>{" "}
            Resistência aeróbica pede corridas longas 3x por semana; barra e
            abdominal respondem melhor a séries curtas quase todos os dias.
          </li>
          <li>
            <strong className="text-bat-gold-400">Não deixe para o fim.</strong>{" "}
            Condicionamento leva meses. Comece a treinar junto com os estudos, e
            não depois de passar na prova escrita.
          </li>
        </ul>
      </section>
    </div>
  );
}
