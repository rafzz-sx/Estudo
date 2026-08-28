"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── Dados dos 9 concursos com suporte a fotos de fachada e brasão ────────
const concursos = [
  {
    sigla: "EEAR",
    nome: "Escola de Especialistas de Aeronáutica",
    forca: "Aeronáutica",
    emoji: "✈️",
    cor: "#3B82F6",
    frase: "Sargentos Especialistas · Português, Matemática e Inglês",
    descricao: "Formação de sargentos especialistas da Força Aérea Brasileira.",
    gradientFrom: "#1E3A5F",
    gradientTo: "#0B1B2E",
    imagem: "/images/concursos/eear.jpg",
  },
  {
    sigla: "ESA",
    nome: "Escola de Sargentos das Armas",
    forca: "Exército",
    emoji: "⭐",
    cor: "#22C55E",
    frase: "Praças do Exército · Português, Matemática, História e Geografia",
    descricao: "Formação de sargentos combatentes do Exército Brasileiro.",
    gradientFrom: "#1A3D1A",
    gradientTo: "#0B1F0B",
    imagem: "/images/concursos/esa.jpg",
  },
  {
    sigla: "EAM",
    nome: "Escola de Aprendizes-Marinheiros",
    forca: "Marinha",
    emoji: "⚓",
    cor: "#0EA5E9",
    frase: "Praças da Marinha · Nível Fundamental/Médio",
    descricao: "Ingresso na Marinha do Brasil como Praça.",
    gradientFrom: "#0C3B5E",
    gradientTo: "#061C2E",
    imagem: "/images/concursos/eam.jpg",
  },
  {
    sigla: "CN",
    nome: "Colégio Naval",
    forca: "Marinha",
    emoji: "🚢",
    cor: "#0EA5E9",
    frase: "9º ano → Ensino Médio · Marinha do Brasil",
    descricao: "Ensino médio na Marinha. Ingresso pelo 9º ano.",
    gradientFrom: "#0C3B5E",
    gradientTo: "#061C2E",
    imagem: "/images/concursos/cn.jpg",
  },
  {
    sigla: "EPCAR",
    nome: "Escola Preparatória de Cadetes do Ar",
    forca: "Aeronáutica",
    emoji: "🛩️",
    cor: "#3B82F6",
    frase: "9º ano → Ensino Médio · Força Aérea Brasileira",
    descricao: "Ensino médio da FAB. Ingresso pelo 9º ano.",
    gradientFrom: "#1E3A5F",
    gradientTo: "#0B1B2E",
    imagem: "/images/concursos/epcar.jpg",
  },
  {
    sigla: "EsPCEx",
    nome: "Escola Preparatória de Cadetes do Exército",
    forca: "Exército",
    emoji: "🎖️",
    cor: "#22C55E",
    frase: "Oficial do Exército · Todas as disciplinas",
    descricao: "Formação de oficiais combatentes do Exército.",
    gradientFrom: "#1A3D1A",
    gradientTo: "#0B1F0B",
    imagem: "/images/concursos/espcex.jpg",
  },
  {
    sigla: "EFOMM",
    nome: "Escola de Formação de Oficiais da Marinha Mercante",
    forca: "Marinha",
    emoji: "🌊",
    cor: "#0EA5E9",
    frase: "Oficial da Marinha Mercante · Banca própria",
    descricao: "Oficial da Marinha Mercante com banca própria.",
    gradientFrom: "#0C3B5E",
    gradientTo: "#061C2E",
    imagem: "/images/concursos/efomm.jpg",
  },
  {
    sigla: "IME",
    nome: "Instituto Militar de Engenharia",
    forca: "Exército",
    emoji: "🔬",
    cor: "#22C55E",
    frase: "Oficial de Engenharia · Nível avançado",
    descricao: "Engenharia militar de alto nível.",
    gradientFrom: "#1A3D1A",
    gradientTo: "#0B1F0B",
    imagem: "/images/concursos/ime.jpg",
  },
  {
    sigla: "ENEM",
    nome: "Exame Nacional do Ensino Médio",
    forca: "Vestibular",
    emoji: "📚",
    cor: "#F59E0B",
    frase: "4 áreas + Redação · Questões contextualizadas",
    descricao: "Exame para ingresso em universidades.",
    gradientFrom: "#3D2E0B",
    gradientTo: "#1F1706",
    imagem: "/images/concursos/enem.jpg",
  },
];

export default function ConcursosPage() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
  }, []);

  return (
    <div className={`transition-all duration-700 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
      <div className="mb-8">
        <h1 className="heading text-3xl text-bat-text mb-2">Escolha seu Concurso</h1>
        <p className="text-bat-text-secondary">
          Conteúdo organizado por edital com fotos e brasões oficiais. Selecione para acessar a trilha, questões, bizus e simulados.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {concursos.map((c, index) => (
          <Link
            key={c.sigla}
            href={`/concursos/${c.sigla.toLowerCase()}`}
            className="group relative card-glow no-underline rounded-2xl overflow-hidden border border-bat-border hover:border-bat-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
            style={{
              animationDelay: `${index * 80}ms`,
            }}
          >
            {/* Foto de Fundo Militar / Fachada */}
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
              style={{
                backgroundImage: `url(${c.imagem})`,
                backgroundColor: c.gradientTo,
              }}
            />

            {/* Gradiente escuro sobre a foto para garantir contraste e leitura impecável */}
            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                background: `linear-gradient(180deg, rgba(11,11,15,0.75) 0%, rgba(18,18,24,0.88) 60%, rgba(11,11,15,0.98) 100%)`,
              }}
            />

            {/* Brilho lateral com a cor da Força Militar */}
            <div
              className="absolute top-0 bottom-0 left-0 w-1.5 transition-all duration-300 group-hover:w-2"
              style={{ background: c.cor }}
            />

            {/* Conteúdo do Card */}
            <div className="relative p-6 min-h-[220px] flex flex-col justify-between z-10">
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                      {c.emoji}
                    </span>
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border shadow-sm backdrop-blur-sm"
                      style={{
                        background: `${c.cor}25`,
                        color: c.cor,
                        borderColor: `${c.cor}40`,
                      }}
                    >
                      {c.forca}
                    </span>
                  </div>

                  <span className="text-xs text-bat-text-muted bg-black/40 px-2 py-1 rounded-md border border-white/10">
                    Edital Atualizado
                  </span>
                </div>

                <h2 className="heading text-2xl text-bat-text font-bold mb-1 group-hover:text-bat-gold-400 transition-colors drop-shadow-md">
                  {c.sigla}
                </h2>
                <p className="text-bat-text-secondary text-sm leading-snug line-clamp-2">
                  {c.nome}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
                <p className="text-bat-text-muted text-xs truncate max-w-[85%]">{c.frase}</p>
                <div className="text-bat-gold-400 group-hover:translate-x-1 transition-transform duration-300">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
