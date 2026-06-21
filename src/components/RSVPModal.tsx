/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { X, Check, Gift, Users, Award, Heart } from "lucide-react";
import { GraduationWish } from "../types";

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  guestNameFromUrl: string;
  onSuccess: (newWish: GraduationWish) => void;
}

export function RSVPModal({ isOpen, onClose, guestNameFromUrl, onSuccess }: RSVPModalProps) {
  const [name, setName] = useState("");
  const [isAttending, setIsAttending] = useState(true);
  const [relationship, setRelationship] = useState("Bạn Đại Học");
  const [guestCount, setGuestCount] = useState(1);
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(guestNameFromUrl);
      setIsSubmitted(false);
    }
  }, [isOpen, guestNameFromUrl]);

  if (!isOpen) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Build the new wish
    const avatars = [
      "bg-red-150 text-red-700 border-red-200",
      "bg-blue-150 text-blue-700 border-blue-200",
      "bg-emerald-150 text-emerald-700 border-emerald-200",
      "bg-amber-150 text-amber-700 border-amber-200",
      "bg-purple-150 text-purple-700 border-purple-200",
      "bg-pink-150 text-pink-700 border-pink-200"
    ];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    const dateToday = new Date();
    const formattedDate = `${dateToday.getDate()} Tháng ${dateToday.getMonth() + 1}, ${dateToday.getFullYear()}`;

    const newWish: GraduationWish = {
      id: `wish-${Date.now()}`,
      name: name.trim(),
      relationship,
      message: message.trim() || (isAttending ? "Chúc mừng Văn Sỹ tốt nghiệp xuất sắc nhé!" : "Chúc mừng tốt nghiệp! Tiếc là mình không tham gia chung vui được."),
      timestamp: formattedDate,
      isAttending,
      avatarColor: randomAvatar
    };

    onSuccess(newWish);
    setIsSubmitted(true);
  };

  const relationshipTypes = [
    "Bạn Đại Học",
    "Bạn Thân",
    "Gia Đình / Họ Hàng",
    "Giảng Viên",
    "Em Khoá Dưới",
    "Khác"
  ];

  return (
    <div id="rsvp-modal" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-[500px] bg-[#fdf8f8] rounded-2xl border border-heritage-gold/30 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-heritage-gold/20 flex justify-between items-center bg-midnight-navy text-white">
          <div className="flex items-center gap-2">
            <Award className="text-[#e2c595] stroke-[1.5]" size={22} />
            <h3 className="font-serif text-[18px] text-[#fbf1dc] font-bold">Xác Nhận Tham Dự</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Participant Name */}
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-heritage-gold mb-1">
                  Họ & Tên khách mời <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên của bạn..."
                  className="w-full px-3 py-2.5 text-sm bg-white rounded-lg border border-heritage-gold/20 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-heritage-gold focus:ring-1 focus:ring-heritage-gold"
                />
              </div>

              {/* Attendance Toggle */}
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-heritage-gold mb-2">
                  Xác nhận tham gia
                </label>
                <div class="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAttending(true)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold font-sans tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isAttending
                        ? "bg-midnight-navy text-secondary-fixed border-heritage-gold/40 shadow-sm"
                        : "bg-white text-stone-600 border-heritage-gold/15 hover:bg-gold-light/20"
                    }`}
                  >
                    <Check size={14} /> Sẽ tham dự 🎉
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAttending(false)}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold font-sans tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      !isAttending
                        ? "bg-stone-500 text-white border-stone-600 shadow-sm"
                        : "bg-white text-stone-600 border-heritage-gold/15 hover:bg-gold-light/20"
                    }`}
                  >
                    <X size={14} /> Tiếc là không thể 😢
                  </button>
                </div>
              </div>

              {isAttending && (
                <>
                  {/* Guest Count */}
                  <div>
                    <label className="block text-xs font-bold font-sans uppercase tracking-wider text-[#775a19] mb-1.5 flex items-center gap-1">
                      <Users size={12} /> Số lượng người đi cùng:
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setGuestCount(num)}
                          className={`flex-1 py-1.5 text-xs font-bold font-sans rounded-md border transition-all cursor-pointer ${
                            guestCount === num
                              ? "bg-heritage-gold text-white border-heritage-gold"
                              : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Relationship */}
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-heritage-gold mb-1">
                  Mối quan hệ với Sỹ
                </label>
                <div className="flex flex-wrap gap-2">
                  {relationshipTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setRelationship(type)}
                      className={`px-3 py-1.5 text-xs font-sans rounded-full border transition-all cursor-pointer ${
                        relationship === type
                          ? "bg-heritage-gold/15 text-heritage-gold border-heritage-gold font-semibold"
                          : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Congratulations Message */}
              <div>
                <label className="block text-xs font-bold font-sans uppercase tracking-wider text-heritage-gold mb-1">
                  Lời chúc gửi đến cử nhân Trần Văn Sỹ
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    isAttending
                      ? "Chúc bạn tốt nghiệp ra trường tìm được công việc như ý và bay xa hơn nữa..."
                      : "Dù rất tiếc không thể trực tiếp chung vui nhưng tớ chúc cậu luôn tỏa sáng nhé..."
                  }
                  className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-heritage-gold/20 text-stone-800 placeholder-stone-400 focus:outline-none focus:border-heritage-gold focus:ring-1 focus:ring-heritage-gold resize-none"
                />
              </div>

              {/* Form Buttons */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-midnight-navy hover:bg-black text-secondary-fixed border border-heritage-gold/30 rounded-full py-3.5 px-4 font-label-caps text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  GỬI XÁC NHẬN THAM GIA <Heart size={14} className="fill-current animate-pulse text-[#ffa2a2]" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-8 space-y-4 animate-fade-in-up">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <Check size={32} />
              </div>
              <div>
                <h4 className="font-serif text-[22px] text-midnight-navy font-bold leading-tight">Gửi Xác Nhận Thành Công!</h4>
                <p className="font-sans text-sm text-stone-600 mt-2 max-w-sm mx-auto">
                  Cảm ơn <strong>{name}</strong> đã dành thời gian phản hồi. {isAttending ? "Sỹ rất mong chờ được đón tiếp bạn ở ngày lễ tốt nghiệp đại học sắp tới!" : "Dù không gặp được bạn, Sỹ trân trọng những lời chúc chân thành này của bạn nhé!"}
                </p>
              </div>
              <div className="p-4 bg-amber-50/50 border border-[#e8c176]/30 rounded-xl max-w-xs mx-auto text-left">
                <div className="flex items-center gap-1.5 text-heritage-gold font-bold text-xs font-sans mb-1 uppercase tracking-wider">
                  <Gift size={12} /> Lời chúc của bạn đã xuất hiện
                </div>
                <p className="text-xs text-stone-600 italic font-serif">
                  "{message.trim() || (isAttending ? "Chúc mừng Văn Sỹ tốt nghiệp xuất sắc nhé!" : "Chúc mừng tốt nghiệp! Tiếc là mình không tham gia chung vui được.")}"
                </p>
              </div>
              <div>
                <button
                  onClick={onClose}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-sans font-bold text-xs py-2.5 px-6 rounded-full border border-stone-200 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
