"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PinPad } from "@/components/PinPad";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";

export default function ChildRegistrationPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        familyId: "",
        familySecretPin: "",
        childName: "",
    });

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.familyId || !formData.familySecretPin || !formData.childName) {
            toast.error("Please fill all fields.");
            return;
        }
        setStep(2);
    };

    const handlePinSubmit = async (pin: string) => {
        try {
            setLoading(true);
            const functions = getFunctions(getApp());
            const registerChildFn = httpsCallable(functions, "registerChildFn");

            await registerChildFn({
                familyId: formData.familyId.toLowerCase(),
                familySecretPin: formData.familySecretPin,
                childName: formData.childName,
                childPin: pin,
            });

            toast.success("CEO Profile Created!");
            // We do not auto login here. The user must use the Switcher.
            router.push("/switcher");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to register CEO.");
            setStep(1); // Bring back to step 1 to fix credentials
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center items-center p-4">
            <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 text-zinc-50 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold tracking-tight">CEO Registration</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Create a new company under your family's Holding Corp.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {step === 1 ? (
                        <form onSubmit={handleNextStep} className="flex flex-col gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="familyId" className="text-zinc-300">Family ID</Label>
                                <Input
                                    id="familyId"
                                    placeholder="e.g. smithcraft"
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                    value={formData.familyId}
                                    onChange={(e) => setFormData({ ...formData, familyId: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="familySecretPin" className="text-zinc-300">Family Master PIN</Label>
                                <Input
                                    id="familySecretPin"
                                    type="password"
                                    placeholder="Ask the Board (parents) for this authorization PIN"
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                    value={formData.familySecretPin}
                                    onChange={(e) => setFormData({ ...formData, familySecretPin: e.target.value })}
                                />
                            </div>

                            <div className="h-px bg-zinc-800 my-2" />

                            <div className="space-y-2">
                                <Label htmlFor="childName" className="text-zinc-300">Your First Name</Label>
                                <Input
                                    id="childName"
                                    placeholder="e.g. Alex"
                                    className="bg-zinc-950 border-zinc-700 text-white"
                                    value={formData.childName}
                                    onChange={(e) => setFormData({ ...formData, childName: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white"
                            >
                                Continue to Secure PIN
                            </Button>
                        </form>
                    ) : (
                        <div className="flex flex-col items-center gap-6">
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-zinc-200">Set your Secret PIN</h3>
                                <p className="text-sm text-zinc-400">This 4-digit number will log you into your company.</p>
                            </div>

                            <PinPad onPinSubmit={handlePinSubmit} loading={loading} />

                            <Button
                                variant="ghost"
                                className="text-zinc-400 hover:text-white"
                                onClick={() => setStep(1)}
                                disabled={loading}
                            >
                                Back
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
