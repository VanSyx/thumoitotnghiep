import { promises as fs } from "node:fs";
import path from "node:path";

export interface InvitationConfig {
  graduateName: string;
  title: string;
  subtitle: string;
  defaultGuestName: string;
  message: string;
  ceremonyDate: string;
  ceremonyDateLabel: string;
  ceremonyTimeLabel: string;
  venueName: string;
  venueAddress: string;
  googleMapsQuery: string;
  googleMapsPlaceId: string;
  major: string;
  portraitUrl: string;
}

export interface GuestRecord {
  id: string;
  name: string;
  relationship: string;
}

export interface AppDatabase {
  invitation: InvitationConfig;
  guests: GuestRecord[];
}

const dbPath = process.env.DATA_FILE
  ? path.resolve(process.env.DATA_FILE)
  : path.resolve(process.cwd(), "server", "data", "db.json");

export async function readDatabase(): Promise<AppDatabase> {
  const file = await fs.readFile(dbPath, "utf8");
  return JSON.parse(file) as AppDatabase;
}

export async function writeDatabase(database: AppDatabase) {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });
  await fs.writeFile(dbPath, `${JSON.stringify(database, null, 2)}\n`, "utf8");
}

export function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}
