/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicPlayerProps {
  isVisible?: boolean;
}

const backgroundMusicUrl = "/audio/background-music.mp3";
const startMusicEventName = "graduation-invitation:start-music";

export function MusicPlayer({ isVisible = true }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(backgroundMusicUrl);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.5;

    const startMusic = () => {
      if (!audioRef.current) return;

      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.log("Audio playback was prevented. Direct interaction required.", err);
          setIsPlaying(false);
        });
    };

    window.addEventListener(startMusicEventName, startMusic);

    return () => {
      window.removeEventListener(startMusicEventName, startMusic);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.log("Audio playback was prevented. Direct interaction required.", err);
        setIsPlaying(false);
      });
  };

  return (
    <div
      id="music-player-widget"
      className={`fixed top-4 right-4 z-[99] flex items-center gap-2 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2"
      }`}
    >
      {/* Equalizer bars when playing */}
      {isPlaying && (
        <div
          className="flex items-end gap-0.5 h-7 px-2.5 py-1 rounded-xl shadow-lg"
          style={{ background: "rgba(124,58,237,0.92)", backdropFilter: "blur(8px)" }}
        >
          {[
            { h: "16px", delay: "0.1s", dur: "1s" },
            { h: "8px",  delay: "0.3s", dur: "0.8s" },
            { h: "20px", delay: "0s",   dur: "1.2s" },
            { h: "12px", delay: "0.2s", dur: "0.9s" },
            { h: "16px", delay: "0.4s", dur: "1.1s" },
          ].map((bar, i) => (
            <div
              key={i}
              className="w-0.5 rounded-full animate-bounce"
              style={{
                height: bar.h,
                animationDelay: bar.delay,
                animationDuration: bar.dur,
                background: i % 2 === 0 ? "#fbbf24" : "#f9a8d4",
              }}
            />
          ))}
          <span className="text-[9px] font-bold text-yellow-300 uppercase tracking-wider font-sans pl-1 self-center">
            BGM
          </span>
        </div>
      )}

      {/* Play/Pause button */}
      <button
        onClick={togglePlayback}
        aria-label={isPlaying ? "Tắt nhạc nền" : "Bật nhạc nền"}
        title={isPlaying ? "Tắt nhạc nền 🔇" : "Bật nhạc nền 🎵"}
        className="relative w-11 h-11 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 active:scale-90"
        style={
          isPlaying
            ? { background: "linear-gradient(135deg,#7c3aed,#ec4899)", boxShadow: "0 0 0 3px rgba(236,72,153,0.35)" }
            : { background: "white", border: "2.5px solid #c4b5fd", color: "#7c3aed" }
        }
      >
        {/* Pulse ring when playing */}
        {isPlaying && (
          <span
            className="absolute inset-0 rounded-full animate-ping"
            style={{ background: "rgba(124,58,237,0.3)", animationDuration: "1.5s" }}
          />
        )}

        {isPlaying ? (
          <Volume2 size={17} className="text-white relative z-10" />
        ) : (
          <VolumeX size={17} className="relative z-10" style={{ color: "#7c3aed" }} />
        )}

        {/* Music note emoji overlay */}
        <span className="absolute -top-1 -right-1 text-xs leading-none">
          {isPlaying ? "🎵" : "🔇"}
        </span>
      </button>
    </div>
  );
}

export function startBackgroundMusic() {
  window.dispatchEvent(new Event(startMusicEventName));
}
