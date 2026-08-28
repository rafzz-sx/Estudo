"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ─── Dados mock ──────────────────────────────────────────────
const concursosMap: Record<string, { nome: string; sigla: string; emoji: string; cor: string; forca: string }> = {
  eear: { nome: "Escola de Especialistas de Aeronáutica", sigla: "EEAR", emoji: "✈️", cor: "#3B82F6", forca: "Aeronáutica" },
  esa: { nome: "Escola de Sargentos das Armas", sigla: "ESA", emoji: "⭐", cor: "#22C55E", forca: "Exército" },
  eam: { nome: "Escola de Aprendizes-Marinheiros", sigla: "EAM", emoji: "⚓", cor: "#0EA5E9", forca: "Marinha" },
  cn: { nome: "Colégio Naval", sigla: "CN", emoji: "🚢", cor: "#0EA5E9", forca: "Marinha" },
  epcar: { nome: "Escola Preparatória de Cadetes do Ar", sigla: "EPCAR", emoji: "🛩️", cor: "#3B82F6", forca: "Aeronáutica" },
  espcex: { nome: "Escola Preparatória de Cadetes do Exército", sigla: "EsPCEx", emoji: "🎖️", cor: "#22C55E", forca: "Exército" },
  efomm: { nome: "Escola de Formação de Oficiais da Marinha Mercante", sigla: "EFOMM", emoji: "🌊", cor: "#0EA5E9", forca: "Marinha" },
  ime: { nome: "Instituto Militar de Engenharia", sigla: "IME", emoji: "🔬", cor: "#22C55E", forca: "Exército" },
  enem: { nome: "Exame Nacional do Ensino Médio", sigla: "ENEM", emoji: "📚", cor: "#F59E0B", forca: "Vestibular" },
};

export default function ConcursoInternoPage() {
  const params = useParams();
  const sigla = (params?.sigla as string)?.toLowerCase();
  const concurso = concursosMap[sigla];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  if (!concurso) {
    return (
      <div className="text-center py-20">
        <p className="text-bat-text-secondary text-lg">Concurso não encontrado.</p>
        <Link href="/concursos" className="text-bat-purple-400 hover:underline mt-4 inline-block">
          ← Voltar aos concursos
        </Link>
      </div>
    );
  }

  const subCards = [
    {
      icon: "📖",
      titulo: `Toda Dinâmica para o ${concurso.sigla}`,
      desc: "Trilha de estudos completa: matérias, assuntos e conteúdo organizado por edital.",
      href: `/concursos/${sigla}/trilha`,
      cor: concurso.cor,
    },
    {
      icon: "❓",
      titulo: `Banco de Questões ${concurso.sigla}`,
      desc: "Questões filtradas por matéria, assunto, ano e dificuldade.",
      href: `/concursos/${sigla}/questoes`,
      cor: "#A855F7",
    },
    {
      icon: "💡",
      titulo: `Bizus do ${concurso.sigla}`,
      desc: "Macetes, atalhos e dicas de alto impacto para a sua prova.",
      href: `/concursos/${sigla}/bizus`,
      cor: "#F5C518",
    },
    {
      icon: "⏱️",
      titulo: `Simulado ${concurso.sigla}`,
      desc: "Simulado cronometrado com gabarito comentado no final.",
      href: `/concursos/${sigla}/simulado`,
      cor: "#EF4444",
    },
    {
      icon: "📊",
      titulo: `Minhas Estatísticas no ${concurso.sigla}`,
      desc: "Desempenho por matéria, tempo de estudo e evolução.",
      href: `/concursos/${sigla}/estatisticas`,
      cor: "#22C55E",
    },
  ];

  // Cards extras para ENEM (áreas do conhecimento)
  if (sigla === "enem") {
    subCards.push(
      { icon: "🔬", titulo: "Ciências da Natureza", desc: "Física, Química e Biologia integradas.", href: `/concursos/enem/ciencias-natureza`, cor: "#06B6D4" },
      { icon: "🏛️", titulo: "Ciências Humanas", desc: "História, Geografia, Filosofia e Sociologia.", href: `/concursos/enem/ciencias-humanas`, cor: "#8B5CF6" },
      { icon: "🗣️", titulo: "Linguagens e Códigos", desc: "Português, Literatura, Inglês e Artes.", href: `/concursos/enem/linguagens`, cor: "#EC4899" },
      { icon: "✍️", titulo: "Redação", desc: "Dissertação argumentativa — estrutura e repertório.", href: `/concursos/enem/redacao`, cor: "#F97316" },
    );
  }

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ CABEÇALHO DO CONCURSO COM BANNER ═══ */}
      <div className="relative mb-8 rounded-2xl overflow-hidden border border-bat-border bg-bat-bg-card">
        {/* Foto de Fundo da Academia / Fachada */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage: `url(/images/concursos/${sigla}.jpg)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bat-bg-card via-bat-bg-card/90 to-transparent" />

        <div className="relative p-6 sm:p-8">
          <Link
            href="/concursos"
            className="text-bat-text-muted text-xs hover:text-bat-gold-400 transition-colors no-underline mb-4 inline-flex items-center gap-1"
          >
            ← Voltar a todos os concursos
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5 mt-2">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-xl border backdrop-blur-md"
              style={{
                background: `${concurso.cor}20`,
                borderColor: `${concurso.cor}50`,
              }}
            >
              {concurso.emoji}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="heading text-3xl sm:text-4xl text-bat-text font-bold">
                  {concurso.sigla}
                </h1>
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border shadow-sm"
                  style={{
                    background: `${concurso.cor}25`,
                    color: concurso.cor,
                    borderColor: `${concurso.cor}40`,
                  }}
                >
                  {concurso.forca}
                </span>
              </div>
              <p className="text-bat-text-secondary text-base mt-1 max-w-xl">
                {concurso.nome}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ SUB-CARDS TEMÁTICOS ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {subCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="group card-glow bg-bat-bg-card border border-bat-border rounded-2xl p-5 no-underline relative overflow-hidden"
          >
            {/* Barra lateral colorida */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 opacity-40 group-hover:opacity-100 transition-opacity"
              style={{ background: card.cor }}
            />

            <div className="pl-3">
              <span className="text-2xl mb-3 block">{card.icon}</span>
              <h3 className="heading text-base text-bat-text font-bold mb-2 group-hover:text-bat-purple-300 transition-colors">
                {card.titulo}
              </h3>
              <p className="text-bat-text-secondary text-sm leading-relaxed">{card.desc}</p>
            </div>

            {/* Seta hover */}
            <div className="absolute bottom-4 right-4 opacity-0 translate-x-[-8px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-bat-purple-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
