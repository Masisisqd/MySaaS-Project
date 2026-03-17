"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { AcademicLog, TaskStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function BoardRDAudit({ familyId }: { familyId: string }) {
    const [logs, setLogs] = useState<AcademicLog[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPendingLogs = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const q = query(
                collection(db, "academicLogs"),
                where("familyId", "==", familyId),
                where("date", "==", today),
                where("status", "==", TaskStatus.COMPLETED)
            );
            const snapshot = await getDocs(q);
            const fetchedLogs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AcademicLog));
            setLogs(fetchedLogs);
        } catch (error: any) {
            console.error("Error fetching logs:", error);
            toast.error("Failed to load R&D logs");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingLogs();
    }, [familyId]);

    const handleApprove = async (logId: string) => {
        try {
            const logRef = doc(db, "academicLogs", logId);
            await updateDoc(logRef, {
                status: TaskStatus.APPROVED,
                approvedAt: new Date()
            });
            toast.success("R&D Approved. Marketplace Unlocked for this CEO.");
            setLogs(logs.filter(log => log.id !== logId));
        } catch (error: any) {
            console.error(error);
            toast.error("Approval failed: " + error.message);
        }
    };

    return (
        <Card className="w-full bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl text-emerald-400 font-bold tracking-tight">
                    Board Override: Daily Compliance
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Review today's R&D submissions. Approval unlocks the company's ability to bid on Service Contracts.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="text-sm text-zinc-500 animate-pulse">Loading compliance data...</div>
                ) : logs.length === 0 ? (
                    <div className="text-sm text-zinc-500 italic">No pending R&D logs for today.</div>
                ) : (
                    <div className="space-y-4">
                        {logs.map(log => (
                            <div key={log.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900 border border-zinc-800 p-4 rounded-md gap-4">
                                <div>
                                    <div className="font-semibold text-zinc-200">
                                        User: {log.userId} {/* Normally join with User table for name */}
                                    </div>
                                    <div className="text-sm text-zinc-400 mt-1">
                                        Subject: <span className="text-zinc-300 font-medium">{log.subject}</span>
                                    </div>
                                    <div className="text-sm text-zinc-400">
                                        Duration: <span className="text-emerald-400 font-medium">{log.minutesSpent} mins</span>
                                    </div>
                                </div>
                                <Button
                                    onClick={() => handleApprove(log.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white w-full sm:w-auto"
                                >
                                    Verify & Unlock
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
