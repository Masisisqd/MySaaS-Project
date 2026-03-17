"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function ProtectedRoute({
    children,
    allowedRoles
}: {
    children: React.ReactNode;
    allowedRoles?: ("CEO" | "BOARD")[];
}) {
    const { user, userData, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push("/");
            } else if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
                if (userData.role === "BOARD") {
                    router.push("/board");
                } else {
                    router.push("/ceo");
                }
            }
        }
    }, [user, userData, loading, allowedRoles, router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="animate-pulse text-zinc-500">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    if (allowedRoles && userData && !allowedRoles.includes(userData.role)) {
        return null; // Will redirect
    }

    return <>{children}</>;
}
