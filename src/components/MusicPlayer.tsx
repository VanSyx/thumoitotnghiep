/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX } from "lucide-react";

export function MusicPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Create audio context lazy loading
    audioRef.current = new Audio("https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.4;

    return () => {
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
    } else {
      audioRef.current.play().catch((err) => {
        console.log("Audio autoplay was prevented. Direct interaction required.", err);
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div id="music-player-widget" className="fixed top-4 right-4 z-[99] flex items-center gap-2">
      <button
        onClick={togglePlayback}
        aria-label="Power background music"
        className={`p-2.5 sm:p-3 rounded-full shadow-lg backdrop-blur-md border flex items-center justify-center transition-all duration-300 transform active:scale-90 ${
          isPlaying
            ? "bg-heritage-gold border-secondary text-white scale-105 animate-pulse-subtle"
            : "bg-[#fdf8f8]/95 border-heritage-gold/30 text-heritage-gold hover:bg-gold-light"
        }`}
      >
        {isPlaying ? <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" /> : <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" />}
      </button>

      {/* Elegant audio waves */}
      {isPlaying && (
        <div className="flex items-end gap-0.5 h-6 bg-[#000a1e]/90 px-2 rounded-lg border border-heritage-gold/20 backdrop-blur-sm shadow-sm transition-all duration-300">
          <div className="w-0.5 bg-secondary-fixed animate-bounce h-4" style={{ animationDelay: "0.1s", animationDuration: "1s" }}></div>
          <div className="w-0.5 bg-secondary-fixed animate-bounce h-2" style={{ animationDelay: "0.3s", animationDuration: "0.8s" }}></div>
          <div className="w-0.5 bg-secondary-fixed animate-bounce h-5" style={{ animationDelay: "0.5s", animationDuration: "1.2s" }}></div>
          <div className="w-0.5 bg-secondary-fixed animate-bounce h-3" style={{ animationDelay: "0.2s", animationDuration: "0.9s" }}></div>
          <div className="w-0.5 bg-secondary-fixed animate-bounce h-4" style={{ animationDelay: "0.4s", animationDuration: "1.1s" }}></div>
          <span className="text-[9px] font-bold text-secondary-fixed uppercase tracking-wider font-sans pl-1">BGM</span>
        </div>
      )}
    </div>
  );
}
