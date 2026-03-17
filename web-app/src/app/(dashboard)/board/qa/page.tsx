"use client";

import { useDemoData } from "@/lib/demo/DemoContext";
import { ChoreStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PayStub } from "@/components/PayStub";
import { toast } from "sonner";
import { useState } from "react";

export default function QAPage() {
    const { contracts, setContracts } = useDemoData();
    const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
    const [payStubData, setPayStubData] = useState<any>(null);

    const pendingQA = contracts.filter(c => c.status === ChoreStatus.PENDING_QA);

    const settle = (contractId: string, approved: boolean) => {
        const contract = contracts.find(c => c.id === contractId);
        if (!contract) return;

        if (approved) {
            const gross = contract.baseValue;
            const tax = gross * 0.20;
            const savings = gross * 0.30;
            const reinvest = gross * 0.10;
            const tools = 0.50;
            const net = gross - (tax + savings + reinvest + tools);

            setPayStubData({ grossRevenue: gross, taxAmount: tax, savingsAmount: savings, reinvestAmount: reinvest, toolRentalFees: tools, netProfit: net });
            toast.success("Service Approved & Settled.");
        } else {
            toast.error("Rejected. Sent back for Re-Work.");
        }

        setContracts(contracts.map(c =>
            c.id === contractId
                ? { ...c, status: approved ? ChoreStatus.SETTLED : ChoreStatus.IN_PROGRESS, qaFeedback: feedbackMap[contractId] || "" }
                : c
        ));
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">QA & Dispute Center</h2>
                <p className="text-zinc-400 mt-1">Review proof-of-work photos. Approve to pay or reject for re-work.</p>
            </div>

            {payStubData && (
                <div className="flex justify-center">
                    <PayStub {...payStubData} onClose={() => setPayStubData(null)} />
                </div>
            )}

            {pendingQA.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-8 text-center text-zinc-500 italic">Inbox zero! No contracts pending QA.</CardContent></Card>
            ) : (
                <div className="space-y-6">
                    {pendingQA.map(contract => (
                        <Card key={contract.id} className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-5 flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3">
                                    {contract.proofImageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={contract.proofImageUrl} alt="Proof" className="w-full aspect-square object-cover rounded-md border border-zinc-700" />
                                    ) : (
                                        <div className="w-full aspect-square bg-zinc-800 rounded-md flex items-center justify-center text-zinc-500 text-sm">No Image</div>
                                    )}
                                </div>
                                <div className="w-full md:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-semibold text-zinc-100 text-lg mb-1">{contract.title}</h4>
                                        <div className="text-sm text-zinc-400 flex gap-4 mb-3">
                                            <span>CEO: <span className="text-zinc-300">{contract.assigneeId}</span></span>
                                            <span>Value: <span className="text-emerald-400 font-bold">${contract.baseValue.toFixed(2)}</span></span>
                                        </div>
                                        <Textarea
                                            placeholder="Feedback..."
                                            value={feedbackMap[contract.id] || ""}
                                            onChange={e => setFeedbackMap({ ...feedbackMap, [contract.id]: e.target.value })}
                                            className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 mb-4"
                                        />
                                    </div>
                                    <div className="flex gap-3 justify-end">
                                        <Button variant="destructive" onClick={() => settle(contract.id, false)} className="bg-rose-600 hover:bg-rose-500">Reject</Button>
                                        <Button onClick={() => settle(contract.id, true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">Approve & Pay</Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
