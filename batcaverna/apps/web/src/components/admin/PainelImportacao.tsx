"use client";

import { useEffect, useRef, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";

/**
 * Importação de provas pelo painel.
 *
 * Substitui o antigo "Armazém", que era uma fachada: ele inseria duas
 * questões escritas no próprio código, em colunas que nem existem mais no
 * schema. Nenhuma prova jamais entrou por ali.
 *
 * O fluxo é em dois passos de propósito. O passo de conferência mostra o
 * que entraria, o que seria recusado e por quê, e três questões de amostra
 * renderizadas como o aluno veria — tudo isso sem tocar no banco. Só
 * depois de olhar é que se grava.
 */

interface Alternativa {
  letra: string;
  texto: string;
}

interface Amostra {
  numero_original: string | null;
  materia: string;
  assunto: string;
  texto_base: string | null;
  enunciado: string;
  alternativas: Alternativa[];
  resposta_correta: string | null;
  explicacao: string | null;
  anulada: boolean;
}

interface Rejeitada {
  numero: string;
  motivo: string;
  trecho: string;
}

interface Diagnostico {
  concurso: string;
  concurso_nome: string;
  blocos_encontrados: number;
  aceitas: number;
  rejeitadas: number;
  com_gabarito: number;
  com_explicacao: number;
  com_texto_base: number;
  anuladas: number;
  ja_no_banco: number;
  a_inserir: number;
  por_materia: Record<string, number>;
  anos: (number | null)[];
}

interface Preview {
  diagnostico: Diagnostico;
  rejeitadas: Rejeitada[];
  amostra: Amostra[];
}

interface ConcursoOpcao {
  id: string;
  sigla: string;
  nome: string;
}

export function PainelImportacao() {
  const [concursos, setConcursos] = useState<ConcursoOpcao[]>([]);
  const [sigla, setSigla] = useState("");
  const [diaProva, setDiaProva] = useState("");
  const [texto, setTexto] = useState("");
  const [nomeArquivo, setNomeArquivo] = useState<string | null>(null);

  const [preview, setPreview] = useState<Preview | null>(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);

  const inputArquivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchWithAuth("/api/concursos")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setConcursos(j.data);
      })
      .catch(() => undefined);
  }, []);

  /** Lê o .txt no navegador; o conteúdo só vai para o servidor no envio. */
  const aoEscolherArquivo = async (arquivo: File) => {
    setErro(null);
    setPreview(null);
    setSucesso(null);
    try {
      const conteudo = await arquivo.text();
      setTexto(conteudo);
      setNomeArquivo(arquivo.name);

      // O nome do arquivo costuma trazer o dia da prova: "eear-cfs1-2023".
      const m = arquivo.name.match(/(cfs\s*\d|dia\s*\d|\d\s*dia|geral)/i);
      if (m && !diaProva) setDiaProva(m[1].toUpperCase());

      // E também a sigla do concurso.
      if (!sigla) {
        const achado = concursos.find((c) =>
          arquivo.name.toLowerCase().startsWith(c.sigla.toLowerCase())
        );
        if (achado) setSigla(achado.sigla);
      }
    } catch {
      setErro("Não consegui ler esse arquivo. Ele é mesmo um .txt?");
    }
  };

  const enviar = async (modo: "preview" | "confirmar") => {
    if (!texto.trim() || !sigla) {
      setErro("Escolha o concurso e carregue o .txt da prova.");
      return;
    }
    setOcupado(true);
    setErro(null);
    setSucesso(null);

    try {
      const res = await fetchWithAuth("/api/admin/questoes/importar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modo,
          texto,
          concurso_sigla: sigla,
          dia_prova: diaProva || null,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        setErro(json.error ?? "Falha na importação.");
        return;
      }

      if (modo === "preview") {
        setPreview(json.data);
      } else {
        setSucesso(json.data.mensagem);
        setPreview(null);
        setTexto("");
        setNomeArquivo(null);
        if (inputArquivo.current) inputArquivo.current.value = "";
      }
    } catch {
      setErro("Falha de conexão ao enviar a prova.");
    } finally {
      setOcupado(false);
    }
  };

  const d = preview?.diagnostico;

  return (
    <div className="space-y-5">
      {/* ═══ Explicação ═══ */}
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <h3 className="heading mb-2 text-base font-bold text-bat-text">
          📥 Importar prova
        </h3>
        <p className="text-sm leading-relaxed text-bat-text-secondary">
          Carregue o <strong>.txt</strong> da prova no formato do extrator
          (blocos <code className="text-bat-gold-400">[QUESTÃO n]</code> e a
          seção <code className="text-bat-gold-400">GABARITO COMENTADO</code> no
          fim). A conferência mostra o que entra e o que é recusado —
          <strong> sem gravar nada</strong>. Só o botão de importar grava.
        </p>
        <p className="mt-2 text-xs text-bat-text-muted">
          Questão que já está no banco é ignorada pelo SHA-256 do enunciado,
          o mesmo do pipeline em Python. Reimportar a mesma prova não duplica.
        </p>
      </div>

      {/* ═══ Formulário ═══ */}
      <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-bat-text-muted">
              Concurso
            </label>
            <select
              value={sigla}
              onChange={(e) => setSigla(e.target.value)}
              className="input-field text-sm"
            >
              <option value="">Selecione…</option>
              {concursos.map((c) => (
                <option key={c.id} value={c.sigla}>
                  {c.sigla} — {c.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-bat-text-muted">
              Dia / fase da prova <span className="opacity-60">(opcional)</span>
            </label>
            <input
              value={diaProva}
              onChange={(e) => setDiaProva(e.target.value)}
              placeholder="CFS 1, DIA 2, GERAL…"
              className="input-field text-sm"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block text-xs text-bat-text-muted">
            Arquivo da prova
          </label>
          <input
            ref={inputArquivo}
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) aoEscolherArquivo(f);
            }}
            className="block w-full cursor-pointer rounded-xl border border-bat-border bg-bat-bg-secondary px-3 py-2.5 text-sm text-bat-text-secondary file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-bat-gold-400/15 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-bat-gold-400"
          />
          {nomeArquivo && (
            <p className="mt-2 text-xs text-bat-text-muted">
              {nomeArquivo} · {(texto.length / 1024).toFixed(0)} KB carregados
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => enviar("preview")}
            disabled={ocupado || !texto || !sigla}
            className="btn-secondary px-5 py-2.5 text-sm disabled:opacity-40"
          >
            {ocupado && !preview ? "Lendo a prova…" : "🔍 Conferir antes de importar"}
          </button>

          {preview && d && d.a_inserir > 0 && (
            <button
              onClick={() => enviar("confirmar")}
              disabled={ocupado}
              className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40"
            >
              {ocupado
                ? "Importando…"
                : `✅ Importar ${d.a_inserir} questões`}
            </button>
          )}
        </div>

        {erro && (
          <p className="mt-3 rounded-xl border border-bat-error/30 bg-bat-error/10 px-3 py-2 text-sm text-bat-error">
            {erro}
          </p>
        )}
        {sucesso && (
          <p className="mt-3 rounded-xl border border-bat-success/30 bg-bat-success/10 px-3 py-2 text-sm text-bat-success">
            {sucesso}
          </p>
        )}
      </div>

      {/* ═══ Diagnóstico ═══ */}
      {d && (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
          <h3 className="heading mb-4 text-base font-bold text-bat-text">
            Conferência — {d.concurso}
            {d.anos.length > 0 && ` · ${d.anos.join(", ")}`}
          </h3>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metrica rotulo="Blocos lidos" valor={d.blocos_encontrados} />
            <Metrica rotulo="Vão entrar" valor={d.a_inserir} destaque="ok" />
            <Metrica
              rotulo="Já no banco"
              valor={d.ja_no_banco}
              destaque={d.ja_no_banco ? "aviso" : undefined}
            />
            <Metrica
              rotulo="Recusadas"
              valor={d.rejeitadas}
              destaque={d.rejeitadas ? "erro" : undefined}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metrica rotulo="Com gabarito" valor={d.com_gabarito} />
            <Metrica rotulo="Com comentário" valor={d.com_explicacao} />
            <Metrica rotulo="Com texto base" valor={d.com_texto_base} />
            <Metrica rotulo="Anuladas" valor={d.anuladas} />
          </div>

          {d.com_explicacao < d.aceitas && (
            <p className="mt-4 rounded-xl border border-bat-warning/25 bg-bat-warning/10 px-3 py-2 text-xs leading-relaxed text-bat-text-secondary">
              ⚠️ {d.aceitas - d.com_explicacao} questões vêm{" "}
              <strong>sem gabarito comentado</strong> neste arquivo. Elas entram
              como <code>pendente</code> e aparecem na fila de resolução — o
              aluno vê a resposta certa, mas não o porquê, até alguém escrever.
            </p>
          )}

          {Object.keys(d.por_materia).length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-bat-text-secondary">
                Por matéria
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(d.por_materia)
                  .sort((a, b) => b[1] - a[1])
                  .map(([materia, n]) => (
                    <span
                      key={materia}
                      className="rounded-lg border border-bat-border bg-bat-bg-secondary px-2.5 py-1 text-xs text-bat-text-secondary"
                    >
                      {materia} <strong className="text-bat-gold-400">{n}</strong>
                    </span>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Recusadas ═══ */}
      {preview && preview.rejeitadas.length > 0 && (
        <div className="rounded-2xl border border-bat-error/25 bg-bat-bg-card p-5">
          <h3 className="heading mb-1 text-base font-bold text-bat-error">
            Recusadas ({preview.rejeitadas.length})
          </h3>
          <p className="mb-3 text-xs text-bat-text-muted">
            Questão que o aluno não conseguiria responder não entra. Corrija o
            .txt e importe de novo — o que já entrou não duplica.
          </p>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {preview.rejeitadas.map((r, i) => (
              <div
                key={i}
                className="rounded-lg border border-bat-border bg-bat-bg-secondary px-3 py-2"
              >
                <p className="text-xs font-bold text-bat-text">
                  Questão {r.numero}
                  <span className="ml-2 font-normal text-bat-error">
                    {r.motivo}
                  </span>
                </p>
                <p className="mt-0.5 truncate text-[11px] text-bat-text-muted">
                  {r.trecho}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ Amostra renderizada ═══ */}
      {preview && preview.amostra.length > 0 && (
        <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-5">
          <h3 className="heading mb-1 text-base font-bold text-bat-text">
            Como vai aparecer para o aluno
          </h3>
          <p className="mb-4 text-xs text-bat-text-muted">
            As três primeiras questões, renderizadas. Se o texto vier cortado
            ou com lixo, o problema está no .txt — não importe ainda.
          </p>

          <div className="space-y-4">
            {preview.amostra.map((q, i) => (
              <article
                key={i}
                className="rounded-xl border border-bat-border bg-bat-bg-secondary/50 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-bat-gold-400/20 bg-bat-gold-400/10 px-2 py-0.5 text-[11px] font-bold text-bat-gold-400">
                    {q.materia}
                  </span>
                  <span className="rounded-lg bg-bat-bg-elevated px-2 py-0.5 text-[11px] text-bat-text-muted">
                    {q.assunto}
                  </span>
                  <span className="text-[11px] text-bat-text-muted">
                    nº {q.numero_original}
                  </span>
                  {q.anulada && (
                    <span className="rounded-lg bg-bat-warning/15 px-2 py-0.5 text-[11px] font-bold text-bat-warning">
                      anulada
                    </span>
                  )}
                </div>

                {q.texto_base && (
                  <div className="mb-2 border-l-2 border-bat-gold-400/40 pl-3 text-xs leading-relaxed text-bat-text-muted">
                    {q.texto_base}
                    {q.texto_base.length >= 400 && "…"}
                  </div>
                )}

                <p className="mb-3 whitespace-pre-line text-sm text-bat-text">
                  {q.enunciado}
                </p>

                <div className="space-y-1.5">
                  {q.alternativas.map((a) => (
                    <p
                      key={a.letra}
                      className={`rounded-lg px-2.5 py-1.5 text-xs ${
                        a.letra === q.resposta_correta
                          ? "bg-bat-success/10 font-medium text-bat-success"
                          : "text-bat-text-secondary"
                      }`}
                    >
                      <strong>{a.letra})</strong> {a.texto}
                      {a.letra === q.resposta_correta && " ✓"}
                    </p>
                  ))}
                </div>

                {q.explicacao ? (
                  <p className="mt-3 rounded-lg border border-bat-border bg-bat-bg-card px-3 py-2 text-xs leading-relaxed text-bat-text-secondary">
                    <strong className="text-bat-gold-400">Gabarito:</strong>{" "}
                    {q.explicacao}
                  </p>
                ) : (
                  <p className="mt-3 text-xs italic text-bat-warning">
                    Sem comentário no arquivo — entrará como pendente.
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Metrica({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: number;
  destaque?: "ok" | "aviso" | "erro";
}) {
  const cor =
    destaque === "ok"
      ? "text-bat-success"
      : destaque === "aviso"
      ? "text-bat-warning"
      : destaque === "erro"
      ? "text-bat-error"
      : "text-bat-text";

  return (
    <div className="rounded-xl border border-bat-border bg-bat-bg-secondary px-3 py-2.5">
      <p className="text-[11px] text-bat-text-muted">{rotulo}</p>
      <p className={`heading text-xl font-bold ${cor}`}>{valor}</p>
    </div>
  );
}
