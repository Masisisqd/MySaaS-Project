"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TaskStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export function RDModule({ userId, familyId }: { userId: string; familyId: string }) {
    const [subject, setSubject] = useState("");
    const [minutes, setMinutes] = useState<number | "">("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !minutes) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "academicLogs"), {
                userId,
                familyId,
                subject,
                minutesSpent: Number(minutes),
                status: TaskStatus.COMPLETED, // Needs Board Approval to unlock marketplace
                date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                createdAt: new Date(),
            });
            toast.success("R&D Logged securely. Awaiting Board verification.");
            setSubject("");
            setMinutes("");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to log R&D: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-md bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl text-emerald-400 font-bold tracking-tight">
                    Research & Development (R&D)
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Log your daily academic progress. The Marketplace remains locked until the Board approves your R&D.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="subject" className="text-zinc-300">Subject / Focus</Label>
                        <Input
                            id="subject"
                            placeholder="e.g. Algebra Homework, Assigned Reading"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="minutes" className="text-zinc-300">Minutes Spent</Label>
                        <Input
                            id="minutes"
                            type="number"
                            placeholder="45"
                            min="1"
                            value={minutes}
                            onChange={(e) => setMinutes(Number(e.target.value) || "")}
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    >
                        {isSubmitting ? "Logging..." : "Submit to Board"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
