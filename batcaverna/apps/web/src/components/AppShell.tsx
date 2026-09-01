"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BatBrand } from "@/components/BatLogo";
import { useAuthStore } from "@/stores/auth-store";
import { StudySessionTracker, StudySessionBadge } from "@/components/StudySessionWidget";

// ─── Links do menu ───────────────────────────────────────────
const navLinksBase = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/concursos", label: "Concursos", icon: "🎯" },
  { href: "/questoes", label: "Questões", icon: "❓" },
  { href: "/bizus", label: "Bizus", icon: "💡" },
  { href: "/ranking", label: "Ranking", icon: "🏆" },
  { href: "/chat", label: "Chat & Squad", icon: "💬" },
  { href: "/tickets", label: "Suporte", icon: "🎫" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
];

const adminLink = { href: "/admin", label: "Painel Admin", icon: "🛡️" };

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dados REAIS do auth store
  const storeUser = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const userApelido = storeUser?.apelido || storeUser?.nome || "Soldado";
  const userNivel = storeUser?.nivel_atual || 1;
  const userRole = storeUser?.role || "user";
  const userAvatar = storeUser?.avatar_url;

  // Só mostra link admin se o usuário for admin de verdade
  const navLinks = userRole === "admin"
    ? [...navLinksBase, adminLink]
    : navLinksBase;

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    logout();
    router.push("/auth");
  };

  return (
    <div className="min-h-screen bg-bat-bg flex">
      {/* ═══ TRACKER GLOBAL DE SESSÃO AUTOMÁTICA (LIMITE 8H) ═══ */}
      <StudySessionTracker />

      {/* ═══ SIDEBAR (Desktop) ═══ */}
      <aside className="hidden lg:flex flex-col w-64 bg-bat-bg-card border-r border-bat-border fixed inset-y-0 z-20">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-bat-border flex items-center justify-between">
          <BatBrand iconSize={36} textSize="text-xl" className="!items-start" />
        </div>

        {/* Widget de Sessão na Sidebar */}
        <div className="px-4 py-3 border-b border-bat-border/50 bg-bat-bg-secondary/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-bat-text-secondary uppercase tracking-wider">
              Sessão de Estudo
            </span>
          </div>
          <div className="mt-2">
            <StudySessionBadge />
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-200 ${
                  isActive
                    ? "bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/30 glow-gold font-bold"
                    : "text-bat-text-secondary hover:bg-bat-bg-elevated hover:text-bat-text border border-transparent"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Usuário no rodapé */}
        <div className="px-4 py-4 border-t border-bat-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 flex items-center justify-center text-bat-gold-400 text-sm font-bold overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                userApelido[0]?.toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-bat-text text-sm font-medium truncate">{userApelido}</p>
              <p className="text-bat-gold-400 text-xs font-semibold">Nível {userNivel}</p>
            </div>
            {userRole === "admin" && <span className="badge-admin">ADMIN</span>}
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full py-2 rounded-lg text-xs font-medium text-bat-text-muted hover:text-bat-error hover:bg-bat-error/10 border border-transparent hover:border-bat-error/20 transition-all cursor-pointer"
          >
            Sair da conta
          </button>
        </div>
      </aside>

      {/* ═══ TOPBAR MOBILE ═══ */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-bat-bg-card/95 backdrop-blur-md border-b border-bat-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-bat-text p-1 hover:bg-bat-bg-elevated rounded-lg transition cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <BatBrand iconSize={28} textSize="text-base" />
          </div>
          <div className="flex items-center gap-2.5">
            <StudySessionBadge />
            <div className="w-8 h-8 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 flex items-center justify-center text-bat-gold-400 text-xs font-bold overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="" className="w-full h-full object-cover" />
              ) : (
                userApelido[0]?.toUpperCase()
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ═══ SIDEBAR MOBILE (overlay) ═══ */}
      {sidebarOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 z-30"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 w-72 bg-bat-bg-card border-r border-bat-border z-40 flex flex-col animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-5 py-5 border-b border-bat-border">
              <BatBrand iconSize={32} textSize="text-lg" />
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-bat-text-muted hover:text-bat-text transition cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Sessão no mobile menu */}
            <div className="p-3 mx-3 mt-3 bg-bat-bg-secondary/60 border border-bat-border rounded-xl">
              <p className="text-[10px] text-bat-text-muted mb-1.5 uppercase font-semibold">Sessão Automática 8h</p>
              <StudySessionBadge />
            </div>

            <nav className="flex-1 py-4 px-3 space-y-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all duration-200 ${
                      isActive
                        ? "bg-bat-gold-400/15 text-bat-gold-400 border border-bat-gold-400/30 font-bold"
                        : "text-bat-text-secondary hover:bg-bat-bg-elevated hover:text-bat-text border border-transparent"
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            {/* Logout no menu mobile */}
            <div className="px-4 py-4 border-t border-bat-border">
              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl text-sm font-medium text-bat-text-muted hover:text-bat-error hover:bg-bat-error/10 transition-all cursor-pointer"
              >
                Sair da conta
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ═══ CONTEÚDO PRINCIPAL ═══ */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
