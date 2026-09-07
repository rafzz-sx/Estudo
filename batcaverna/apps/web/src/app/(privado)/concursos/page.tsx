"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/stores/auth-store";

interface Concurso {
  id: string;
  sigla: string;
  nome: string;
  forca: string;
  emoji: string | null;
  cor_tema: string | null;
  frase_curta_card: string | null;
  imagem_fundo_url: string | null;
  escolaridade: string | null;
  tem_taf: boolean;
  total_questoes: number;
}

const NOME_FORCA: Record<string, string> = {
  aeronautica: "Aeronáutica",
  marinha: "Marinha",
  exercito: "Exército",
  enem: "Vestibular",
};

const FILTROS_FORCA = [
  { valor: "todas", rotulo: "Todos" },
  { valor: "aeronautica", rotulo: "✈️ Aeronáutica" },
  { valor: "marinha", rotulo: "⚓ Marinha" },
  { valor: "exercito", rotulo: "⭐ Exército" },
  { valor: "enem", rotulo: "📚 ENEM" },
];

export default function ConcursosPage() {
  const [concursos, setConcursos] = useState<Concurso[]>([]);
  const [forca, setForca] = useState("todas");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/concursos")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setConcursos(json.data);
      })
      .catch(() => undefined)
      .finally(() => setCarregando(false));
  }, []);

  const visiveis =
    forca === "todas" ? concursos : concursos.filter((c) => c.forca === forca);

  const totalQuestoes = concursos.reduce((a, c) => a + c.total_questoes, 0);

  return (
    <div>
      <header className="mb-6">
        <h1 className="heading mb-2 text-3xl text-bat-text">Escolha seu Concurso</h1>
        <p className="text-bat-text-secondary">
          Cada concurso tem trilha teórica, banco de questões oficiais, bizus,
          simulado e — nos militares — a tabela do TAF.
          {totalQuestoes > 0 && (
            <>
              {" "}
              São{" "}
              <strong className="text-bat-gold-400">
                {totalQuestoes.toLocaleString("pt-BR")} questões oficiais
              </strong>{" "}
              catalogadas.
            </>
          )}
        </p>
      </header>

      {/* ═══ Filtro por força ═══ */}
      <div className="mb-6 flex flex-wrap gap-2">
        {FILTROS_FORCA.map((f) => (
          <button
            key={f.valor}
            onClick={() => setForca(f.valor)}
            className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              forca === f.valor
                ? "border-bat-gold-400/40 bg-bat-gold-400/15 text-bat-gold-400"
                : "border-bat-border bg-bat-bg-card text-bat-text-secondary hover:border-bat-gold-400/25"
            }`}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton h-56 rounded-2xl" />
          ))}
        </div>
      ) : visiveis.length === 0 ? (
        <p className="py-16 text-center text-bat-text-muted">
          Nenhum concurso nesta categoria.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visiveis.map((c) => {
            const cor = c.cor_tema ?? "#F5C518";
            return (
              <Link
                key={c.id}
                href={`/concursos/${c.sigla.toLowerCase()}`}
                className="group relative overflow-hidden rounded-2xl border border-bat-border no-underline transition-all duration-300 hover:-translate-y-1 hover:border-bat-gold-400/50 hover:shadow-2xl"
              >
                {/* Foto de fundo: `object-fit: cover` via bg-cover garante que
                    qualquer proporção de imagem preencha o card sem distorcer. */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: c.imagem_fundo_url
                      ? `url(${c.imagem_fundo_url})`
                      : undefined,
                    backgroundColor: "#0B0B0F",
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(11,11,15,0.72) 0%, rgba(18,18,24,0.9) 60%, rgba(11,11,15,0.98) 100%)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 top-0 w-1.5 transition-all duration-300 group-hover:w-2"
                  style={{ background: cor }}
                />

                <div className="relative z-10 flex min-h-[220px] flex-col justify-between p-6">
                  <div>
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">
                          {c.emoji ?? "🎯"}
                        </span>
                        <span
                          className="rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-sm"
                          style={{
                            background: `${cor}25`,
                            color: cor,
                            borderColor: `${cor}40`,
                          }}
                        >
                          {NOME_FORCA[c.forca] ?? c.forca}
                        </span>
                      </div>

                      {c.tem_taf && (
                        <span
                          className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-[10px] text-bat-text-muted"
                          title="Este concurso tem Teste de Aptidão Física"
                        >
                          🏃 TAF
                        </span>
                      )}
                    </div>

                    <h2 className="heading mb-1 text-2xl font-bold text-bat-text drop-shadow-md transition-colors group-hover:text-bat-gold-400">
                      {c.sigla}
                    </h2>
                    <p className="line-clamp-2 text-sm leading-snug text-bat-text-secondary">
                      {c.nome}
                    </p>
                    {c.escolaridade && (
                      <p className="mt-1.5 text-[11px] text-bat-text-muted">
                        🎓 {c.escolaridade}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                    <p className="truncate text-xs text-bat-text-muted">
                      {c.total_questoes > 0
                        ? `${c.total_questoes.toLocaleString("pt-BR")} questões oficiais`
                        : c.frase_curta_card ?? "Conteúdo em construção"}
                    </p>
                    <span className="text-bat-gold-400 transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
