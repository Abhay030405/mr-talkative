export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3030";

// Thrown when the server returns a 422 with per-field Pydantic errors.
export class ValidationError extends Error {
  readonly fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>) {
    super("Validation failed");
    this.fieldErrors = fieldErrors;
  }
}

function parseErrorDetail(detail: unknown, fallback: string): never {
  if (Array.isArray(detail)) {
    const fieldErrors: Record<string, string> = {};
    for (const e of detail as Array<{ loc: (string | number)[]; msg: string }>) {
      const field = String(e.loc[e.loc.length - 1]);
      // Strip "Value error, " prefix Pydantic v2 sometimes prepends
      fieldErrors[field] = e.msg.replace(/^Value error,\s*/i, "");
    }
    throw new ValidationError(fieldErrors);
  }
  throw new Error(typeof detail === "string" ? detail : fallback);
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    parseErrorDetail(err.detail, "Login failed");
  }
  return res.json();
}

export async function signupUser(
  fullName: string,
  email: string,
  password: string,
  branch: string,
  semester: number,
  regNumber: string
) {
  const res = await fetch(`${API_URL}/api/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ full_name: fullName, email, password, branch, semester, reg_number: regNumber }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    parseErrorDetail(err.detail, "Sign up failed");
  }
  return res.json();
}

export async function authFetch(
  url: string,
  options: RequestInit = {},
  token: string
): Promise<Response> {
  const headers = new Headers(options.headers as HeadersInit);
  headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.headers as Record<string, string>)?.["Content-Type"]) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...options, headers });
}

export async function getDocuments(
  branch?: string,
  semester?: number,
  skip = 0,
  limit = 100
) {
  const params = new URLSearchParams();
  if (branch) params.set("branch", branch);
  if (semester !== undefined) params.set("semester", String(semester));
  params.set("skip", String(skip));
  params.set("limit", String(limit));
  const res = await fetch(`${API_URL}/api/upload/?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    parseErrorDetail(err.detail, "Failed to fetch documents");
  }
  return res.json();
}

export async function getLatestUploads(limit = 20) {
  return getDocuments(undefined, undefined, 0, limit);
}

export async function sendDemoChatMessage(query: string, conversationId?: string) {
  const res = await fetch(`${API_URL}/api/demo/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, conversation_id: conversationId ?? null }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    parseErrorDetail(err.detail, "Demo chat request failed");
  }
  return res.json();
}

export async function sendChatMessage(
  query: string,
  branch: string,
  semester: number,
  subject: string,
  token: string
) {
  const res = await authFetch(
    `${API_URL}/api/chat/query`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, branch, semester, subject, include_sources: true }),
    },
    token
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    parseErrorDetail(err.detail, "Chat request failed");
  }
  return res.json();
}
