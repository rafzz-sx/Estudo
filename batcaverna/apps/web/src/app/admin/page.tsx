"use client";

import { useState } from "react";
import Link from "next/link";

interface ImportacaoRecente {
  id: string;
  arquivo: string;
  aceitas: number;
  duplicadas: number;
  erros: number;
  data: string;
}

const mockImportacoes: ImportacaoRecente[] = [
  {
    id: "imp1",
    arquivo: "eear_2023_portugues_matematica.json",
    aceitas: 48,
    duplicadas: 2,
    erros: 0,
    data: "28/08/2026 14:20",
  },
  {
    id: "imp2",
    arquivo: "esa_historico_questoes_v1.csv",
    aceitas: 120,
    duplicadas: 15,
    erros: 1,
    data: "27/08/2026 18:45",
  },
];

type AbaAdmin = "visao_geral" | "armazem" | "questoes" | "bizus" | "usuarios";

export default function AdminPage() {
  const [aba, setAba] = useState<AbaAdmin>("visao_geral");
  const [executandoVarredura, setExecutandoVarredura] = useState(false);
  const [logImportacao, setLogImportacao] = useState<string | null>(null);

  const handleExecutarArmazem = () => {
    setExecutandoVarredura(true);
    setLogImportacao("Iniciando varredura no bucket Supabase Storage `armazem-questoes`...");

    setTimeout(() => {
      setLogImportacao((prev) => `${prev}\n✓ 3 arquivos encontrados no bucket.`);
    }, 800);

    setTimeout(() => {
      setLogImportacao(
        (prev) =>
          `${prev}\n✓ Validando hashes SHA-256 de conteúdo para deduplicação...\n✓ 42 novas questões aceitas e inseridas no banco.\n✓ 4 duplicadas ignoradas com sucesso.\n🎉 Processo finalizado com sucesso em 2.4s.`
      );
      setExecutandoVarredura(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* ═══ CABEÇALHO ADMIN ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="heading text-3xl text-bat-text">Painel de Controle</h1>
            <span className="badge-admin">ADMINISTRADOR</span>
          </div>
          <p className="text-bat-text-secondary text-sm">
            Gestão de conteúdo, armazém de questões, auditoria e moderação da plataforma.
          </p>
        </div>
      </div>

      {/* ═══ ABAS DO ADMIN ═══ */}
      <div className="flex gap-2 bg-bat-bg-card border border-bat-border p-1.5 rounded-xl w-fit flex-wrap">
        {[
          { key: "visao_geral", label: "📊 Visão Geral" },
          { key: "armazem", label: "📦 Armazém de Questões" },
          { key: "questoes", label: "❓ Gerenciar Questões" },
          { key: "bizus", label: "💡 Gerenciar Bizus" },
          { key: "usuarios", label: "👥 Usuários & Moderação" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setAba(item.key as AbaAdmin)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              aba === item.key
                ? "bg-bat-purple-500 text-white glow-purple"
                : "text-bat-text-muted hover:text-bat-text"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* ═══ CONTEÚDO 1: VISÃO GERAL ═══ */}
      {aba === "visao_geral" && (
        <div className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Usuários Registrados</p>
              <p className="heading text-3xl font-bold text-bat-text">1.482</p>
              <p className="text-bat-success text-xs mt-1">↑ +14% esta semana</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Questões no Banco</p>
              <p className="heading text-3xl font-bold text-bat-purple-400">8.940</p>
              <p className="text-bat-text-secondary text-xs mt-1">9 concursos atendidos</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Bizus Publicados</p>
              <p className="heading text-3xl font-bold text-bat-gold-400">420</p>
              <p className="text-bat-text-secondary text-xs mt-1">15 matérias</p>
            </div>
            <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-5">
              <p className="text-bat-text-muted text-xs mb-1">Tickets Pendentes</p>
              <p className="heading text-3xl font-bold text-bat-error">2</p>
              <p className="text-bat-text-muted text-xs mt-1">Aguardando resposta</p>
            </div>
          </div>

          {/* Atividade Recente */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
            <h2 className="heading text-lg text-bat-text mb-4">Log de Auditoria Recente</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-bat-border/40">
                <span className="text-bat-text">Importação em lote de questões (EEAR 2023)</span>
                <span className="text-bat-text-muted text-xs">Hoje às 14:20</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-bat-border/40">
                <span className="text-bat-text">Novo Bizu criado: "Ternas Pitagóricas Rápidas"</span>
                <span className="text-bat-text-muted text-xs">Ontem às 19:10</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-bat-text">Ticket #t1 respondido com sucesso</span>
                <span className="text-bat-text-muted text-xs">Ontem às 16:45</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONTEÚDO 2: ARMAZÉM DE QUESTÕES ═══ */}
      {aba === "armazem" && (
        <div className="space-y-6">
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="heading text-xl text-bat-text">Varredura Automática do Armazém</h2>
                <p className="text-bat-text-secondary text-sm">
                  Varre os arquivos JSON/CSV no bucket Supabase Storage, valida a integridade e evita duplicidade usando hashing SHA-256.
                </p>
              </div>

              <button
                onClick={handleExecutarArmazem}
                disabled={executandoVarredura}
                className="btn-primary py-3 px-6 text-sm whitespace-nowrap disabled:opacity-50"
              >
                {executandoVarredura ? "Processando..." : "Executar Varredura Agora ⚡"}
              </button>
            </div>

            {/* Console de Log */}
            {logImportacao && (
              <div className="bg-bat-bg-primary border border-bat-border rounded-xl p-4 font-mono text-xs text-bat-purple-300 whitespace-pre-wrap leading-relaxed">
                {logImportacao}
              </div>
            )}
          </div>

          {/* Histórico de Importações */}
          <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6">
            <h3 className="heading text-base text-bat-text mb-4">Histórico de Importações Recentes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-bat-border text-bat-text-muted text-xs uppercase">
                    <th className="pb-3">Arquivo de Origem</th>
                    <th className="pb-3">Aceitas</th>
                    <th className="pb-3">Duplicadas</th>
                    <th className="pb-3">Erros</th>
                    <th className="pb-3 text-right">Data/Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bat-border/40">
                  {mockImportacoes.map((imp) => (
                    <tr key={imp.id}>
                      <td className="py-3 font-mono text-xs text-bat-text">{imp.arquivo}</td>
                      <td className="py-3 text-bat-success font-bold">+{imp.aceitas}</td>
                      <td className="py-3 text-bat-gold-400">{imp.duplicadas}</td>
                      <td className="py-3 text-bat-error">{imp.erros}</td>
                      <td className="py-3 text-right text-bat-text-muted text-xs">{imp.data}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONTEÚDO 3: GERENCIAR QUESTÕES ═══ */}
      {aba === "questoes" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="heading text-xl text-bat-text">Banco de Questões</h2>
            <button className="btn-primary text-xs py-2 px-4">+ Nova Questão</button>
          </div>
          <p className="text-bat-text-secondary text-sm">
            Cadastre novas questões com gabarito, explicação detalhada e vínculo direto aos bizus.
          </p>
          <div className="bg-bat-bg-secondary p-4 rounded-xl border border-bat-border text-xs text-bat-text-muted">
            💡 Dica: Você também pode usar a importação em lote na aba "Armazém de Questões" enviando arquivos JSON/CSV.
          </div>
        </div>
      )}

      {/* ═══ CONTEÚDO 4: GERENCIAR BIZUS ═══ */}
      {aba === "bizus" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="heading text-xl text-bat-text">Banco de Bizus</h2>
            <button className="btn-primary text-xs py-2 px-4">+ Novo Bizu</button>
          </div>
          <p className="text-bat-text-secondary text-sm">
            Crie novos macetes com tags de impacto (🔥 Alto impacto, ⚡ Útil, 🎓 Avançado) e exemplos práticos.
          </p>
        </div>
      )}

      {/* ═══ CONTEÚDO 5: USUÁRIOS & MODERAÇÃO ═══ */}
      {aba === "usuarios" && (
        <div className="bg-bat-bg-card border border-bat-border rounded-2xl p-6 space-y-4">
          <h2 className="heading text-xl text-bat-text">Moderação de Usuários</h2>
          <p className="text-bat-text-secondary text-sm">
            Pesquise por apelido ou e-mail para visualizar histórico, alterar permissões ou aplicar advertências.
          </p>
          <div className="flex gap-3 max-w-md">
            <input type="text" placeholder="Buscar por apelido ou e-mail..." className="input-field text-sm" />
            <button className="btn-primary text-xs py-2 px-4 whitespace-nowrap">Buscar</button>
          </div>
        </div>
      )}
    </div>
  );
}
