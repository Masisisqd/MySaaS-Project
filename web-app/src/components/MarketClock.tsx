"use client";

import { useEffect, useState } from "react";
import { getLocalTime, getBusinessDayStatus } from "@/lib/time-manager";
import { Clock } from "lucide-react";

export default function MarketClock({ timezone }: { timezone?: string }) {
    const activeZone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const [timeStr, setTimeStr] = useState<string>("");
    const [statusStr, setStatusStr] = useState<string>("");

    useEffect(() => {
        // Initial set
        const updateClock = () => {
            const now = getLocalTime(activeZone);
            setTimeStr(now.toFormat("hh:mm a z"));
            setStatusStr(getBusinessDayStatus(activeZone));
        };

        updateClock();
        const interval = setInterval(updateClock, 1000);
        return () => clearInterval(interval);
    }, [activeZone]);

    // Hydration mismatch prevention
    if (!timeStr) return null;

    return (
        <div className="flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5 text-zinc-100 font-mono text-sm bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700/50">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{timeStr}</span>
            </div>
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mt-1">
                {statusStr}
            </div>
        </div>
    );
}
