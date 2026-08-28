"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BatLogo, BatBrand } from "@/components/BatLogo";

// ─── Dados dos 9 concursos com suporte a fotos reais de banner ────────
const concursos = [
  {
    sigla: "EEAR",
    nome: "Escola de Especialistas de Aeronáutica",
    forca: "Aeronáutica",
    emoji: "✈️",
    cor: "#3B82F6",
    imagem: "/images/concursos/eear.jpg",
    frase: "Sargentos Especialistas · FAB",
  },
  {
    sigla: "ESA",
    nome: "Escola de Sargentos das Armas",
    forca: "Exército",
    emoji: "⭐",
    cor: "#22C55E",
    imagem: "/images/concursos/esa.jpg",
    frase: "Praças do Exército Brasileiro",
  },
  {
    sigla: "EAM",
    nome: "Escola de Aprendizes-Marinheiros",
    forca: "Marinha",
    emoji: "⚓",
    cor: "#0EA5E9",
    imagem: "/images/concursos/eam.jpg",
    frase: "Praças da Marinha do Brasil",
  },
  {
    sigla: "CN",
    nome: "Colégio Naval",
    forca: "Marinha",
    emoji: "🚢",
    cor: "#0EA5E9",
    imagem: "/images/concursos/cn.jpg",
    frase: "Ensino Médio · Marinha do Brasil",
  },
  {
    sigla: "EPCAR",
    nome: "Escola Preparatória de Cadetes do Ar",
    forca: "Aeronáutica",
    emoji: "🛩️",
    cor: "#3B82F6",
    imagem: "/images/concursos/epcar.jpg",
    frase: "Ensino Médio · Força Aérea",
  },
  {
    sigla: "EsPCEx",
    nome: "Escola Preparatória de Cadetes do Exército",
    forca: "Exército",
    emoji: "🎖️",
    cor: "#22C55E",
    imagem: "/images/concursos/espcex.jpg",
    frase: "Oficial do Exército · Campinas",
  },
  {
    sigla: "EFOMM",
    nome: "Escola de Formação de Oficiais da Marinha Mercante",
    forca: "Marinha",
    emoji: "🌊",
    cor: "#0EA5E9",
    imagem: "/images/concursos/efomm.jpg",
    frase: "Oficial da Marinha Mercante",
  },
  {
    sigla: "IME",
    nome: "Instituto Militar de Engenharia",
    forca: "Exército",
    emoji: "🔬",
    cor: "#22C55E",
    imagem: "/images/concursos/ime.jpg",
    frase: "Engenharia Militar de Elite",
  },
  {
    sigla: "ENEM",
    nome: "Exame Nacional do Ensino Médio",
    forca: "Vestibular",
    emoji: "📚",
    cor: "#F59E0B",
    imagem: "/images/concursos/enem.jpg",
    frase: "4 áreas do conhecimento + Redação",
  },
];

// ─── Bizus de exemplo (prévia gratuita) ──────────────────────
const bizusDestaque = [
  {
    titulo: "Regra do MNEMÔNICO para Crase",
    materia: "Português",
    impacto: "🔥 Alto impacto",
    conteudo: "NUNCA crase antes de: verbo, masculino, pronomes pessoais/indefinidos, palavras repetidas. Se trocar \"a\" por \"para a\" e funcionar → tem crase!",
  },
  {
    titulo: "Triângulo de Pitágoras — Ternas rápidas",
    materia: "Matemática",
    impacto: "🔥 Alto impacto",
    conteudo: "Decore as ternas: (3,4,5), (5,12,13), (8,15,17), (7,24,25). 90% das questões de triângulo retângulo usam múltiplos dessas.",
  },
  {
    titulo: "MRU vs MRUV — Identifique em 3 segundos",
    materia: "Física",
    impacto: "⚡ Útil",
    conteudo: "Se a velocidade é constante → MRU (S = S₀ + vt). Se há aceleração → MRUV (S = S₀ + v₀t + at²/2). Olhe se tem aceleração no enunciado.",
  },
  {
    titulo: "Balanceamento por TENTATIVA — Atalho",
    materia: "Química",
    impacto: "⚡ Útil",
    conteudo: "Comece balanceando os metais, depois não-metais, depois hidrogênio, e por último o oxigênio. Funciona em 80% dos casos sem precisar de método algébrico.",
  },
];

// ─── Componente de Partículas (névoa/atmosfera) ──────────────
function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; opacity: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Criar partículas
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 197, 24, ${p.opacity})`;
        ctx.fill();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

// ─── Spotlight que segue o cursor (Luz Amarela Suave) ────────
function SpotlightEffect() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none transition-opacity duration-300"
      style={{
        background: `radial-gradient(650px circle at ${pos.x}px ${pos.y}px, rgba(245, 197, 24, 0.07), transparent 60%)`,
        zIndex: 1,
      }}
    />
  );
}

// ─── Página Principal (Landing Page) ─────────────────────────
export default function LandingPage() {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setHeroVisible(true), 100);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <SpotlightEffect />

      {/* ═══ HERO SECTION ═══ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6">
        <ParticleBackground />
        <div className="fog-layer" />

        {/* Conteúdo do Hero */}
        <div
          className={`relative z-10 text-center max-w-4xl mx-auto transition-all duration-1000 ease-out ${
            heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Logo + Nome (BatCaverna Oficial) */}
          <BatBrand
            iconSize={72}
            textSize="text-5xl sm:text-6xl md:text-7xl"
            className="mb-6"
          />

          {/* Slogan */}
          <p className="text-bat-text-secondary text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto mb-4 leading-relaxed">
            Sua central de operações para dominar os{" "}
            <span className="text-bat-purple-400 font-semibold drop-shadow-[0_0_12px_rgba(124,58,237,0.4)]">
              concursos militares
            </span>{" "}
            e o{" "}
            <span className="text-bat-purple-400 font-semibold drop-shadow-[0_0_12px_rgba(124,58,237,0.4)]">
              ENEM
            </span>.
          </p>

          <p className="text-bat-text-muted text-sm sm:text-base max-w-xl mx-auto mb-10">
            Banco de questões, simulados cronometrados, bizus estratégicos, ranking e gamificação — tudo em uma experiência imersiva.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth" className="btn-primary text-lg px-10 py-4 inline-block no-underline">
              Entrar na Caverna
            </Link>
            <Link
              href="/auth?tab=cadastro"
              className="btn-secondary text-lg px-10 py-4 inline-block no-underline"
            >
              Criar minha conta
            </Link>
          </div>

          {/* Indicador de scroll */}
          <div className="mt-16 animate-bounce">
            <svg className="w-6 h-6 mx-auto text-bat-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ═══ SEÇÃO: CONCURSOS ATENDIDOS ═══ */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading text-3xl sm:text-4xl text-center mb-4">
            <span className="text-bat-purple-400">9 concursos</span> em uma só plataforma
          </h2>
          <p className="text-bat-text-secondary text-center text-lg mb-14 max-w-2xl mx-auto">
            Conteúdo organizado por edital, com questões, bizus e simulados específicos para cada prova.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {concursos.map((c) => (
              <Link
                key={c.sigla}
                href={`/concursos/${c.sigla.toLowerCase()}`}
                className="card-glow group relative bg-bat-bg-card border border-bat-border rounded-2xl overflow-hidden cursor-pointer no-underline block hover:border-bat-purple-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Foto de Fundo Militar */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${c.imagem})`,
                    backgroundColor: "#16161E",
                  }}
                />

                {/* Sobreposição escura de contraste */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background: "linear-gradient(180deg, rgba(11,11,15,0.75) 0%, rgba(18,18,24,0.88) 60%, rgba(11,11,15,0.98) 100%)",
                  }}
                />

                {/* Barra lateral colorida da Força */}
                <div
                  className="absolute top-0 bottom-0 left-0 w-1.5 transition-all duration-300 group-hover:w-2"
                  style={{ background: c.cor }}
                />

                <div className="relative p-6 min-h-[190px] flex flex-col justify-between z-10">
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300 inline-block drop-shadow-md">
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

                    <h3 className="heading text-2xl text-bat-text font-bold mb-1 group-hover:text-bat-gold-400 transition-colors drop-shadow-md">
                      {c.sigla}
                    </h3>
                    <p className="text-bat-text-secondary text-sm leading-snug line-clamp-2">
                      {c.nome}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 flex items-center justify-between border-t border-white/10">
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
      </section>

      {/* ═══ SEÇÃO: BIZUS EM DESTAQUE ═══ */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 bg-bat-bg-secondary/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="heading text-3xl sm:text-4xl text-center mb-4">
            <span className="text-bat-gold-400">Bizus</span> em destaque
          </h2>
          <p className="text-bat-text-secondary text-center text-lg mb-14 max-w-2xl mx-auto">
            Macetes e atalhos que economizam tempo na prova. Prévia gratuita — dentro da caverna tem muito mais.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bizusDestaque.map((bizu, i) => (
              <div
                key={i}
                className="card-glow bg-bat-bg-card border border-bat-border rounded-2xl p-6 hover:border-bat-gold-400/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-bat-purple-400 bg-bat-purple-500/10 px-3 py-1 rounded-full">
                    {bizu.materia}
                  </span>
                  <span className="text-xs">{bizu.impacto}</span>
                </div>
                <h3 className="heading text-lg text-bat-text font-bold mb-3">{bizu.titulo}</h3>
                <p className="text-bat-text-secondary text-sm leading-relaxed">{bizu.conteudo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SEÇÃO: DEPOIMENTOS (placeholder) ═══ */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="heading text-3xl sm:text-4xl mb-4">
            Quem estuda na <span className="text-bat-purple-400">Caverna</span>, aprova
          </h2>
          <p className="text-bat-text-secondary text-lg mb-14">
            Em breve, depoimentos de quem conquistou a vaga dos sonhos.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
                <div className="skeleton w-12 h-12 rounded-full mx-auto mb-4" />
                <div className="skeleton h-3 w-24 mx-auto mb-3" />
                <div className="skeleton h-3 w-full mb-2" />
                <div className="skeleton h-3 w-5/6 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SEÇÃO: CTA FINAL ═══ */}
      <section className="relative z-10 py-20 sm:py-28 px-4 sm:px-6 bg-bat-bg-secondary/50">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <BatLogo size={52} glow />
          </div>
          <h2 className="heading text-3xl sm:text-4xl mb-4 text-bat-text font-bold">
            Pronto para entrar na <span className="text-bat-gold-400 drop-shadow-[0_0_15px_rgba(245,197,24,0.4)]">Caverna</span>?
          </h2>
          <p className="text-bat-text-secondary text-lg mb-8 max-w-xl mx-auto">
            Crie sua conta gratuitamente e comece a dominar os concursos militares hoje.
          </p>
          <Link href="/auth?tab=cadastro" className="btn-primary text-lg px-12 py-4 inline-block no-underline">
            Criar minha conta grátis
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative z-10 border-t border-bat-border py-12 px-4 sm:px-6 bg-bat-bg">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            {/* Logo */}
            <div>
              <BatBrand
                iconSize={32}
                textSize="text-xl"
                className="!items-start mb-3"
              />
              <p className="text-bat-text-muted text-sm leading-relaxed">
                Sua central de operações para dominar os concursos militares e o ENEM.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Plataforma</h4>
              <ul className="space-y-2 text-sm text-bat-text-muted">
                <li><Link href="/auth" className="hover:text-bat-purple-400 transition-colors">Entrar</Link></li>
                <li><Link href="/auth?tab=cadastro" className="hover:text-bat-purple-400 transition-colors">Criar conta</Link></li>
                <li><span className="opacity-50">Banco de Questões</span></li>
                <li><span className="opacity-50">Ranking</span></li>
              </ul>
            </div>

            <div>
              <h4 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Concursos</h4>
              <ul className="space-y-2 text-sm text-bat-text-muted">
                <li>EEAR · ESA · EAM</li>
                <li>CN · EPCAR</li>
                <li>EsPCEx · EFOMM · IME</li>
                <li>ENEM</li>
              </ul>
            </div>

            <div>
              <h4 className="heading text-sm text-bat-text-secondary uppercase tracking-wider mb-3">Legal</h4>
              <ul className="space-y-2 text-sm text-bat-text-muted">
                <li><Link href="/termos" className="hover:text-bat-purple-400 transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-bat-purple-400 transition-colors">Política de Privacidade</Link></li>
                <li><Link href="/contato" className="hover:text-bat-purple-400 transition-colors">Contato</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-bat-border pt-6 text-center text-bat-text-muted text-xs">
            © {new Date().getFullYear()} BatCaverna. Todos os direitos reservados.
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> · </span>
            Nenhum vínculo com DC Comics, Warner Bros ou marcas registradas de terceiros.
          </div>
        </div>
      </footer>
    </main>
  );
}
