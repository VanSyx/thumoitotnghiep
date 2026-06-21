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

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;

    try {
      const body = await response.json();
      if (body?.error) {
        message = `${message} - ${body.error}`;
      }
    } catch {
      // Response body is optional.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export function getInvitationConfig() {
  return fetchJson<InvitationConfig>("/api/invitation");
}

function adminHeaders(adminToken: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (adminToken) {
    headers["x-admin-token"] = adminToken;
  }

  return headers;
}

export function updateInvitationConfig(
  config: InvitationConfig,
  adminToken: string,
) {
  return fetchJson<InvitationConfig>("/api/invitation", {
    method: "PATCH",
    headers: adminHeaders(adminToken),
    body: JSON.stringify(config),
  });
}

export function getGuest(id: string) {
  return fetchJson<GuestRecord>(`/api/guests/${encodeURIComponent(id)}`);
}

export function listGuests(adminToken: string) {
  return fetchJson<GuestRecord[]>("/api/guests", {
    headers: adminHeaders(adminToken),
  });
}

export function createGuest(
  guest: Pick<GuestRecord, "name" | "relationship"> & Partial<Pick<GuestRecord, "id">>,
  adminToken: string,
) {
  return fetchJson<GuestRecord>("/api/guests", {
    method: "POST",
    headers: adminHeaders(adminToken),
    body: JSON.stringify(guest),
  });
}

export function updateGuest(
  id: string,
  guest: Pick<GuestRecord, "name" | "relationship">,
  adminToken: string,
) {
  return fetchJson<GuestRecord>(`/api/guests/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: adminHeaders(adminToken),
    body: JSON.stringify(guest),
  });
}

export async function deleteGuest(id: string, adminToken: string) {
  const response = await fetch(`/api/guests/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: adminHeaders(adminToken),
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
}

export function buildGoogleMapsDirectionsUrl(config: InvitationConfig) {
  const mapInput = config.googleMapsQuery.trim();

  if (/^https?:\/\/.+/i.test(mapInput)) {
    return mapInput;
  }

  const params = new URLSearchParams({
    api: "1",
    destination: mapInput || `${config.venueName}, ${config.venueAddress}`,
  });

  if (config.googleMapsPlaceId) {
    params.set("destination_place_id", config.googleMapsPlaceId);
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
