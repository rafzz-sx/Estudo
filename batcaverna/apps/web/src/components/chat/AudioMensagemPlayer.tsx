"use client";

import { useState, useRef } from "react";

interface AudioMensagemPlayerProps {
  src: string;
  duracao?: number | null;
  souEu: boolean;
}

/** Formata segundos em mm:ss limpo e sem bugs */
export function formatarTempoAudio(segundos: number): string {
  if (isNaN(segundos) || !isFinite(segundos) || segundos < 0) return "0:00";
  const s = Math.round(segundos);
  const min = Math.floor(s / 60);
  const seg = s % 60;
  return `${min}:${seg < 10 ? "0" : ""}${seg}`;
}

/**
 * Player de áudio tático, minimalista e de alta performance para mensagens no chat.
 */
export function AudioMensagemPlayer({
  src,
  duracao,
  souEu,
}: AudioMensagemPlayerProps) {
  const [tocando, setTocando] = useState(false);
  const [tempoAtual, setTempoAtual] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (tocando) {
      audioRef.current.pause();
      setTocando(false);
    } else {
      audioRef.current
        .play()
        .then(() => setTocando(true))
        .catch(() => setTocando(false));
    }
  };

  const duracaoTotal = duracao && duracao > 0 ? duracao : Math.max(1, Math.round(audioRef.current?.duration || 0));
  const progresso = duracaoTotal > 0 ? Math.min(100, (tempoAtual / duracaoTotal) * 100) : 0;

  return (
    <div
      className={`flex items-center gap-3 py-1 px-1 min-w-[190px] max-w-[260px] select-none ${
        souEu ? "text-black" : "text-bat-text"
      }`}
    >
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={() => {
          if (audioRef.current) setTempoAtual(audioRef.current.currentTime);
        }}
        onEnded={() => {
          setTocando(false);
          setTempoAtual(0);
        }}
        preload="metadata"
        className="hidden"
      />
      <button
        type="button"
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all active:scale-95 cursor-pointer ${
          souEu
            ? "bg-black text-bat-gold-400 hover:bg-black/80"
            : "bg-bat-gold-400 text-black hover:bg-bat-gold-300"
        }`}
        title={tocando ? "Pausar áudio" : "Ouvir áudio"}
      >
        <span className="text-xs font-bold pl-0.5">{tocando ? "⏸" : "▶"}</span>
      </button>

      <div className="flex-1 min-w-0">
        <div
          onClick={(e) => {
            if (!audioRef.current || duracaoTotal <= 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            audioRef.current.currentTime = pos * duracaoTotal;
            setTempoAtual(audioRef.current.currentTime);
          }}
          className={`h-2.5 rounded-full cursor-pointer relative overflow-hidden transition-all ${
            souEu ? "bg-black/20" : "bg-bat-bg-primary border border-bat-border/80"
          }`}
        >
          <div
            className={`h-full rounded-full transition-all duration-75 ${
              souEu ? "bg-black" : "bg-bat-gold-400"
            }`}
            style={{ width: `${progresso}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] font-mono mt-1 font-semibold opacity-85">
          <span>{formatarTempoAudio(tempoAtual)}</span>
          <span>{duracaoTotal > 0 ? formatarTempoAudio(duracaoTotal) : ""}</span>
        </div>
      </div>
    </div>
  );
}
