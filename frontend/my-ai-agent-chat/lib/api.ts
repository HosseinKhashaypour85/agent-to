const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://agent-to.darkube.ir/api/v1";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? window.sessionStorage.getItem("agentto_token")
      : null;

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("agentto:unauthorized"));
    }

    throw new Error(
      data?.message ||
        data?.msg ||
        (response.status === 401
          ? "نشست شما منقضی شده؛ دوباره وارد شوید."
          : "خطا در ارتباط با سرور")
    );
  }

  return data;
}

export function clearCustomerSession() {
  if (typeof window !== "undefined") {
    window.sessionStorage.removeItem("agentto_token");
    window.sessionStorage.removeItem("agentto_user");
  }
}
