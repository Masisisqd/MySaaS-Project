"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center p-8">
      <div className="max-w-3xl w-full flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="w-48 h-48 mb-2">
          <Image src="/assets/logo.png" alt="Prodigy Chore Suite" width={192} height={192} className="w-full h-full object-contain" priority />
        </div>
        <p className="text-xl text-zinc-400 max-w-2xl leading-relaxed">
          The <span className="text-zinc-200 font-semibold">Life ERP</span> for the next generation.
          Turn household chores into a structured business — complete with tool rentals,
          taxes, credit scores, and quarterly earnings reports.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/board">
            <Button
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8"
            >
              Enter as Board (Parent)
            </Button>
          </Link>
          <Link href="/ceo">
            <Button
              size="lg"
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-8"
            >
              Enter as CEO (Child)
            </Button>
          </Link>
        </div>

        <p className="text-xs text-zinc-600 mt-6">Demo Mode — No Firebase credentials needed</p>
      </div>
    </main>
  );
}
