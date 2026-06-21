/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { BookOpen, Calendar, Mail, MapPin, Menu, MessageCircle, Navigation, Sparkles } from "lucide-react";
import {
  buildGoogleMapsDirectionsUrl,
  getGuest,
  getInvitationConfig,
  type InvitationConfig,
} from "./api";
import { AdminPage } from "./components/AdminPage";
import { CountDown } from "./components/CountDown";
import { MusicPlayer } from "./components/MusicPlayer";

const fallbackInvitation: InvitationConfig = {
  graduateName: "Tran Van Sy",
  title: "Thiep Moi Tot Nghiep",
  subtitle: "GRADUATION CEREMONY 2026",
  defaultGuestName: "Ban & Nguoi Than",
  message:
    "Mot cot moc dang nho trong hanh trinh truong thanh. Tran trong kinh moi quy khach den chung vui, chia se niem vui tot nghiep cung gia dinh toi.",
  ceremonyDate: "2026-11-10T08:00:00+07:00",
  ceremonyDateLabel: "Thu Bay, 10 Thang 11, 2026",
  ceremonyTimeLabel: "08:00 AM - 11:30 AM",
  venueName: "Hoi truong A, Dai hoc VKU",
  venueAddress: "Khu do thi Dai hoc Da Nang, Viet Nam",
  googleMapsQuery: "Dai hoc CNTT va TT Viet - Han VKU Da Nang",
  googleMapsPlaceId: "",
  major: "Information Technology",
  portraitUrl: "",
};

function getDisplayYear(invitation: InvitationConfig) {
  const labelMatch = invitation.ceremonyDateLabel.match(/\b(20\d{2})\b/);
  if (labelMatch) return labelMatch[1];

  const dateYear = new Date(invitation.ceremonyDate).getFullYear();
  return Number.isFinite(dateYear) ? String(dateYear) : "2026";
}

export default function App() {
  if (window.location.pathname.startsWith("/admin")) {
    return <AdminPage />;
  }

  return <InvitationPage />;
}

function InvitationPage() {
  const [invitation, setInvitation] = useState(fallbackInvitation);
  const [guestName, setGuestName] = useState(fallbackInvitation.defaultGuestName);
  const [relation, setRelation] = useState("");
  const [introPhase, setIntroPhase] = useState<"message" | "opening" | "open">("message");
  const ceremonyYear = getDisplayYear(invitation);

  useEffect(() => {
    getInvitationConfig()
      .then((config) => {
        setInvitation(config);
        setGuestName((currentName) =>
          currentName === fallbackInvitation.defaultGuestName
            ? config.defaultGuestName
            : currentName,
        );
      })
      .catch((error) => {
        console.error("Could not load invitation config", error);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get("guest");
    const relParam = params.get("rel");

    if (guestParam) {
      const value = guestParam.trim();
      setGuestName(value);

      getGuest(value)
        .then((guest) => {
          setGuestName(guest.name);
          setRelation(guest.relationship);
        })
        .catch(() => {
          // Old links can still pass a plain guest name directly.
        });
    }

    if (relParam) {
      setRelation(relParam.trim());
    }
  }, []);

  const handleOpenMap = () => {
    window.open(buildGoogleMapsDirectionsUrl(invitation), "_blank", "noopener,noreferrer");
  };

  const handleOpenInvitation = () => {
    if (introPhase !== "message") return;

    setIntroPhase("opening");
    window.setTimeout(() => {
      setIntroPhase("open");
    }, 950);
  };

  return (
    <div id="graduation-app-wrapper" className="bg-background text-on-surface font-sans min-h-screen pb-24 overflow-x-hidden selection:bg-[#ffdea3] selection:text-midnight-navy relative">
      <div className="fixed inset-0 bg-radial-dots pointer-events-none opacity-20 z-0"></div>
      <div className="absolute top-[20%] left-0 w-72 h-72 bg-heritage-gold/5 rounded-full filter blur-3xl pointer-events-none animate-pulse-subtle"></div>
      <div className="absolute top-[50%] right-0 w-80 h-80 bg-gold-light/20 rounded-full filter blur-2xl pointer-events-none"></div>

      {introPhase !== "open" && (
        <IntroOpening
          guestName={guestName}
          isOpening={introPhase === "opening"}
          onOpen={handleOpenInvitation}
        />
      )}

      {introPhase === "open" && <MusicPlayer />}

      <div
        className={`relative z-10 transition-all duration-700 ${
          introPhase === "open"
            ? "opacity-100 translate-y-0 scale-100"
            : "pointer-events-none opacity-0 translate-y-6 scale-[0.98]"
        }`}
      >
      <header className="bg-background/90 text-primary sticky top-0 backdrop-blur-md border-b border-heritage-gold/20 z-40 transition-all">
        <div className="flex justify-between items-center w-full px-5 py-4 max-w-[768px] mx-auto">
          <div className="flex items-center gap-2 animate-fade-in-up">
            <span className="text-[11px] font-sans font-bold tracking-[0.18em] text-heritage-gold uppercase">
              GRADUATION INVITATION
            </span>
          </div>
          <button className="text-heritage-gold hover:text-midnight-navy transition-colors" aria-label="Open menu">
            <Menu size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-[768px] mx-auto px-5 relative z-10 space-y-12">
        <section className="flex flex-col items-center justify-center pt-10 pb-6 text-center">
          <div className="mb-8 space-y-2 animate-fade-in-up">
            <h1 className="font-serif text-[38px] sm:text-[48px] tracking-tight text-midnight-navy font-bold leading-tight">
              {invitation.title}
            </h1>
            <p className="font-sans text-[11px] font-bold text-heritage-gold tracking-[0.2em] uppercase">
              {invitation.subtitle}
            </p>
          </div>

          <div className="mb-8 flex min-h-[180px] w-full max-w-[420px] flex-col items-center justify-center rounded-sm border-y border-heritage-gold/25 bg-[#fffdfb] px-6 py-8 text-center shadow-sm animate-fade-in-up">
            <h2 className="font-serif text-[34px] font-bold leading-tight text-midnight-navy sm:text-[42px]">
              {invitation.graduateName}
            </h2>
            <div className="my-4 h-px w-20 bg-heritage-gold/45"></div>
            <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-heritage-gold">
              {invitation.major}
            </p>
            <p className="mt-2 font-serif text-[24px] font-bold text-midnight-navy">
              {ceremonyYear}
            </p>
          </div>

          <div className="mb-4 text-center space-y-1.5 w-full max-w-sm mx-auto">
            <p className="font-sans text-[11px] font-bold text-heritage-gold uppercase tracking-widest">
              THÂN MỜI:
            </p>
            <div className="relative inline-block max-w-[90%] truncate">
              <p className="font-serif text-[24px] tracking-wide text-midnight-navy italic font-semibold border-b border-heritage-gold/35 px-7 py-1 inline-block bg-[#fdf8f8]">
                {guestName}
              </p>
            </div>
            {relation && (
              <p className="font-sans text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                ({relation})
              </p>
            )}
          </div>

          <p className="font-sans text-sm sm:text-base leading-relaxed text-stone-600 max-w-md mx-auto px-4 mt-2">
            {invitation.message}
          </p>
        </section>

        <section className="py-2">
          <CountDown
            ceremonyDate={invitation.ceremonyDate}
            ceremonyDateLabel={invitation.ceremonyDateLabel}
            ceremonyTimeLabel={invitation.ceremonyTimeLabel}
          />
        </section>

        <section className="grid gap-4 w-full">
          <div className="p-6 rounded-2xl glass-card border border-heritage-gold/25 shadow-sm text-center space-y-3 shrink-none">
            <div className="mx-auto w-10 h-10 rounded-full bg-gold-light/35 flex items-center justify-center text-heritage-gold border border-heritage-gold/15">
              <Calendar size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans text-[11px] font-bold text-heritage-gold tracking-widest uppercase">
                THỜI GIAN
              </h4>
              <p className="font-serif text-[22px] text-midnight-navy font-bold leading-tight">
                {invitation.ceremonyDateLabel}
              </p>
              <p className="font-sans text-sm text-stone-500">
                {invitation.ceremonyTimeLabel}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-card border border-heritage-gold/25 shadow-sm text-center space-y-3">
            <div className="mx-auto w-10 h-10 rounded-full bg-gold-light/35 flex items-center justify-center text-heritage-gold border border-heritage-gold/15">
              <MapPin size={18} />
            </div>
            <div className="space-y-1">
              <h4 className="font-sans text-[11px] font-bold text-heritage-gold tracking-widest uppercase">
                ĐỊA ĐIỂM
              </h4>
              <p className="font-serif text-[22px] text-midnight-navy font-bold leading-tight">
                {invitation.venueName}
              </p>
              <p className="font-sans text-sm text-stone-500 max-w-sm mx-auto">
                {invitation.venueAddress}
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl glass-card border border-heritage-gold/20 shadow-sm text-center flex flex-col justify-center items-center gap-2">
            <div className="flex items-center gap-1.5 text-heritage-gold text-[10px] font-sans font-bold uppercase tracking-[0.14em]">
              <BookOpen size={13} /> CHUYÊN NGÀNH 
            </div>
            <p className="font-serif text-[17px] sm:text-[18px] text-midnight-navy font-bold tracking-wide">
              {invitation.major}
            </p>
          </div>
        </section>

        <div className="flex items-center justify-center gap-3 py-4">
          <div className="h-[1px] bg-heritage-gold/25 flex-1 max-w-[120px]"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-heritage-gold/60"></div>
          <div className="h-[1px] bg-heritage-gold/25 flex-1 max-w-[120px]"></div>
        </div>
      </main>

      <footer className="bg-paper-white border-t border-heritage-gold/20 flex flex-col items-center gap-2 py-8 w-full px-5 text-center mt-12 relative z-10">
        <p className="text-[11px] font-sans font-bold text-midnight-navy uppercase tracking-[0.16em]">
          {invitation.graduateName} - CLASS OF {ceremonyYear}
        </p>
        <p className="text-[9px] text-stone-400 font-sans uppercase tracking-[0.08em] mt-1">
          ACADEMIC HERITAGE - VKU UNIVERSITY
        </p>
      </footer>

      <div id="sticky-call-to-actions" className="fixed bottom-6 inset-x-0 z-40 max-w-[768px] mx-auto px-5 pointer-events-none">
        <div className="pointer-events-auto w-full bg-midnight-navy rounded-full shadow-2xl border border-heritage-gold/30 flex p-1.5 gap-2 backdrop-blur-md justify-center">
          <button
            onClick={handleOpenMap}
            className="w-full bg-heritage-gold hover:bg-gold-accent text-white font-sans text-xs font-black py-3.5 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-lg cursor-pointer"
          >
            <Navigation className="w-4 h-4 text-white stroke-[2.5]" />
            <span className="truncate font-semibold tracking-wider text-[11px] uppercase">
              Đường đến gặp tân cử nhân nè !!!!
            </span>
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}

interface IntroOpeningProps {
  guestName: string;
  isOpening: boolean;
  onOpen: () => void;
}

function IntroOpening({ guestName, isOpening, onOpen }: IntroOpeningProps) {
  return (
    <div className={`intro-screen ${isOpening ? "intro-screen--opening" : ""}`}>
      <div className="intro-confetti intro-confetti-one"></div>
      <div className="intro-confetti intro-confetti-two"></div>
      <div className="intro-confetti intro-confetti-three"></div>

      <button
        type="button"
        onClick={onOpen}
        disabled={isOpening}
        className="intro-card"
        aria-label="Mo thiep moi tot nghiep"
      >
        <div className="intro-ribbon" aria-hidden="true">
          Special day
        </div>
        <div className="intro-sticker" aria-hidden="true">
          <Sparkles size={18} />
          <span>Yay!</span>
        </div>
        <div className="intro-message">
          <div className="intro-avatar">
            <MessageCircle size={22} />
          </div>
          <div className="intro-bubble">
            <span className="intro-kicker">Tin nhan moi</span>
            <strong>Ban co mot loi moi dac biet</strong>
            <span className="intro-preview">Gui rieng den {guestName}</span>
          </div>
        </div>

        <div className="intro-envelope" aria-hidden="true">
          <div className="intro-envelope-back"></div>
          <div className="intro-letter">
            <Sparkles size={15} />
            <span>Graduation</span>
          </div>
          <div className="intro-envelope-flap"></div>
          <div className="intro-seal">
            <Sparkles size={16} />
          </div>
          <div className="intro-envelope-front">
            <Mail size={28} />
          </div>
        </div>

        <div className="intro-action">
          <span>{isOpening ? "Dang mo thiep..." : "Cham de mo thiep"}</span>
        </div>
        <div className="intro-sparkle-field" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
    </div>
  );
}
