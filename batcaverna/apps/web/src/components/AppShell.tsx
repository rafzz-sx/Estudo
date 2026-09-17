"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BatBrand } from "@/components/BatLogo";
import { fetchWithAuth, useAuthStore } from "@/stores/auth-store";
import { useStudySessionStore } from "@/stores/study-session-store";
import { StudySessionBadge, StudySessionTracker } from "@/components/StudySessionWidget";
import { NotificationCenter } from "@/components/NotificationCenter";
import { XpToast } from "@/components/XpToast";
import { DynamicIsland } from "@/components/DynamicIsland";
import { usePlayerStore } from "@/stores/player-store";
import { ConviteFeedback } from "@/components/ConviteFeedback";

// ─── Links do menu categorizados ──────────────────────────────
interface NavLink {
  href: string;
  label: string;
  icon: string;
  /** Nome do contador a exibir como selo. Só "revisoes" por enquanto. */
  contador?: "revisoes";
}

interface NavSection {
  id: string;
  title: string;
  links: NavLink[];
}

const navSectionsBase: NavSection[] = [
  {
    id: "estudo",
    title: "Estudo Ativo",
    links: [
      { href: "/dashboard", label: "Plano de Hoje", icon: "🏠" },
      { href: "/questoes", label: "Questões", icon: "❓" },
      { href: "/simulado", label: "Simulado", icon: "⏱️" },
      { href: "/redacao", label: "Redação", icon: "✍️" },
      { href: "/cronograma", label: "Cronograma", icon: "🗓️" },
    ],
  },
  {
    id: "retencao",
    title: "Retenção & Tática",
    links: [
      { href: "/revisoes", label: "Revisões", icon: "🔁", contador: "revisoes" },
      { href: "/caderno", label: "Caderno de Erros", icon: "📓" },
      { href: "/bizus", label: "Bizus", icon: "💡" },
      { href: "/progresso", label: "Meu Progresso", icon: "📊" },
      { href: "/concursos", label: "Concursos", icon: "🎯" },
    ],
  },
  {
    id: "esquadrao",
    title: "Esquadrão & Foco",
    links: [
      { href: "/chat", label: "Chat & Squad", icon: "💬" },
      { href: "/ranking", label: "Ranking", icon: "🏆" },
      { href: "/musica", label: "Música", icon: "🎧" },
    ],
  },
  {
    id: "conta",
    title: "Conta & Apoio",
    links: [
      { href: "/perfil", label: "Meu Perfil", icon: "👤" },
      { href: "/perfil?tab=config", label: "Configurações", icon: "⚙️" },
      { href: "/tickets", label: "Suporte", icon: "🎫" },
      { href: "/feedback", label: "Feedback", icon: "⭐" },
    ],
  },
];

const adminLink: NavLink = { href: "/admin", label: "Painel Admin", icon: "🛡️" };

/** Todos os atalhos para a barra móvel com rolagem horizontal suave */
const bottomNavItemsBase: NavLink[] = [
  { href: "/dashboard", label: "Hoje", icon: "🏠" },
  { href: "/questoes", label: "Questões", icon: "❓" },
  { href: "/simulado", label: "Simulado", icon: "⏱️" },
  { href: "/redacao", label: "Redação", icon: "✍️" },
  { href: "/cronograma", label: "Cronograma", icon: "🗓️" },
  { href: "/revisoes", label: "Revisões", icon: "🔁", contador: "revisoes" },
  { href: "/caderno", label: "Caderno", icon: "📓" },
  { href: "/bizus", label: "Bizus", icon: "💡" },
  { href: "/chat", label: "Chat", icon: "💬" },
  { href: "/ranking", label: "Ranking", icon: "🏆" },
  { href: "/musica", label: "Música", icon: "🎧" },
  { href: "/progresso", label: "Progresso", icon: "📊" },
  { href: "/concursos", label: "Concursos", icon: "🎯" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
  { href: "/perfil?tab=config", label: "Config", icon: "⚙️" },
];

/** Quantas revisões espaçadas venceram — vira o selo vermelho no menu. */
function useRevisoesPendentes() {
  const [pendentes, setPendentes] = useState(0);

  useEffect(() => {
    const buscar = async () => {
      try {
        const res = await fetchWithAuth("/api/revisoes?limite=1");
        if (!res.ok) return;
        const json = await res.json();
        if (json.success) setPendentes(json.data.vencidas ?? 0);
      } catch {
        // O selo é um extra: falhar aqui não pode atrapalhar a navegação.
      }
    };
    buscar();
    // Revisão vence por data, não por minuto: 10 minutos é frequência de sobra.
    const t = setInterval(buscar, 600_000);
    return () => clearInterval(t);
  }, []);

  return pendentes;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const revisoesPendentes = useRevisoesPendentes();

  // Sincronizar tab ativa da URL para destacar Perfil vs Configurações
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setCurrentTab(params.get("tab") || "");
    }
  }, [pathname]);

  // Dados REAIS do auth store
  const storeUser = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logout = useAuthStore((state) => state.logout);

  // 1. Sincronizar dados do usuário (avatar, banner, bio, stats) do Supabase
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const res = await fetchWithAuth("/api/usuarios/me");
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            updateUser(json.data);
          }
        }
      } catch (e) {
        console.warn("Erro ao sincronizar perfil:", e);
      }
    };
    syncProfile();
  }, [updateUser]);

  const userApelido = storeUser?.apelido || storeUser?.nome || "Soldado";
  const userNivel = storeUser?.nivel_atual || 1;
  const userRole = storeUser?.role || "user";
  const userAvatar = storeUser?.avatar_url;

  // Se for admin, adiciona o link na seção de Conta
  const navSections = navSectionsBase.map((sec) => {
    if (sec.id === "conta" && userRole === "admin") {
      return { ...sec, links: [...sec.links, adminLink] };
    }
    return sec;
  });

  const toggleSection = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const bottomNavRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const bottomNavItems = userRole === "admin"
    ? [...bottomNavItemsBase, { href: "/admin", label: "Admin", icon: "🛡️" }]
    : bottomNavItemsBase;

  // Handlers para permitir arrastar e deslizar livremente tanto com o dedo (touch) quanto com o mouse
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!bottomNavRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - bottomNavRef.current.offsetLeft;
    scrollLeftRef.current = bottomNavRef.current.scrollLeft;
    hasDraggedRef.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !bottomNavRef.current) return;
    const x = e.pageX - bottomNavRef.current.offsetLeft;
    const distance = x - startXRef.current;
    if (Math.abs(distance) > 6) {
      hasDraggedRef.current = true;
    }
    bottomNavRef.current.scrollLeft = scrollLeftRef.current - distance;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleLogout = async () => {
    try {
      await fetchWithAuth("/api/auth/logout", { method: "POST" });
    } catch {}
    logout();
    router.push("/auth");
  };

  // Há faixa carregada no player? O <main> usa isto para abrir espaço.
  const tocandoAlgo = usePlayerStore((s) => s.fila.length > 0);

  const renderNavLinks = (links: NavLink[], onNavigate?: () => void) => {
    return (
      <div className="space-y-1">
        {links.map((link) => {
          const isConfig = link.href.includes("tab=config");
          const isPerfil = link.href === "/perfil";
          const isActive = isConfig
            ? pathname === "/perfil" && currentTab === "config"
            : isPerfil
            ? pathname === "/perfil" && currentTab !== "config"
            : (pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href + "/")));

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => {
                if (isConfig) setCurrentTab("config");
                else if (isPerfil) setCurrentTab("");
                if (onNavigate) onNavigate();
              }}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium no-underline transition-all duration-200 ${
                isActive
                  ? "bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/30 glow-gold font-bold"
                  : "text-bat-text-secondary hover:bg-bat-bg-elevated hover:text-bat-text border border-transparent"
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span className="flex-1 truncate">{link.label}</span>
              {link.contador === "revisoes" && revisoesPendentes > 0 && (
                <span className="min-w-5 rounded-full bg-bat-gold-400 px-1.5 text-center text-[10px] font-extrabold text-black">
                  {revisoesPendentes > 99 ? "99+" : revisoesPendentes}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bat-bg flex w-full max-w-full overflow-x-hidden">
      {/* Player global: fica fora da árvore de páginas para a música não
          parar a cada navegação. Só aparece quando há algo tocando. */}
      <DynamicIsland />

      {/* Convite de feedback após 1h e 3h de uso acumulado */}
      <ConviteFeedback />

      {/* Motor da sessão de estudo */}
      <StudySessionTracker />

      {/* Toast flutuante de XP e Level Up (via React Portal para nunca ser cortado pelo header ou filtros) */}
      <XpToast />

      {/* ═══ SIDEBAR (Desktop) ═══ */}
      <aside className="hidden lg:flex flex-col w-64 bg-bat-bg-card border-r border-bat-border fixed inset-y-0 z-20">
        {/* Logo e Notificações */}
        <div className="px-5 py-5 border-b border-bat-border flex items-center justify-between">
          <BatBrand iconSize={36} textSize="text-xl" className="!items-start" />
          <NotificationCenter align="left" />
        </div>

        {/* Status de Estudo na Sidebar */}
        <div className="px-4 py-3 border-b border-bat-border/50 bg-bat-bg-secondary/40">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-bat-text-secondary uppercase tracking-wider">
              Central de Estudo
            </span>
          </div>
          <StudySessionBadge />
        </div>

        {/* Nav categorizado com seções colapsáveis */}
        <nav className="flex-1 py-3 px-3 space-y-3 overflow-y-auto custom-scrollbar">
          {navSections.map((section) => {
            const isCollapsed = !!collapsedSections[section.id];
            const hasActiveChild = section.links.some((link) => {
              if (link.href.includes("tab=config")) {
                return pathname === "/perfil" && currentTab === "config";
              }
              if (link.href === "/perfil") {
                return pathname === "/perfil" && currentTab !== "config";
              }
              return pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href + "/"));
            });

            // Se tem item ativo e o usuário não colapsou explicitamente, mantém expandido
            const displayCollapsed = isCollapsed && !hasActiveChild;

            return (
              <div key={section.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-bat-text-muted hover:text-bat-text transition-colors cursor-pointer"
                >
                  <span>{section.title}</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-200 text-bat-text-muted ${
                      displayCollapsed ? "-rotate-90" : "rotate-0"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {!displayCollapsed && renderNavLinks(section.links)}
              </div>
            );
          })}
        </nav>

        {/* Usuário no rodapé */}
        <div className="px-4 py-4 border-t border-bat-border">
          <Link
            href="/perfil"
            onClick={() => setCurrentTab("")}
            className="flex items-center gap-3 p-2 -m-2 rounded-xl hover:bg-bat-bg-elevated transition-all group cursor-pointer"
            title="Acessar Meu Perfil & Configurações"
          >
            <div className="w-9 h-9 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 group-hover:border-bat-gold-400 flex items-center justify-center text-bat-gold-400 text-sm font-bold overflow-hidden flex-shrink-0 transition-colors">
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                userApelido[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-bat-text text-sm font-medium truncate group-hover:text-bat-gold-400 transition-colors">{userApelido}</p>
              <p className="text-bat-gold-400 text-xs font-semibold">Nível {userNivel}</p>
            </div>
            {userRole === "admin" && <span className="badge-admin">ADMIN</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="mt-3 w-full py-2 rounded-lg text-xs font-medium text-bat-text-muted hover:text-bat-error hover:bg-bat-error/10 border border-transparent hover:border-bat-error/20 transition-all cursor-pointer"
          >
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ═══ TOPBAR MOBILE ═══ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-bat-bg-card/95 backdrop-blur-md border-b border-bat-border px-3 py-2.5">
        <div className="flex items-center justify-between gap-2 max-w-full">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-bat-text p-1 hover:bg-bat-bg-elevated rounded-lg transition cursor-pointer shrink-0"
              aria-label="Abrir Menu Completo"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <BatBrand iconSize={22} textSize="text-sm sm:text-base" />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <NotificationCenter align="right" />
            <StudySessionBadge />
            <Link
              href="/perfil"
              onClick={() => setCurrentTab("")}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 hover:border-bat-gold-400 flex items-center justify-center text-bat-gold-400 text-xs font-bold overflow-hidden shrink-0 transition-all active:scale-95 cursor-pointer"
              title="Meu Perfil e Configurações"
              aria-label="Meu Perfil e Configurações"
            >
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                userApelido[0]?.toUpperCase()
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ SIDEBAR MOBILE (drawer / overlay) ═══ */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-xs z-40"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-bat-bg-card border-r border-bat-border z-40 flex flex-col h-full animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-5 py-5 border-b border-bat-border">
              <BatBrand iconSize={32} textSize="text-lg" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-bat-text-muted hover:text-bat-text transition cursor-pointer p-1"
                aria-label="Fechar menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-3 mx-3 mt-3 bg-bat-bg-secondary/60 border border-bat-border rounded-xl">
              <p className="text-[10px] text-bat-text-muted mb-1.5 uppercase font-semibold">Central de Estudo</p>
              <StudySessionBadge />
            </div>

            <nav className="flex-1 py-3 px-3 space-y-3 overflow-y-auto overscroll-contain">
              {navSections.map((section) => (
                <div key={section.id} className="space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                    {section.title}
                  </div>
                  {renderNavLinks(section.links, () => setSidebarOpen(false))}
                </div>
              ))}
            </nav>

            {/* Usuário e Logout no menu mobile */}
            <div className="px-4 py-3 border-t border-bat-border">
              <Link
                href="/perfil"
                onClick={() => {
                  setCurrentTab("");
                  setSidebarOpen(false);
                }}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-bat-bg-elevated transition-all group"
              >
                <div className="w-8 h-8 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 flex items-center justify-center text-bat-gold-400 text-xs font-bold overflow-hidden flex-shrink-0">
                  {userAvatar ? (
                    <img src={userAvatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    userApelido[0]?.toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-bat-text text-xs font-medium truncate group-hover:text-bat-gold-400">{userApelido}</p>
                  <p className="text-bat-gold-400 text-[11px] font-semibold">Nível {userNivel}</p>
                </div>
                {userRole === "admin" && <span className="badge-admin text-[10px]">ADMIN</span>}
              </Link>
              <button
                onClick={handleLogout}
                className="mt-2.5 w-full py-2 rounded-xl text-xs font-medium text-bat-text-muted hover:text-bat-error hover:bg-bat-error/10 transition-all cursor-pointer border border-transparent hover:border-bat-error/20"
              >
                Sair da conta
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ═══ BOTTOM NAVIGATION BAR MOBILE ROLÁVEL COM TODOS OS ATALHOS ═══ */}
      <nav
        aria-label="Navegação rápida móvel"
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-bat-bg-card/95 backdrop-blur-lg border-t border-bat-border/80 px-1 py-1.5 select-none"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom, 0px))" }}
      >
        <div
          ref={bottomNavRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full px-2 cursor-grab active:cursor-grabbing"
          style={{
            WebkitOverflowScrolling: "touch",
            touchAction: "pan-x",
            overscrollBehaviorX: "contain",
          }}
        >
          {bottomNavItems.map((item) => {
            const isConfig = item.href.includes("tab=config");
            const isPerfil = item.href === "/perfil";
            const isActive = isConfig
              ? pathname === "/perfil" && currentTab === "config"
              : isPerfil
              ? pathname === "/perfil" && currentTab !== "config"
              : (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")));

            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive ? "true" : undefined}
                draggable={false}
                onClick={(e) => {
                  if (hasDraggedRef.current) {
                    e.preventDefault();
                    return;
                  }
                  if (isConfig) setCurrentTab("config");
                  else if (isPerfil) setCurrentTab("");
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-3.5 rounded-xl transition-all min-h-[48px] min-w-[68px] shrink-0 relative select-none touch-manipulation ${
                  isActive
                    ? "text-bat-gold-400 font-bold bg-bat-gold-400/15 border border-bat-gold-400/30 shadow-xs glow-gold"
                    : "text-bat-text-secondary hover:text-bat-text hover:bg-bat-bg-elevated/40 border border-transparent"
                }`}
              >
                <span className="text-xl leading-none pointer-events-none">{item.icon}</span>
                <span className="text-[10px] mt-1 whitespace-nowrap font-medium pointer-events-none">{item.label}</span>
                {item.contador === "revisoes" && revisoesPendentes > 0 && (
                  <span className="absolute top-1 right-1.5 min-w-4 h-4 rounded-full bg-bat-gold-400 px-1 text-center text-[9px] font-black text-black leading-4 flex items-center justify-center">
                    {revisoesPendentes > 99 ? "99+" : revisoesPendentes}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ═══ CONTEÚDO PRINCIPAL ═══ */}
      {/* Respiro inferior 'pb-24 lg:pb-8' garante que em telas mobile a Bottom Bar
          nunca cubra os botões de ação ou o final do scroll */}
      <main
        className={`flex-1 lg:ml-64 min-w-0 w-full max-w-full min-h-screen overflow-x-hidden pb-24 lg:pb-8 ${
          tocandoAlgo ? "pt-32 lg:pt-20" : "pt-16 lg:pt-0"
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}

