"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BatLogo, BatBrand } from "@/components/BatLogo";

// ─── Links do menu ───────────────────────────────────────────
const navLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/concursos", label: "Concursos", icon: "🎯" },
  { href: "/questoes", label: "Questões", icon: "❓" },
  { href: "/bizus", label: "Bizus", icon: "💡" },
  { href: "/ranking", label: "Ranking", icon: "🏆" },
  { href: "/chat", label: "Chat & Squad", icon: "💬" },
  { href: "/tickets", label: "Suporte", icon: "🎫" },
  { href: "/perfil", label: "Perfil", icon: "👤" },
  { href: "/admin", label: "Painel Admin", icon: "🛡️" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Usuário padrão da sessão (Admin)
  const user = {
    apelido: "AdminCaverna",
    email: "raf4biel.venafro@gmail.com",
    role: "admin",
    nivel_atual: 15,
  };

  return (
    <div className="min-h-screen bg-bat-bg flex">
      {/* ═══ SIDEBAR (Desktop) ═══ */}
      <aside className="hidden lg:flex flex-col w-64 bg-bat-bg-card border-r border-bat-border fixed inset-y-0 z-20">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-bat-border">
          <BatBrand iconSize={36} textSize="text-xl" className="!items-start" />
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
            <div className="w-9 h-9 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 flex items-center justify-center text-bat-gold-400 text-sm font-bold">
              {user.apelido[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-bat-text text-sm font-medium truncate">{user.apelido}</p>
              <p className="text-bat-gold-400 text-xs font-semibold">Nível {user.nivel_atual}</p>
            </div>
            {user.role === "admin" && <span className="badge-admin">ADMIN</span>}
          </div>
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
          <div className="flex items-center gap-3">
            {/* Sino de notificações */}
            <button className="relative text-bat-text-secondary hover:text-bat-text transition cursor-pointer">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-bat-error rounded-full text-white text-[10px] flex items-center justify-center font-bold pulse-notification">
                3
              </span>
            </button>
            <div className="w-8 h-8 rounded-full bg-bat-gold-400/20 border border-bat-gold-400/30 flex items-center justify-center text-bat-gold-400 text-xs font-bold">
              {user.apelido[0]?.toUpperCase()}
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
