import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGENT-TO CRM",
  description: "سیستم مدیریت ارتباط با مشتری و هوش تجاری",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2"
          rel="preload"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}