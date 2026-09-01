"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BatBrand } from "@/components/BatLogo";
import { useAuthStore } from "@/stores/auth-store";
import {
  validateNomeCompleto,
  isStrongPassword,
} from "@/lib/validators";

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

// ─── Dados dos concursos para seleção ────────────────────────
const concursosOpcoes = [
  { id: "eear", sigla: "EEAR", nome: "Escola de Especialistas de Aeronáutica" },
  { id: "esa", sigla: "ESA", nome: "Escola de Sargentos das Armas" },
  { id: "eam", sigla: "EAM", nome: "Escola de Aprendizes-Marinheiros" },
  { id: "cn", sigla: "CN", nome: "Colégio Naval" },
  { id: "epcar", sigla: "EPCAR", nome: "Escola Preparatória de Cadetes do Ar" },
  { id: "espcex", sigla: "EsPCEx", nome: "Escola Preparatória de Cadetes do Exército" },
  { id: "efomm", sigla: "EFOMM", nome: "Escola de Formação de Oficiais da Marinha Mercante" },
  { id: "ime", sigla: "IME", nome: "Instituto Militar de Engenharia" },
  { id: "enem", sigla: "ENEM", nome: "Exame Nacional do Ensino Médio" },
];

function AuthForm() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "cadastro">("login");
  const [mounted, setMounted] = useState(false);

  // Form login
  const [loginEmail, setLoginEmail] = useState("");
  const [loginSenha, setLoginSenha] = useState("");

  // Form cadastro
  const [nome, setNome] = useState("");
  const [apelido, setApelido] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [concursosSelecionados, setConcursosSelecionados] = useState<string[]>([]);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceiteIdade, setAceiteIdade] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Status de Validação em Tempo Real
  const [nomeStatus, setNomeStatus] = useState<{
    valid?: boolean;
    message?: string;
  }>({});

  const [apelidoStatus, setApelidoStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  const [emailStatus, setEmailStatus] = useState<{
    checking: boolean;
    available?: boolean;
    message?: string;
  }>({ checking: false });

  // Erros & Status
  const [erros, setErros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (searchParams?.get("tab") === "cadastro") {
      setTab("cadastro");
    }
  }, [searchParams]);

  // ─── Validador de Nome Completo em Tempo Real (Blindado) ─────
  useEffect(() => {
    if (!nome.trim()) {
      setNomeStatus({});
      return;
    }

    const check = validateNomeCompleto(nome);
    if (check.valid) {
      setNomeStatus({
        valid: true,
        message: "✓ Nome e sobrenome válidos!",
      });
    } else {
      setNomeStatus({
        valid: false,
        message: check.error || "Insira seu nome completo (nome e sobrenome)",
      });
    }
  }, [nome]);

  // ─── Verificador de Apelido em Tempo Real (Debounce 350ms) ────
  useEffect(() => {
    if (!apelido.trim()) {
      setApelidoStatus({ checking: false });
      return;
    }

    if (apelido.trim().length < 3) {
      setApelidoStatus({
        checking: false,
        available: false,
        message: "Apelido deve ter no mínimo 3 caracteres",
      });
      return;
    }

    setApelidoStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-availability?field=apelido&value=${encodeURIComponent(apelido.trim())}`
        );
        const data = await res.json();
        setApelidoStatus({
          checking: false,
          available: data.available,
          message: data.available ? (data.message || "✓ Este apelido está disponível!") : (data.error || "Este apelido já está em uso"),
        });
      } catch {
        setApelidoStatus({ checking: false });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [apelido]);

  // ─── Verificador de E-mail Anti-Fake em Tempo Real (Debounce 400ms) ──
  useEffect(() => {
    if (!email.trim()) {
      setEmailStatus({ checking: false });
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setEmailStatus({
        checking: false,
        available: false,
        message: "Digite um e-mail válido (ex: seu@email.com)",
      });
      return;
    }

    setEmailStatus({ checking: true });
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/auth/check-availability?field=email&value=${encodeURIComponent(email.trim())}`
        );
        const data = await res.json();
        setEmailStatus({
          checking: false,
          available: data.available,
          message: data.available ? (data.message || "✓ E-mail válido e disponível!") : (data.error || "E-mail inválido ou indisponível"),
        });
      } catch {
        setEmailStatus({ checking: false });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [email]);

  const toggleConcurso = (id: string) => {
    setConcursosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const getDestinationUrl = () => {
    const redirectParam = searchParams?.get("redirect");
    if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("/auth")) {
      return redirectParam;
    }
    return "/dashboard";
  };

  // ─── Submissão de Login ─────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);
    setLoading(true);

    const emailLimpo = loginEmail.toLowerCase().trim();
    const senhaLimpa = loginSenha;

    if (!emailLimpo || !senhaLimpa) {
      setErros(["Preencha todos os campos"]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: emailLimpo, senha: senhaLimpa }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok || !json?.success) {
        setErros([json?.error || "E-mail ou senha incorretos"]);
      } else {
        // Salvar estado na store do cliente
        if (json.data?.user && json.data?.access_token) {
          useAuthStore.getState().setAuth(
            json.data.user,
            json.data.access_token,
            json.data.refresh_token
          );
          // Garantir cookie client-side
          document.cookie = `bat_access_token=${json.data.access_token}; path=/; max-age=604800; SameSite=Lax`;
        }
        window.location.href = getDestinationUrl();
      }
    } catch (err: any) {
      console.error("Erro no login:", err);
      setErros(["Falha de conexão. Verifique sua internet ou tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  // ─── Submissão de Cadastro ──────────────────────────────────
  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);
    const novosErros: string[] = [];

    // Validação estrita de Nome Completo
    const nomeCheck = validateNomeCompleto(nome);
    if (!nomeCheck.valid) {
      novosErros.push(nomeCheck.error || "Insira seu nome e sobrenome completo");
    }

    if (!apelido.trim() || apelido.trim().length < 3)
      novosErros.push("Apelido deve ter pelo menos 3 caracteres");
    if (apelidoStatus.available === false)
      novosErros.push(apelidoStatus.message || "Apelido indisponível");

    if (!email.trim()) novosErros.push("E-mail é obrigatório");
    if (emailStatus.available === false)
      novosErros.push(emailStatus.message || "E-mail inválido ou temporário detectado");

    const senhaCheck = isStrongPassword(senha);
    if (!senhaCheck.valid) {
      novosErros.push(`Senha fraca: ${senhaCheck.errors.join(", ")}`);
    }
    if (senha !== confirmarSenha) novosErros.push("Senhas não coincidem");
    if (concursosSelecionados.length === 0)
      novosErros.push("Selecione pelo menos um concurso");
    if (!aceiteTermos) novosErros.push("Aceite os termos de uso");

    if (novosErros.length > 0) {
      setErros(novosErros);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          nome: nome.trim(),
          apelido: apelido.trim(),
          email: email.toLowerCase().trim(),
          senha,
          data_nascimento: dataNascimento,
          concursos_interesse: concursosSelecionados,
          aceite_termos: aceiteTermos,
        }),
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok || !json?.success) {
        setErros([json?.error || "Erro ao cadastrar"]);
      } else {
        // Salvar sessão diretamente e navegar para a Dashboard
        if (json.data?.user && json.data?.access_token) {
          useAuthStore.getState().setAuth(
            json.data.user,
            json.data.access_token,
            json.data.refresh_token
          );
          // Garantir cookie client-side
          document.cookie = `bat_access_token=${json.data.access_token}; path=/; max-age=604800; SameSite=Lax`;
        }
        window.location.href = getDestinationUrl();
      }
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      setErros(["Falha de conexão. Verifique sua internet ou tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="relative min-h-screen bg-bat-bg flex flex-col items-center justify-center px-4 py-8 sm:py-12 overflow-hidden">
      {/* Luz amarela suave que segue o cursor */}
      <AuthSpotlight />

      {/* Logo */}
      <div className="relative z-10">
        <Link href="/" className="mb-8 no-underline inline-block">
          <BatBrand iconSize={44} textSize="text-2xl sm:text-3xl" />
        </Link>
      </div>

      {/* Card de autenticação */}
      <div className="relative z-10 w-full max-w-md bg-bat-bg-card border border-bat-border hover:border-[#F5C518]/30 rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors duration-300">
        {/* Toggle Entrar / Criar conta */}
        <div className="flex bg-bat-bg-secondary rounded-xl p-1 mb-6 border border-bat-border/60">
          <button
            onClick={() => { setTab("login"); setErros([]); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
              tab === "login"
                ? "bg-[#F5C518] text-black shadow-[0_0_15px_rgba(245,197,24,0.35)]"
                : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab("cadastro"); setErros([]); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer ${
              tab === "cadastro"
                ? "bg-[#F5C518] text-black shadow-[0_0_15px_rgba(245,197,24,0.35)]"
                : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            Criar conta
          </button>
        </div>

        {/* Erros */}
        {erros.length > 0 && (
          <div className="mb-4 p-3 bg-bat-error/10 border border-bat-error/30 rounded-xl">
            {erros.map((e, i) => (
              <p key={i} className="text-bat-error text-sm">• {e}</p>
            ))}
          </div>
        )}

        {/* ─── LOGIN ─── */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">E-mail</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">Senha</label>
              <input
                type="password"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                placeholder="••••••••"
                className="input-field focus:!border-[#F5C518] focus:!ring-[#F5C518]/30"
                autoComplete="current-password"
              />
            </div>

            <div className="text-right">
              <Link href="/auth/recuperar" className="text-[#F5C518] hover:text-[#FDE68A] text-sm hover:underline font-medium transition-colors">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-base font-bold text-black bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#EAB308] hover:shadow-[0_0_25px_rgba(245,197,24,0.45)] active:scale-[0.99] rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar na Caverna"}
            </button>
          </form>
        )}

        {/* ─── CADASTRO ─── */}
        {tab === "cadastro" && (
          <form onSubmit={handleCadastro} className="space-y-4">
            {/* Campo: Nome Completo (Blindado) */}
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
                Nome Completo <span className="text-bat-text-muted font-normal">(Nome e Sobrenome)</span>
              </label>
              <input
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Danilo de Oliveira"
                className={`input-field ${
                  nomeStatus.valid === true
                    ? "border-emerald-500/70 focus:border-emerald-500"
                    : nomeStatus.valid === false
                    ? "border-bat-error/70 focus:border-bat-error"
                    : ""
                }`}
                required
              />
              {nome.trim().length > 0 && (
                <div className="text-[11px] px-1 mt-1">
                  {nomeStatus.valid === true ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>✓</span>
                      <span>{nomeStatus.message}</span>
                    </span>
                  ) : nomeStatus.valid === false ? (
                    <span className="text-bat-error font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{nomeStatus.message}</span>
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Campo: Apelido (Nome de Guerra) */}
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">
                Apelido (Nome de Guerra)
              </label>
              <input
                type="text"
                value={apelido}
                onChange={(e) => setApelido(e.target.value)}
                placeholder="Ex: Falcao_FAB"
                className={`input-field font-mono text-xs ${
                  apelidoStatus.available === true
                    ? "border-emerald-500/70 focus:border-emerald-500"
                    : apelidoStatus.available === false
                    ? "border-bat-error/70 focus:border-bat-error"
                    : ""
                }`}
                maxLength={20}
                required
              />
              {apelido.trim().length > 0 && (
                <div className="text-[11px] px-1 mt-1">
                  {apelidoStatus.checking ? (
                    <span className="text-bat-gold-400 flex items-center gap-1.5 animate-pulse">
                      <span>⏳</span>
                      <span>Verificando disponibilidade do apelido...</span>
                    </span>
                  ) : apelidoStatus.available === true ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>✓</span>
                      <span>{apelidoStatus.message || "Este apelido está disponível!"}</span>
                    </span>
                  ) : apelidoStatus.available === false ? (
                    <span className="text-bat-error font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{apelidoStatus.message}</span>
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Campo: E-mail Real */}
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">E-mail Real</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu.email@provedor.com"
                className={`input-field ${
                  emailStatus.available === true
                    ? "border-emerald-500/70 focus:border-emerald-500"
                    : emailStatus.available === false
                    ? "border-bat-error/70 focus:border-bat-error"
                    : ""
                }`}
                required
              />
              {email.trim().length > 0 && (
                <div className="text-[11px] px-1 mt-1">
                  {emailStatus.checking ? (
                    <span className="text-bat-gold-400 flex items-center gap-1.5 animate-pulse">
                      <span>⏳</span>
                      <span>Verificando integridade e existência do e-mail...</span>
                    </span>
                  ) : emailStatus.available === true ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <span>✓</span>
                      <span>{emailStatus.message || "E-mail válido e disponível!"}</span>
                    </span>
                  ) : emailStatus.available === false ? (
                    <span className="text-bat-error font-semibold flex items-center gap-1">
                      <span>⚠️</span>
                      <span>{emailStatus.message}</span>
                    </span>
                  ) : null}
                </div>
              )}
            </div>

            {/* Campo: Data de Nascimento */}
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">Data de Nascimento</label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="input-field"
              />
            </div>

            {/* Senhas */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">Senha</label>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-bat-text-secondary text-sm mb-1.5 font-medium">Confirmar</label>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
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

            {/* Seleção de concursos */}
            <div>
              <label className="block text-bat-text-secondary text-sm mb-2 font-medium">
                Concursos de interesse <span className="text-bat-text-muted">(selecione pelo menos 1)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {concursosOpcoes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleConcurso(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      concursosSelecionados.includes(c.id)
                        ? "bg-[#F5C518]/20 border-[#F5C518] text-[#F5C518] shadow-[0_0_12px_rgba(245,197,24,0.25)]"
                        : "bg-bat-bg-secondary border-bat-border text-bat-text-muted hover:border-[#F5C518]/40 hover:text-bat-text"
                    }`}
                    title={c.nome}
                  >
                    {c.sigla}
                  </button>
                ))}
              </div>
            </div>

            {/* Aceites */}
            <div className="space-y-2 pt-1">
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceiteTermos}
                  onChange={() => setAceiteTermos(!aceiteTermos)}
                  className="accent-[#F5C518] mt-0.5"
                />
                <span className="text-bat-text-muted text-xs leading-snug">
                  Li e aceito os{" "}
                  <Link href="/termos" className="text-[#F5C518] hover:text-[#FDE68A] hover:underline font-medium">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" className="text-[#F5C518] hover:text-[#FDE68A] hover:underline font-medium">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceiteIdade}
                  onChange={() => setAceiteIdade(!aceiteIdade)}
                  className="accent-[#F5C518] mt-0.5"
                />
                <span className="text-bat-text-muted text-xs leading-snug">
                  Declaro que tenho 18 anos ou mais, ou que possuo autorização de um responsável legal
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-base font-bold text-black bg-gradient-to-r from-[#F5C518] via-[#FFD700] to-[#EAB308] hover:shadow-[0_0_25px_rgba(245,197,24,0.45)] active:scale-[0.99] rounded-xl transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              {loading ? "Entrando na Caverna..." : "Criar minha conta"}
            </button>
          </form>
        )}
      </div>

      {/* Rodapé explicativo do nome */}
      <p className="mt-8 text-center text-bat-text-muted max-w-sm mx-auto" style={{ fontSize: "11px", lineHeight: 1.5, color: "#6B7280" }}>
        BatCaverna: porque é aqui, escondido do mundo e focado, que você vai se preparar em silêncio
        até o dia de sair vitorioso na prova — sua caverna pessoal de estudos.
      </p>
    </main>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bat-bg" />}>
      <AuthForm />
    </Suspense>
  );
}
