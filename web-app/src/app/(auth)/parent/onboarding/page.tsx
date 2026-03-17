"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/lib/firebase/config";

export default function ParentOnboardingPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        familyName: "",
        familyId: "",
        familySecretPin: "",
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error("You must be logged in first.");
            router.push("/parent/login");
            return;
        }

        if (!formData.familyName || !formData.familyId || !formData.familySecretPin) {
            toast.error("Please fill all fields.");
            return;
        }

        // basic slug validation for familyId
        if (!/^[a-z0-9-]+$/.test(formData.familyId)) {
            toast.error("Family ID must be alphanumeric and lowercase (e.g., 'smith-family')");
            return;
        }

        try {
            setLoading(true);
            const functions = getFunctions(getApp());
            const createFamilyFn = httpsCallable(functions, "createFamilyFn");

            await createFamilyFn(formData);

            toast.success("Family created successfully!");
            // Force token refresh to get claim
            await user.getIdToken(true);

            router.push("/board");
            // Since context listens to auth state, we can also just reload or router.push
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to create family.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex justify-center items-center p-4">
            <Card className="w-full max-w-lg bg-zinc-900 border-zinc-800 text-zinc-50 shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold tracking-tight">Setup the Holding Corp</CardTitle>
                    <CardDescription className="text-zinc-400">
                        Create your family workspace. This will serve as the parent entity for all your kids' companies.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div className="space-y-2">
                            <Label htmlFor="familyName" className="text-zinc-300">Family/Holding Name</Label>
                            <Input
                                id="familyName"
                                placeholder="e.g. The Smith Group"
                                className="bg-zinc-950 border-zinc-700 text-white"
                                value={formData.familyName}
                                onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="familyId" className="text-zinc-300">Unique Family ID</Label>
                            <Input
                                id="familyId"
                                placeholder="e.g. smithcraft"
                                className="bg-zinc-950 border-zinc-700 text-white"
                                value={formData.familyId}
                                onChange={(e) => setFormData({ ...formData, familyId: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                            />
                            <p className="text-xs text-zinc-500">Must be lowercase letters, numbers, and hyphens only.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="familySecretPin" className="text-zinc-300">Family Master PIN</Label>
                            <Input
                                id="familySecretPin"
                                type="password"
                                placeholder="A strong PIN phrase or code to authorize new kids"
                                className="bg-zinc-950 border-zinc-700 text-white"
                                value={formData.familySecretPin}
                                onChange={(e) => setFormData({ ...formData, familySecretPin: e.target.value })}
                            />
                        </div>

                        <Button
                            type="submit"
                            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white"
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Incorporate Family Hub"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
