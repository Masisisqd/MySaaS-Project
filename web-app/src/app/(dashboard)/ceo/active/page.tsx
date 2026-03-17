"use client";

import { useDemoData } from "@/lib/demo/DemoContext";
import { ChoreStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

function JuniorActiveJobs() {
    const { currentUser, contracts, setContracts } = useDemoData();
    const myActive = contracts.filter(c => c.assigneeId === currentUser.id && c.status === ChoreStatus.IN_PROGRESS);

    const submit = (id: string) => {
        setContracts(contracts.map(c =>
            c.id === id
                ? { ...c, status: ChoreStatus.PENDING_QA, proofImageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop", updatedAt: new Date() }
                : c
        ));
        toast.success("Great job! Mom or Dad will check your work! 🌟");
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-amber-900">🎯 My Tasks</h2>
                <p className="text-amber-700 mt-1">Finish your chores and tell Mom & Dad!</p>
            </div>

            {myActive.length === 0 ? (
                <Card className="border-2 border-amber-300" style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>
                    <CardContent className="p-8 text-center text-amber-800 font-bold text-lg">
                        No tasks right now! Go to the Chore Store to find one! 🛒
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {myActive.map(c => (
                        <Card key={c.id} className="border-2 border-blue-300" style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>
                            <CardContent className="p-5">
                                <h4 className="font-extrabold text-blue-900 text-xl mb-1">{c.title}</h4>
                                <p className="text-sm text-blue-700 mb-4">{c.description}</p>
                                <div className="text-right text-blue-800 font-bold mb-3">You&apos;ll earn: ${c.baseValue.toFixed(2)} 💰</div>
                                <Button onClick={() => submit(c.id)} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg py-6 rounded-xl font-bold">
                                    ✅ I&apos;m Done!
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProActiveJobs() {
    const { currentUser, contracts, setContracts } = useDemoData();
    const myActive = contracts.filter(c => c.assigneeId === currentUser.id && c.status === ChoreStatus.IN_PROGRESS);

    const submit = (id: string) => {
        setContracts(contracts.map(c =>
            c.id === id
                ? { ...c, status: ChoreStatus.PENDING_QA, proofImageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop", updatedAt: new Date() }
                : c
        ));
        toast.success("Proof submitted! Awaiting Board QA.");
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">Active Contracts</h2>
                <p className="text-zinc-400 mt-1">Submit proof-of-work for your active jobs.</p>
            </div>
            {myActive.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-8 text-center text-zinc-500 italic">No active contracts. Visit the Marketplace to bid!</CardContent></Card>
            ) : (
                <div className="space-y-4">
                    {myActive.map(c => (
                        <Card key={c.id} className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-semibold text-zinc-100 text-lg">{c.title}</h4>
                                        <p className="text-sm text-zinc-400 mt-1">{c.description}</p>
                                    </div>
                                    <span className="text-emerald-400 font-bold">${c.baseValue.toFixed(2)}</span>
                                </div>
                                <Button onClick={() => submit(c.id)} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">📸 Submit Proof for QA</Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ActiveJobsPage() {
    const { isJunior } = useDemoData();
    return isJunior ? <JuniorActiveJobs /> : <ProActiveJobs />;
}
