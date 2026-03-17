"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChoreStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { useDemoData } from "@/lib/demo/DemoContext";
import { CountryCurrencyMap } from "@/lib/currency";

export function CreateJobForm({ familyId }: { familyId: string }) {
    const { family } = useDemoData();
    const currencyInfo = CountryCurrencyMap[family.countryCode || "USA"];
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [baseValue, setBaseValue] = useState<number | "">("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !baseValue) {
            toast.error("Please provide a title and contract price");
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "contracts"), {
                familyId,
                title,
                description,
                baseValue: Number(baseValue),
                priority: 1,
                status: ChoreStatus.AVAILABLE,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            toast.success("RFP Posted Successfully.");
            setTitle("");
            setDescription("");
            setBaseValue("");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to post contract: " + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card className="w-full max-w-lg bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
            <CardHeader>
                <CardTitle className="text-xl text-emerald-400 font-bold tracking-tight">
                    Post Request For Proposal (RFP)
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Create a new Service Contract for the household marketplace.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-zinc-300">Contract Title</Label>
                        <Input
                            id="title"
                            placeholder="e.g. Kitchen Sanitation Detail"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-zinc-300">Scope of Work</Label>
                        <Textarea
                            id="description"
                            placeholder="Detailed requirements for the job..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="baseValue" className="text-zinc-300">Budget ({currencyInfo.symbol})</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">{currencyInfo.symbol}</span>
                            <Input
                                id="baseValue"
                                type="number"
                                placeholder="5.00"
                                step={currencyInfo.decimals === 0 ? "1" : "0.25"}
                                min="0"
                                value={baseValue}
                                onChange={(e) => setBaseValue(Number(e.target.value) || "")}
                                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 pl-8"
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                    >
                        {isSubmitting ? "Posting..." : "Publish to Job Board"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
