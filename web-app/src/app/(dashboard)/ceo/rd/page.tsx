"use client";

import { useState } from "react";
import { useDemoData } from "@/lib/demo/DemoContext";
import { TaskStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

function JuniorRD() {
    const { currentUser, academicLogs, setAcademicLogs } = useDemoData();
    const [subject, setSubject] = useState("");
    const [minutes, setMinutes] = useState<number | "">("");

    const myLogs = academicLogs.filter(l => l.userId === currentUser.id);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !minutes) { toast.error("Fill in what you studied! 📚"); return; }
        setAcademicLogs([{
            id: `al-${Date.now()}`, userId: currentUser.id, familyId: "family-smith",
            subject, minutesSpent: Number(minutes), status: TaskStatus.COMPLETED,
            date: new Date().toISOString().split("T")[0], createdAt: new Date(),
        }, ...academicLogs]);
        toast.success("Awesome! Mom or Dad will check it! ⭐");
        setSubject(""); setMinutes("");
    };

    return (
        <div className="space-y-6 max-w-lg mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-amber-900">📖 Study Time</h2>
                <p className="text-amber-700 mt-1">Tell us what you learned today!</p>
            </div>

            <Card className="border-2 border-blue-300" style={{ background: "linear-gradient(135deg, #dbeafe, #bfdbfe)" }}>
                <form onSubmit={submit}>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-blue-900 font-bold">What did you study? 📚</Label>
                            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Reading, Math, Spelling..."
                                className="bg-white border-blue-300 text-blue-900 placeholder:text-blue-400 text-lg py-6 rounded-xl" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-blue-900 font-bold">How many minutes? ⏱️</Label>
                            <Input type="number" min="1" value={minutes} onChange={e => setMinutes(Number(e.target.value) || "")} placeholder="30"
                                className="bg-white border-blue-300 text-blue-900 placeholder:text-blue-400 text-lg py-6 rounded-xl" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg py-6 rounded-xl font-bold">
                            ✅ Done! Tell Mom & Dad
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {myLogs.length > 0 && (
                <div className="space-y-2">
                    <h3 className="text-lg font-bold text-amber-900 text-center">Today&apos;s Stamps</h3>
                    {myLogs.map(l => (
                        <Card key={l.id} className="border-2" style={{
                            borderColor: l.status === TaskStatus.APPROVED ? "#86efac" : "#fde68a",
                            background: l.status === TaskStatus.APPROVED ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" : "linear-gradient(135deg, #fef3c7, #fde68a)"
                        }}>
                            <CardContent className="p-3 flex justify-between items-center">
                                <span className="font-bold" style={{ color: l.status === TaskStatus.APPROVED ? "#065f46" : "#92400e" }}>
                                    {l.subject} · {l.minutesSpent} mins
                                </span>
                                <span className="text-lg">{l.status === TaskStatus.APPROVED ? "⭐" : "⏳"}</span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

function ProRD() {
    const { currentUser, academicLogs, setAcademicLogs } = useDemoData();
    const [subject, setSubject] = useState("");
    const [minutes, setMinutes] = useState<number | "">("");
    const myLogs = academicLogs.filter(l => l.userId === currentUser.id);

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !minutes) { toast.error("Fill in all fields"); return; }
        setAcademicLogs([{
            id: `al-${Date.now()}`, userId: currentUser.id, familyId: "family-smith",
            subject, minutesSpent: Number(minutes), status: TaskStatus.COMPLETED,
            date: new Date().toISOString().split("T")[0], createdAt: new Date(),
        }, ...academicLogs]);
        toast.success("R&D logged. Awaiting Board verification.");
        setSubject(""); setMinutes("");
    };

    return (
        <div className="space-y-6 max-w-lg">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">Research & Development</h2>
                <p className="text-zinc-400 mt-1">Log your study sessions. The marketplace stays locked until the Board approves.</p>
            </div>
            <Card className="bg-zinc-900 border-zinc-800">
                <form onSubmit={submit}>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Subject / Focus</Label>
                            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Algebra Homework" className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Minutes Spent</Label>
                            <Input type="number" min="1" value={minutes} onChange={e => setMinutes(Number(e.target.value) || "")} placeholder="45" className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Submit to Board</Button>
                    </CardFooter>
                </form>
            </Card>
            {myLogs.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader><CardTitle className="text-lg text-zinc-200">My R&D Log</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {myLogs.map(l => (
                            <div key={l.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-md">
                                <div><span className="text-zinc-200 font-medium">{l.subject}</span><span className="text-zinc-500 text-sm ml-2">· {l.minutesSpent} mins</span></div>
                                <span className={`text-xs font-semibold ${l.status === TaskStatus.APPROVED ? "text-emerald-400" : "text-amber-400"}`}>
                                    {l.status === TaskStatus.APPROVED ? "✓ APPROVED" : "⏳ PENDING"}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function RDPage() {
    const { isJunior } = useDemoData();
    return isJunior ? <JuniorRD /> : <ProRD />;
}
