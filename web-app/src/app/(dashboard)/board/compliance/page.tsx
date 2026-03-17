"use client";

import { useDemoData } from "@/lib/demo/DemoContext";
import { TaskStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function CompliancePage() {
    const { academicLogs, setAcademicLogs } = useDemoData();

    const pendingLogs = academicLogs.filter(l => l.status === TaskStatus.COMPLETED);
    const approvedLogs = academicLogs.filter(l => l.status === TaskStatus.APPROVED);

    const handleApprove = (logId: string) => {
        setAcademicLogs(academicLogs.map(l =>
            l.id === logId ? { ...l, status: TaskStatus.APPROVED } : l
        ));
        toast.success("R&D Approved. Marketplace unlocked for this CEO.");
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">R&D Compliance Center</h2>
                <p className="text-zinc-400 mt-1">Review and approve today&apos;s academic submissions to unlock marketplaces.</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg text-amber-400">Pending Verification</CardTitle>
                    <CardDescription className="text-zinc-400">{pendingLogs.length} submission(s) awaiting your review</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingLogs.length === 0 ? (
                        <div className="text-sm text-zinc-500 italic">All submissions verified ✓</div>
                    ) : (
                        <div className="space-y-3">
                            {pendingLogs.map(log => (
                                <div key={log.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-4 rounded-md">
                                    <div>
                                        <div className="font-medium text-zinc-200">{log.subject}</div>
                                        <div className="text-sm text-zinc-400">User: {log.userId} · {log.minutesSpent} mins</div>
                                    </div>
                                    <Button onClick={() => handleApprove(log.id)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                                        Verify & Unlock
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {approvedLogs.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader>
                        <CardTitle className="text-lg text-emerald-400">Approved Today</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {approvedLogs.map(log => (
                                <div key={log.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-md">
                                    <div className="text-sm text-zinc-300">{log.subject} — {log.minutesSpent} mins</div>
                                    <span className="text-emerald-400 text-xs font-semibold">✓ APPROVED</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
