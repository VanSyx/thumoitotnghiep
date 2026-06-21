/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { GraduationWish } from "../types";
import { Heart, Star } from "lucide-react";

interface WishesListProps {
  wishes: GraduationWish[];
}

export function WishesList({ wishes }: WishesListProps) {
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  // Store likes of each wish in a state and local storage
  const [likes, setLikes] = useState<Record<string, number>>({});

  useEffect(() => {
    const savedLikes = localStorage.getItem("graduation-wishes-likes");
    if (savedLikes) {
      try {
        setLikes(JSON.parse(savedLikes));
      } catch (err) {
        console.error(err);
      }
    }
  }, []);

  const handleLike = (wishId: string) => {
    const updated = {
      ...likes,
      [wishId]: (likes[wishId] || 0) + 1
    };
    setLikes(updated);
    localStorage.setItem("graduation-wishes-likes", JSON.stringify(updated));
  };

  const filters = ["Tất cả", "Gia đình", "Bạn thân", "Bạn Đại Học", "Giảng Viên", "Em Khoá Dưới"];

  const filteredWishes = wishes.filter((wish) => {
    if (activeFilter === "Tất cả") return true;
    if (activeFilter === "Gia đình") return wish.relationship.toLowerCase().includes("gia đình");
    if (activeFilter === "Giảng Viên") {
      return wish.relationship.toLowerCase().includes("thầy") || wish.relationship.toLowerCase().includes("giảng") || wish.relationship.toLowerCase().includes("viên");
    }
    return wish.relationship.toLowerCase().includes(activeFilter.toLowerCase());
  });

  const getInitials = (name: string) => {
    if (!name) return "S";
    const words = name.trim().split(" ");
    if (words.length >= 2) {
      return (words[words.length - 2][0] + words[words.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div id="wishes-guestbook" className="w-full space-y-6">
      <div className="text-center">
        <span className="material-symbols-outlined text-heritage-gold text-[32px] mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
          auto_awesome
        </span>
        <h3 className="font-serif text-[24px] text-midnight-navy font-bold">Lưu Bút Lời Chúc</h3>
        <p className="font-sans text-xs text-stone-500 max-w-sm mx-auto mt-1">
          Nơi lưu giữ những tình cảm và chia sẻ dễ thương từ bạn bè gửi đến Trần Văn Sỹ
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none justify-start sm:justify-center">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3.5 py-1.5 text-xs font-sans font-semibold rounded-full border transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === filter
                ? "bg-midnight-navy text-[#fdd587] border-heritage-gold/40 shadow-sm"
                : "bg-white text-stone-600 border-heritage-gold/15 hover:bg-gold-light/20"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Wishes Grid */}
      {filteredWishes.length === 0 ? (
        <div className="text-center p-8 bg-gold-light/10 border border-dashed border-heritage-gold/20 rounded-2xl">
          <p className="text-sm font-sans text-slate-500 italic">Chưa có lời chúc nào trong nhóm này. Hãy là người đầu tiên chúc mừng Sỹ nhé!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredWishes.map((wish) => (
            <div
              key={wish.id}
              className="bg-white border border-[#775a19]/15 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 relative group flex flex-col justify-between"
            >
              {/* Top border decoration for special relationships */}
              {wish.relationship.toLowerCase().includes("gia") && (
                <div className="absolute top-0 inset-x-0 h-1 bg-[#ba1a1a] rounded-t-2xl"></div>
              )}
              {wish.relationship.toLowerCase().includes("giảng") && (
                <div className="absolute top-0 inset-x-0 h-1 bg-[#775a19] rounded-t-2xl"></div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  {/* Author Meta */}
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border ${wish.avatarColor || "bg-gold-light/50 text-heritage-gold border-heritage-gold/25"}`}>
                      {getInitials(wish.name)}
                    </div>
                    <div>
                      <h4 className="font-serif text-[15px] font-bold text-midnight-navy flex items-center gap-1.5">
                        {wish.name}
                        {wish.isAttending && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold font-sans bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Sẽ Tham Dự
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] font-sans text-heritage-gold font-bold uppercase tracking-wider">
                        • {wish.relationship}
                      </p>
                    </div>
                  </div>

                  {/* Stamp detail */}
                  <div className="opacity-30 group-hover:opacity-60 transition-opacity">
                    <Star className="text-heritage-gold fill-current" size={16} />
                  </div>
                </div>

                {/* Message Content */}
                <p className="text-sm font-sans text-stone-600 leading-relaxed font-normal italic pr-2">
                  "{wish.message}"
                </p>
              </div>

              {/* Bottom Row */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-stone-100 text-[11px] text-stone-400 font-sans">
                <span>{wish.timestamp}</span>
                <button
                  onClick={() => handleLike(wish.id)}
                  className="flex items-center gap-1.5 text-stone-500 hover:text-red-500 active:scale-90 transition-all cursor-pointer group/btn"
                >
                  <Heart
                    size={14}
                    className={`transition-colors duration-200 ${
                      likes[wish.id] ? "fill-red-500 text-red-500" : "text-stone-400 group-hover/btn:text-red-500"
                    }`}
                  />
                  <span className={`font-bold ${likes[wish.id] ? "text-red-500" : ""}`}>
                    Tặng tim ({likes[wish.id] || 0})
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
