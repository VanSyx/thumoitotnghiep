import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Save } from "lucide-react";
import {
  buildGoogleMapsDirectionsUrl,
  getInvitationConfig,
  updateInvitationConfig,
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
};

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
    return {
      ceremonyDateLabel: "",
      ceremonyTimeLabel: "",
    };
  }

  const weekdays = [
    "Chu Nhat",
    "Thu Hai",
    "Thu Ba",
    "Thu Tu",
    "Thu Nam",
    "Thu Sau",
    "Thu Bay",
  ];
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

export function AdminPage() {
  const [adminToken, setAdminToken] = useState(() => localStorage.getItem("admin-token") || "");
  const [invitation, setInvitation] = useState<InvitationConfig>(emptyInvitation);
  const [ceremonyDateInput, setCeremonyDateInput] = useState("");
  const [status, setStatus] = useState("Dang tai du lieu...");
  const [isSaving, setIsSaving] = useState(false);

  const mapPreviewUrl = useMemo(
    () => buildGoogleMapsDirectionsUrl(invitation),
    [invitation],
  );

  const timePreview = useMemo(
    () => formatDateLabels(fromDateTimeLocalValue(ceremonyDateInput)),
    [ceremonyDateInput],
  );

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

  return (
    <div className="min-h-screen bg-paper-white text-midnight-navy">
      <header className="border-b border-heritage-gold/20 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-heritage-gold">
              Admin
            </p>
            <h1 className="font-serif text-2xl font-bold">Quan ly thong tin thiep</h1>
          </div>
          <a
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-heritage-gold/30 px-4 py-2 text-xs font-bold uppercase tracking-wider text-heritage-gold hover:bg-gold-light/30"
          >
            Xem thiep <ExternalLink size={14} />
          </a>
        </div>
      </header>

      <main className="mx-auto grid max-w-5xl gap-6 px-5 py-6 lg:grid-cols-[1.35fr_0.85fr]">
        <section className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold">Du lieu can nhap</h2>
              <p className="text-sm text-stone-500">
                Chi can dien cac thong tin thay doi. Noi dung con lai se dung du lieu co san.
              </p>
            </div>
            <button
              onClick={saveInvitation}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-midnight-navy px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-black disabled:opacity-60"
            >
              <Save size={15} /> Luu thay doi
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Ten nguoi nhan"
              value={invitation.defaultGuestName}
              onChange={(value) => updateInvitationField("defaultGuestName", value)}
              placeholder="Vi du: Anh Minh, Chi Lan, Ban & Nguoi Than"
            />
            <Field
              label="Ten chu nhan"
              value={invitation.graduateName}
              onChange={(value) => updateInvitationField("graduateName", value)}
              placeholder="Vi du: Pham Thi Khanh Ly"
            />
            <Field
              label="Thoi gian su kien"
              type="datetime-local"
              value={ceremonyDateInput}
              onChange={setCeremonyDateInput}
              helpText="Chon ngay va gio tren lich. Khi luu, he thong tu chuyen sang gio Viet Nam (+07:00) de countdown dem chinh xac."
            />
            <Field
              label="Dia diem"
              value={invitation.venueName}
              onChange={(value) => updateInvitationField("venueName", value)}
              placeholder="Vi du: San truong Dai hoc Kinh te Da Nang"
            />
            <Field
              label="Dia chi"
              value={invitation.venueAddress}
              onChange={(value) => updateInvitationField("venueAddress", value)}
              placeholder="Vi du: 71 Ngu Hanh Son, Da Nang"
            />
            <Field
              label="Link hoac tu khoa Google Map"
              value={invitation.googleMapsQuery}
              onChange={(value) => updateInvitationField("googleMapsQuery", value)}
              placeholder="Vi du: https://maps.app.goo.gl/... hoac ten dia diem"
            />
          </div>

          <div className="mt-5 rounded-lg bg-gold-light/25 p-4 text-sm text-stone-600">
            <p className="font-bold text-heritage-gold">Xem truoc thoi gian hien thi</p>
            <p className="mt-1">
              Ngay: {timePreview.ceremonyDateLabel || "Chua doc duoc thoi gian"}
            </p>
            <p>Gio: {timePreview.ceremonyTimeLabel || "Chua doc duoc thoi gian"}</p>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-xl font-bold">Bao mat admin</h2>
            <p className="mt-1 text-sm text-stone-500">
              Neu server co ADMIN_TOKEN, nhap token vao day de duoc phep luu.
            </p>
            <input
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              placeholder="ADMIN_TOKEN"
              className={`${fieldClass} mt-3`}
              type="password"
            />
          </div>

          <div className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-xl font-bold">Google Maps</h2>
            <p className="mt-1 text-sm text-stone-500">
              Nut chi duong se dung link hoac tu khoa ban nhap o form.
            </p>
            <a
              href={mapPreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-heritage-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white"
            >
              Test chi duong <ExternalLink size={15} />
            </a>
          </div>

          <div className="rounded-lg border border-heritage-gold/20 bg-white p-5 shadow-sm">
            <h2 className="font-serif text-xl font-bold">Trang thai</h2>
            <p className="mt-2 text-sm text-stone-600">{status}</p>
          </div>
        </aside>
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
}

function Field({ label, value, onChange, placeholder, helpText, type = "text" }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-heritage-gold">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={fieldClass}
      />
      {helpText && <span className="mt-1 block text-xs text-stone-500">{helpText}</span>}
    </label>
  );
}
