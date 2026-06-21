/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountDownProps {
  ceremonyDate: string;
  ceremonyDateLabel?: string;
  ceremonyTimeLabel?: string;
}

// Each unit gets its own vibrant gradient + emoji
const UNIT_CONFIG = [
  { key: "days",    label: "Ngày",   emoji: "📅", gradient: "linear-gradient(135deg,#7c3aed,#6d28d9)" },
  { key: "hours",   label: "Giờ",    emoji: "🕐", gradient: "linear-gradient(135deg,#ec4899,#db2777)" },
  { key: "minutes", label: "Phút",   emoji: "⏱️", gradient: "linear-gradient(135deg,#f97316,#ea580c)" },
  { key: "seconds", label: "Giây",   emoji: "⚡", gradient: "linear-gradient(135deg,#14b8a6,#0d9488)" },
] as const;

export function CountDown({ ceremonyDate }: CountDownProps) {
  const targetTime = useMemo(() => new Date(ceremonyDate).getTime(), [ceremonyDate]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetTime - Date.now();

      if (!Number.isFinite(targetTime) || difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculateTimeLeft();
    const timer = window.setInterval(calculateTimeLeft, 1000);
    return () => window.clearInterval(timer);
  }, [targetTime]);

  if (!timeLeft) return null;

  const isEventPast =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  return (
    <div
      id="countdown-section"
      className="relative rounded-3xl overflow-hidden shadow-xl"
      style={{
        background: "linear-gradient(135deg,#1e1b4b 0%,#4c1d95 50%,#831843 100%)",
        border: "2.5px solid rgba(251,191,36,0.5)",
      }}
    >
      {/* Floating emoji decorations inside card */}
      <span className="absolute top-3 left-4 text-xl opacity-40 animate-bounce-soft pointer-events-none">✨</span>
      <span className="absolute top-3 right-4 text-xl opacity-40 animate-wiggle pointer-events-none">🎉</span>

      <div className="p-5 sm:p-6 text-center">
        {isEventPast ? (
          <div className="py-4">
            <p className="text-3xl mb-2">🎓🎊🥳</p>
            <p className="text-yellow-300 font-bold text-lg" style={{ fontFamily: "'Baloo 2',sans-serif" }}>
              Chúc mừng ngày tốt nghiệp!!!
            </p>
            <p className="text-purple-200 text-sm mt-1">Hôm nay là ngày đặc biệt nhất! 💜</p>
          </div>
        ) : (
          <>
            <p className="text-yellow-300 font-bold text-xs uppercase tracking-[0.2em] mb-4 flex items-center justify-center gap-2">
              <span>⏳</span>
              Sắp đến ngày được gặp mình rồi nè !!!
              <span>⏳</span>
            </p>

            <div className="flex items-stretch justify-center gap-2 sm:gap-3">
              {UNIT_CONFIG.map(({ key, label, emoji, gradient }) => (
                <div key={key} className="flex flex-col items-center gap-1.5 flex-1 max-w-[80px]">
                  {/* Number box */}
                  <div
                    className="w-full rounded-2xl flex flex-col items-center justify-center py-3 px-2 shadow-lg relative overflow-hidden"
                    style={{ background: gradient, minHeight: "72px" }}
                  >
                    {/* Shine overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.15) 0%,transparent 60%)" }}
                    />
                    <span className="text-sm mb-0.5" aria-hidden="true">{emoji}</span>
                    <span
                      className="text-white font-bold leading-none tabular-nums"
                      style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: "clamp(22px,5vw,32px)" }}
                    >
                      {String(timeLeft[key as keyof TimeLeft]).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Label */}
                  <span className="text-[10px] font-bold text-purple-200 uppercase tracking-widest">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Separator dots between units — visual only */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="h-1 w-1 rounded-full bg-yellow-400/60" />
              <div className="h-1 w-1 rounded-full bg-pink-400/60" />
              <div className="h-1 w-1 rounded-full bg-teal-400/60" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
