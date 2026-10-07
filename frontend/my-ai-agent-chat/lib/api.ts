const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://agent-to.darkube.ir/api/v1";

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    cache: "no-store",
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.msg ||
        "خطا در ارتباط با سرور"
    );
  }

  return data;
}