import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";                 // ← novo import
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Exam-Manager",
  description: "Gerencie turmas, gabaritos e redações",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* cabeçalho de navegação simples */}
        <header className="flex gap-4 p-4 border-b">
          <Link href="/classes" className="hover:underline">
            Turmas
          </Link>
          <Link href="/answer-keys" className="hover:underline">
            Gabaritos
          </Link>
        </header>

        {children}
      </body>
    </html>
  );
}
