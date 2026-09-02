"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ─── Dados dos 9 Concursos ────────────────────────────────────
const concursosMap: Record<string, { nome: string; sigla: string; emoji: string; cor: string; forca: string; imagemBg: string }> = {
  eear: {
    nome: "Escola de Especialistas de Aeronáutica",
    sigla: "EEAR",
    emoji: "✈️",
    cor: "#3B82F6",
    forca: "Aeronáutica",
    imagemBg: "/images/concursos/eear.jpg",
  },
  esa: {
    nome: "Escola de Sargentos das Armas",
    sigla: "ESA",
    emoji: "⭐",
    cor: "#22C55E",
    forca: "Exército",
    imagemBg: "/images/concursos/esa.jpg",
  },
  eam: {
    nome: "Escola de Aprendizes-Marinheiros",
    sigla: "EAM",
    emoji: "⚓",
    cor: "#0EA5E9",
    forca: "Marinha",
    imagemBg: "/images/concursos/eam.jpg",
  },
  cn: {
    nome: "Colégio Naval",
    sigla: "CN",
    emoji: "🚢",
    cor: "#0EA5E9",
    forca: "Marinha",
    imagemBg: "/images/concursos/cn.jpg",
  },
  epcar: {
    nome: "Escola Preparatória de Cadetes do Ar",
    sigla: "EPCAR",
    emoji: "🛩️",
    cor: "#3B82F6",
    forca: "Aeronáutica",
    imagemBg: "/images/concursos/epcar.jpg",
  },
  espcex: {
    nome: "Escola Preparatória de Cadetes do Exército",
    sigla: "EsPCEx",
    emoji: "🎖️",
    cor: "#22C55E",
    forca: "Exército",
    imagemBg: "/images/concursos/espcex.jpg",
  },
  efomm: {
    nome: "Escola de Formação de Oficiais da Marinha Mercante",
    sigla: "EFOMM",
    emoji: "🌊",
    cor: "#0EA5E9",
    forca: "Marinha",
    imagemBg: "/images/concursos/efomm.jpg",
  },
  ime: {
    nome: "Instituto Militar de Engenharia",
    sigla: "IME",
    emoji: "🔬",
    cor: "#22C55E",
    forca: "Exército",
    imagemBg: "/images/concursos/ime.jpg",
  },
  enem: {
    nome: "Exame Nacional do Ensino Médio",
    sigla: "ENEM",
    emoji: "📚",
    cor: "#F59E0B",
    forca: "Vestibular",
    imagemBg: "/images/concursos/enem.jpg",
  },
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
        <Link href="/concursos" className="text-bat-gold-400 hover:underline mt-4 inline-block">
          ← Voltar aos concursos
        </Link>
      </div>
    );
  }

  const siglaUpper = concurso.sigla.toUpperCase();

  const subCards = [
    {
      icon: "📖",
      titulo: `Começar a Estudar para ${['EEAR', 'ESA', 'EAM', 'EFOMM', 'EPCAR', 'ESPCEX'].includes(concurso.sigla.toUpperCase()) ? 'a' : 'o'} ${concurso.sigla}`,
      desc: "Trilha de estudos completa: matérias, assuntos e conteúdo organizado por edital verticalizado.",
      href: `/concursos/${sigla}/trilha`,
      bgImg: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80",
      cor: concurso.cor,
    },
    {
      icon: "❓",
      titulo: `Banco de Questões ${concurso.sigla}`,
      desc: "Questões comentadas da banca com filtros por matéria, ano e nível de dificuldade.",
      href: `/questoes?concurso=${siglaUpper}`,
      bgImg: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
      cor: "#F5C518",
    },
    {
      icon: "💡",
      titulo: `Bizus Estratégicos ${concurso.sigla}`,
      desc: "Macetes, atalhos táticos e fórmulas de alto impacto para gabaritar a prova.",
      href: `/bizus?concurso=${siglaUpper}`,
      bgImg: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
      cor: "#A855F7",
    },
    {
      icon: "⏱️",
      titulo: `Simulado Oficial ${concurso.sigla}`,
      desc: "Simulado cronometrado com ranking em tempo real e análise detalhada de desempenho.",
      href: `/simulados?concurso=${siglaUpper}`,
      bgImg: "https://images.unsplash.com/photo-1501139083538-0139583c060f?auto=format&fit=crop&w=600&q=80",
      cor: "#EF4444",
    },
    {
      icon: "📊",
      titulo: `Minhas Estatísticas no ${concurso.sigla}`,
      desc: "Taxa de acertos por matéria, horas líquidas estudadas e histórico de evolução.",
      href: `/dashboard?concurso=${siglaUpper}`,
      bgImg: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      cor: "#22C55E",
    },
  ];

  // Cards extras para ENEM (4 Áreas do Conhecimento + Redação Nota 1000)
  if (sigla === "enem") {
    subCards.push(
      {
        icon: "🔬",
        titulo: "Ciências da Natureza",
        desc: "Física, Química e Biologia contextualizadas no modelo ENEM.",
        href: `/questoes?concurso=ENEM&area=natureza`,
        bgImg: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
        cor: "#06B6D4",
      },
      {
        icon: "🏛️",
        titulo: "Ciências Humanas",
        desc: "História, Geografia, Filosofia e Sociologia com análise de gráficos e textos.",
        href: `/questoes?concurso=ENEM&area=humanas`,
        bgImg: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=600&q=80",
        cor: "#8B5CF6",
      },
      {
        icon: "🗣️",
        titulo: "Linguagens e Códigos",
        desc: "Língua Portuguesa, Literatura, Interpretação de Texto, Artes e Língua Estrangeira.",
        href: `/questoes?concurso=ENEM&area=linguagens`,
        bgImg: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80",
        cor: "#EC4899",
      },
      {
        icon: "✍️",
        titulo: "Redação Nota 1000",
        desc: "Estrutura dissertativo-argumentativa, repertórios socioculturais e propostas de intervenção.",
        href: `/bizus?concurso=ENEM&tema=redacao`,
        bgImg: "https://images.unsplash.com/photo-1455849318743-b2233052fcff?auto=format&fit=crop&w=600&q=80",
        cor: "#F97316",
      },
    );
  }

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      {/* ═══ CABEÇALHO DO CONCURSO COM BANNER TEMÁTICO ═══ */}
      <div className="relative mb-8 rounded-3xl overflow-hidden border border-bat-border bg-[#0B0B0F] shadow-2xl min-h-[190px] flex items-center">
        {/* Foto de Fundo Criada do Concurso */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90 scale-100 transition-transform duration-700 hover:scale-105"
          style={{
            backgroundImage: `url(${concurso.imagemBg})`,
          }}
        />
        {/* Overlay suave focado na leitura do texto à esquerda */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="relative w-full p-6 sm:p-8">
          <Link
            href="/concursos"
            className="text-bat-text-muted text-xs hover:text-bat-gold-400 transition-colors no-underline mb-3 inline-flex items-center gap-1.5"
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

      {/* ═══ SUB-CARDS TEMÁTICOS COM IMAGENS DE FUNDO E OVERLAY ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {subCards.map((card, i) => (
          <Link
            key={i}
            href={card.href}
            className="group relative bg-bat-bg-card border border-bat-border rounded-3xl p-6 no-underline overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-bat-gold-400/50 hover:shadow-[0_0_25px_rgba(245,197,24,0.15)] flex flex-col justify-between min-h-[170px]"
          >
            {/* Imagem de Fundo Temática com Zoom no Hover */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 group-hover:opacity-35 group-hover:scale-110 transition-all duration-700"
              style={{ backgroundImage: `url(${card.bgImg})` }}
            />
            {/* Overlay Escuro */}
            <div className="absolute inset-0 bg-gradient-to-t from-bat-bg-card via-bat-bg-card/85 to-transparent" />

            {/* Barra lateral colorida de identificação */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1.5 opacity-60 group-hover:opacity-100 transition-opacity"
              style={{ background: card.cor }}
            />

            {/* Conteúdo */}
            <div className="relative z-10 pl-2">
              <span className="text-3xl mb-3 block">{card.icon}</span>
              <h3 className="heading text-base font-bold text-bat-text mb-2 group-hover:text-bat-gold-400 transition-colors">
                {card.titulo}
              </h3>
              <p className="text-bat-text-secondary text-xs leading-relaxed">
                {card.desc}
              </p>
            </div>

            {/* Seta de ação hover */}
            <div className="relative z-10 flex justify-end mt-4">
              <span className="text-xs font-bold text-bat-gold-400 opacity-0 group-hover:opacity-100 transform translate-x-[-6px] group-hover:translate-x-0 transition-all flex items-center gap-1">
                <span>Acessar</span>
                <span>→</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
