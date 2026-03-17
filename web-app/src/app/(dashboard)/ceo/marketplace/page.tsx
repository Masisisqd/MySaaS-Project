"use client";

import { useDemoData } from "@/lib/demo/DemoContext";
import { ChoreStatus, TaskStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

// ─── Junior Marketplace ────────────────────────────────────────────

function JuniorMarketplace() {
    const { currentUser, contracts, setContracts, academicLogs } = useDemoData();
    const isLocked = !academicLogs.some(l => l.userId === currentUser.id && l.status === TaskStatus.APPROVED);
    const available = contracts.filter(c => c.status === ChoreStatus.AVAILABLE);

    const accept = (id: string) => {
        if (isLocked) { toast.error("Do your Study Time first! 📚"); return; }
        setContracts(contracts.map(c => c.id === id ? { ...c, status: ChoreStatus.IN_PROGRESS, assigneeId: currentUser.id, updatedAt: new Date() } : c));
        toast.success("Yay! You got a new task! 🎉");
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-amber-900">🌟 Chore Store 🌟</h2>
                <p className="text-amber-700 mt-1">
                    {isLocked ? "🔒 Finish Study Time to shop for chores!" : "Pick a chore and earn money! 💪"}
                </p>
            </div>

            {available.length === 0 ? (
                <Card className="border-2 border-amber-300" style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>
                    <CardContent className="p-8 text-center text-amber-800 font-bold text-lg">
                        No chores right now! Check back later 🕐
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {available.map(c => (
                        <Card key={c.id} className="border-2 border-emerald-300 overflow-hidden" style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)" }}>
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-extrabold text-emerald-900 text-xl">{c.title}</h4>
                                        <p className="text-sm text-emerald-700 mt-1">{c.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-emerald-700 font-bold">You earn</div>
                                        <div className="text-2xl font-extrabold text-emerald-800">${c.baseValue.toFixed(2)}</div>
                                    </div>
                                </div>
                                <Button disabled={isLocked} onClick={() => accept(c.id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-lg py-6 rounded-xl font-bold disabled:opacity-40">
                                    {isLocked ? "🔒 Locked" : "🙋 I'll Do It!"}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Pro Marketplace (unchanged) ───────────────────────────────────

function ProMarketplace() {
    const { currentUser, contracts, setContracts, academicLogs } = useDemoData();
    const isLocked = !academicLogs.some(l => l.userId === currentUser.id && l.status === TaskStatus.APPROVED);
    const available = contracts.filter(c => c.status === ChoreStatus.AVAILABLE);

    const accept = (id: string) => {
        if (isLocked) { toast.error("Complete your R&D first!"); return; }
        setContracts(contracts.map(c => c.id === id ? { ...c, status: ChoreStatus.IN_PROGRESS, assigneeId: currentUser.id, updatedAt: new Date() } : c));
        toast.success("Contract accepted! Get to work.");
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">Marketplace</h2>
                <p className="text-zinc-400 mt-1">
                    {isLocked ? "🔒 Marketplace is locked. Complete and get your R&D verified first." : "🟢 Marketplace is open. Accept service contracts below."}
                </p>
            </div>
            {available.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-8 text-center text-zinc-500 italic">No contracts available.</CardContent></Card>
            ) : (
                <div className="space-y-4">
                    {available.map(c => (
                        <Card key={c.id} className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-semibold text-zinc-100 text-lg">{c.title}</h4>
                                        <p className="text-sm text-zinc-400 mt-1">{c.description}</p>
                                    </div>
                                    <div className="text-xl font-bold text-emerald-400">${c.baseValue.toFixed(2)}</div>
                                </div>
                                <div className="flex justify-end">
                                    <Button disabled={isLocked} onClick={() => accept(c.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40">Accept Contract</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function MarketplacePage() {
    const { isJunior } = useDemoData();
    return isJunior ? <JuniorMarketplace /> : <ProMarketplace />;
}
