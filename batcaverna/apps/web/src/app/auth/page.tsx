"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BatLogo, BatBrand } from "@/components/BatLogo";

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

  // Erros & Status
  const [erros, setErros] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (searchParams?.get("tab") === "cadastro") {
      setTab("cadastro");
    }
  }, [searchParams]);

  const toggleConcurso = (id: string) => {
    setConcursosSelecionados((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const validarSenhaForte = (s: string): string[] => {
    const erros: string[] = [];
    if (s.length < 8) erros.push("Mínimo 8 caracteres");
    if (!/[A-Z]/.test(s)) erros.push("Uma letra maiúscula");
    if (!/[0-9]/.test(s)) erros.push("Um número");
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(s)) erros.push("Um caractere especial");
    return erros;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);
    setLoading(true);

    if (!loginEmail || !loginSenha) {
      setErros(["Preencha todos os campos"]);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, senha: loginSenha }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErros([json.error || "Erro ao fazer login"]);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setErros(["Falha de conexão. Tente novamente."]);
    } finally {
      setLoading(false);
    }
  };

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErros([]);
    const novosErros: string[] = [];

    if (!nome.trim()) novosErros.push("Nome é obrigatório");
    if (!apelido.trim() || apelido.trim().length < 3)
      novosErros.push("Apelido deve ter pelo menos 3 caracteres");
    if (!email.trim()) novosErros.push("E-mail é obrigatório");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      novosErros.push("E-mail inválido");

    const errosSenha = validarSenhaForte(senha);
    if (errosSenha.length > 0)
      novosErros.push(`Senha fraca: ${errosSenha.join(", ")}`);
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
        body: JSON.stringify({
          nome,
          apelido,
          email,
          senha,
          data_nascimento: dataNascimento,
          concursos_interesse: concursosSelecionados,
          aceite_termos: aceiteTermos,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErros([json.error || "Erro ao cadastrar"]);
      } else {
        window.location.href = "/dashboard";
      }
    } catch {
      setErros(["Falha de conexão. Tente novamente."]);
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
      <div className="relative z-10 w-full max-w-md bg-bat-bg-card border border-bat-border rounded-2xl p-6 sm:p-8 shadow-2xl">
        {/* Toggle Entrar / Criar conta */}
        <div className="flex bg-bat-bg-secondary rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab("login"); setErros([]); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
              tab === "login"
                ? "bg-bat-purple-500 text-white shadow-md glow-purple"
                : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab("cadastro"); setErros([]); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 cursor-pointer ${
              tab === "cadastro"
                ? "bg-bat-purple-500 text-white shadow-md glow-purple"
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
              <label className="block text-bat-text-secondary text-sm mb-1.5">E-mail</label>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-field"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5">Senha</label>
              <input
                type="password"
                value={loginSenha}
                onChange={(e) => setLoginSenha(e.target.value)}
                placeholder="••••••••"
                className="input-field"
                autoComplete="current-password"
              />
            </div>

            <div className="text-right">
              <Link href="/auth/recuperar" className="text-bat-purple-400 text-sm hover:underline">
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar na Caverna"}
            </button>
          </form>
        )}

        {/* ─── CADASTRO ─── */}
        {tab === "cadastro" && (
          <form onSubmit={handleCadastro} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-bat-text-secondary text-sm mb-1.5">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-bat-text-secondary text-sm mb-1.5">Apelido</label>
                <input
                  type="text"
                  value={apelido}
                  onChange={(e) => setApelido(e.target.value)}
                  placeholder="Seu nickname"
                  className="input-field"
                  maxLength={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-bat-text-secondary text-sm mb-1.5">Data de Nascimento</label>
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-bat-text-secondary text-sm mb-1.5">Senha</label>
                <input
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-bat-text-secondary text-sm mb-1.5">Confirmar</label>
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
                className="accent-bat-purple-500"
              />
              Mostrar senhas
            </label>

            {/* Seleção de concursos */}
            <div>
              <label className="block text-bat-text-secondary text-sm mb-2">
                Concursos de interesse <span className="text-bat-text-muted">(selecione pelo menos 1)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {concursosOpcoes.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleConcurso(c.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      concursosSelecionados.includes(c.id)
                        ? "bg-bat-purple-500/20 border-bat-purple-500 text-bat-purple-300"
                        : "bg-bat-bg-secondary border-bat-border text-bat-text-muted hover:border-bat-border-strong"
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
                  className="accent-bat-purple-500 mt-0.5"
                />
                <span className="text-bat-text-muted text-xs leading-snug">
                  Li e aceito os{" "}
                  <Link href="/termos" className="text-bat-purple-400 hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e a{" "}
                  <Link href="/privacidade" className="text-bat-purple-400 hover:underline">
                    Política de Privacidade
                  </Link>
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={aceiteIdade}
                  onChange={() => setAceiteIdade(!aceiteIdade)}
                  className="accent-bat-purple-500 mt-0.5"
                />
                <span className="text-bat-text-muted text-xs leading-snug">
                  Declaro que tenho 18 anos ou mais, ou que possuo autorização de um responsável legal
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 text-base disabled:opacity-50"
            >
              {loading ? "Criando conta..." : "Criar minha conta"}
            </button>
          </form>
        )}
      </div>

      {/* Rodapé explicativo do nome (seção 2.2 item 2) */}
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
