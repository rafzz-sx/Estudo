"use client";

import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/stores/auth-store";
import {
  usePlayerStore,
  formatarTempoMusica,
  type Musica,
} from "@/stores/player-store";
import {
  ArrowLeft,
  Play,
  Plus,
  Trash2,
  Image as ImageIcon,
  Music,
  Clock,
  Sparkles,
  ListMusic,
  ChevronRight,
} from "lucide-react";

interface MusicaLista extends Musica {
  genero: string | null;
  favorita: boolean;
  ehMinha?: boolean;
}

interface Playlist {
  id: string;
  nome: string;
  descricao: string | null;
  capa_url?: string | null;
  musicas: Musica[];
}

const PRESETS_CAPAS_PLAYLIST = [
  {
    nome: "Bat-Foco",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    emoji: "🦇",
  },
  {
    nome: "Lo-Fi Noite",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80",
    emoji: "🎧",
  },
  {
    nome: "Cyberpunk",
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80",
    emoji: "⚡",
  },
  {
    nome: "Biblioteca",
    url: "https://images.unsplash.com/photo-1507842229451-7f01be7fe8e5?w=600&auto=format&fit=crop&q=80",
    emoji: "📚",
  },
  {
    nome: "Cósmico",
    url: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80",
    emoji: "🌌",
  },
  {
    nome: "Chuva Suave",
    url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80",
    emoji: "🌧️",
  },
];

function calcularDuracaoTotalPlaylist(faixas: Musica[]) {
  const segs = faixas.reduce((acc, m) => acc + (m.duracao_segundos || 0), 0);
  const min = Math.floor(segs / 60);
  const s = segs % 60;
  if (min === 0) return `${s}s`;
  return `${min} min${s > 0 ? ` ${s}s` : ""}`;
}

type Aba = "acervo" | "favoritas" | "playlists";
type OrigemAcervo = "todas" | "minhas" | "batcaverna";

export default function MusicaPage() {
  const tocarFila = usePlayerStore((s) => s.tocarFila);
  const filaAtual = usePlayerStore((s) => s.fila);
  const indiceAtual = usePlayerStore((s) => s.indice);
  const tocando = usePlayerStore((s) => s.tocando);
  const alternarPlay = usePlayerStore((s) => s.alternarPlay);

  const [aba, setAba] = useState<Aba>("acervo");
  const [origemAcervo, setOrigemAcervo] = useState<OrigemAcervo>("todas");
  const [busca, setBusca] = useState("");
  const [musicas, setMusicas] = useState<MusicaLista[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aviso, setAviso] = useState<string | null>(null);
  const [mostrarAjuda, setMostrarAjuda] = useState(false);

  // Modal com abas inteligentes
  type AbaModal = "youtube" | "spotify" | "manual";
  const [abaModal, setAbaModal] = useState<AbaModal>("youtube");

  const [modalNova, setModalNova] = useState(false);
  const [novaFaixa, setNovaFaixa] = useState({
    titulo: "",
    artista: "",
    audio_url: "",
    capa_url: "",
  });

  // Modal Criar Playlist dedicada
  const [modalCriarPlaylist, setModalCriarPlaylist] = useState(false);
  const [formPlaylist, setFormPlaylist] = useState({ nome: "", descricao: "" });
  const [criandoPlaylistDedicada, setCriandoPlaylistDedicada] = useState(false);

  // Modal de Adicionar Músicas a uma Playlist específica
  const [playlistGerenciando, setPlaylistGerenciando] = useState<Playlist | null>(null);

  // Visualização e Edição de Playlist Estilo Spotify
  const [playlistAbertaId, setPlaylistAbertaId] = useState<string | null>(null);
  const playlistAberta = playlists.find((p) => p.id === playlistAbertaId) || null;

  const [modalEditarPlaylist, setModalEditarPlaylist] = useState<Playlist | null>(null);
  const [formEditarPlaylist, setFormEditarPlaylist] = useState({
    nome: "",
    descricao: "",
    capa_url: "",
  });
  const [salvandoEdicaoPlaylist, setSalvandoEdicaoPlaylist] = useState(false);

  const abrirModalEdicao = (p: Playlist) => {
    setModalEditarPlaylist(p);
    setFormEditarPlaylist({
      nome: p.nome,
      descricao: p.descricao || "",
      capa_url: p.capa_url || "",
    });
  };

  const salvarEdicaoPlaylist = async () => {
    if (!modalEditarPlaylist) return;
    const nomeLimpo = formEditarPlaylist.nome.trim();
    if (nomeLimpo.length < 2) {
      setAviso("O nome da playlist deve ter pelo menos 2 caracteres.");
      return;
    }
    setSalvandoEdicaoPlaylist(true);
    try {
      const res = await fetchWithAuth(`/api/playlists/${modalEditarPlaylist.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          nome: nomeLimpo,
          descricao: formEditarPlaylist.descricao.trim() || null,
          capa_url: formEditarPlaylist.capa_url.trim() || null,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPlaylists((prev) =>
          prev.map((item) =>
            item.id === modalEditarPlaylist.id
              ? {
                  ...item,
                  nome: nomeLimpo,
                  descricao: formEditarPlaylist.descricao.trim() || null,
                  capa_url: formEditarPlaylist.capa_url.trim() || null,
                }
              : item
          )
        );
        setModalEditarPlaylist(null);
        setAviso("✅ Playlist e foto de capa atualizadas com sucesso!");
      } else {
        setAviso(json.error || "Erro ao salvar alterações da playlist.");
      }
    } catch {
      setAviso("Erro de conexão ao salvar.");
    } finally {
      setSalvandoEdicaoPlaylist(false);
    }
  };

  // Busca no YouTube
  const [ytBusca, setYtBusca] = useState("");
  const [ytResultados, setYtResultados] = useState<
    Array<{
      videoId: string;
      titulo: string;
      artista: string;
      duracao_segundos: number;
      duracao_formatada: string;
      capa_url: string;
    }>
  >([]);
  const [ytBuscando, setYtBuscando] = useState(false);
  const [adicionadasYt, setAdicionadasYt] = useState<Record<string, boolean>>({});
  const [menuYtPlaylist, setMenuYtPlaylist] = useState<string | null>(null);

  // Importador Spotify
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [spotifyImportando, setSpotifyImportando] = useState(false);
  const [spotifyProgresso, setSpotifyProgresso] = useState<string | null>(null);

  const [novaPlaylist, setNovaPlaylist] = useState("");
  const [criandoPlaylist, setCriandoPlaylist] = useState(false);
  const [novaPlaylistMenu, setNovaPlaylistMenu] = useState("");
  const [criandoPlaylistMenu, setCriandoPlaylistMenu] = useState(false);
  /** Faixa cujo menu "adicionar à playlist" está aberto. */
  const [menuPara, setMenuPara] = useState<string | null>(null);

  // ─── Carregamento ──────────────────────────────────────────
  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const qs = new URLSearchParams();
      if (busca.trim().length >= 2) qs.set("busca", busca.trim());
      if (aba === "favoritas") qs.set("favoritas", "1");
      if (aba === "acervo") qs.set("origem", origemAcervo);

      const res = await fetchWithAuth(`/api/musicas?${qs}`);
      const json = await res.json();
      if (json.success) setMusicas(json.data);
    } catch {
      setAviso("Não consegui carregar o acervo.");
    } finally {
      setCarregando(false);
    }
  }, [busca, aba, origemAcervo]);

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

  useEffect(() => {
    carregarPlaylists();
  }, [carregarPlaylists]);

  // Menu de playlists fecha ao clicar fora ou apertar Esc.
  useEffect(() => {
    if (!menuPara && !menuYtPlaylist) return;
    const fechar = () => {
      setMenuPara(null);
      setMenuYtPlaylist(null);
    };
    const porTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") fechar();
    };
    document.addEventListener("click", fechar);
    document.addEventListener("keydown", porTecla);
    return () => {
      document.removeEventListener("click", fechar);
      document.removeEventListener("keydown", porTecla);
    };
  }, [menuPara, menuYtPlaylist]);

  useEffect(() => {
    if (aba === "playlists") {
      setCarregando(false);
      carregarPlaylists();
      return;
    }
    const t = setTimeout(carregar, 250);
    return () => clearTimeout(t);
  }, [carregar, aba, carregarPlaylists]);

  // ─── Ações ─────────────────────────────────────────────────
  const favoritar = async (m: MusicaLista) => {
    setMusicas((atual) =>
      atual.map((x) => (x.id === m.id ? { ...x, favorita: !x.favorita } : x))
    );
    await fetchWithAuth(`/api/musicas/${m.id}/favoritar`, {
      method: "POST",
    }).catch(() => undefined);
  };

  const excluirMusica = async (m: MusicaLista) => {
    if (!confirm(`Remover "${m.titulo}" do seu acervo pessoal?`)) return;
    try {
      const res = await fetchWithAuth(`/api/musicas/${m.id}`, { method: "DELETE" });
      const json = await res.json();
      if (res.ok && json.success) {
        setMusicas((atual) => atual.filter((x) => x.id !== m.id));
        setAviso(`"${m.titulo}" removida.`);
        await carregarPlaylists();
      } else {
        setAviso(json.error || "Não foi possível remover a música.");
      }
    } catch {
      setAviso("Erro de conexão ao remover música.");
    }
  };

  const buscarYouTube = async () => {
    if (!ytBusca.trim() || ytBusca.trim().length < 2) return;
    setYtBuscando(true);
    try {
      const res = await fetchWithAuth(
        `/api/musicas/youtube/buscar?q=${encodeURIComponent(ytBusca.trim())}`
      );
      const json = await res.json();
      if (json.success) {
        setYtResultados(json.data || []);
      } else {
        setAviso(json.error || "Erro ao buscar vídeos no YouTube.");
      }
    } catch {
      setAviso("Falha ao comunicar com o buscador do YouTube.");
    } finally {
      setYtBuscando(false);
    }
  };

  const adicionarDoYouTube = async (
    item: {
      videoId: string;
      titulo: string;
      artista: string;
      duracao_segundos: number;
      capa_url: string;
    },
    playlistIdDestino?: string
  ) => {
    setAdicionadasYt((prev) => ({ ...prev, [item.videoId]: true }));
    setMenuYtPlaylist(null);
    try {
      const res = await fetchWithAuth("/api/musicas", {
        method: "POST",
        body: JSON.stringify({
          titulo: item.titulo,
          artista: item.artista,
          audio_url: `https://www.youtube.com/watch?v=${item.videoId}`,
          capa_url: item.capa_url,
          duracao_segundos: item.duracao_segundos,
          fonte: "youtube",
          fonte_id: item.videoId,
        }),
      });
      const json = await res.json();
      if (json.success) {
        const musicaCriada = json.data;
        if (playlistIdDestino && musicaCriada?.id) {
          await fetchWithAuth(`/api/playlists/${playlistIdDestino}`, {
            method: "POST",
            body: JSON.stringify({
              musica_id: musicaCriada.id,
              acao: "adicionar",
            }),
          }).catch(() => undefined);
          await carregarPlaylists();
        }
        setAviso(`✅ "${item.titulo}" adicionada com sucesso!`);
        carregar();
      } else {
        setAviso(json.error || "Não consegui adicionar a faixa.");
      }
    } catch {
      setAviso("Erro ao adicionar faixa do YouTube.");
    }
  };

  const criarPlaylistComItemYouTube = async (item: any) => {
    const nomeLimpo = novaPlaylistMenu.trim();
    if (nomeLimpo.length < 2) return;
    try {
      const res = await fetchWithAuth("/api/playlists", {
        method: "POST",
        body: JSON.stringify({ nome: nomeLimpo }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const nova = { musicas: [], ...json.data };
        setPlaylists((p) => [nova, ...p]);
        setNovaPlaylistMenu("");
        setMenuYtPlaylist(null);
        await adicionarDoYouTube(item, nova.id);
      } else {
        setAviso(json.error || "Não foi possível criar a playlist.");
      }
    } catch {
      setAviso("Erro ao criar playlist.");
    }
  };

  const importarDoSpotify = async () => {
    if (!spotifyUrl.trim()) {
      setAviso("Cole o link da playlist do Spotify.");
      return;
    }
    setSpotifyImportando(true);
    setSpotifyProgresso("Extraindo faixas e conectando com o áudio do YouTube...");
    try {
      const res = await fetchWithAuth("/api/musicas/spotify/importar", {
        method: "POST",
        body: JSON.stringify({ url: spotifyUrl.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        const qtd = json.data?.total_faixas || 0;
        const nome = json.data?.nome || "do Spotify";
        setAviso(`✅ Playlist "${nome}" importada com sucesso (${qtd} faixas conectadas)!`);
        setSpotifyUrl("");
        setModalNova(false);
        await carregarPlaylists();
        await carregar();
        setAba("playlists");
      } else {
        setAviso(json.error || "Não consegui importar a playlist do Spotify.");
      }
    } catch {
      setAviso("Erro de conexão ao importar do Spotify.");
    } finally {
      setSpotifyImportando(false);
      setSpotifyProgresso(null);
    }
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
      setAviso("✅ Faixa adicionada ao seu acervo.");
      carregar();
    } else {
      setAviso(json.error ?? "Não consegui adicionar.");
    }
  };

  const salvarNovaPlaylist = async () => {
    const nomeLimpo = formPlaylist.nome.trim();
    if (nomeLimpo.length < 2) {
      setAviso("O nome da playlist deve ter pelo menos 2 caracteres.");
      return;
    }
    setCriandoPlaylistDedicada(true);
    try {
      const res = await fetchWithAuth("/api/playlists", {
        method: "POST",
        body: JSON.stringify({
          nome: nomeLimpo,
          descricao: formPlaylist.descricao.trim() || null,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPlaylists((p) => [{ musicas: [], ...json.data }, ...p]);
        setFormPlaylist({ nome: "", descricao: "" });
        setModalCriarPlaylist(false);
        setAviso(`✅ Playlist "${nomeLimpo}" criada com sucesso!`);
        setAba("playlists");
      } else {
        setAviso(json.error || "Não foi possível criar a playlist.");
      }
    } catch {
      setAviso("Erro de conexão ao criar playlist.");
    } finally {
      setCriandoPlaylistDedicada(false);
    }
  };

  const criarPlaylist = async () => {
    const nomeLimpo = novaPlaylist.trim();
    if (nomeLimpo.length < 2) {
      setAviso("O nome da playlist deve ter pelo menos 2 caracteres.");
      return;
    }
    setCriandoPlaylist(true);
    setAviso(null);
    try {
      const res = await fetchWithAuth("/api/playlists", {
        method: "POST",
        body: JSON.stringify({ nome: nomeLimpo }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setPlaylists((p) => [{ musicas: [], ...json.data }, ...p]);
        setNovaPlaylist("");
        setAviso(`✅ Playlist "${nomeLimpo}" criada com sucesso!`);
      } else {
        setAviso(json.error || "Não foi possível criar a playlist.");
      }
    } catch {
      setAviso("Erro de conexão ao criar playlist. Tente novamente.");
    } finally {
      setCriandoPlaylist(false);
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
    } catch {
      setAviso("Erro ao conectar com o servidor.");
    }
  };

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
        ? `✅ "${musica.titulo}" foi adicionada a ${nome}.`
        : `Removida de ${nome}.`
    );
  };

  const criarPlaylistRapidaParaMusica = async (m: Musica) => {
    const nomeLimpo = novaPlaylistMenu.trim();
    if (nomeLimpo.length < 2) return;
    setCriandoPlaylistMenu(true);
    try {
      const res = await fetchWithAuth("/api/playlists", {
        method: "POST",
        body: JSON.stringify({ nome: nomeLimpo }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        const nova = { musicas: [], ...json.data };
        setPlaylists((p) => [nova, ...p]);
        setNovaPlaylistMenu("");
        await mexerNaPlaylist(nova.id, m, "adicionar");
      } else {
        setAviso(json.error || "Não foi possível criar a playlist.");
      }
    } catch {
      setAviso("Erro ao criar playlist.");
    } finally {
      setCriandoPlaylistMenu(false);
    }
  };

  const musicaAtual = filaAtual[indiceAtual];

  return (
    <div>
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="heading flex items-center gap-3 text-2xl font-bold text-bat-text sm:text-3xl">
            <span>🎧</span> Trilha Sonora & Playlists
          </h1>
          <p className="mt-1 text-sm text-bat-text-secondary">
            Música ininterrupta enquanto você resolve questões, simulados ou lê resumos.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setModalCriarPlaylist(true)}
            className="btn-secondary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>📚</span> + Nova Playlist
          </button>
          <button
            onClick={() => setModalNova(true)}
            className="btn-primary px-4 py-2.5 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>⚡</span> + Adicionar Música
          </button>
        </div>
      </header>

      {/* ═══ GUIA DIDÁTICO ═══ */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-bat-gold-400/25 bg-bat-bg-card/90 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3 border-b border-bat-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-bat-gold-400/20 text-sm">
              ℹ️
            </span>
            <div>
              <h3 className="text-sm font-bold text-bat-text">
                Central da Trilha Sonora — Privacidade & Foco Total
              </h3>
              <p className="text-xs text-bat-text-muted">
                Suas músicas importadas são 100% privadas. Crie suas playlists e estude com o melhor do YouTube e Spotify.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMostrarAjuda((v) => !v)}
            className="cursor-pointer text-xs font-semibold text-bat-gold-400 transition-colors hover:text-bat-gold-300"
          >
            {mostrarAjuda ? "Recolher manual ▴" : "Ver guia rápido ▾"}
          </button>
        </div>

        {mostrarAjuda && (
          <div className="mt-3 grid grid-cols-1 gap-3 pt-1 text-xs text-bat-text-secondary sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-bat-border/40 bg-bat-bg-secondary/40 p-3">
              <p className="mb-1 flex items-center gap-1.5 font-bold text-bat-gold-400">
                <span>🔒</span> Acervo Pessoal & Privado
              </p>
              <p className="leading-relaxed text-bat-text-muted">
                As músicas que você adiciona ficam visíveis exclusivamente para você no seu acervo pessoal.
              </p>
            </div>
            <div className="rounded-xl border border-bat-border/40 bg-bat-bg-secondary/40 p-3">
              <p className="mb-1 flex items-center gap-1.5 font-bold text-red-400">
                <span>▶️</span> YouTube Sem Interrupções
              </p>
              <p className="leading-relaxed text-bat-text-muted">
                Pesquise por nome, artista ou link. O áudio toca em segundo plano e você pode abrir o vídeo em miniatura a qualquer momento.
              </p>
            </div>
            <div className="rounded-xl border border-bat-border/40 bg-bat-bg-secondary/40 p-3">
              <p className="mb-1 flex items-center gap-1.5 font-bold text-emerald-400">
                <span>🟢</span> Playlists do Spotify
              </p>
              <p className="leading-relaxed text-bat-text-muted">
                Cole o link de uma playlist pública do Spotify para conectar automaticamente todas as faixas e criar sua playlist na BatCaverna.
              </p>
            </div>
            <div className="rounded-xl border border-bat-border/40 bg-bat-bg-secondary/40 p-3">
              <p className="mb-1 flex items-center gap-1.5 font-bold text-cyan-400">
                <span>📚</span> Gestão de Playlists
              </p>
              <p className="leading-relaxed text-bat-text-muted">
                Organize suas faixas por matéria ou momento: Playlists para Foco Pesado, Simulados, Manhãs e Descanso.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ═══ ABAS PRINCIPAIS ═══ */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["acervo", "🎵 Acervo Geral"],
              ["favoritas", "⭐ Favoritas"],
              ["playlists", "📚 Minhas Playlists"],
            ] as [Aba, string][]
          ).map(([valor, rotulo]) => (
            <button
              key={valor}
              onClick={() => setAba(valor)}
              className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
                aba === valor
                  ? "border-bat-gold-400/40 bg-bat-gold-400/15 text-bat-gold-400 shadow-sm"
                  : "border-bat-border bg-bat-bg-card text-bat-text-secondary hover:border-bat-gold-400/25"
              }`}
            >
              {rotulo}
            </button>
          ))}
        </div>

        {/* Sub-filtros de origem quando no Acervo */}
        {aba === "acervo" && (
          <div className="flex items-center rounded-xl border border-bat-border bg-bat-bg-card p-1 text-xs">
            <button
              onClick={() => setOrigemAcervo("todas")}
              className={`cursor-pointer rounded-lg px-3 py-1 font-medium transition-all ${
                origemAcervo === "todas"
                  ? "bg-bat-gold-400 text-black font-bold"
                  : "text-bat-text-secondary hover:text-white"
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setOrigemAcervo("minhas")}
              className={`cursor-pointer rounded-lg px-3 py-1 font-medium transition-all ${
                origemAcervo === "minhas"
                  ? "bg-bat-gold-400 text-black font-bold"
                  : "text-bat-text-secondary hover:text-white"
              }`}
            >
              👤 Minhas Músicas
            </button>
            <button
              onClick={() => setOrigemAcervo("batcaverna")}
              className={`cursor-pointer rounded-lg px-3 py-1 font-medium transition-all ${
                origemAcervo === "batcaverna"
                  ? "bg-bat-gold-400 text-black font-bold"
                  : "text-bat-text-secondary hover:text-white"
              }`}
            >
              🦇 Acervo BatCaverna
            </button>
          </div>
        )}
      </div>

      {aviso && (
        <p className="mb-4 rounded-xl border border-bat-gold-400/30 bg-bat-gold-400/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-bat-gold-400 flex items-center justify-between">
          <span>{aviso}</span>
          <button onClick={() => setAviso(null)} className="cursor-pointer text-xs hover:underline">
            ✕
          </button>
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
            {musicas.length > 0 && (
              <button
                onClick={() => tocarFila(musicas, 0)}
                className="btn-primary shrink-0 px-5 py-2.5 text-sm cursor-pointer"
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
              origemMinhas={origemAcervo === "minhas"}
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
                      <div className="flex items-center gap-1.5">
                        <p
                          className={`truncate text-sm font-medium ${
                            ehAtual ? "text-bat-gold-400 font-bold" : "text-bat-text"
                          }`}
                        >
                          {ehAtual && tocando ? "▶ " : ""}
                          {m.titulo}
                        </p>
                        {m.fonte === "youtube" && (
                          <span className="shrink-0 rounded bg-red-600/20 border border-red-500/30 px-1 py-0.2 text-[9px] font-bold text-red-400">
                            YT
                          </span>
                        )}
                        {m.fonte === "spotify" && (
                          <span className="shrink-0 rounded bg-emerald-600/20 border border-emerald-500/30 px-1 py-0.2 text-[9px] font-bold text-emerald-400">
                            Spotify
                          </span>
                        )}
                        {m.ehMinha && (
                          <span className="shrink-0 rounded bg-bat-gold-400/15 border border-bat-gold-400/30 px-1 py-0.2 text-[9px] font-bold text-bat-gold-400">
                            Minha
                          </span>
                        )}
                      </div>
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
                      title={m.favorita ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                    >
                      {m.favorita ? "⭐" : "☆"}
                    </button>

                    {/* Adicionar à playlist */}
                    <div
                      className="relative shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          setMenuPara((atual) => (atual === m.id ? null : m.id))
                        }
                        className="cursor-pointer rounded-lg border border-bat-border/50 px-2 py-1 text-xs text-bat-text-secondary transition-colors hover:bg-bat-bg-secondary hover:text-bat-gold-400 flex items-center gap-1"
                        aria-label={`Adicionar ${m.titulo} a uma playlist`}
                        title="Adicionar à playlist"
                      >
                        <span>📚</span>
                        <span className="hidden sm:inline text-[11px] font-medium">+ Playlist</span>
                      </button>

                      {menuPara === m.id && (
                        <div className="absolute right-0 top-full z-30 mt-1 w-64 overflow-hidden rounded-xl border border-bat-border bg-bat-bg-elevated shadow-xl">
                          <p className="border-b border-bat-border px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                            Adicionar à playlist
                          </p>

                          {playlists.length === 0 ? (
                            <p className="px-3 py-2 text-xs text-bat-text-muted">
                              Você ainda não tem playlists criadas.
                            </p>
                          ) : (
                            <ul className="max-h-48 overflow-y-auto py-1">
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
                                            ? "shrink-0 text-bat-success font-bold"
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

                          <div className="border-t border-bat-border/80 bg-bat-bg-secondary/60 p-2">
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                placeholder="Criar nova playlist..."
                                value={novaPlaylistMenu}
                                onChange={(e) => setNovaPlaylistMenu(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" && novaPlaylistMenu.trim().length >= 2) {
                                    e.preventDefault();
                                    criarPlaylistRapidaParaMusica(m);
                                  }
                                }}
                                className="input-field text-xs py-1 px-2.5 flex-1 h-7"
                                disabled={criandoPlaylistMenu}
                              />
                              <button
                                onClick={() => criarPlaylistRapidaParaMusica(m)}
                                disabled={criandoPlaylistMenu || novaPlaylistMenu.trim().length < 2}
                                className="btn-primary text-xs px-2.5 py-1 h-7 shrink-0 disabled:opacity-40 cursor-pointer"
                                title="Criar playlist e adicionar esta música"
                              >
                                {criandoPlaylistMenu ? "..." : "＋"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Excluir da biblioteca (se for uma faixa que o aluno importou) */}
                    {m.ehMinha && (
                      <button
                        onClick={() => excluirMusica(m)}
                        className="shrink-0 cursor-pointer text-xs text-bat-text-muted hover:text-red-400 p-1 transition-colors"
                        title="Remover música do seu acervo"
                      >
                        🗑️
                      </button>
                    )}
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
          {playlistAberta ? (
            /* ── VISÃO DETALHADA ESTILO SPOTIFY (PLAYLIST ABERTA) ── */
            <div className="space-y-6">
              {/* Botão Voltar */}
              <button
                onClick={() => setPlaylistAbertaId(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-bat-border/70 bg-bat-bg-card/80 px-4 py-2 text-xs font-bold text-bat-text-secondary hover:text-bat-gold-400 hover:border-bat-gold-400/40 hover:bg-bat-bg-secondary transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar para Minhas Playlists</span>
              </button>

              {/* Banner Hero Estilo Spotify com Capa Personalizada */}
              <div className="relative overflow-hidden rounded-3xl border border-bat-border/80 bg-gradient-to-b from-bat-bg-secondary/90 via-bat-bg-card to-bat-bg-card p-5 sm:p-7 shadow-2xl backdrop-blur-md">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                  {/* Capa da Playlist */}
                  <div className="group relative mx-auto h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-2xl sm:mx-0 sm:h-48 sm:w-48">
                    {playlistAberta.capa_url ? (
                      <img
                        src={playlistAberta.capa_url}
                        alt={playlistAberta.nome}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : playlistAberta.musicas[0]?.capa_url ? (
                      <img
                        src={playlistAberta.musicas[0].capa_url}
                        alt={playlistAberta.nome}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-bat-gold-400/20 to-neutral-900 text-bat-gold-400">
                        <Music className="h-16 w-16 opacity-70" />
                        <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-bat-text-muted">
                          Sem Capa
                        </span>
                      </div>
                    )}

                    {/* Botão de Alterar Capa sobreposto (Desktop Hover) */}
                    <button
                      onClick={() => abrirModalEdicao(playlistAberta)}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 text-white opacity-0 backdrop-blur-xs transition-opacity duration-200 group-hover:opacity-100 cursor-pointer sm:opacity-0 focus:opacity-100"
                      title="Alterar foto de capa da playlist"
                    >
                      <ImageIcon className="h-7 w-7 text-bat-gold-400 mb-1" />
                      <span className="text-[11px] font-bold tracking-wide">
                        Alterar Capa
                      </span>
                    </button>

                    {/* Botão de ação visível em mobile */}
                    <button
                      onClick={() => abrirModalEdicao(playlistAberta)}
                      className="absolute bottom-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-black/85 text-bat-gold-400 border border-white/20 sm:hidden shadow-lg cursor-pointer"
                      title="Alterar Capa"
                    >
                      <ImageIcon className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Informações da Playlist */}
                  <div className="flex min-w-0 flex-1 flex-col justify-end">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-bat-gold-400/20 border border-bat-gold-400/40 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-bat-gold-400">
                        Playlist
                      </span>
                      {playlistAberta.capa_url && (
                        <span className="text-[11px] text-bat-text-muted flex items-center gap-1">
                          <Sparkles className="h-3 w-3 text-bat-gold-400" />
                          Capa Personalizada
                        </span>
                      )}
                    </div>

                    <h1 className="text-2xl font-black text-bat-text sm:text-4xl tracking-tight mb-2">
                      {playlistAberta.nome}
                    </h1>

                    {playlistAberta.descricao && (
                      <p className="text-xs text-bat-text-secondary sm:text-sm leading-relaxed mb-3 max-w-2xl">
                        {playlistAberta.descricao}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-bat-text-muted font-medium mb-4">
                      <span>{playlistAberta.musicas.length} {playlistAberta.musicas.length === 1 ? "faixa" : "faixas"}</span>
                      {playlistAberta.musicas.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {calcularDuracaoTotalPlaylist(playlistAberta.musicas)}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Ações da Playlist */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {playlistAberta.musicas.length > 0 && (
                        <button
                          onClick={() => tocarFila(playlistAberta.musicas, 0)}
                          className="flex items-center gap-2 rounded-xl bg-bat-gold-400 px-5 py-2.5 text-xs font-black text-black shadow-lg shadow-bat-gold-400/20 hover:bg-bat-gold-300 transition-transform active:scale-95 cursor-pointer"
                        >
                          <Play className="h-4 w-4 fill-current" />
                          <span>Tocar Tudo</span>
                        </button>
                      )}

                      <button
                        onClick={() => setPlaylistGerenciando(playlistAberta)}
                        className="flex items-center gap-1.5 rounded-xl border border-bat-border/80 bg-bat-bg-secondary/70 px-3.5 py-2.5 text-xs font-bold text-bat-text hover:bg-bat-bg-secondary hover:border-bat-gold-400/40 transition-colors cursor-pointer"
                      >
                        <Plus className="h-4 w-4 text-bat-gold-400" />
                        <span>Adicionar Faixas</span>
                      </button>

                      <button
                        onClick={() => abrirModalEdicao(playlistAberta)}
                        className="flex items-center gap-1.5 rounded-xl border border-bat-border/80 bg-bat-bg-secondary/70 px-3.5 py-2.5 text-xs font-bold text-bat-text-secondary hover:text-bat-text hover:bg-bat-bg-secondary transition-colors cursor-pointer"
                        title="Editar nome, descrição ou foto de capa"
                      >
                        <ImageIcon className="h-4 w-4 text-bat-gold-400" />
                        <span>Foto de Capa</span>
                      </button>

                      <button
                        onClick={() => {
                          apagarPlaylist(playlistAberta.id, playlistAberta.nome);
                          setPlaylistAbertaId(null);
                        }}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/15 transition-colors cursor-pointer ml-auto"
                        title="Excluir playlist"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Músicas com Fotos Individuais */}
              {playlistAberta.musicas.length === 0 ? (
                <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
                  <Music className="mx-auto h-12 w-12 text-bat-gold-400/50 mb-3" />
                  <h3 className="heading text-base font-bold text-bat-text mb-1">
                    Esta playlist ainda não tem faixas
                  </h3>
                  <p className="text-xs text-bat-text-secondary max-w-sm mx-auto mb-4">
                    Adicione faixas do acervo geral ou busque do YouTube para começar a ouvir.
                  </p>
                  <button
                    onClick={() => setPlaylistGerenciando(playlistAberta)}
                    className="btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
                  >
                    + Escolher Músicas para Incluir
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-bat-border/80 bg-bat-bg-card/70 overflow-hidden shadow-xl">
                  <div className="border-b border-bat-border/50 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-bat-text-muted flex items-center gap-3">
                    <span className="w-6 text-center">#</span>
                    <span className="flex-1">Faixa / Artista</span>
                    <span className="w-16 text-right hidden sm:block">Duração</span>
                    <span className="w-16 text-right">Ação</span>
                  </div>

                  <ul className="divide-y divide-bat-border/30">
                    {playlistAberta.musicas.map((m, i) => {
                      const estaTocando = tocando && filaAtual[indiceAtual]?.id === m.id;
                      return (
                        <li
                          key={m.id}
                          className={`group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-bat-bg-secondary/60 ${
                            estaTocando ? "bg-bat-gold-400/10" : ""
                          }`}
                        >
                          {/* Número ou Play/Equalizer */}
                          <div className="w-6 shrink-0 text-center">
                            {estaTocando ? (
                              <span className="text-xs text-bat-gold-400 animate-pulse">🔊</span>
                            ) : (
                              <span className="text-xs text-bat-text-muted group-hover:hidden font-mono">
                                {i + 1}
                              </span>
                            )}
                            <button
                              onClick={() => tocarFila(playlistAberta.musicas, i)}
                              className={`text-bat-gold-400 hover:scale-110 transition-transform cursor-pointer ${
                                estaTocando ? "hidden" : "hidden group-hover:inline-block"
                              }`}
                              title={`Tocar ${m.titulo}`}
                            >
                              <Play className="h-3.5 w-3.5 fill-current" />
                            </button>
                          </div>

                          {/* Foto da Música */}
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-bat-border/50 bg-black/40 shadow-xs relative">
                            {m.capa_url ? (
                              <img
                                src={m.capa_url}
                                alt={m.titulo}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-bat-bg-secondary text-sm">
                                🎵
                              </div>
                            )}
                          </div>

                          {/* Título & Artista */}
                          <div className="min-w-0 flex-1">
                            <button
                              onClick={() => tocarFila(playlistAberta.musicas, i)}
                              className="w-full text-left cursor-pointer truncate"
                            >
                              <p
                                className={`truncate text-sm font-semibold transition-colors ${
                                  estaTocando
                                    ? "text-bat-gold-400 font-bold"
                                    : "text-bat-text group-hover:text-bat-gold-400"
                                }`}
                              >
                                {m.titulo}
                              </p>
                              <p className="truncate text-xs text-bat-text-muted">
                                {m.artista || "Artista desconhecido"}
                                {m.album ? ` • ${m.album}` : ""}
                              </p>
                            </button>
                          </div>

                          {/* Duração */}
                          <div className="w-16 shrink-0 text-right text-xs text-bat-text-muted font-mono hidden sm:block">
                            {formatarTempoMusica(m.duracao_segundos)}
                          </div>

                          {/* Botões de Ação */}
                          <div className="w-16 shrink-0 flex items-center justify-end gap-1">
                            <button
                              onClick={() => mexerNaPlaylist(playlistAberta.id, m, "remover")}
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-bat-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                              title="Remover desta playlist"
                              aria-label={`Remover ${m.titulo}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            /* ── VISÃO CATÁLOGO DE PLAYLISTS (GRID) ── */
            <>
              <div className="mb-5 flex flex-wrap gap-3">
                <input
                  value={novaPlaylist}
                  onChange={(e) => setNovaPlaylist(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !criandoPlaylist && criarPlaylist()}
                  placeholder="Criar nova playlist (ex: Foco Pesado, Matemática, Noturna)..."
                  disabled={criandoPlaylist}
                  className="input-field min-w-0 flex-1"
                />
                <button
                  onClick={criarPlaylist}
                  disabled={criandoPlaylist || novaPlaylist.trim().length < 2}
                  className="btn-primary shrink-0 px-5 py-2.5 text-sm disabled:opacity-40 cursor-pointer"
                >
                  {criandoPlaylist ? "Criando..." : "＋ Criar Playlist"}
                </button>
              </div>

              {playlists.length === 0 ? (
                <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
                  <span className="mb-3 block text-4xl">📚</span>
                  <h3 className="heading text-lg font-bold text-bat-text mb-1">
                    Você ainda não criou nenhuma playlist
                  </h3>
                  <p className="text-xs text-bat-text-secondary max-w-md mx-auto mb-4">
                    Organize suas faixas favoritas para cada disciplina ou fase de estudo.
                  </p>
                  <button
                    onClick={() => setModalCriarPlaylist(true)}
                    className="btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
                  >
                    + Criar Minha Primeira Playlist
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {playlists.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setPlaylistAbertaId(p.id)}
                      className="group relative flex flex-col justify-between rounded-2xl border border-bat-border/80 bg-bat-bg-card p-5 transition-all duration-300 hover:border-bat-gold-400/50 hover:bg-bat-bg-secondary/40 hover:shadow-xl cursor-pointer"
                    >
                      <div>
                        {/* Cabeçalho do Card com Ícone/Miniatura */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bat-gold-400/15 border border-bat-gold-400/30 text-bat-gold-400 shadow-xs group-hover:scale-105 transition-transform">
                              <ListMusic className="h-6 w-6" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-base font-bold text-bat-text group-hover:text-bat-gold-400 transition-colors">
                                {p.nome}
                              </h3>
                              <p className="text-xs text-bat-text-muted mt-0.5">
                                {p.musicas.length} {p.musicas.length === 1 ? "faixa" : "faixas"}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              apagarPlaylist(p.id, p.nome);
                            }}
                            title="Excluir playlist"
                            className="cursor-pointer rounded-lg border border-red-500/20 px-2 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors opacity-60 hover:opacity-100"
                            aria-label={`Excluir playlist ${p.nome}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {p.descricao && (
                          <p className="text-xs text-bat-text-secondary line-clamp-2 mb-3">
                            {p.descricao}
                          </p>
                        )}
                      </div>

                      {/* Rodapé do Card */}
                      <div className="mt-4 flex items-center justify-between border-t border-bat-border/50 pt-3">
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-bat-gold-400 group-hover:translate-x-1 transition-transform">
                          <span>Abrir playlist</span>
                          <ChevronRight className="h-3.5 w-3.5" />
                        </span>

                        {p.musicas.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              tocarFila(p.musicas, 0);
                            }}
                            className="flex items-center gap-1.5 cursor-pointer rounded-lg bg-bat-gold-400/20 border border-bat-gold-400/35 px-3 py-1.5 text-xs font-bold text-bat-gold-400 hover:bg-bat-gold-400 hover:text-black transition-all"
                            title="Tocar todas as faixas desta playlist"
                          >
                            <Play className="h-3.5 w-3.5 fill-current" />
                            <span>Tocar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ═══ MODAL GERENCIAR MÚSICAS DA PLAYLIST ═══ */}
      {playlistGerenciando && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setPlaylistGerenciando(null)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] flex flex-col rounded-3xl border border-bat-gold-400/30 bg-bat-bg-card p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-bat-border/60 shrink-0">
              <div>
                <h3 className="heading text-base font-bold text-bat-text">
                  📚 {playlistGerenciando.nome}
                </h3>
                <p className="text-xs text-bat-text-muted">
                  Toque para adicionar ou remover faixas desta playlist
                </p>
              </div>
              <button
                onClick={() => setPlaylistGerenciando(null)}
                className="cursor-pointer text-sm text-bat-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="my-3 flex-1 overflow-y-auto space-y-1.5 pr-1">
              {musicas.length === 0 ? (
                <p className="text-xs text-bat-text-muted py-6 text-center">
                  Nenhuma música no seu acervo no momento.
                </p>
              ) : (
                musicas.map((m) => {
                  const jaEstaNaPlaylist = playlistGerenciando.musicas.some(
                    (x) => x.id === m.id
                  );
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between gap-3 p-2.5 rounded-xl border text-xs transition-colors ${
                        jaEstaNaPlaylist
                          ? "bg-bat-gold-400/10 border-bat-gold-400/30"
                          : "bg-bat-bg-secondary/40 border-bat-border/60 hover:border-bat-gold-400/25"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-bat-text truncate">{m.titulo}</p>
                        <p className="text-[11px] text-bat-text-muted truncate">
                          {m.artista || "Desconhecido"}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          await mexerNaPlaylist(
                            playlistGerenciando.id,
                            m,
                            jaEstaNaPlaylist ? "remover" : "adicionar"
                          );
                          // Atualiza o estado local do modal
                          setPlaylistGerenciando((prev) => {
                            if (!prev) return null;
                            const sem = prev.musicas.filter((x) => x.id !== m.id);
                            return {
                              ...prev,
                              musicas: jaEstaNaPlaylist ? sem : [...sem, m],
                            };
                          });
                        }}
                        className={`cursor-pointer px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          jaEstaNaPlaylist
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/30 hover:bg-bat-gold-400/30"
                        }`}
                      >
                        {jaEstaNaPlaylist ? "✓ Na Playlist" : "+ Adicionar"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-bat-border/60 flex justify-end shrink-0">
              <button
                onClick={() => setPlaylistGerenciando(null)}
                className="btn-primary px-5 py-2 text-xs font-bold cursor-pointer"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL CRIAR PLAYLIST DEDICADA ═══ */}
      {modalCriarPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setModalCriarPlaylist(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-bat-gold-400/30 bg-bat-bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-bat-border/60">
              <h2 className="heading text-base font-bold text-bat-text flex items-center gap-2">
                <span>📚</span> Nova Playlist de Estudo
              </h2>
              <button
                onClick={() => setModalCriarPlaylist(false)}
                className="cursor-pointer text-sm text-bat-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-bold text-bat-text block mb-1">
                  Nome da Playlist *
                </label>
                <input
                  value={formPlaylist.nome}
                  onChange={(e) =>
                    setFormPlaylist({ ...formPlaylist, nome: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && salvarNovaPlaylist()}
                  placeholder="Ex: Foco Pesado, Simulados, Instrumental..."
                  className="input-field text-sm w-full"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-bat-text block mb-1">
                  Descrição (Opcional)
                </label>
                <input
                  value={formPlaylist.descricao}
                  onChange={(e) =>
                    setFormPlaylist({ ...formPlaylist, descricao: e.target.value })
                  }
                  placeholder="Ex: Músicas sem vocal para resolver provas..."
                  className="input-field text-sm w-full"
                />
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setModalCriarPlaylist(false)}
                  className="btn-secondary px-4 py-2 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={criandoPlaylistDedicada || formPlaylist.nome.trim().length < 2}
                  onClick={salvarNovaPlaylist}
                  className="btn-primary px-5 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer"
                >
                  {criandoPlaylistDedicada ? "Criando..." : "Criar Playlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL EDITAR PLAYLIST & FOTO DE CAPA ═══ */}
      {modalEditarPlaylist && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setModalEditarPlaylist(null)}
        >
          <div
            className="w-full max-w-lg rounded-3xl border border-bat-gold-400/40 bg-bat-bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-bat-border/60">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-bat-gold-400/20 text-bat-gold-400">
                  <ImageIcon className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="heading text-base font-bold text-bat-text">
                    Personalizar Capa & Playlist
                  </h2>
                  <p className="text-[11px] text-bat-text-muted">
                    Defina a capa oficial que aparece ao abrir sua playlist
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalEditarPlaylist(null)}
                className="cursor-pointer text-sm text-bat-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 py-4">
              {/* Preview da Capa Atual */}
              <div className="flex items-center gap-4 rounded-2xl bg-bat-bg-secondary/50 p-3.5 border border-bat-border/50">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-black/50 shadow-md">
                  {formEditarPlaylist.capa_url ? (
                    <img
                      src={formEditarPlaylist.capa_url}
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-bat-text-muted text-[10px]">
                      <Music className="h-6 w-6 opacity-40 mb-1" />
                      Sem Capa
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-bat-text mb-1">
                    Foto de Capa
                  </p>
                  <p className="text-[11px] text-bat-text-secondary leading-relaxed mb-2">
                    Cole o link direto da imagem ou selecione um dos temas de alta definição abaixo.
                  </p>
                  {formEditarPlaylist.capa_url && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormEditarPlaylist({ ...formEditarPlaylist, capa_url: "" })
                      }
                      className="text-[11px] font-semibold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                    >
                      Remover Capa
                    </button>
                  )}
                </div>
              </div>

              {/* Input URL da Imagem */}
              <div>
                <label className="block text-xs font-bold text-bat-text-secondary mb-1">
                  Link direto da Imagem (URL)
                </label>
                <input
                  type="url"
                  value={formEditarPlaylist.capa_url}
                  onChange={(e) =>
                    setFormEditarPlaylist({ ...formEditarPlaylist, capa_url: e.target.value })
                  }
                  placeholder="https://exemplo.com/minha-imagem.jpg"
                  className="input-field w-full text-xs"
                />
              </div>

              {/* Sugestões de Capas para Estudo */}
              <div>
                <p className="text-xs font-bold text-bat-text-secondary mb-2 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-bat-gold-400" />
                  <span>Temas Prontos de Alta Resolução</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PRESETS_CAPAS_PLAYLIST.map((preset) => (
                    <button
                      key={preset.nome}
                      type="button"
                      onClick={() =>
                        setFormEditarPlaylist({
                          ...formEditarPlaylist,
                          capa_url: preset.url,
                        })
                      }
                      className={`group relative flex flex-col items-center overflow-hidden rounded-xl border p-2 transition-all cursor-pointer text-left ${
                        formEditarPlaylist.capa_url === preset.url
                          ? "border-bat-gold-400 bg-bat-gold-400/15 ring-1 ring-bat-gold-400/50"
                          : "border-bat-border/60 bg-bat-bg-secondary/40 hover:border-bat-gold-400/40 hover:bg-bat-bg-secondary"
                      }`}
                    >
                      <div className="h-14 w-full rounded-lg overflow-hidden mb-1.5 bg-black/40">
                        <img
                          src={preset.url}
                          alt={preset.nome}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-[11px] font-bold text-bat-text truncate w-full text-center">
                        {preset.emoji} {preset.nome}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-bold text-bat-text-secondary mb-1">
                  Nome da Playlist *
                </label>
                <input
                  value={formEditarPlaylist.nome}
                  onChange={(e) =>
                    setFormEditarPlaylist({ ...formEditarPlaylist, nome: e.target.value })
                  }
                  placeholder="Nome da playlist"
                  className="input-field w-full text-xs"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-xs font-bold text-bat-text-secondary mb-1">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formEditarPlaylist.descricao}
                  onChange={(e) =>
                    setFormEditarPlaylist({ ...formEditarPlaylist, descricao: e.target.value })
                  }
                  rows={2}
                  placeholder="Ex: Músicas para foco total em questões..."
                  className="input-field w-full text-xs resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-bat-border/60">
              <button
                type="button"
                onClick={() => setModalEditarPlaylist(null)}
                className="btn-secondary px-4 py-2 text-xs font-bold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={salvarEdicaoPlaylist}
                disabled={salvandoEdicaoPlaylist || formEditarPlaylist.nome.trim().length < 2}
                className="btn-primary px-5 py-2 text-xs font-bold cursor-pointer disabled:opacity-40"
              >
                {salvandoEdicaoPlaylist ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL INTELIGENTE: ADICIONAR MÚSICA / IMPORTAR PLAYLIST ═══ */}
      {modalNova && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
          onClick={() => setModalNova(false)}
        >
          <div
            className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-bat-gold-400/30 bg-bat-bg-card p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-bat-border/60">
              <h2 className="heading text-lg font-bold text-bat-text flex items-center gap-2">
                <span>⚡</span> Adicionar Música & Playlists
              </h2>
              <button
                onClick={() => setModalNova(false)}
                className="cursor-pointer text-sm text-bat-text-muted hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* SELETOR DE ABAS DO MODAL */}
            <div className="mt-4 mb-5 flex flex-wrap gap-2 border-b border-bat-border/50 pb-3">
              <button
                onClick={() => setAbaModal("youtube")}
                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  abaModal === "youtube"
                    ? "bg-red-600/20 text-red-400 border border-red-500/40"
                    : "text-bat-text-muted hover:text-bat-text"
                }`}
              >
                <span>▶️</span> Buscar no YouTube
              </button>
              <button
                onClick={() => setAbaModal("spotify")}
                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  abaModal === "spotify"
                    ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/40"
                    : "text-bat-text-muted hover:text-bat-text"
                }`}
              >
                <span>🟢</span> Importar do Spotify
              </button>
              <button
                onClick={() => setAbaModal("manual")}
                className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  abaModal === "manual"
                    ? "bg-bat-gold-400/20 text-bat-gold-400 border border-bat-gold-400/40"
                    : "text-bat-text-muted hover:text-bat-text"
                }`}
              >
                <span>🔗</span> Link Direto / MP3
              </button>
            </div>

            {/* ABA 1: YOUTUBE */}
            {abaModal === "youtube" && (
              <div className="space-y-4">
                <p className="text-xs text-bat-text-muted leading-relaxed">
                  Digite o nome da música ou artista. As músicas adicionadas ficam salvas exclusivamente no seu acervo pessoal ou playlist.
                </p>
                <div className="flex gap-2">
                  <input
                    value={ytBusca}
                    onChange={(e) => setYtBusca(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && buscarYouTube()}
                    placeholder="Ex: Interstellar Theme, Lofi Girl, Batman Soundtrack..."
                    className="input-field flex-1 text-sm"
                  />
                  <button
                    onClick={buscarYouTube}
                    disabled={ytBuscando || ytBusca.trim().length < 2}
                    className="btn-primary shrink-0 px-4 py-2 text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    {ytBuscando ? "Buscando..." : "🔍 Buscar"}
                  </button>
                </div>

                {ytBuscando && (
                  <div className="space-y-2 py-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="skeleton h-14 rounded-xl" />
                    ))}
                  </div>
                )}

                {!ytBuscando && ytResultados.length > 0 && (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {ytResultados.map((item) => {
                      const jaAdd = adicionadasYt[item.videoId];
                      return (
                        <div
                          key={item.videoId}
                          className="flex items-center gap-3 rounded-xl border border-bat-border/60 bg-bat-bg-secondary/40 p-2.5 transition-colors hover:border-bat-gold-400/30"
                        >
                          <img
                            src={item.capa_url}
                            alt=""
                            className="h-12 w-16 shrink-0 rounded-lg object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-bold text-bat-text" title={item.titulo}>
                              {item.titulo}
                            </p>
                            <p className="truncate text-[11px] text-bat-text-muted">
                              {item.artista} • {item.duracao_formatada}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0 relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => adicionarDoYouTube(item)}
                              disabled={jaAdd}
                              className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                jaAdd
                                  ? "bg-bat-success/20 text-bat-success border border-bat-success/30"
                                  : "bg-bat-gold-400/20 text-bat-gold-400 hover:bg-bat-gold-400/30 border border-bat-gold-400/40"
                              }`}
                            >
                              {jaAdd ? "✓ Adicionada" : "+ Acervo"}
                            </button>

                            <div>
                              <button
                                onClick={() =>
                                  setMenuYtPlaylist((curr) =>
                                    curr === item.videoId ? null : item.videoId
                                  )
                                }
                                className="cursor-pointer rounded-lg border border-bat-border px-2 py-1.5 text-xs font-bold text-bat-text-muted hover:text-white"
                                title="Adicionar à playlist"
                              >
                                ＋ Playlist
                              </button>

                              {menuYtPlaylist === item.videoId && (
                                <div className="absolute right-0 top-full z-40 mt-1 w-64 rounded-xl border border-bat-border bg-bat-bg-elevated p-2 shadow-2xl">
                                  <p className="px-2 py-1 text-[10px] font-bold text-bat-text-muted uppercase">
                                    Adicionar à Playlist:
                                  </p>
                                  {playlists.length > 0 ? (
                                    <ul className="max-h-40 overflow-y-auto py-1 space-y-0.5">
                                      {playlists.map((pl) => (
                                        <li key={pl.id}>
                                          <button
                                            onClick={() => {
                                              adicionarDoYouTube(item, pl.id);
                                              setMenuYtPlaylist(null);
                                            }}
                                            className="w-full text-left px-2.5 py-1.5 text-xs text-bat-text hover:bg-bat-bg-secondary rounded truncate cursor-pointer flex items-center justify-between"
                                          >
                                            <span className="truncate">{pl.nome}</span>
                                            <span className="text-[10px] text-bat-text-muted shrink-0">＋</span>
                                          </button>
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="px-2 py-1 text-xs text-bat-text-muted">
                                      Nenhuma playlist criada ainda.
                                    </p>
                                  )}

                                  {/* Criar nova playlist inline */}
                                  <div className="mt-1.5 pt-1.5 border-t border-bat-border/60">
                                    <div className="flex gap-1">
                                      <input
                                        type="text"
                                        placeholder="Nova playlist..."
                                        value={novaPlaylistMenu}
                                        onChange={(e) => setNovaPlaylistMenu(e.target.value)}
                                        onKeyDown={async (e) => {
                                          if (e.key === "Enter" && novaPlaylistMenu.trim().length >= 2) {
                                            e.preventDefault();
                                            await criarPlaylistComItemYouTube(item);
                                          }
                                        }}
                                        className="input-field text-xs py-1 px-2 flex-1 h-7"
                                      />
                                      <button
                                        onClick={() => criarPlaylistComItemYouTube(item)}
                                        disabled={novaPlaylistMenu.trim().length < 2}
                                        className="btn-primary text-xs px-2 py-1 h-7 shrink-0 cursor-pointer disabled:opacity-40"
                                        title="Criar playlist e adicionar esta música"
                                      >
                                        ＋
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ABA 2: SPOTIFY */}
            {abaModal === "spotify" && (
              <div className="space-y-4">
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs text-emerald-300">
                  <p className="font-bold flex items-center gap-1.5 mb-1 text-sm">
                    <span>🟢</span> Como importar sua playlist do Spotify:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-emerald-200/80 text-[11px]">
                    <li>Abra sua playlist pública no Spotify.</li>
                    <li>Clique nos 3 pontos (...) &gt; Compartilhar &gt; <strong>Copiar link da playlist</strong>.</li>
                    <li>Cole o link abaixo e clique no botão de importar. O sistema conectará com o áudio completo no YouTube.</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-bat-text-secondary">
                    URL da Playlist do Spotify
                  </label>
                  <input
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    placeholder="https://open.spotify.com/playlist/..."
                    className="input-field text-sm"
                  />
                </div>

                {spotifyProgresso && (
                  <p className="text-xs font-medium text-bat-gold-400 animate-pulse">
                    ⏳ {spotifyProgresso}
                  </p>
                )}

                <button
                  onClick={importarDoSpotify}
                  disabled={spotifyImportando || !spotifyUrl.trim()}
                  className="btn-primary w-full py-2.5 text-xs font-bold disabled:opacity-40 cursor-pointer"
                >
                  {spotifyImportando ? "Importando..." : "Importar Playlist para a BatCaverna"}
                </button>
              </div>
            )}

            {/* ABA 3: MANUAL */}
            {abaModal === "manual" && (
              <div className="space-y-3">
                <p className="text-xs text-bat-text-muted leading-relaxed">
                  Informe o link de um vídeo do YouTube ou arquivo direto (.mp3, .ogg) para adicionar ao seu acervo.
                </p>
                <input
                  value={novaFaixa.titulo}
                  onChange={(e) =>
                    setNovaFaixa({ ...novaFaixa, titulo: e.target.value })
                  }
                  placeholder="Título *"
                  className="input-field text-sm"
                />
                <input
                  value={novaFaixa.artista}
                  onChange={(e) =>
                    setNovaFaixa({ ...novaFaixa, artista: e.target.value })
                  }
                  placeholder="Artista"
                  className="input-field text-sm"
                />
                <input
                  value={novaFaixa.audio_url}
                  onChange={(e) =>
                    setNovaFaixa({ ...novaFaixa, audio_url: e.target.value })
                  }
                  placeholder="URL do áudio (YouTube ou link .mp3) *"
                  className="input-field text-sm"
                />
                <input
                  value={novaFaixa.capa_url}
                  onChange={(e) =>
                    setNovaFaixa({ ...novaFaixa, capa_url: e.target.value })
                  }
                  placeholder="URL da capa (opcional)"
                  className="input-field text-sm"
                />
                <button onClick={adicionarFaixa} className="btn-primary w-full py-2.5 text-xs font-bold mt-2 cursor-pointer">
                  Adicionar ao Meu Acervo
                </button>
              </div>
            )}

            <div className="mt-5 border-t border-bat-border/40 pt-3 flex justify-end">
              <button
                onClick={() => setModalNova(false)}
                className="btn-secondary px-5 py-2 text-xs cursor-pointer"
              >
                Fechar
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
  origemMinhas,
  temBusca,
  onAdicionar,
}: {
  favoritas: boolean;
  origemMinhas: boolean;
  temBusca: boolean;
  onAdicionar: () => void;
}) {
  return (
    <div className="rounded-2xl border border-bat-border bg-bat-bg-card p-10 text-center">
      <span className="mb-3 block text-4xl">
        {favoritas ? "⭐" : origemMinhas ? "👤" : "🎵"}
      </span>
      <h2 className="heading mb-2 text-lg text-bat-text">
        {favoritas
          ? "Nenhuma favorita ainda"
          : origemMinhas
          ? "Você ainda não adicionou músicas particulares"
          : temBusca
          ? "Nada encontrado"
          : "O acervo está vazio"}
      </h2>
      <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed text-bat-text-secondary">
        {favoritas
          ? "Toque na estrela ao lado de uma faixa no acervo para guardá-la aqui."
          : origemMinhas
          ? "Adicione faixas do YouTube ou Spotify. Elas serão visíveis apenas para você!"
          : temBusca
          ? "Tente outro termo, ou adicione a faixa ao acervo."
          : "Adicione faixas do YouTube ou Spotify para estudar com foco total."}
      </p>
      {!favoritas && (
        <button onClick={onAdicionar} className="btn-primary px-6 py-2.5 cursor-pointer">
          + Adicionar Música
        </button>
      )}
    </div>
  );
}
