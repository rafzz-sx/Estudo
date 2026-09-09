"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";
import {
  usePlayerStore,
  formatarTempoMusica,
  type Musica,
} from "@/stores/player-store";

interface MusicaLista extends Musica {
  genero: string | null;
  favorita: boolean;
}

interface Playlist {
  id: string;
  nome: string;
  descricao: string | null;
  musicas: Musica[];
}

type Aba = "acervo" | "favoritas" | "playlists";

export default function MusicaPage() {
  const tocarFila = usePlayerStore((s) => s.tocarFila);
  const filaAtual = usePlayerStore((s) => s.fila);
  const indiceAtual = usePlayerStore((s) => s.indice);
  const tocando = usePlayerStore((s) => s.tocando);
  const alternarPlay = usePlayerStore((s) => s.alternarPlay);

  const [aba, setAba] = useState<Aba>("acervo");
  const [busca, setBusca] = useState("");
  const [musicas, setMusicas] = useState<MusicaLista[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);

  const [modalNova, setModalNova] = useState(false);
  const [novaFaixa, setNovaFaixa] = useState({
    titulo: "",
    artista: "",
    audio_url: "",
    capa_url: "",
  });

  const [novaPlaylist, setNovaPlaylist] = useState("");
  /** Faixa cujo menu "adicionar à playlist" está aberto. */
  const [menuPara, setMenuPara] = useState<string | null>(null);

  // ─── Carregamento ──────────────────────────────────────────
  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const qs = new URLSearchParams();
      if (busca.trim().length >= 2) qs.set("busca", busca.trim());
      if (aba === "favoritas") qs.set("favoritas", "1");

      const res = await fetchWithAuth(`/api/musicas?${qs}`);
      const json = await res.json();
      if (json.success) setMusicas(json.data);
    } catch {
      setAviso("Não consegui carregar o acervo.");
    } finally {
      setCarregando(false);
    }
  }, [busca, aba]);

  /** Recarrega as playlists (com as faixas de cada uma). */
  const carregarPlaylists = useCallback(async () => {
    try {
      const res = await fetchWithAuth("/api/playlists");
      const json = await res.json();
      if (json.success) setPlaylists(json.data);
    } catch {
      /* silencioso: a aba do acervo continua utilizável sem elas */
    }
  }, []);

  // As playlists são carregadas SEMPRE, não só na aba delas: o botão de
  // "adicionar à playlist" fica em cada faixa do acervo e precisa da lista
  // para oferecer o destino.
  useEffect(() => {
    carregarPlaylists();
  }, [carregarPlaylists]);

  // Menu de playlists fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!menuPara) return;
    const fechar = () => setMenuPara(null);
    const porTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuPara(null);
    };
    // `click` no documento dispara depois do onClick do botão, então abrir
    // não fecha em seguida.
    document.addEventListener("click", fechar);
    document.addEventListener("keydown", porTecla);
    return () => {
      document.removeEventListener("click", fechar);
      document.removeEventListener("keydown", porTecla);
    };
  }, [menuPara]);

  useEffect(() => {
    if (aba === "playlists") {
      setCarregando(false);
      return;
    }
    // Busca só dispara depois que o usuário para de digitar.
    const t = setTimeout(carregar, 300);
    return () => clearTimeout(t);
  }, [carregar, aba]);

  // ─── Ações ─────────────────────────────────────────────────
  const favoritar = async (m: MusicaLista) => {
    setMusicas((atual) =>
      atual.map((x) => (x.id === m.id ? { ...x, favorita: !x.favorita } : x))
    );
    await fetchWithAuth(`/api/musicas/${m.id}/favoritar`, {
      method: "POST",
    }).catch(() => undefined);
  };

  const adicionarFaixa = async () => {
    if (!novaFaixa.titulo || !novaFaixa.audio_url) {
      setAviso("Título e URL do áudio são obrigatórios.");
      return;
    }
    const res = await fetchWithAuth("/api/musicas", {
      method: "POST",
      body: JSON.stringify(novaFaixa),
    });
    const json = await res.json();
    if (json.success) {
      setModalNova(false);
      setNovaFaixa({ titulo: "", artista: "", audio_url: "", capa_url: "" });
      setAviso("✅ Faixa adicionada ao acervo.");
      carregar();
    } else {
      setAviso(json.error ?? "Não consegui adicionar.");
    }
  };

  const criarPlaylist = async () => {
    if (novaPlaylist.trim().length < 2) return;
    const res = await fetchWithAuth("/api/playlists", {
      method: "POST",
      body: JSON.stringify({ nome: novaPlaylist.trim() }),
    });
    const json = await res.json();
    if (json.success) {
      // A resposta da criação não traz `musicas`; sem isso a playlist recém
      // criada quebraria o `p.musicas.length` do card.
      setPlaylists((p) => [{ musicas: [], ...json.data }, ...p]);
      setNovaPlaylist("");
    }
  };

  const apagarPlaylist = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja apagar a playlist "${nome}"?`)) return;
    try {
      const res = await fetchWithAuth(`/api/playlists/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.success) {
        setPlaylists((prev) => prev.filter((p) => p.id !== id));
        setAviso(`Playlist "${nome}" apagada.`);
      } else {
        setAviso(json.error || "Erro ao apagar playlist.");
      }
    } catch (err) {
      console.error("Erro ao apagar playlist:", err);
      setAviso("Erro ao conectar com o servidor.");
    }
  };

  /**
   * Põe (ou tira) uma faixa numa playlist.
   *
   * `POST /api/playlists/[id]` existia completa — valida dono, trata
   * duplicata, calcula a ordem — e NÃO TINHA UM ÚNICO CHAMADOR. Dava para
   * criar playlist, e ela ficava vazia para sempre; o texto do estado vazio
   * ainda instruía a "ir adicionando faixas do acervo", coisa que a interface
   * não permitia. Este é o gatilho que faltava.
   */
  const mexerNaPlaylist = async (
    playlistId: string,
    musica: Musica,
    acao: "adicionar" | "remover"
  ) => {
    setMenuPara(null);
    const res = await fetchWithAuth(`/api/playlists/${playlistId}`, {
      method: "POST",
      body: JSON.stringify({ musica_id: musica.id, acao }),
    }).catch(() => null);

    const json = res ? await res.json().catch(() => null) : null;

    if (!json?.success) {
      setAviso(json?.error ?? "Não consegui atualizar a playlist.");
      return;
    }

    // Reflete na tela sem esperar o servidor devolver tudo de novo.
    setPlaylists((atual) =>
      atual.map((p) => {
        if (p.id !== playlistId) return p;
        const semEla = p.musicas.filter((x) => x.id !== musica.id);
        return {
          ...p,
          musicas: acao === "adicionar" ? [...semEla, musica] : semEla,
        };
      })
    );

    const nome = playlists.find((p) => p.id === playlistId)?.nome ?? "playlist";
    setAviso(
      acao === "adicionar"
        ? `✅ "${musica.titulo}" foi para ${nome}.`
        : `Removida de ${nome}.`
    );
  };

  const musicaAtual = filaAtual[indiceAtual];

  return (
    <div>
      <header className="mb-6">
        <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
          <span>🎧</span> Trilha sonora
        </h1>
        <p className="mt-1 text-sm text-bat-text-secondary">
          A música continua tocando enquanto você navega pela plataforma — os
          controles ficam no topo, em qualquer página.
        </p>
      </header>

      {/* ═══ ABAS ═══ */}
      <div className="mb-5 flex flex-wrap gap-2">
        {(
          [
            ["acervo", "🎵 Acervo"],
            ["favoritas", "⭐ Favoritas"],
            ["playlists", "📚 Playlists"],
          ] as [Aba, string][]
        ).map(([valor, rotulo]) => (
          <button
            key={valor}
            onClick={() => setAba(valor)}
            className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              aba === valor
                ? "border-bat-gold-400/40 bg-bat-gold-400/15 text-bat-gold-400"
                : "border-bat-border bg-bat-bg-card text-bat-text-secondary hover:border-bat-gold-400/25"
            }`}
          >
            {rotulo}
          </button>
        ))}
      </div>

      {aviso && (
        <p className="mb-4 rounded-xl border border-bat-border bg-bat-bg-secondary/60 px-4 py-2.5 text-sm text-bat-text-secondary">
          {aviso}
        </p>
      )}

      {/* ═══ ACERVO / FAVORITAS ═══ */}
      {aba !== "playlists" && (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, artista ou álbum..."
              className="input-field min-w-0 flex-1"
            />
            <button
              onClick={() => setModalNova(true)}
              className="btn-secondary shrink-0 px-5 py-2.5 text-sm"
            >
              + Adicionar faixa
            </button>
            {musicas.length > 0 && (
              <button
                onClick={() => tocarFila(musicas, 0)}
                className="btn-primary shrink-0 px-5 py-2.5 text-sm"
              >
                ▶ Tocar tudo
              </button>
            )}
          </div>

          {carregando ? (
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : musicas.length === 0 ? (
            <VazioAcervo
              favoritas={aba === "favoritas"}
              temBusca={busca.trim().length >= 2}
              onAdicionar={() => setModalNova(true)}
            />
          ) : (
            <ul className="space-y-2">
              {musicas.map((m, i) => {
                const ehAtual = musicaAtual?.id === m.id;
                return (
                  <li
                    key={m.id}
                    className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all ${
                      ehAtual
                        ? "border-bat-gold-400/40 bg-bat-gold-400/10"
                        : "border-bat-border bg-bat-bg-card hover:border-bat-gold-400/25"
                    }`}
                  >
                    <button
                      onClick={() =>
                        ehAtual ? alternarPlay() : tocarFila(musicas, i)
                      }
                      className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-bat-bg-secondary"
                      aria-label={ehAtual && tocando ? "Pausar" : "Tocar"}
                    >
                      {m.capa_url ? (
                        <img src={m.capa_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-lg">🎵</span>
                      )}
                    </button>

                    <button
                      onClick={() =>
                        ehAtual ? alternarPlay() : tocarFila(musicas, i)
                      }
                      className="min-w-0 flex-1 cursor-pointer text-left"
                    >
                      <p
                        className={`truncate text-sm font-medium ${
                          ehAtual ? "text-bat-gold-400" : "text-bat-text"
                        }`}
                      >
                        {ehAtual && tocando ? "▶ " : ""}
                        {m.titulo}
                      </p>
                      <p className="truncate text-xs text-bat-text-muted">
                        {m.artista ?? "Desconhecido"}
                        {m.album ? ` · ${m.album}` : ""}
                      </p>
                    </button>

                    {m.duracao_segundos > 0 && (
                      <span className="shrink-0 text-xs text-bat-text-muted">
                        {formatarTempoMusica(m.duracao_segundos)}
                      </span>
                    )}

                    <button
                      onClick={() => favoritar(m)}
                      className="shrink-0 cursor-pointer px-1 text-lg transition-transform hover:scale-110"
                      aria-label={m.favorita ? "Desfavoritar" : "Favoritar"}
                    >
                      {m.favorita ? "⭐" : "☆"}
                    </button>

                    {/* Adicionar à playlist. A rota existia desde sempre e
                        nunca teve este botão: dava para criar playlist e ela
                        ficava vazia para sempre. */}
                    <div
                      className="relative shrink-0"
                      // O ouvinte de "clicou fora" vive no document, que fica
                      // acima da raiz do React: sem parar aqui, o mesmo clique
                      // que abre o menu chegaria lá e o fecharia na sequência.
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setMenuPara((atual) => (atual === m.id ? null : m.id))
                        }
                        className="cursor-pointer rounded-lg px-2 py-1 text-sm text-bat-text-muted transition-colors hover:bg-bat-bg-secondary hover:text-bat-gold-400"
                        aria-label={`Adicionar ${m.titulo} a uma playlist`}
                        aria-expanded={menuPara === m.id}
                      >
                        ＋
                      </button>

                      {menuPara === m.id && (
                        <div className="absolute right-0 top-full z-30 mt-1 w-56 overflow-hidden rounded-xl border border-bat-border bg-bat-bg-elevated shadow-xl">
                          <p className="border-b border-bat-border px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                            Adicionar a
                          </p>

                          {playlists.length === 0 ? (
                            <p className="px-3 py-3 text-xs text-bat-text-muted">
                              Você ainda não tem playlists. Crie uma na aba
                              📚&nbsp;Playlists.
                            </p>
                          ) : (
                            <ul className="max-h-56 overflow-y-auto py-1">
                              {playlists.map((p) => {
                                const jaTem = p.musicas.some(
                                  (x) => x.id === m.id
                                );
                                return (
                                  <li key={p.id}>
                                    <button
                                      onClick={() =>
                                        mexerNaPlaylist(
                                          p.id,
                                          m,
                                          jaTem ? "remover" : "adicionar"
                                        )
                                      }
                                      className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-xs text-bat-text transition-colors hover:bg-bat-bg-secondary"
                                    >
                                      <span className="truncate">{p.nome}</span>
                                      <span
                                        className={
                                          jaTem
                                            ? "shrink-0 text-bat-success"
                                            : "shrink-0 text-bat-text-muted"
                                        }
                                      >
                                        {jaTem ? "✓" : "+"}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {/* ═══ PLAYLISTS ═══ */}
      {aba === "playlists" && (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            <input
              value={novaPlaylist}
              onChange={(e) => setNovaPlaylist(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && criarPlaylist()}
              placeholder="Nome da nova playlist..."
              className="input-field min-w-0 flex-1"
            />
            <button
              onClick={criarPlaylist}
              disabled={novaPlaylist.trim().length < 2}
              className="btn-primary shrink-0 px-5 py-2.5 text-sm disabled:opacity-40"
            >
              Criar playlist
            </button>
          </div>

          {playlists.length === 0 ? (
            <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
              <span className="mb-3 block text-4xl">📚</span>
              <p className="text-sm text-bat-text-secondary">
                Você ainda não tem playlists. Crie uma acima e depois, no
                acervo, toque em{" "}
                <span className="text-bat-gold-400">＋</span> na faixa que
                quiser guardar.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {playlists.map((p) => (
                <div
                  key={p.id}
                  className="rounded-2xl border border-bat-border bg-bat-bg-card p-4"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-bold text-bat-text">
                        {p.nome}
                      </h3>
                      <p className="text-xs text-bat-text-muted">
                        {p.musicas.length} faixa
                        {p.musicas.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {p.musicas.length > 0 && (
                        <button
                          onClick={() => tocarFila(p.musicas, 0)}
                          className="cursor-pointer rounded-lg bg-bat-gold-400/15 px-3 py-1.5 text-xs font-bold text-bat-gold-400 hover:bg-bat-gold-400/25 transition-colors"
                        >
                          ▶ Tocar
                        </button>
                      )}
                      <button
                        onClick={() => apagarPlaylist(p.id, p.nome)}
                        title="Excluir playlist"
                        className="cursor-pointer rounded-lg border border-red-500/20 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                        aria-label={`Excluir playlist ${p.nome}`}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  {p.musicas.length > 0 ? (
                    <ul className="space-y-1">
                      {p.musicas.map((m, i) => (
                        <li
                          key={m.id}
                          className="group flex items-center gap-2 text-xs text-bat-text-secondary"
                        >
                          <span className="w-4 shrink-0 text-bat-text-muted">
                            {i + 1}.
                          </span>
                          <button
                            onClick={() => tocarFila(p.musicas, i)}
                            className="min-w-0 flex-1 cursor-pointer truncate text-left hover:text-bat-gold-400"
                          >
                            {m.titulo}
                          </button>
                          <button
                            onClick={() => mexerNaPlaylist(p.id, m, "remover")}
                            className="shrink-0 cursor-pointer px-1 text-bat-text-muted opacity-0 transition-opacity hover:text-bat-error focus:opacity-100 group-hover:opacity-100"
                            aria-label={`Tirar ${m.titulo} de ${p.nome}`}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-bat-text-muted">
                      Playlist vazia. Vá ao acervo e toque em{" "}
                      <span className="text-bat-gold-400">＋</span> na faixa que
                      quiser.
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ MODAL: ADICIONAR FAIXA ═══ */}
      {modalNova && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setModalNova(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-bat-gold-400/30 bg-bat-bg-card p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="heading mb-1 text-lg font-bold text-bat-text">
              Adicionar faixa ao acervo
            </h2>
            <p className="mb-4 text-xs leading-relaxed text-bat-text-muted">
              Informe o link direto de um arquivo de áudio (.mp3, .ogg, .m4a) ao
              qual você tem direito de acesso. A plataforma não hospeda nem
              distribui catálogo licenciado.
            </p>

            <div className="space-y-3">
              <input
                value={novaFaixa.titulo}
                onChange={(e) =>
                  setNovaFaixa({ ...novaFaixa, titulo: e.target.value })
                }
                placeholder="Título *"
                className="input-field"
              />
              <input
                value={novaFaixa.artista}
                onChange={(e) =>
                  setNovaFaixa({ ...novaFaixa, artista: e.target.value })
                }
                placeholder="Artista"
                className="input-field"
              />
              <input
                value={novaFaixa.audio_url}
                onChange={(e) =>
                  setNovaFaixa({ ...novaFaixa, audio_url: e.target.value })
                }
                placeholder="URL do áudio (https://...) *"
                className="input-field"
              />
              <input
                value={novaFaixa.capa_url}
                onChange={(e) =>
                  setNovaFaixa({ ...novaFaixa, capa_url: e.target.value })
                }
                placeholder="URL da capa (opcional — define as cores do player)"
                className="input-field"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button onClick={adicionarFaixa} className="btn-primary flex-1 py-2.5">
                Adicionar
              </button>
              <button
                onClick={() => setModalNova(false)}
                className="btn-secondary px-5 py-2.5"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function VazioAcervo({
  favoritas,
  temBusca,
  onAdicionar,
}: {
  favoritas: boolean;
  temBusca: boolean;
  onAdicionar: () => void;
}) {
  return (
    <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
      <span className="mb-3 block text-4xl">{favoritas ? "⭐" : "🎵"}</span>
      <h2 className="heading mb-2 text-lg text-bat-text">
        {favoritas
          ? "Nenhuma favorita ainda"
          : temBusca
          ? "Nada encontrado"
          : "O acervo está vazio"}
      </h2>
      <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-bat-text-secondary">
        {favoritas
          ? "Toque na estrela ao lado de uma faixa no acervo para guardá-la aqui."
          : temBusca
          ? "Tente outro termo, ou adicione a faixa ao acervo."
          : "Adicione faixas por link direto de áudio. Instrumental e lo-fi funcionam melhor para estudar — música com letra compete com a leitura."}
      </p>
      {!favoritas && (
        <button onClick={onAdicionar} className="btn-primary px-6 py-2.5">
          + Adicionar a primeira faixa
        </button>
      )}
    </div>
  );
}
