/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import {
  Award, BookOpen, Calendar, Globe, GraduationCap,
  Mail, MapPin, MessageCircle, Music, Navigation,
  PartyPopper, Phone, Sparkles, Star, Timer,
} from "lucide-react";
import {
  buildGoogleMapsDirectionsUrl,
  getGuest,
  getInvitationConfig,
  type InvitationConfig,
} from "./api";
import { AdminPage } from "./components/AdminPage";
import { CountDown } from "./components/CountDown";
import { MusicPlayer, startBackgroundMusic } from "./components/MusicPlayer";

const fallbackInvitation: InvitationConfig = {
  graduateName: "Tran Van Sy",
  title: "Thiep Moi Tot Nghiep",
  subtitle: "GRADUATION CEREMONY 2026",
  defaultGuestName: "Ban & Nguoi Than",
  message:
    "Khép lại hành trình đại học đầy ý nghĩa, em xin trân trọng mời mọi người đến chung vui cùng em trong Lễ Tốt Nghiệp và lưu lại những tấm hình thật xinh xắn nhé ạ! 🎓🌸.",
  ceremonyDate: "2026-11-10T08:00:00+07:00",
  ceremonyDateLabel: "Thu Bay, 10 Thang 11, 2026",
  ceremonyTimeLabel: "08:00 AM - 11:30 AM",
  venueName: "Hoi truong A, Dai hoc VKU",
  venueAddress: "Khu do thi Dai hoc Da Nang, Viet Nam",
  googleMapsQuery: "Dai hoc CNTT va TT Viet - Han VKU Da Nang",
  googleMapsPlaceId: "",
  major: "Information Technology",
  portraitUrl: "",
  phoneNumber: "",
  email: "",
  facebookUrl: "",
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

/* ─────────────────────────────── INVITATION PAGE ─────────────────────────── */
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
    if (relParam) setRelation(relParam.trim());
  }, []);

  const handleOpenMap = () => {
    window.open(buildGoogleMapsDirectionsUrl(invitation), "_blank", "noopener,noreferrer");
  };

  const handleOpenInvitation = () => {
    if (introPhase !== "message") return;
    startBackgroundMusic();
    setIntroPhase("opening");
    window.setTimeout(() => setIntroPhase("open"), 950);
  };

  return (
    <div
      id="graduation-app-wrapper"
      style={{ background: "linear-gradient(160deg, #fdf6ff 0%, #fce7f3 35%, #ede9fe 70%, #e0f2fe 100%)" }}
      className="font-sans min-h-screen pb-28 overflow-x-hidden relative"
    >
      {/* Decorative blobs */}
      <div className="fun-blob w-96 h-96 top-[-80px] left-[-80px]" style={{ background: "#c084fc" }} />
      <div className="fun-blob w-80 h-80 top-[30%] right-[-60px]" style={{ background: "#f9a8d4" }} />
      <div className="fun-blob w-72 h-72 bottom-[20%] left-[-40px]" style={{ background: "#7dd3fc" }} />
      <div className="fun-blob w-64 h-64 bottom-[-40px] right-[10%]" style={{ background: "#86efac" }} />

      {/* Floating emoji decorations */}
      <span className="fixed top-20 left-4 text-3xl animate-bounce-soft pointer-events-none z-10 opacity-60 delay-100">🎓</span>
      <span className="fixed top-36 right-4 text-2xl animate-wiggle pointer-events-none z-10 opacity-60 delay-200">✨</span>
      <span className="fixed bottom-32 left-3 text-2xl animate-bounce-soft pointer-events-none z-10 opacity-50 delay-300">🎉</span>
      <span className="fixed bottom-40 right-5 text-2xl animate-wiggle pointer-events-none z-10 opacity-50 delay-400">🌟</span>

      {/* Intro screen */}
      {introPhase !== "open" && (
        <IntroOpening
          guestName={guestName}
          isOpening={introPhase === "opening"}
          onOpen={handleOpenInvitation}
        />
      )}

      {/* Music player */}
      <MusicPlayer isVisible={introPhase === "open"} />

      {/* Main content */}
      <div
        className={`relative z-10 transition-all duration-700 ${
          introPhase === "open"
            ? "opacity-100 translate-y-0"
            : "pointer-events-none opacity-0 translate-y-8"
        }`}
      >
        {/* ── HEADER ── */}
        <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-purple-200/60"
          style={{ background: "rgba(253,246,255,0.88)" }}>
          <div className="max-w-[720px] mx-auto px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl grad-purple-pink flex items-center justify-center shadow-sm">
                <GraduationCap size={16} className="text-white" />
              </div>
              <span className="text-sm font-bold text-purple-700 tracking-wide hidden sm:block">
                Thiệp Mời Tốt Nghiệp 🎓
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg animate-heartbeat">🎊</span>
              <span className="text-xs font-bold text-pink-500 uppercase tracking-widest hidden sm:block">Class of {ceremonyYear}</span>
            </div>
          </div>
        </header>

        <main className="max-w-[720px] mx-auto px-4 pt-6 pb-4 space-y-6 relative z-10">

          {/* ── HERO SECTION ── */}
          <section className="text-center space-y-5">

            {/* Title badge */}
            <div className="animate-fade-in-up inline-flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-4xl animate-bounce-soft">🎓</span>
                <div>
                  <h1 className="font-display text-3xl sm:text-4xl shimmer-text leading-tight">
                    {invitation.title}
                  </h1>
                  <p className="text-xs font-bold text-purple-500 uppercase tracking-[0.25em] mt-0.5">
                    {invitation.subtitle}
                  </p>
                </div>
                <span className="text-4xl animate-bounce-soft delay-200">🎊</span>
              </div>
            </div>

            {/* Graduate name card */}
            <div className="animate-fade-in-up delay-200 mx-auto max-w-sm">
              <div
                className="relative rounded-3xl p-6 text-center overflow-hidden shadow-xl"
                style={{
                  background: "linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #831843 100%)",
                  border: "3px solid #fbbf24",
                }}
              >
                {/* Corner sparkles */}
                <span className="absolute top-3 left-3 text-xl animate-spin-slow">⭐</span>
                <span className="absolute top-3 right-3 text-xl animate-wiggle">✨</span>
                <span className="absolute bottom-3 left-3 text-xl animate-bounce-soft delay-300">🌟</span>
                <span className="absolute bottom-3 right-3 text-xl animate-wiggle delay-100">💫</span>

                <div className="w-16 h-16 rounded-full grad-orange-yellow mx-auto mb-3 flex items-center justify-center shadow-lg border-4 border-white/30">
                  <GraduationCap size={28} className="text-white" />
                </div>

                <h2 className="text-white font-display text-2xl sm:text-3xl leading-tight mb-2">
                  {invitation.graduateName}
                </h2>

                <div className="flex items-center justify-center gap-2 my-3">
                  <div className="h-0.5 w-12 bg-yellow-400/50 rounded" />
                  <Star size={12} className="text-yellow-400 fill-current" />
                  <div className="h-0.5 w-12 bg-yellow-400/50 rounded" />
                </div>

                <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-4 py-1.5">
                  <BookOpen size={13} className="text-yellow-300" />
                  <span className="text-yellow-200 text-xs font-bold uppercase tracking-wider">
                    {invitation.major}
                  </span>
                </div>

                <div className="mt-3 text-yellow-300 font-bold text-lg tracking-widest">
                  🎯 {ceremonyYear}
                </div>
              </div>
            </div>

            {/* Guest name section */}
            <div className="animate-pop-in delay-400">
              <div
                className="inline-block rounded-2xl px-6 py-4 relative"
                style={{ background: "white", border: "2.5px dashed #c084fc" }}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="text-sm">💌</span>
                  <p className="text-[10px] font-bold text-purple-500 uppercase tracking-[0.2em]">
                    Thân mời
                  </p>
                </div>
                <p
                  className="font-serif text-2xl sm:text-3xl font-bold text-purple-900 leading-tight"
                  style={{ fontFamily: "'Baloo 2', sans-serif" }}
                >
                  {guestName}
                </p>
                {relation && (
                  <span className="mt-1 inline-block text-[11px] font-bold text-pink-500 bg-pink-50 border border-pink-200 rounded-full px-3 py-0.5">
                    {relation} 💕
                  </span>
                )}
              </div>
            </div>

            {/* Message */}
            <div className="animate-fade-in-up delay-500 mx-auto max-w-md">
              <div className="bg-white/80 rounded-2xl p-4 border border-purple-100 shadow-sm">
                <div className="flex justify-center mb-2">
                  <span className="text-xl">💬</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 italic">
                  "{invitation.message}"
                </p>
              </div>
            </div>
          </section>

          {/* ── DIVIDER ── */}
          <div className="fun-divider">
            <span className="text-lg">⏰</span>
          </div>

          {/* ── COUNTDOWN ── */}
          <section>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Timer size={18} className="text-pink-500" />
              <p className="text-sm font-bold text-pink-600 uppercase tracking-widest">Đếm ngược đến ngày vui</p>
              <Timer size={18} className="text-pink-500" />
            </div>
            <CountDown
              ceremonyDate={invitation.ceremonyDate}
              ceremonyDateLabel={invitation.ceremonyDateLabel}
              ceremonyTimeLabel={invitation.ceremonyTimeLabel}
            />
          </section>

          {/* ── INFO CARDS ── */}
          <section className="grid gap-4 sm:grid-cols-2">

            {/* Time card */}
            <div className="fun-card animate-slide-left">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl grad-purple-pink flex items-center justify-center shadow-md">
                    <Calendar size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.2em]">📅 Thời gian</p>
                    <p className="text-xs text-slate-400 font-semibold">Hãy đánh dấu lịch nhé!</p>
                  </div>
                </div>
                <div className="bg-purple-50 rounded-2xl p-3 border border-purple-100">
                  <p className="font-bold text-purple-900 text-base leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {invitation.ceremonyDateLabel}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-sm">🕐</span>
                    <p className="text-sm text-purple-600 font-semibold">{invitation.ceremonyTimeLabel}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue card */}
            <div className="fun-card animate-slide-right delay-100">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl grad-pink-red flex items-center justify-center shadow-md">
                    <MapPin size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.2em]">📍 Địa điểm</p>
                    <p className="text-xs text-slate-400 font-semibold">Địa điểm tổ chức</p>
                  </div>
                </div>
                <div className="bg-pink-50 rounded-2xl p-3 border border-pink-100">
                  <p className="font-bold text-pink-900 text-base leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {invitation.venueName}
                  </p>
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <span className="text-sm shrink-0 mt-0.5">🗺️</span>
                    <p className="text-xs text-pink-600">{invitation.venueAddress}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Major card — full width */}
            <div className="fun-card animate-fade-in-up delay-200 sm:col-span-2">
              <div className="p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl grad-orange-yellow flex items-center justify-center shadow-md shrink-0">
                  <Award size={26} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-orange-400 uppercase tracking-[0.2em]">🏆 Chuyên ngành tốt nghiệp</p>
                  <p className="font-bold text-slate-800 text-xl mt-0.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {invitation.major}
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="text-3xl animate-wiggle delay-200">🎓</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── CONTACT SECTION ── */}
          {(invitation.phoneNumber || invitation.email || invitation.facebookUrl) && (
            <section>
              <div className="fun-divider mb-4">
                <span className="text-lg">📬</span>
              </div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <PartyPopper size={16} className="text-teal-500" />
                <p className="text-sm font-bold text-teal-600 uppercase tracking-widest">Liên hệ với tân cử nhân</p>
                <PartyPopper size={16} className="text-teal-500" />
              </div>
              <div className="grid gap-3">
                {invitation.phoneNumber && (
                  <a
                    href={`tel:${invitation.phoneNumber}`}
                    className="fun-card flex items-center gap-4 p-4 no-underline group"
                  >
                    <div className="w-12 h-12 rounded-2xl grad-teal-sky flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">📞 Điện thoại</p>
                      <p className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                        {invitation.phoneNumber}
                      </p>
                    </div>
                    <span className="ml-auto text-xl animate-bounce-soft">📲</span>
                  </a>
                )}
                {invitation.email && (
                  <a
                    href={`mailto:${invitation.email}`}
                    className="fun-card flex items-center gap-4 p-4 no-underline group"
                  >
                    <div className="w-12 h-12 rounded-2xl grad-sky-purple flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">✉️ Email</p>
                      <p className="font-bold text-slate-800 text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                        {invitation.email}
                      </p>
                    </div>
                    <span className="ml-auto text-xl animate-wiggle">💌</span>
                  </a>
                )}
                {invitation.facebookUrl && (
                  <a
                    href={invitation.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fun-card flex items-center gap-4 p-4 no-underline group"
                  >
                    <div className="w-12 h-12 rounded-2xl grad-purple-pink flex items-center justify-center shadow-md shrink-0 group-hover:scale-110 transition-transform">
                      <Globe size={20} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">🌐 Facebook</p>
                      <p className="font-bold text-slate-800 text-base truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                        {invitation.facebookUrl.replace(/^https?:\/\/(www\.)?facebook\.com\//, "").replace(/\/$/, "") || invitation.facebookUrl}
                      </p>
                    </div>
                    <span className="ml-auto text-xl animate-bounce-soft delay-100">👋</span>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* ── FOOTER DIVIDER ── */}
          <div className="fun-divider">
            <span className="text-2xl animate-spin-slow">🌟</span>
          </div>
        </main>

        {/* ── FOOTER ── */}
        <footer className="max-w-[720px] mx-auto px-4 pb-4 text-center">
          <div className="bg-white/70 rounded-3xl p-5 border border-purple-100 shadow-sm">
            <div className="flex justify-center gap-2 mb-2">
              <span className="text-xl">🎓</span>
              <span className="text-xl">💜</span>
              <span className="text-xl">🎉</span>
            </div>
            <p className="text-sm font-bold text-purple-800" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {invitation.graduateName} — Class of {ceremonyYear}
            </p>
            <p className="text-[10px] text-purple-400 font-semibold uppercase tracking-widest mt-1">
              Hẹn gặp nhau tại lễ tốt nghiệp nhé! 🥳
            </p>
          </div>
        </footer>
      </div>

      {/* ── STICKY NAVIGATION BUTTON ── */}
      {introPhase === "open" && (
        <div
          id="sticky-call-to-actions"
          className="fixed bottom-5 inset-x-0 z-50 max-w-[720px] mx-auto px-4 pointer-events-none"
        >
          <div className="pointer-events-auto flex gap-2 p-2 rounded-full shadow-2xl backdrop-blur-md"
            style={{ background: "rgba(30,27,75,0.92)", border: "2px solid #fbbf24" }}>
            <button
              onClick={handleOpenMap}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-full font-bold text-xs uppercase tracking-wider transition-all active:scale-95 cursor-pointer shadow-lg"
              style={{ background: "linear-gradient(135deg, #f97316, #fbbf24)", color: "white" }}
            >
              <Navigation size={16} className="stroke-[2.5]" />
              <span>🗺️ Chỉ đường đến lễ tốt nghiệp!</span>
            </button>
            <button
              onClick={() => document.getElementById("countdown-section")?.scrollIntoView({ behavior: "smooth" })}
              className="w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer shrink-0"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}
              title="Xem đếm ngược"
            >
              <Music size={18} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────── INTRO OPENING ──────────────────────────── */
interface IntroOpeningProps {
  guestName: string;
  isOpening: boolean;
  onOpen: () => void;
}

function IntroOpening({ guestName, isOpening, onOpen }: IntroOpeningProps) {
  return (
    <div className={`intro-screen ${isOpening ? "intro-screen--opening" : ""}`}>
      <div className="intro-confetti intro-confetti-one" />
      <div className="intro-confetti intro-confetti-two" />
      <div className="intro-confetti intro-confetti-three" />

      <button
        type="button"
        onClick={onOpen}
        disabled={isOpening}
        className="intro-card"
        aria-label="Mo thiep moi tot nghiep"
      >
        <div className="intro-ribbon" aria-hidden="true">🎓 Special Day 🎓</div>
        <div className="intro-sticker" aria-hidden="true">
          <Sparkles size={14} />
          <span>Yay! 🎉</span>
        </div>

        <div className="intro-message">
          <div className="intro-avatar">
            <MessageCircle size={20} />
          </div>
          <div className="intro-bubble">
            <span className="intro-kicker">💌 Tin nhắn mới</span>
            <strong>Bạn có một lời nhắn đặc biệt nè!!!</strong>
            <span className="intro-preview">Gửi riêng đến {guestName} 💕</span>
          </div>
        </div>

        <div className="intro-envelope" aria-hidden="true">
          <div className="intro-envelope-back" />
          <div className="intro-letter">
            <Sparkles size={15} />
            <span>Graduation 🎓</span>
          </div>
          <div className="intro-envelope-flap" />
          <div className="intro-seal">
            <Star size={16} className="fill-current" />
          </div>
          <div className="intro-envelope-front">
            <Mail size={28} />
          </div>
        </div>

        <div className="intro-action">
          <span>{isOpening ? "✨ Đang mở thiệp..." : "👆 Chạm để mở thiệp"}</span>
        </div>

        <div className="intro-sparkle-field" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </button>
    </div>
  );
}
