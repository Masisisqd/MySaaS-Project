"use client";

import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-zinc-400">
            <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-4" />
            <p className="text-lg animate-pulse">Loading the Command Center...</p>
        </div>
    );
}
