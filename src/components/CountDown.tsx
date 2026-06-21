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

  const labels = {
    days: "Ngay",
    hours: "Gio",
    minutes: "Phut",
    seconds: "Giay",
  };

  return (
    <div id="countdown-section" className="flex flex-col items-center justify-center p-6 rounded-2xl glass-card border border-heritage-gold/30 shadow-md">
      <p className="font-sans font-semibold tracking-wider text-[11px] text-heritage-gold uppercase mb-3">
        Dem nguoc den ngay gap mat
      </p>
      <div className="flex items-center gap-3 sm:gap-4">
        {Object.entries(timeLeft).map(([key, value]) => (
          <div key={key} className="flex flex-col items-center">
            <div className="min-w-[56px] sm:min-w-[64px] h-[56px] sm:h-[64px] bg-midnight-navy border border-heritage-gold/40 rounded-xl flex items-center justify-center shadow-inner relative overflow-hidden group">
              <span className="font-serif text-xl sm:text-2xl text-[#f3e1bf] font-bold tracking-tight">
                {String(value).padStart(2, "0")}
              </span>
              <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"></div>
            </div>
            <span className="font-sans text-[10px] font-bold text-heritage-gold tracking-widest uppercase mt-1.5">
              {labels[key as keyof TimeLeft]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
