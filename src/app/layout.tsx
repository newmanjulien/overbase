import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { SessionLogger } from "@/components/SessionLogger";

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
      <body>
        <AuthProvider>
          <SessionLogger />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
