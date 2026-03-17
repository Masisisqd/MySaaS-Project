"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Contract, ChoreStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useMarketplaceLock } from "@/hooks/useMarketplaceLock";
import { useDemoData } from "@/lib/demo/DemoContext";
import { formatCurrency } from "@/lib/currency";

export function JobBoard({ userId, familyId }: { userId: string; familyId: string }) {
    const { family } = useDemoData();
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const { isLocked, loading: lockLoading } = useMarketplaceLock(userId, familyId);

    const fetchAvailableContracts = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "contracts"),
                where("familyId", "==", familyId),
                where("status", "==", ChoreStatus.AVAILABLE)
            );
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contract));
            setContracts(fetched);
        } catch (error) {
            console.error("Error fetching contracts:", error);
            toast.error("Failed to load Job Board");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAvailableContracts();
    }, [familyId]);

    const handleAcceptContract = async (contractId: string) => {
        if (isLocked) {
            toast.error("Marketplace is locked. Complete your R&D first!");
            return;
        }

        try {
            const contractRef = doc(db, "contracts", contractId);
            await updateDoc(contractRef, {
                status: ChoreStatus.IN_PROGRESS,
                assigneeId: userId, // Assuming CEO userId maps to their company
                updatedAt: new Date()
            });
            toast.success("Contract Accepted! Get to work.");
            setContracts(contracts.filter(c => c.id !== contractId));
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to accept contract: " + error.message);
        }
    };

    if (lockLoading || loading) {
        return <div className="text-zinc-500 animate-pulse">Loading Marketplace...</div>;
    }

    return (
        <Card className="w-full max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl text-emerald-400 font-bold tracking-tight">
                    Marketplace: Open RFPs
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    {isLocked
                        ? "🔒 The marketplace is currently locked pending Academic Verification."
                        : "🟢 Marketplace is open. Bid on available Service Contracts."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {contracts.length === 0 ? (
                    <div className="text-sm text-zinc-500 italic p-4 text-center border border-zinc-800 rounded-md bg-zinc-900/50">
                        No active contracts available right now. Check back later!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contracts.map(contract => (
                            <div key={contract.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-md flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-zinc-100 text-lg">{contract.title}</h4>
                                        <p className="text-sm text-zinc-400 mt-1">{contract.description}</p>
                                    </div>
                                    <div className="text-xl font-bold text-emerald-400">
                                        {formatCurrency(contract.baseValue, family.locale, family.currencyCode)}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-2">
                                    <Button
                                        disabled={isLocked}
                                        onClick={() => handleAcceptContract(contract.id)}
                                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                    >
                                        Accept Contract
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
