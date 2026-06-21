import "dotenv/config";
import express from "express";
import path from "node:path";
import {
  createSlug,
  readDatabase,
  writeDatabase,
  type GuestRecord,
  type InvitationConfig,
} from "./storage";

const app = express();
const port = Number(process.env.PORT || 3001);
const adminToken = process.env.ADMIN_TOKEN || "";

app.use(express.json());

function requireAdmin(
  request: express.Request,
  response: express.Response,
  next: express.NextFunction,
) {
  if (!adminToken) {
    next();
    return;
  }

  const token = request.header("x-admin-token");
  if (token !== adminToken) {
    response.status(401).json({ error: "Invalid admin token" });
    return;
  }

  next();
}

app.get("/api/health", (_request, response) => {
  response.json({ ok: true });
});

app.get("/api/invitation", async (_request, response, next) => {
  try {
    const database = await readDatabase();
    response.json(database.invitation);
  } catch (error) {
    next(error);
  }
});

app.patch("/api/invitation", requireAdmin, async (request, response, next) => {
  try {
    const database = await readDatabase();
    const updates = request.body as Partial<InvitationConfig>;
    database.invitation = { ...database.invitation, ...updates };
    await writeDatabase(database);
    response.json(database.invitation);
  } catch (error) {
    next(error);
  }
});

app.get("/api/guests/:id", async (request, response, next) => {
  try {
    const database = await readDatabase();
    const guest = database.guests.find((item) => item.id === request.params.id);

    if (!guest) {
      response.status(404).json({ error: "Guest not found" });
      return;
    }

    response.json(guest);
  } catch (error) {
    next(error);
  }
});

app.get("/api/guests", requireAdmin, async (_request, response, next) => {
  try {
    const database = await readDatabase();
    response.json(database.guests);
  } catch (error) {
    next(error);
  }
});

app.post("/api/guests", requireAdmin, async (request, response, next) => {
  try {
    const { name, relationship = "", id } = request.body as Partial<GuestRecord>;

    if (!name?.trim()) {
      response.status(400).json({ error: "Guest name is required" });
      return;
    }

    const database = await readDatabase();
    const baseId = id?.trim() || createSlug(name);
    let nextId = baseId;
    let suffix = 2;

    while (database.guests.some((guest) => guest.id === nextId)) {
      nextId = `${baseId}-${suffix}`;
      suffix += 1;
    }

    const guest: GuestRecord = {
      id: nextId,
      name: name.trim(),
      relationship: relationship.trim(),
    };

    database.guests.push(guest);
    await writeDatabase(database);
    response.status(201).json(guest);
  } catch (error) {
    next(error);
  }
});

app.put("/api/guests/:id", requireAdmin, async (request, response, next) => {
  try {
    const { name, relationship = "" } = request.body as Partial<GuestRecord>;

    if (!name?.trim()) {
      response.status(400).json({ error: "Guest name is required" });
      return;
    }

    const database = await readDatabase();
    const guest = database.guests.find((item) => item.id === request.params.id);

    if (!guest) {
      response.status(404).json({ error: "Guest not found" });
      return;
    }

    guest.name = name.trim();
    guest.relationship = relationship.trim();
    await writeDatabase(database);
    response.json(guest);
  } catch (error) {
    next(error);
  }
});

app.delete("/api/guests/:id", requireAdmin, async (request, response, next) => {
  try {
    const database = await readDatabase();
    const nextGuests = database.guests.filter((guest) => guest.id !== request.params.id);

    if (nextGuests.length === database.guests.length) {
      response.status(404).json({ error: "Guest not found" });
      return;
    }

    database.guests = nextGuests;
    await writeDatabase(database);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
});

const distPath = path.resolve(process.cwd(), "dist");

app.use(express.static(distPath));
app.get("*", (_request, response) => {
  response.sendFile(path.join(distPath, "index.html"));
});

app.use(
  (
    error: unknown,
    _request: express.Request,
    response: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    response.status(500).json({ error: "Internal server error" });
  },
);

app.listen(port, () => {
  console.log(`API server running at http://localhost:${port}`);
});
