export type TicketStatus = "OPEN" | "IN_PROGRESS" | "WAITING_CUSTOMER" | "ANSWERED" | "CLOSED";
export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type TicketMessage = { id: string; ticketId: string; senderUserId: string; senderType: "CUSTOMER" | "SUPPORT"; message: string; createdAt: string };
export type Ticket = { id: string; tenantId: string; createdByUserId: string; subject: string; category: string; priority: TicketPriority; status: TicketStatus; lastMessageAt: string; createdAt: string; messages?: TicketMessage[] };

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://agent-to.darkube.ir/api/v1").replace(/\/$/, "");

function getToken() {
  if (typeof window === "undefined") return "";
  const sessionToken = window.sessionStorage.getItem("agentto_token");
  if (sessionToken) return sessionToken.replace(/^Bearer\\s+/i, "");
  for (const key of ["token", "accessToken", "authToken", "access_token", "jwt"]) {
    const value = window.localStorage.getItem(key);
    if (value) return value.replace(/^Bearer\\s+/i, "");
  }
  return "";
}

export async function supportRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success === false) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("agentto:unauthorized"));
    }
    throw new Error(data?.message || `Request failed (${response.status})`);
  }
  return data as T;
}

export const statusLabel: Record<TicketStatus, string> = {
  OPEN: "باز", IN_PROGRESS: "در حال بررسی", WAITING_CUSTOMER: "منتظر مشتری", ANSWERED: "پاسخ داده‌شده", CLOSED: "بسته‌شده",
};
export const priorityLabel: Record<TicketPriority, string> = {
  LOW: "کم", MEDIUM: "متوسط", HIGH: "زیاد", URGENT: "فوری",
};
export function formatDate(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}
