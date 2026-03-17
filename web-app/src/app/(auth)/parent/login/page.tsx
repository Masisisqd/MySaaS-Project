"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth, db } from "@/lib/firebase/config";
import { GoogleAuthProvider, signInWithPopup, getRedirectResult } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function ParentLoginPage() {
    const router = useRouter();
    const { user, userData, loading } = useAuth();
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            if (userData?.role === "BOARD") {
                router.push("/board");
            } else if (userData?.role === "CEO") {
                router.push("/ceo");
            } else {
                // User exists but has no document, redirect to onboarding
                router.push("/parent/onboarding");
            }
        }
    }, [user, userData, loading, router]);

    const handleGoogleLogin = async () => {
        try {
            setIsLoggingIn(true);
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);

            const userDocRef = doc(db, "users", result.user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const data = userDocSnap.data();
                if (data.role === "BOARD") {
                    toast.success("Welcome back to the Board Room!");
                    router.push("/board");
                } else {
                    router.push("/ceo");
                }
            } else {
                toast.info("Registration started. Please complete your family onboarding.");
                router.push("/parent/onboarding");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to log in with Google");
        } finally {
            setIsLoggingIn(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-zinc-50">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">Parent Login</CardTitle>
                    <CardDescription className="text-zinc-400 mt-2">
                        The Board of Directors authentication portal.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center pt-4">
                    <Button
                        size="lg"
                        className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-semibold"
                        onClick={handleGoogleLogin}
                        disabled={isLoggingIn || loading}
                    >
                        {isLoggingIn ? "Authenticating..." : "Sign in with Google"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
