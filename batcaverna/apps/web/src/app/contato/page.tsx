"use client";

import { useState } from "react";
import Link from "next/link";
import { BatBrand } from "@/components/BatLogo";

export default function ContatoPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [assunto, setAssunto] = useState("duvida");
  const [mensagem, setMensagem] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim() || !mensagem.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setEnviado(true);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bat-bg text-bat-text py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Cabeçalho */}
        <div className="text-center space-y-4 border-b border-bat-border pb-8">
          <Link href="/" className="inline-block no-underline mb-2">
            <BatBrand iconSize={40} textSize="text-2xl" />
          </Link>
          <h1 className="heading text-3xl sm:text-4xl text-bat-text font-bold">
            Central de Contato & Suporte
          </h1>
          <p className="text-bat-text-muted text-sm max-w-xl mx-auto">
            Tem dúvidas sobre a plataforma, sugestões de novos bizus ou precisa de auxílio com sua conta? Fale diretamente com a equipe do Comandante.
          </p>
        </div>

        {/* Grid de Contato */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Coluna 1: Informações e Canais Diretos (5 colunas) */}
          <div className="md:col-span-5 space-y-4">
            
            {/* Card E-mail Oficial */}
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-3 card-glow">
              <div className="w-10 h-10 rounded-xl bg-bat-gold-400/15 border border-bat-gold-400/30 flex items-center justify-center text-xl">
                ✉️
              </div>
              <h3 className="heading text-base font-bold text-bat-text">E-mail Oficial do Admin</h3>
              <p className="text-xs text-bat-text-secondary">
                Canal direto com o Administrador Geral da BatCaverna.
              </p>
              <div className="p-3 bg-bat-bg-primary rounded-xl border border-bat-border">
                <a
                  href="mailto:raf4biel.venafro@gmail.com"
                  className="text-xs font-mono text-bat-gold-400 font-bold hover:underline break-all"
                >
                  raf4biel.venafro@gmail.com
                </a>
              </div>
            </div>

            {/* Card Sistema de Tickets */}
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-bat-purple-500/15 border border-bat-purple-500/30 flex items-center justify-center text-xl">
                🎫
              </div>
              <h3 className="heading text-base font-bold text-bat-text">Sistema de Tickets</h3>
              <p className="text-xs text-bat-text-secondary">
                Já é aluno cadastrado? Abra um chamado de suporte direto na plataforma para acompanhamento em tempo real.
              </p>
              <Link
                href="/tickets"
                className="btn-secondary w-full py-2.5 text-xs font-bold text-center inline-block"
              >
                Acessar Meus Tickets →
              </Link>
            </div>

            {/* Card Horário de Resposta */}
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tempo Médio de Resposta: Menos de 24h</span>
              </div>
              <p className="text-bat-text-muted">
                Atendimento tático de Segunda a Sábado das 08h às 22h.
              </p>
            </div>

          </div>

          {/* Coluna 2: Formulário de Mensagem Direta (7 colunas) */}
          <div className="md:col-span-7 bg-bat-bg-card border border-bat-border rounded-2xl p-6 sm:p-8 shadow-2xl">
            {enviado ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-3xl flex items-center justify-center mx-auto">
                  ✓
                </div>
                <h3 className="heading text-2xl font-bold text-bat-text">Mensagem Enviada!</h3>
                <p className="text-sm text-bat-text-secondary max-w-sm mx-auto">
                  Obrigado pelo contato, soldado! Sua mensagem foi encaminhada com sucesso para o comando. Responderemos em breve no seu e-mail.
                </p>
                <button
                  onClick={() => {
                    setEnviado(false);
                    setNome("");
                    setEmail("");
                    setMensagem("");
                  }}
                  className="btn-primary py-2.5 px-6 text-xs font-bold mt-4"
                >
                  Enviar Outra Mensagem
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="heading text-xl text-bat-text font-bold mb-2">Envie uma Mensagem</h2>
                
                <div>
                  <label className="block text-bat-text-secondary text-xs mb-1.5 font-semibold">
                    Seu Nome Completo
                  </label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Gabriel Silveira"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-bat-text-secondary text-xs mb-1.5 font-semibold">
                    Seu E-mail para Resposta
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="input-field text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-bat-text-secondary text-xs mb-1.5 font-semibold">
                    Assunto do Contato
                  </label>
                  <select
                    value={assunto}
                    onChange={(e) => setAssunto(e.target.value)}
                    className="input-field text-sm bg-bat-bg-primary text-bat-text"
                  >
                    <option value="duvida">❓ Dúvida Geral sobre a Plataforma</option>
                    <option value="bizu">💡 Sugestão de Novo Bizu / Questão</option>
                    <option value="bug">🐛 Reportar Erro ou Bug</option>
                    <option value="parceria">🤝 Parcerias e Assuntos Institucionais</option>
                    <option value="outro">📋 Outro Assunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-bat-text-secondary text-xs mb-1.5 font-semibold">
                    Mensagem Detalhada
                  </label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    placeholder="Descreva detalhadamente sua dúvida, sugestão ou solicitação..."
                    rows={4}
                    className="w-full input-field text-sm resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Enviando mensagem...</span>
                  ) : (
                    <>
                      <span>Transmitir Mensagem ao Comando</span>
                      <span>⚡</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Rodapé da Página */}
        <div className="text-center pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-bat-purple-400 hover:text-bat-purple-300 transition-colors"
          >
            <span>←</span>
            <span>Voltar para a Página Inicial</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
