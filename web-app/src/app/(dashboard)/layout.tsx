// src/app/(dashboard)/layout.tsx
"use client";

import { DemoProvider, useDemoData } from "@/lib/demo/DemoContext";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";

function DashboardShell({ children }: { children: React.ReactNode }) {
    const { isJunior, currentUser } = useDemoData();
    const isBoard = currentUser.role === "BOARD";
    const useKidBg = !isBoard && isJunior;

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main
                className="flex-1 p-8 overflow-y-auto"
                style={useKidBg
                    ? { background: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)" }
                    : { background: "#09090b" }
                }
            >
                {children}
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    // If we are logged in with a real account, we should ideally not use DemoProvider
    // but the pages inside depend on useDemoData(). 
    // So the best approach is to modify DemoProvider to return real data if logged in.
    
    return (
        <DemoProvider>
            <DashboardShell>{children}</DashboardShell>
        </DemoProvider>
    );
}
