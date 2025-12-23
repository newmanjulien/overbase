import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Overbase",
  description: "Easiest Customer Success data",
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
