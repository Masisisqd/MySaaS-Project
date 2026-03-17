"use client";

import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export function RegistrationModal({
    isOpen,
    onClose,
    userId,
    familyId,
}: {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
    familyId: string;
}) {
    const [companyName, setCompanyName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const sigCanvas = useRef<SignatureCanvas>(null);

    const handleRegister = async () => {
        if (!companyName.trim()) {
            toast.error("Please enter a company name.");
            return;
        }

        if (sigCanvas.current?.isEmpty()) {
            toast.error("Please sign the agreement.");
            return;
        }

        const signatureBase64 = sigCanvas.current
            ?.getTrimmedCanvas()
            .toDataURL("image/png");

        setIsSubmitting(true);
        try {
            // Create the company in Firestore
            await addDoc(collection(db, "companies"), {
                name: companyName,
                ceoId: userId,
                familyId: familyId,
                creditScore: 750, // Starting score
                totalRevenue: 0,
                spendingBalance: 0,
                savingsBalance: 0,
                reinvestBalance: 0,
                overheadCost: 0,
                termsAcceptedAt: new Date(),
                signatureBase64,
            });

            toast.success("Business Registered Successfully!");
            onClose();
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to register business: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-zinc-950 text-zinc-50 border-zinc-800">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold tracking-tight text-emerald-400">
                        Micro-Enterprise Operating Agreement
                    </DialogTitle>
                    <DialogDescription className="text-zinc-400">
                        Between the Parental Board of Directors and the Service Provider
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="companyName" className="text-zinc-300">
                            Company Name (e.g. SwiftScrub Solutions)
                        </Label>
                        <Input
                            id="companyName"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="bg-zinc-900 border-zinc-800 text-zinc-100"
                            placeholder="Enter your registered business name"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <Label className="text-zinc-300">Terms of Service</Label>
                        <ScrollArea className="h-48 border border-zinc-800 rounded-md bg-zinc-900 p-4 text-sm text-zinc-400 leading-relaxed shadow-inner">
                            <h4 className="font-semibold text-zinc-200 mb-2">
                                1. The Right to Operate (The Academic License)
                            </h4>
                            <p className="mb-4">
                                The Service Provider acknowledges that their license to operate a
                                business is contingent upon Academic Compliance. All "Research &
                                Development" (Schoolwork/Homework) must be completed and logged
                                daily.
                            </p>

                            <h4 className="font-semibold text-zinc-200 mb-2">
                                2. Service Level Agreements (SLA)
                            </h4>
                            <p className="mb-4">
                                Services must be completed within the window specified in the
                                Contract. Payment is only released upon visual inspection and
                                approval by the Customer (Parent). Plagiarized or substandard
                                work requires $0.00 Re-Work.
                            </p>

                            <h4 className="font-semibold text-zinc-200 mb-2">
                                3. Fiscal Responsibility (Taxes & Savings)
                            </h4>
                            <p className="mb-4">
                                By signing this, the CEO agrees to the Automatic Revenue Split:
                                20% Household Tax, 30% Long-Term Capital, 10% Business Growth.
                            </p>
                        </ScrollArea>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-zinc-300">Digital Signature (CEO)</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => sigCanvas.current?.clear()}
                                className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-300"
                            >
                                Clear
                            </Button>
                        </div>
                        <div className="border border-zinc-800 rounded-md bg-zinc-900 shadow-inner overflow-hidden">
                            <SignatureCanvas
                                ref={sigCanvas}
                                penColor="#34d399" // emerald-400
                                canvasProps={{
                                    className: "w-full h-32 cursor-crosshair",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRegister}
                        disabled={isSubmitting}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white"
                    >
                        {isSubmitting ? "Signing..." : "I Accept & Incorporate"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
