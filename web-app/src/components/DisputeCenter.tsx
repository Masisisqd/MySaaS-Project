"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Contract, ChoreStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function DisputeCenter({ familyId }: { familyId: string }) {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});

    const fetchPendingQA = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "contracts"),
                where("familyId", "==", familyId),
                where("status", "==", ChoreStatus.PENDING_QA)
            );
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contract));
            setContracts(fetched);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load Pending QA contracts.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingQA();
    }, [familyId]);

    const handleDecision = async (contract: Contract, isApproved: boolean) => {
        try {
            const contractRef = doc(db, "contracts", contract.id);

            if (isApproved) {
                // Approve & queue for Invoice Settlement (ACH)
                // Here we create an INVOICE document that our Phase 5 cloud function will settle
                // Or we just update the contract to SETTLED and directly call the function, but for now we mark it SETTLED
                // and create a pending invoice.

                // 1. Mark contract as SETTLED
                await updateDoc(contractRef, {
                    status: ChoreStatus.SETTLED,
                    qaFeedback: feedbackMap[contract.id] || "Great job!",
                    updatedAt: new Date()
                });

                // 2. Create the Invoice document for the ACH 
                // We will assume the company ID is the same as assigneeId for the sake of MVP
                await addDoc(collection(db, "invoices"), {
                    familyId,
                    companyId: contract.assigneeId,
                    ceoId: contract.assigneeId,
                    contractId: contract.id,
                    amount: contract.baseValue,
                    status: "DRAFT", // The cloud function will change this to PAID/SETTLED
                    createdAt: new Date()
                });

                toast.success("Service Approved. Invoice queued for payment.");
            } else {
                // Reject & send back for Re-Work
                await updateDoc(contractRef, {
                    status: ChoreStatus.IN_PROGRESS,
                    qaFeedback: feedbackMap[contract.id] || "Substandard work. Please fix and resubmit.",
                    updatedAt: new Date()
                });
                toast.error("Service Rejected. Sent back for Re-Work.");
            }

            setContracts(contracts.filter(c => c.id !== contract.id));
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to process QA decision: " + error.message);
        }
    };

    return (
        <Card className="w-full max-w-3xl bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl text-emerald-400 font-bold tracking-tight">
                    Dispute & QA Center
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Review "Proof of Work" photos submitted by CEOs. Approve to authorize payment or Reject to force Re-Work.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-zinc-500 animate-pulse">Loading submissions...</div>
                ) : contracts.length === 0 ? (
                    <div className="text-sm text-zinc-500 italic p-4 text-center border border-zinc-800 rounded-md bg-zinc-900/50">
                        Inbox zero! No contracts are currently pending QA.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {contracts.map(contract => (
                            <div key={contract.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-md flex flex-col md:flex-row gap-6">

                                {/* Image Preview */}
                                <div className="w-full md:w-1/3">
                                    {contract.proofImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={contract.proofImageUrl}
                                            alt="Proof of work"
                                            className="w-full h-auto aspect-square object-cover rounded-md border border-zinc-700 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-full aspect-square bg-zinc-800 rounded-md flex items-center justify-center text-zinc-500 text-sm">
                                            No Image Provided
                                        </div>
                                    )}
                                </div>

                                {/* Details & Actions */}
                                <div className="w-full md:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-semibold text-zinc-100 text-lg mb-1">{contract.title}</h4>
                                        <div className="text-sm text-zinc-400 flex gap-4 mb-4">
                                            <span>CEO ID: <span className="text-zinc-300">{contract.assigneeId}</span></span>
                                            <span>Value: <span className="text-emerald-400 font-bold">${contract.baseValue.toFixed(2)}</span></span>
                                        </div>

                                        <Textarea
                                            placeholder="Feedback (Rejection reason or praise)..."
                                            value={feedbackMap[contract.id] || ""}
                                            onChange={(e) => setFeedbackMap({ ...feedbackMap, [contract.id]: e.target.value })}
                                            className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 mb-4"
                                        />
                                    </div>

                                    <div className="flex gap-3 justify-end">
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleDecision(contract, false)}
                                            className="bg-rose-600 hover:bg-rose-500 text-white"
                                        >
                                            Reject (Re-Work)
                                        </Button>
                                        <Button
                                            onClick={() => handleDecision(contract, true)}
                                            className="bg-emerald-600 hover:bg-emerald-500 text-white"
                                        >
                                            Approve & Pay
                                        </Button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
