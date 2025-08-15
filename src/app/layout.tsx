import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Fruit Packing Planner",
  description: "Planning and scheduling for fruit packing lines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}>
        <Providers>
          <header className="border-b border-black/10 dark:border-white/10">
            <nav className="max-w-6xl mx-auto flex items-center justify-between px-4 h-14">
              <Link href="/" className="font-semibold">Fruit Planner</Link>
              <div className="flex gap-4 text-sm">
                <Link href="/planning" className="hover:underline">Planning</Link>
                <Link href="/admin" className="hover:underline">Admin</Link>
              </div>
            </nav>
          </header>
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
