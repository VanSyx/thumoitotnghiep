import { useEffect, useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, Plus, Save, Trash2, Users } from "lucide-react";
import {
  buildGoogleMapsDirectionsUrl,
  createGuest,
  deleteGuest,
  getInvitationConfig,
  listGuests,
  updateInvitationConfig,
  type GuestRecord,
  type InvitationConfig,
} from "../api";

const emptyInvitation: InvitationConfig = {
  graduateName: "",
  title: "Thiệp Mời Tốt Nghiệp",
  subtitle: "GRADUATION CEREMONY",
  defaultGuestName: "",
  message:
    "Ngày tốt nghiệp không chỉ khép lại một chặng đường học tập mà còn mở ra những hành trình mới phía trước. Mình xin trân trọng kính mời mọi người đến chung vui, cùng sẻ chia niềm hạnh phúc và lưu giữ những khoảnh khắc đáng nhớ của ngày đặc biệt này với mình nhaa !!.",
  ceremonyDate: "",
  ceremonyDateLabel: "",
  ceremonyTimeLabel: "",
  venueName: "",
  venueAddress: "",
  googleMapsQuery: "",
  googleMapsPlaceId: "",
  major: "Information Technology",
  portraitUrl: "",
  phoneNumber: "",
  email: "",
  facebookUrl: "",
};

const REL_OPTIONS = [
  "Bạn Đại Học",
  "Bạn Thân",
  "Gia Đình / Họ Hàng",
  "Giảng Viên",
  "Em Khoá Dưới",
  "Đồng Nghiệp",
  "Khác",
];

const fieldClass =
  "w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-800 outline-none focus:border-heritage-gold focus:ring-2 focus:ring-heritage-gold/15";

function toDateTimeLocalValue(value: string) {
  if (!value) return "";

  const directMatch = value.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})/);
  if (directMatch) return directMatch[1];

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function fromDateTimeLocalValue(value: string) {
  if (!value) return "";
  return `${value}:00+07:00`;
}

function formatDateLabels(ceremonyDate: string) {
  const date = new Date(ceremonyDate);

  if (!Number.isFinite(date.getTime())) {
    return { ceremonyDateLabel: "", ceremonyTimeLabel: "" };
  }

  const weekdays = ["Chu Nhat", "Thu Hai", "Thu Ba", "Thu Tu", "Thu Nam", "Thu Sau", "Thu Bay"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    ceremonyDateLabel: `${weekdays[date.getDay()]}, ${day} Thang ${month}, ${year}`,
    ceremonyTimeLabel: `${hours}:${minutes}`,
  };
}

/** Tạo link thiệp cá nhân cho từng khách dựa vào guest ID — ổn định, không bị thay đổi */
function buildGuestLink(guestId: string) {
  return `${window.location.origin}/?guest=${encodeURIComponent(guestId)}`;
}

export function AdminPage() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("admin-token") || "");

  // --- Invitation state ---
  const [invitation, setInvitation] = useState<InvitationConfig>(emptyInvitation);
  const [ceremonyDateInput, setCeremonyDateInput] = useState("");
  const [status, setStatus] = useState("Dang tai du lieu...");
  const [isSaving, setIsSaving] = useState(false);

  // --- Guest management state ---
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestRel, setNewGuestRel] = useState(REL_OPTIONS[0]);
  const [isAddingGuest, setIsAddingGuest] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [guestError, setGuestError] = useState("");

  const mapPreviewUrl = useMemo(
    () => buildGoogleMapsDirectionsUrl(invitation),
    [invitation],
  );

  const timePreview = useMemo(
    () => formatDateLabels(fromDateTimeLocalValue(ceremonyDateInput)),
    [ceremonyDateInput],
  );

  // Load invitation config on mount
  useEffect(() => {
    getInvitationConfig()
      .then((config) => {
        setInvitation(config);
        setCeremonyDateInput(toDateTimeLocalValue(config.ceremonyDate));
        setStatus("Da tai du lieu admin.");
      })
      .catch((error) => {
        console.error(error);
        setStatus("Khong tai duoc du lieu. Kiem tra server.");
      });
  }, []);

  // Load guests using saved token on mount
  useEffect(() => {
    const saved = localStorage.getItem("admin-token") || "";
    if (saved) loadGuests(saved);
  }, []);

  const loadGuests = (token: string) => {
    if (!token) {
      setGuests([]);
      return;
    }
    setIsLoadingGuests(true);
    listGuests(token)
      .then((data) => setGuests(data))
      .catch(() => setGuests([]))
      .finally(() => setIsLoadingGuests(false));
  };

  const updateInvitationField = (field: keyof InvitationConfig, value: string) => {
    setInvitation((current) => ({ ...current, [field]: value }));
  };

  const saveInvitation = async () => {
    setIsSaving(true);
    setStatus("Dang luu thong tin thiep...");

    try {
      const ceremonyDate = fromDateTimeLocalValue(ceremonyDateInput);
      const labels = formatDateLabels(ceremonyDate);
      const saved = await updateInvitationConfig(
        {
          ...invitation,
          ceremonyDate,
          ceremonyDateLabel: labels.ceremonyDateLabel || invitation.ceremonyDateLabel,
          ceremonyTimeLabel: labels.ceremonyTimeLabel || invitation.ceremonyTimeLabel,
        },
        adminToken,
      );
      setInvitation(saved);
      setCeremonyDateInput(toDateTimeLocalValue(saved.ceremonyDate));
      localStorage.setItem("admin-token", adminToken);
      setStatus("Da luu thong tin thiep.");
      // Sau khi lưu token thành công, reload danh sách khách
      loadGuests(adminToken);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "";

      if (message.includes("401")) {
        setStatus("Luu that bai: ADMIN_TOKEN dang sai hoac server dang bat bao mat admin.");
      } else if (message.includes("Failed to fetch")) {
        setStatus("Luu that bai: server API chua chay. Hay chay npm.cmd run dev:server.");
      } else {
        setStatus(`Luu that bai: ${message || "kiem tra server API."}`);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // --- Guest handlers ---
  const handleAddGuest = async () => {
    const name = newGuestName.trim();
    if (!name) {
      setGuestError("Vui lòng nhập tên khách mời.");
      return;
    }
    if (!adminToken) {
      setGuestError("Nhập ADMIN_TOKEN trước khi thêm khách.");
      return;
    }
    setGuestError("");
    setIsAddingGuest(true);
    try {
      const created = await createGuest({ name, relationship: newGuestRel }, adminToken);
      setGuests((prev) => [...prev, created]);
      setNewGuestName("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setGuestError(
        msg.includes("401")
          ? "Token sai, không thể thêm khách."
          : "Thêm khách thất bại. Kiểm tra kết nối server.",
      );
    } finally {
      setIsAddingGuest(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!window.confirm("Xoá khách mời này khỏi danh sách?")) return;
    setDeletingId(id);
    try {
      await deleteGuest(id, adminToken);
      setGuests((prev) => prev.filter((g) => g.id !== id));
    } catch {
      alert("Xoá thất bại. Kiểm tra token hoặc kết nối.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopyLink = async (guestId: string) => {
    try {
      await navigator.clipboard.writeText(buildGuestLink(guestId));
      setCopiedId(guestId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      alert("Không copy được. Hãy copy thủ công:\n" + buildGuestLink(guestId));
    }
  };

  return (
    <div className="min-h-screen bg-paper-white text-midnight-navy">
      <header className="border-b border-heritage-gold/20 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-heritage-gold">
              Admin
            </p>
            <h1 className="font-serif text-2xl font-bold">Quản lý thiệp mời</h1>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-heritage-gold/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-heritage-gold hover:bg-gold-light/30"
          >
            Xem thiệp <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-6 space-y-6">

        {/* ── Row 1: Invitation config + Sidebar ── */}
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.85fr]">
          <section className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold">Thông tin thiệp</h2>
                <p className="text-sm text-stone-500">
                  Chỉ cần điền các thông tin thay đổi. Tên người nhận mặc định dùng khi không có link cá nhân.
                </p>
              </div>
              <button
                onClick={saveInvitation}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-midnight-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black disabled:opacity-60"
              >
                <Save size={15} /> Lưu thay đổi
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Tiêu đề chính"
                value={invitation.title}
                onChange={(value) => updateInvitationField("title", value)}
                placeholder="Ví dụ: Thiệp Mời Tốt Nghiệp"
              />
              <Field
                label="Tiêu đề phụ"
                value={invitation.subtitle}
                onChange={(value) => updateInvitationField("subtitle", value)}
                placeholder="Ví dụ: GRADUATION CEREMONY"
              />
              <Field
                label="Chuyên ngành"
                value={invitation.major}
                onChange={(value) => updateInvitationField("major", value)}
                placeholder="Ví dụ: Công nghệ thông tin"
              />
              <Field
                label="Tên người nhận mặc định"
                value={invitation.defaultGuestName}
                onChange={(value) => updateInvitationField("defaultGuestName", value)}
                placeholder="Ví dụ: Bạn & Người Thân"
                helpText="Chỉ hiển thị khi link không có ?guest=. Không ảnh hưởng link cá nhân."
              />
              <Field
                label="Tên chủ nhân"
                value={invitation.graduateName}
                onChange={(value) => updateInvitationField("graduateName", value)}
                placeholder="Ví dụ: Phạm Thị Khánh Ly"
              />
              <Field
                label="Thời gian sự kiện"
                type="datetime-local"
                value={ceremonyDateInput}
                onChange={setCeremonyDateInput}
                helpText="Hệ thống tự chuyển sang giờ Việt Nam (+07:00) để countdown đếm chính xác."
              />
              <Field
                label="Địa điểm"
                value={invitation.venueName}
                onChange={(value) => updateInvitationField("venueName", value)}
                placeholder="Ví dụ: Sân trường Đại học Kinh tế Đà Nẵng"
              />
              <Field
                label="Địa chỉ"
                value={invitation.venueAddress}
                onChange={(value) => updateInvitationField("venueAddress", value)}
                placeholder="Ví dụ: 71 Ngũ Hành Sơn, Đà Nẵng"
              />
              <Field
                label="Link hoặc từ khoá Google Maps"
                value={invitation.googleMapsQuery}
                onChange={(value) => updateInvitationField("googleMapsQuery", value)}
                placeholder="https://maps.app.goo.gl/... hoặc tên địa điểm"
              />
            </div>

            <div className="mt-4">
              <Field
                label="Lời nhắn (Message)"
                value={invitation.message}
                onChange={(value) => updateInvitationField("message", value)}
                placeholder="Nhập lời nhắn gửi đến khách mời..."
                isTextArea
              />
            </div>

            {/* Contact Info Fields */}
            <div className="mt-5 border-t border-heritage-gold/15 pt-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-heritage-gold">
                Thông tin liên hệ (hiển thị trên thiệp nếu được điền)
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                <Field
                  label="Số điện thoại"
                  value={invitation.phoneNumber}
                  onChange={(value) => updateInvitationField("phoneNumber", value)}
                  placeholder="Ví dụ: 0901 234 567"
                />
                <Field
                  label="Email"
                  value={invitation.email}
                  onChange={(value) => updateInvitationField("email", value)}
                  placeholder="Ví dụ: ten@gmail.com"
                />
                <Field
                  label="Facebook URL"
                  value={invitation.facebookUrl}
                  onChange={(value) => updateInvitationField("facebookUrl", value)}
                  placeholder="Ví dụ: https://facebook.com/username"
                />
              </div>
            </div>

            <div className="mt-5 rounded-lg bg-gold-light/25 p-4 text-sm text-stone-600">
              <p className="font-bold text-heritage-gold">Xem trước thời gian hiển thị</p>
              <p className="mt-1">Ngày: {timePreview.ceremonyDateLabel || "Chưa đọc được thời gian"}</p>
              <p>Giờ: {timePreview.ceremonyTimeLabel || "Chưa đọc được thời gian"}</p>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
              <h2 className="font-serif text-xl font-bold">Bảo mật admin</h2>
              <p className="mt-1 text-sm text-stone-500">
                Nhập ADMIN_TOKEN để được phép lưu dữ liệu và quản lý khách mời.
              </p>
              <input
                value={adminToken}
                onChange={(event) => setAdminToken(event.target.value)}
                onBlur={() => { if (adminToken) loadGuests(adminToken); }}
                placeholder="ADMIN_TOKEN"
                className={`${fieldClass} mt-3`}
                type="password"
              />
            </div>

            <div className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
              <h2 className="font-serif text-xl font-bold">Google Maps</h2>
              <p className="mt-1 text-sm text-stone-500">
                Nút chỉ đường sẽ dùng link hoặc từ khoá bạn nhập ở form.
              </p>
              <a
                href={mapPreviewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-heritage-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
              >
                Test chỉ đường <ExternalLink size={15} />
              </a>
            </div>

            <div className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
              <h2 className="font-serif text-xl font-bold">Trạng thái</h2>
              <p className="mt-2 text-sm text-stone-600">{status}</p>
            </div>
          </aside>
        </div>

        {/* ── Row 2: Guest Management — full width ── */}
        <section className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-heritage-gold/10 text-heritage-gold">
              <Users size={20} />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold">Danh Sách Khách Mời</h2>
              <p className="text-sm text-stone-500">
                Mỗi khách có link cá nhân riêng — không bị ảnh hưởng khi thay đổi tên mặc định.
              </p>
            </div>
          </div>

          {/* Giải thích */}
          <div className="mb-5 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 font-sans leading-relaxed">
            <strong>✅ Cách dùng đúng:</strong> Thêm tên từng khách vào đây → Bấm{" "}
            <strong>Copy link</strong> → Gửi qua Zalo / Messenger. Mỗi link dùng ID riêng (
            <code className="bg-blue-100 px-1 rounded">?guest=slug-id</code>), tên lấy từ database
            nên <strong>không bao giờ bị thay đổi</strong> dù bạn chỉnh sửa các trường khác.
          </div>

          {/* Form thêm khách */}
          <div className="mb-5 rounded-xl border border-heritage-gold/20 bg-gold-light/15 p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-heritage-gold">
              Thêm khách mới
            </p>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
              <input
                type="text"
                value={newGuestName}
                onChange={(e) => { setNewGuestName(e.target.value); setGuestError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleAddGuest()}
                placeholder="Tên khách mời (ví dụ: Nguyễn Văn A)"
                className={fieldClass}
              />
              <select
                value={newGuestRel}
                onChange={(e) => setNewGuestRel(e.target.value)}
                className={`${fieldClass} sm:w-44`}
              >
                {REL_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                onClick={handleAddGuest}
                disabled={isAddingGuest || !newGuestName.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-midnight-navy px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black disabled:opacity-50 whitespace-nowrap"
              >
                {isAddingGuest
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Plus size={14} />}
                Thêm
              </button>
            </div>
            {guestError && (
              <p className="mt-2 text-xs text-red-600">{guestError}</p>
            )}
          </div>

          {/* Danh sách */}
          {isLoadingGuests ? (
            <div className="flex items-center justify-center py-10 text-stone-400">
              <Loader2 size={20} className="animate-spin mr-2" />
              <span className="text-sm">Đang tải danh sách khách...</span>
            </div>
          ) : guests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-heritage-gold/25 p-8 text-center">
              <Users size={32} className="mx-auto mb-2 text-heritage-gold/30" />
              <p className="text-sm text-stone-400 italic">
                {adminToken
                  ? "Chưa có khách nào. Thêm khách đầu tiên bên trên!"
                  : "Nhập ADMIN_TOKEN rồi bấm ra ngoài để xem danh sách khách."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-stone-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100 bg-stone-50">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-heritage-gold">#</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-heritage-gold">Tên khách</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-heritage-gold hidden sm:table-cell">Quan hệ</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-heritage-gold hidden md:table-cell">ID trong link</th>
                    <th className="px-4 py-3 text-right text-[11px] font-bold uppercase tracking-wider text-heritage-gold">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {guests.map((guest, idx) => (
                    <tr key={guest.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="px-4 py-3 text-stone-400 font-mono text-xs">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <span className="font-serif text-[15px] font-bold text-midnight-navy">
                          {guest.name}
                        </span>
                        {guest.relationship && (
                          <span className="ml-2 sm:hidden text-xs text-heritage-gold">
                            • {guest.relationship}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="inline-flex items-center rounded-full border border-heritage-gold/20 bg-gold-light/30 px-2.5 py-0.5 text-[11px] font-bold text-heritage-gold">
                          {guest.relationship || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <code className="rounded bg-stone-100 px-2 py-0.5 text-[11px] text-stone-500 font-mono">
                          ?guest={guest.id}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleCopyLink(guest.id)}
                            title={`Copy link thiệp cho ${guest.name}`}
                            className={`inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                              copiedId === guest.id
                                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                : "bg-midnight-navy text-white hover:bg-black"
                            }`}
                          >
                            {copiedId === guest.id
                              ? <><Check size={12} /> Đã copy!</>
                              : <><Copy size={12} /> Copy link</>}
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(guest.id)}
                            disabled={deletingId === guest.id}
                            title="Xoá khách"
                            className="p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                          >
                            {deletingId === guest.id
                              ? <Loader2 size={14} className="animate-spin" />
                              : <Trash2 size={14} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-stone-100 bg-stone-50/50">
                    <td colSpan={5} className="px-4 py-2 text-[11px] text-stone-400 text-right font-sans">
                      Tổng: <strong className="text-midnight-navy">{guests.length}</strong> khách mời
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {guests.length > 0 && (
            <div className="mt-4 rounded-lg border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-xs text-emerald-700 font-sans">
              <strong>💡 Gửi thiệp:</strong> Bấm <strong>Copy link</strong> cho từng người →
              Paste vào Zalo / Messenger → Gửi đi. Khách mở link sẽ thấy đúng tên của họ,
              không bao giờ nhầm với người khác.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  type?: string;
  isTextArea?: boolean;
}

function Field({ label, value, onChange, placeholder, helpText, type = "text", isTextArea = false }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-heritage-gold">
        {label}
      </span>
      {isTextArea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${fieldClass} min-h-[100px] resize-y`}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={fieldClass}
        />
      )}
      {helpText && <span className="mt-1 block text-xs text-stone-500">{helpText}</span>}
    </label>
  );
}
