import type { Metadata } from "next";
import { Geist, Geist_Mono, Bubblegum_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bubbleGum = Bubblegum_Sans({
  variable: "--font-bubblegum",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prodigy Chore Suite — Life ERP for Kids",
  description: "Turn household chores into a structured business. Teach entrepreneurship, discipline, and financial literacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${bubbleGum.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
