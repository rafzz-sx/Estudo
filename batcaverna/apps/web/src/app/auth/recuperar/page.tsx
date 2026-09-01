"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BatBrand } from "@/components/BatLogo";

// ─── Luz de fundo amarela suave que segue o cursor ────────────
function AuthSpotlight() {
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
        background: `radial-gradient(650px circle at ${pos.x}px ${pos.y}px, rgba(245, 197, 24, 0.08), transparent 60%)`,
        zIndex: 1,
      }}
    />
  );
}

type Step = "email" | "code" | "newPassword" | "done";

export default function RecuperarSenhaPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [devCode, setDevCode] = useState("");

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);
    setMensagem("");

    if (!email.trim()) {
      setErros(["Digite seu e-mail"]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErros([json.error || "Erro ao solicitar recuperação"]);
      } else {
        setMensagem(json.message || "Código enviado!");
        // Em dev, o backend retorna o código
        if (json._dev_code) {
          setDevCode(json._dev_code);
        }
        setStep("code");
      }
    } catch {
      setErros(["Falha de conexão. Tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);

    if (!code.trim() || code.trim().length !== 6) {
      setErros(["Digite o código de 6 dígitos"]);
      return;
    }

    setStep("newPassword");
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);
    const novosErros: string[] = [];

    if (novaSenha.length < 8) novosErros.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(novaSenha)) novosErros.push("Uma letra maiúscula");
    if (!/[0-9]/.test(novaSenha)) novosErros.push("Um número");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(novaSenha))
      novosErros.push("Um caractere especial");
    if (novaSenha !== confirmarSenha) novosErros.push("Senhas não coincidem");

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/recuperar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim(), nova_senha: novaSenha }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErros([json.error || "Erro ao redefinir senha"]);
      } else {
        setMensagem(json.message || "Senha redefinida!");
        setStep("done");
      }
    } catch {
      setErros(["Falha de conexão. Tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-bat-bg flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-hidden">
      <AuthSpotlight />

      {/* Logo */}
      <div className="relative z-10">
        <Link href="/" className="mb-8 no-underline inline-block">
          <BatBrand iconSize={44} textSize="text-2xl sm:text-3xl" />
        </Link>
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-bat-bg-card border border-bat-border hover:border-[#F5C518]/30 rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors duration-300">
        {/* Título */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-bat-text mb-1">
            {step === "done" ? "✅ Senha Redefinida!" : "🔐 Recuperar Senha"}
          </h1>
          <p className="text-bat-text-muted text-sm">
            {step === "email" && "Digite o e-mail da sua conta para receber o código de recuperação."}
            {step === "code" && "Digite o código de 6 dígitos enviado para seu e-mail."}
            {step === "newPassword" && "Crie uma nova senha forte para sua conta."}
            {step === "done" && "Sua senha foi alterada com sucesso. Faça login agora!"}
          </p>
        </div>

        {/* Erros */}
        {erros.length > 0 && (
          <div className="mb-4 p-3 bg-bat-error/10 border border-bat-error/30 rounded-xl">
            {erros.map((e, i) => (
              <p key={i} className="text-bat-error text-sm">• {e}</p>
            ))}
          </div>
        )}

        {/* Mensagem de sucesso */}
        {mensagem && step !== "done" && (
          <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <p className="text-emerald-400 text-sm">✓ {mensagem}</p>
          </div>
        )}

        {/* Dev code hint */}
        {devCode && step === "code" && (
          <div className="mb-4 p-3 bg-[#F5C518]/10 border border-[#F5C518]/30 rounded-xl">
            <p className="text-[#F5C518] text-sm font-mono">
              🔑 Código (dev): <span className="font-bold text-lg tracking-widest">{devCode}</span>
            </p>
          </div>
        )}

        {/* ─── STEP 1: E-mail ─── */}
        {step === "email" && (
          <form onSubmit={handleSolicitarCodigo} className="space-y-4">
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
                E-mail cadastrado
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30"
                autoComplete="email"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-base font-bold text-black bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#EAB308] hover:shadow-[0_0_25px_rgba(245,197,24,0.45)] active:scale-[0.99] rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Enviar código de recuperação"}
            </button>
          </form>
        )}

        {/* ─── STEP 2: Código ─── */}
        {step === "code" && (
          <form onSubmit={handleVerificarCodigo} className="space-y-4">
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
                Código de 6 dígitos
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30 text-center text-2xl font-mono tracking-[0.5em] font-bold"
                maxLength={6}
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={code.length !== 6}
              className="w-full py-3.5 text-base font-bold text-black bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#EAB308] hover:shadow-[0_0_25px_rgba(245,197,24,0.45)] active:scale-[0.99] rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              Verificar código
            </button>

            <button
              type="button"
              onClick={() => { setStep("email"); setErros([]); setMensagem(""); setDevCode(""); }}
              className="w-full py-2 text-sm text-bat-text-muted hover:text-[#F5C518] transition-colors cursor-pointer"
            >
              ← Voltar e tentar outro e-mail
            </button>
          </form>
        )}

        {/* ─── STEP 3: Nova senha ─── */}
        {step === "newPassword" && (
          <form onSubmit={handleRedefinirSenha} className="space-y-4">
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
                Nova Senha
              </label>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
                Confirmar Nova Senha
              </label>
              <input
                type={mostrarSenha ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30"
              />
            </div>

            <label className="flex items-center gap-2 text-bat-text-muted text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={mostrarSenha}
                onChange={() => setMostrarSenha(!mostrarSenha)}
                className="accent-[#F5C518]"
              />
              Mostrar senhas
            </label>

            {/* Indicador de força */}
            {novaSenha && (
              <div className="space-y-1 text-[11px]">
                <div className={`flex items-center gap-1.5 ${novaSenha.length >= 8 ? "text-emerald-400" : "text-bat-text-muted"}`}>
                  <span>{novaSenha.length >= 8 ? "✓" : "○"}</span> Mínimo 8 caracteres
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(novaSenha) ? "text-emerald-400" : "text-bat-text-muted"}`}>
                  <span>{/[A-Z]/.test(novaSenha) ? "✓" : "○"}</span> Uma letra maiúscula
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(novaSenha) ? "text-emerald-400" : "text-bat-text-muted"}`}>
                  <span>{/[0-9]/.test(novaSenha) ? "✓" : "○"}</span> Um número
                </div>
                <div className={`flex items-center gap-1.5 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(novaSenha) ? "text-emerald-400" : "text-bat-text-muted"}`}>
                  <span>{/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(novaSenha) ? "✓" : "○"}</span> Um caractere especial
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-base font-bold text-black bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#EAB308] hover:shadow-[0_0_25px_rgba(245,197,24,0.45)] active:scale-[0.99] rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Redefinindo..." : "Redefinir minha senha"}
            </button>
          </form>
        )}

        {/* ─── STEP 4: Sucesso ─── */}
        {step === "done" && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl mb-4">🦇</div>
              <p className="text-bat-text text-sm">
                Sua senha foi alterada com sucesso! Agora faça login com a nova senha.
              </p>
            </div>

            <Link
              href="/auth"
              className="block w-full py-3.5 text-base font-bold text-black bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#EAB308] hover:shadow-[0_0_25px_rgba(245,197,24,0.45)] rounded-xl transition-all duration-300 text-center no-underline"
            >
              Ir para o Login
            </Link>
          </div>
        )}

        {/* Link voltar */}
        {step !== "done" && (
          <div className="mt-6 text-center">
            <Link
              href="/auth"
              className="text-bat-text-muted hover:text-[#F5C518] text-sm transition-colors"
            >
              ← Voltar para o login
            </Link>
          </div>
        )}
      </div>

      {/* Rodapé */}
      <p className="mt-8 text-center text-bat-text-muted max-w-sm mx-auto" style={{ fontSize: "11px", lineHeight: 1.5, color: "#6B7280" }}>
        BatCaverna: porque é aqui, escondido do mundo e focado, que você vai se preparar em silêncio
        até o dia de sair vitorioso na prova — sua caverna pessoal de estudos.
      </p>
    </main>
  );
}
