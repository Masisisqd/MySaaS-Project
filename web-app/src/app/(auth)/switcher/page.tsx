"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { getFunctions, httpsCallable } from "firebase/functions";
import { getApp } from "firebase/app";
import { signInWithCustomToken } from "firebase/auth";
import { auth as firebaseAuth } from "@/lib/firebase/config";
import { PinPad } from "@/components/PinPad";
import { UserCircle2, Building2 } from "lucide-react";

interface Profile {
    id: string;
    name: string;
}

export default function SwitcherPage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();

    const [familyId, setFamilyId] = useState("");
    const [deviceLinked, setDeviceLinked] = useState(false);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [fetching, setFetching] = useState(false);

    // Auto-redirect if already logged in as CEO
    useEffect(() => {
        if (!loading && user && userData?.role === "CEO") {
            router.push("/ceo");
        }
    }, [user, userData, loading, router]);

    // Load familyId from localStorage on mount
    useEffect(() => {
        const savedFamilyId = localStorage.getItem("familyId");
        if (savedFamilyId) {
            setFamilyId(savedFamilyId);
            fetchProfiles(savedFamilyId);
        }
    }, []);

    const fetchProfiles = async (fId: string) => {
        try {
            setFetching(true);
            const functions = getFunctions(getApp());
            const getFamilyProfilesFn = httpsCallable(functions, "getFamilyProfilesFn");

            const result = await getFamilyProfilesFn({ familyId: fId }) as any;
            const { profiles } = result.data;

            if (profiles && profiles.length > 0) {
                setProfiles(profiles);
                setDeviceLinked(true);
                localStorage.setItem("familyId", fId);
            } else {
                toast.error("No subsidiary companies found for this Family ID.");
                setDeviceLinked(false);
                localStorage.removeItem("familyId");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to find family details.");
            setDeviceLinked(false);
            localStorage.removeItem("familyId");
        } finally {
            setFetching(false);
        }
    };

    const handleLinkDevice = (e: React.FormEvent) => {
        e.preventDefault();
        if (!familyId) return;
        fetchProfiles(familyId.toLowerCase());
    };

    const handlePinSubmit = async (pin: string) => {
        if (!selectedProfile) return;
        try {
            setFetching(true);
            const functions = getFunctions(getApp());
            const loginChildFn = httpsCallable(functions, "loginChildFn");

            const result = await loginChildFn({
                ceoId: selectedProfile.id,
                childPin: pin,
            }) as any;

            const { customToken } = result.data;

            // Log in with custom token
            await signInWithCustomToken(firebaseAuth, customToken);
            toast.success(`Welcome back, CEO ${selectedProfile.name}`);

            router.push("/ceo");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Invalid PIN. Access Denied.");
            setSelectedProfile(null); // Return to profile selection on error
        } finally {
            setFetching(false);
        }
    };

    if (!deviceLinked) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center p-4">
                <Card className="w-full max-w-sm bg-zinc-900 border-zinc-800 text-zinc-50">
                    <CardHeader>
                        <CardTitle>Link Device</CardTitle>
                        <CardDescription className="text-zinc-400">
                            Enter your Family ID to access local companies.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLinkDevice} className="flex flex-col gap-4">
                            <Input
                                placeholder="Unique Family ID"
                                className="bg-zinc-950 border-zinc-700 text-white"
                                value={familyId}
                                onChange={(e) => setFamilyId(e.target.value)}
                            />
                            <Button type="submit" disabled={fetching} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                {fetching ? "Searching..." : "Find Subsidaries"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
            <div className="max-w-4xl w-full flex flex-col items-center gap-12">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-2">Who is clocking in?</h1>
                    <p className="text-zinc-400 font-medium">Select your company to access your dashboard.</p>
                </div>

                {!selectedProfile ? (
                    <div className="flex flex-wrap justify-center gap-8">
                        {profiles.map((profile) => (
                            <button
                                key={profile.id}
                                onClick={() => setSelectedProfile(profile)}
                                className="group flex flex-col items-center gap-4 hover:scale-105 transition-transform duration-200"
                            >
                                <div className="w-32 h-32 md:w-40 md:h-40 bg-zinc-800 rounded-2xl flex items-center justify-center border-4 border-transparent group-hover:border-emerald-500 group-hover:bg-zinc-700 transition-all duration-200 shadow-xl overflow-hidden">
                                    {/* Real app would use an Avatar Image. Using an icon for now */}
                                    <Building2 size={64} className="text-zinc-500 group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <span className="text-xl font-semibold text-zinc-400 group-hover:text-white transition-colors">
                                    {profile.name}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-24 h-24 bg-emerald-900 rounded-2xl flex items-center justify-center border-2 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                                <Building2 size={40} className="text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mt-2">{selectedProfile.name}</h2>
                            <p className="text-zinc-400 text-sm">Enter your 4-digit PIN</p>
                        </div>

                        <PinPad onPinSubmit={handlePinSubmit} loading={fetching} />

                        <Button
                            variant="ghost"
                            className="text-zinc-500 hover:text-zinc-300 mt-4"
                            onClick={() => setSelectedProfile(null)}
                            disabled={fetching}
                        >
                            Cancel
                        </Button>
                    </div>
                )}

                <div className="mt-12 text-center">
                    <Button
                        variant="link"
                        onClick={() => {
                            localStorage.removeItem("familyId");
                            setDeviceLinked(false);
                            setFamilyId("");
                            setProfiles([]);
                        }}
                        className="text-zinc-600 hover:text-zinc-400 text-sm"
                    >
                        Unlink this device from Family ID
                    </Button>
                </div>
            </div>
        </div>
    );
}
