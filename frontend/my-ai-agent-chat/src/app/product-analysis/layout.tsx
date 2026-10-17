import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "تحلیل محصولات" };

export default function RouteLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
