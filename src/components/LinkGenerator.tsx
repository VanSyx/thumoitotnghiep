/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Copy, Check, Users, Sparkles } from "lucide-react";

export function LinkGenerator() {
  const [guestName, setGuestName] = useState("");
  const [relationship, setRelationship] = useState("Bạn Đại Học");
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate the customized share link
  const getShareLink = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    if (guestName.trim()) {
      params.append("guest", guestName.trim());
    }
    if (relationship) {
      params.append("rel", relationship);
    }
    const query = params.toString();
    return query ? `${baseUrl}?${query}` : baseUrl;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getShareLink());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Could not copy link", err);
    }
  };

  const relOptions = [
    { label: "Bạn Đại Học", value: "Bạn Đại Học" },
    { label: "Bạn Thân Thiết", value: "Bạn Thân" },
    { label: "Gia Đình & Họ Hàng", value: "Gia Đình / Họ Hàng" },
    { label: "Thầy Cô Giảng Viên", value: "Giảng Viên" },
    { label: "Đồng Nghiệp / Anh Chị", value: "Khác" },
    { label: "Đàn Em Khoá Dưới", value: "Em Khoá Dưới" }
  ];

  return (
    <div id="link-generator-section" className="w-full mt-10 p-6 rounded-2xl border border-heritage-gold/25 bg-[#fdf8f8] shadow-sm relative overflow-hidden">
      <div className="absolute -right-6 -bottom-6 opacity-5 pointer-events-none text-heritage-gold">
        <Users size={120} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-heritage-gold/10 text-heritage-gold">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-serif text-[17px] font-bold text-midnight-navy">
              Bộ Tạo Thư Mời Cá Nhân Hoá
            </h3>
            <p className="text-[11px] font-sans antialiased text-stone-500">
              Công cụ dành riêng cho Sỹ để gửi thiệp mời riêng lẻ
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold font-sans text-heritage-gold hover:text-midnight-navy px-3 py-1.5 rounded-full border border-heritage-gold/20 hover:bg-gold-light/40 transition-colors"
        >
          {isExpanded ? "Thu gọn" : "Bắt đầu tạo"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-4 animate-fade-in-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-heritage-gold mb-1.5">
                Tên Khách Mời:
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A, Anh Minh..."
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-heritage-gold/20 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-heritage-gold focus:ring-1 focus:ring-custom"
              />
            </div>

            <div>
              <label className="block text-xs font-bold font-sans uppercase tracking-wider text-heritage-gold mb-1.5">
                Mối Quan Hệ (Cách Xưng Hô):
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-heritage-gold/20 text-stone-800 focus:outline-none focus:border-heritage-gold focus:ring-1 focus:ring-custom appearance-none"
              >
                {relOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3 bg-gold-light/30 border border-heritage-gold/15 rounded-xl">
            <p className="text-[11px] font-semibold text-heritage-gold uppercase tracking-wider mb-1">
              BẢN XEM TRƯỚC LỜI XƯNG HÔ THIỆP:
            </p>
            <p className="text-sm italic font-serif text-midnight-navy">
              THÂN MỜI: <span className="font-bold border-b border-heritage-gold/30">{guestName.trim() || "[Tên Khách Mời]"}</span>
            </p>
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <label className="block text-xs font-bold font-sans uppercase tracking-wider text-heritage-gold">
              ĐƯỜNG DẪN THIỆP RIÊNG BIỆT:
            </label>
            <div className="flex gap-1">
              <input
                type="text"
                readOnly
                value={getShareLink()}
                className="flex-1 px-3 py-2 text-xs bg-stone-100 border border-stone-200 rounded-lg text-stone-500 overflow-x-auto select-all focus:outline-none"
              />
              <button
                onClick={handleCopy}
                disabled={!guestName.trim()}
                className={`px-4 py-2 text-xs font-bold font-sans rounded-lg flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
                  !guestName.trim()
                    ? "bg-stone-200 text-stone-400 cursor-not-allowed"
                    : copied
                    ? "bg-emerald-600 text-white"
                    : "bg-midnight-navy text-white hover:bg-black"
                }`}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Đã copy!" : "Copy"}
              </button>
            </div>
            {guestName.trim() ? (
              <p className="text-[10px] text-stone-500 font-sans mt-1">
                👉 Copy liên kết này gửi cho <strong>{guestName}</strong> qua Zalo, Messenger để khách thấy tên mình trang trọng trên thiệp nhé!
              </p>
            ) : (
              <p className="text-[10px] text-amber-600 font-sans mt-0.5">
                ⚠️ Hãy nhập tên khách mời để kích hoạt tính năng copy link.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
