"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BatBrand } from "@/components/BatLogo";
import { fetchWithAuth } from "@/stores/auth-store";
import { REGRAS_SENHA } from "@batcaverna/utils";

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

type Step = "email" | "code" | "newPassword" | "adminRecovery" | "done";

function RecuperarSenhaForm() {
  const searchParams = useSearchParams();
  const paramToken = searchParams.get("token") || "";
  const paramEmail = searchParams.get("email") || "";
  const paramModo = searchParams.get("modo") || "";

  const [step, setStep] = useState<Step>(
    paramToken ? "newPassword" : paramModo === "admin" ? "adminRecovery" : "email"
  );
  const [email, setEmail] = useState(paramEmail);
  const [token] = useState(paramToken);
  const [code, setCode] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erros, setErros] = useState<string[]>([]);
  const [mensagem, setMensagem] = useState(paramToken ? "Link validado! Digite sua nova senha abaixo." : "");

  const handleSolicitarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);
    setMensagem("");

    if (!email.trim()) {
      setErros(["Digite seu e-mail cadastrado"]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetchWithAuth("/api/auth/recuperar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const json = await res.json();

      if (!res.ok) {
        setErros([json.error || "Erro ao solicitar recuperação"]);
      } else {
        setMensagem(json.message || "Instruções enviadas para seu e-mail!");
        setStep("code");
      }
    } catch {
      setErros(["Falha de conexão com o servidor. Tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerificarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);

    if (!code.trim() || code.trim().length !== 6) {
      setErros(["Digite o código de 6 dígitos enviado ao seu e-mail"]);
      return;
    }

    setStep("newPassword");
  };

  const handleRedefinirSenha = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);
    const novosErros: string[] = [];

    // Validação estrita de senha compartilhada com o backend
    for (const regra of REGRAS_SENHA) {
      if (!regra.testa(novaSenha)) novosErros.push(regra.rotulo);
    }
    if (novaSenha !== confirmarSenha) novosErros.push("As senhas digitadas não coincidem");

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    setLoading(true);
    try {
      const payload: Record<string, string> = {
        email: email.trim(),
        nova_senha: novaSenha,
      };

      if (token) {
        payload.token = token;
      } else if (code) {
        payload.code = code.trim();
      } else if (recoveryCode) {
        payload.recovery_code = recoveryCode.trim();
      }

      const res = await fetchWithAuth("/api/auth/recuperar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();

      if (!res.ok) {
        setErros([json.error || "Erro ao redefinir senha"]);
      } else {
        setMensagem(json.message || "Senha redefinida com sucesso!");
        setStep("done");
      }
    } catch {
      setErros(["Falha de conexão com o servidor. Tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 w-full max-w-md bg-bat-bg-card border border-bat-border hover:border-[#F5C518]/30 rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors duration-300">
      {/* Título e Ícone */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-bat-text mb-1 flex items-center gap-2">
          {step === "done" && "✅ Senha Redefinida!"}
          {step === "email" && "🔐 Recuperar Senha"}
          {step === "code" && "📩 Digite o Código"}
          {step === "newPassword" && "🔑 Nova Senha"}
          {step === "adminRecovery" && "🛡️ Contingência do Administrador"}
        </h1>
        <p className="text-bat-text-muted text-sm">
          {step === "email" && "Digite o e-mail da sua conta para receber o link e o código de recuperação."}
          {step === "code" && "Digite o código de 6 dígitos enviado por e-mail ou utilize o link enviado."}
          {step === "newPassword" && "Crie uma nova senha forte para acessar sua conta com segurança."}
          {step === "adminRecovery" && "Digite o e-mail de administrador e um dos seus códigos de backup (ex: BAT-XXXX-XXXX)."}
          {step === "done" && "Sua nova senha está ativa e todas as sessões anteriores foram desconectadas."}
        </p>
      </div>

      {/* Erros */}
      {erros.length > 0 && (
        <div className="mb-4 p-3 bg-bat-error/10 border border-bat-error/30 rounded-xl">
          {erros.map((e, i) => (
            <p key={i} className="text-bat-error text-sm font-medium">• {e}</p>
          ))}
          {erros.some((e) => e.includes("Contato")) && (
            <Link
              href="/contato"
              className="mt-2 inline-block text-sm font-bold text-[#F5C518] underline underline-offset-4"
            >
              Ir para a página de Contato →
            </Link>
          )}
        </div>
      )}

      {/* Mensagem de sucesso */}
      {mensagem && step !== "done" && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <p className="text-emerald-400 text-sm font-medium">✓ {mensagem}</p>
        </div>
      )}

      {/* ─── PASSO 1: E-mail ─── */}
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
              placeholder="seu.email@exemplo.com"
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
            {loading ? "Enviando..." : "Enviar instruções de recuperação"}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => {
                setErros([]);
                setMensagem("");
                setStep("adminRecovery");
              }}
              className="text-xs text-bat-text-muted hover:text-[#F5C518] transition-colors"
            >
              🛡️ É o Administrador e está sem acesso ao e-mail? Use código de contingência
            </button>
          </div>
        </form>
      )}

      {/* ─── PASSO 2: Código ─── */}
      {step === "code" && (
        <form onSubmit={handleVerificarCodigo} className="space-y-4">
          <div>
            <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
              Código de 6 dígitos recebido no e-mail
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
            Confirmar código
          </button>

          <button
            type="button"
            onClick={() => { setStep("email"); setErros([]); setMensagem(""); }}
            className="w-full py-2 text-sm text-bat-text-muted hover:text-[#F5C518] transition-colors cursor-pointer"
          >
            ← Voltar e tentar outro e-mail
          </button>
        </form>
      )}

      {/* ─── PASSO ADMIN: Código de Contingência ─── */}
      {step === "adminRecovery" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setErros([]);
            if (!email.trim() || !recoveryCode.trim()) {
              setErros(["Preencha o e-mail do admin e o código de contingência"]);
              return;
            }
            setStep("newPassword");
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
              E-mail do Administrador
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
              Código de Contingência (Recovery Code)
            </label>
            <input
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
              placeholder="BAT-XXXX-XXXX"
              className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30 font-mono tracking-wider uppercase text-center"
            />
            <p className="mt-1 text-xs text-bat-text-muted">
              Código de uso único salvo previamente pelo administrador.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 text-base font-bold text-black bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#EAB308] hover:shadow-[0_0_25px_rgba(245,197,24,0.45)] active:scale-[0.99] rounded-xl transition-all duration-300 cursor-pointer"
          >
            Avançar para Nova Senha
          </button>

          <button
            type="button"
            onClick={() => { setStep("email"); setErros([]); setMensagem(""); }}
            className="w-full py-2 text-sm text-bat-text-muted hover:text-[#F5C518] transition-colors cursor-pointer"
          >
            ← Voltar para recuperação padrão
          </button>
        </form>
      )}

      {/* ─── PASSO 3: Nova Senha ─── */}
      {step === "newPassword" && (
        <form onSubmit={handleRedefinirSenha} className="space-y-4">
          <div>
            <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
              Nova Senha
            </label>
            <div className="relative">
              <input
                type={mostrarSenha ? "text" : "password"}
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="••••••••"
                className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30 pr-11"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bat-text-muted hover:text-[#F5C518] transition-colors cursor-pointer p-1"
                tabIndex={-1}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
              Confirmar Nova Senha
            </label>
            <div className="relative">
              <input
                type={mostrarConfirmar ? "text" : "password"}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••••"
                className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30 pr-11"
              />
              <button
                type="button"
                onClick={() => setMostrarConfirmar(!mostrarConfirmar)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-bat-text-muted hover:text-[#F5C518] transition-colors cursor-pointer p-1"
                tabIndex={-1}
                aria-label={mostrarConfirmar ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
              >
                {mostrarConfirmar ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                )}
              </button>
            </div>
          </div>

          {/* Indicador de regras de força */}
          {novaSenha && (
            <div className="space-y-1 text-[11px] p-2.5 bg-bat-bg rounded-lg border border-bat-border">
              {REGRAS_SENHA.map((regra) => {
                const ok = regra.testa(novaSenha);
                return (
                  <div
                    key={regra.rotulo}
                    className={`flex items-center gap-1.5 ${
                      ok ? "text-emerald-400 font-medium" : "text-bat-text-muted"
                    }`}
                  >
                    <span>{ok ? "✓" : "○"}</span> {regra.rotulo}
                  </div>
                );
              })}
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

      {/* ─── PASSO 4: Sucesso ─── */}
      {step === "done" && (
        <div className="space-y-4 text-center py-4">
          <div className="text-5xl mb-3">🦇</div>
          <p className="text-bat-text text-sm mb-6">
            Sua senha foi alterada com sucesso! Você já pode entrar com sua nova credencial.
          </p>

          <Link
            href="/auth"
            className="block w-full py-3.5 text-base font-bold text-black bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#EAB308] hover:shadow-[0_0_25px_rgba(245,197,24,0.45)] rounded-xl transition-all duration-300 text-center no-underline"
          >
            Fazer Login Agora
          </Link>
        </div>
      )}

      {/* Link para voltar ao login */}
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
  );
}

export default function RecuperarSenhaPage() {
  return (
    <main className="relative min-h-screen bg-bat-bg flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-hidden">
      <AuthSpotlight />

      {/* Logo */}
      <div className="relative z-10">
        <Link href="/" className="mb-8 no-underline inline-block">
          <BatBrand iconSize={44} textSize="text-2xl sm:text-3xl" />
        </Link>
      </div>

      {/* Componente encapsulado em Suspense para uso de useSearchParams */}
      <Suspense fallback={<div className="text-bat-text-muted text-sm">Carregando formulário...</div>}>
        <RecuperarSenhaForm />
      </Suspense>

      {/* Rodapé */}
      <p className="mt-8 text-center text-bat-text-muted max-w-sm mx-auto" style={{ fontSize: "11px", lineHeight: 1.5, color: "#6B7280" }}>
        BatCaverna: porque é aqui, focado e preparado, que você constrói a sua aprovação.
      </p>
    </main>
  );
}
