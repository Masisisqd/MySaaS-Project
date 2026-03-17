"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase/config";
import { Contract, ChoreStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function ProofOfWorkUpload({ userId, familyId }: { userId: string; familyId: string }) {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);

    const fetchInProgressContracts = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "contracts"),
                where("familyId", "==", familyId),
                where("assigneeId", "==", userId),
                where("status", "==", ChoreStatus.IN_PROGRESS)
            );
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Contract));
            setContracts(fetched);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load active contracts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInProgressContracts();
    }, [userId, familyId]);

    const handleSubmitQA = async (contractId: string) => {
        if (!file) {
            toast.error("Please select an image file as proof of work.");
            return;
        }

        setUploadingId(contractId);
        try {
            // 1. Upload to Firebase Storage
            const storageRef = ref(storage, `proofs/${familyId}/${contractId}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            // 2. Update Contract in Firestore
            const contractRef = doc(db, "contracts", contractId);
            await updateDoc(contractRef, {
                status: ChoreStatus.PENDING_QA,
                proofImageUrl: downloadUrl,
                updatedAt: new Date()
            });

            toast.success("Proof submitted! Awaiting Board QA.");
            setContracts(contracts.filter(c => c.id !== contractId));
            setFile(null);
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to submit proof: " + error.message);
        } finally {
            setUploadingId(null);
        }
    };

    return (
        <Card className="w-full max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl text-emerald-400 font-bold tracking-tight">
                    Active Contracts (Pending Submission)
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Upload photo evidence of your completed work to invoice the Customer.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-zinc-500 animate-pulse">Loading active contracts...</div>
                ) : contracts.length === 0 ? (
                    <div className="text-sm text-zinc-500 italic p-4 text-center border border-zinc-800 rounded-md bg-zinc-900/50">
                        You have no active contracts. Go back to the Job Board to bid!
                    </div>
                ) : (
                    <div className="space-y-4">
                        {contracts.map(contract => (
                            <div key={contract.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-md flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-zinc-100 text-lg">{contract.title}</h4>
                                        <p className="text-sm text-zinc-400 mt-1">Reward: <span className="text-emerald-400 font-bold">${contract.baseValue.toFixed(2)}</span></p>
                                    </div>
                                </div>
                                <div className="mt-2 space-y-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                        className="bg-zinc-950 border-zinc-700 text-zinc-300 file:text-zinc-100 file:bg-zinc-800 file:border-0"
                                    />
                                    <Button
                                        disabled={uploadingId === contract.id || !file}
                                        onClick={() => handleSubmitQA(contract.id)}
                                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                                    >
                                        {uploadingId === contract.id ? "Uploading & Submitting..." : "Submit for QA"}
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
