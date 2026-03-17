"use client";

import { useState } from "react";
import { useDemoData } from "@/lib/demo/DemoContext";
import { ChoreStatus } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

export default function ContractsPage() {
    const { contracts, setContracts } = useDemoData();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [value, setValue] = useState<number | "">("");

    const handlePost = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !value) { toast.error("Title and budget required"); return; }

        const newContract = {
            id: `c-${Date.now()}`,
            familyId: "family-smith",
            title,
            description,
            baseValue: Number(value),
            priority: 1,
            status: ChoreStatus.AVAILABLE as ChoreStatus,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        setContracts([newContract, ...contracts]);
        toast.success("RFP published to Job Board.");
        setTitle(""); setDescription(""); setValue("");
    };

    const openContracts = contracts.filter(c => c.status === ChoreStatus.AVAILABLE);

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">Post Request for Proposal</h2>
                <p className="text-zinc-400 mt-1">Create a new chore contract for the marketplace.</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <form onSubmit={handlePost}>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Contract Title</Label>
                            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Kitchen Sanitation Detail" className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Scope of Work</Label>
                            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed requirements..." className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600 min-h-[80px]" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Budget ($)</Label>
                            <Input type="number" step="0.25" min="0" value={value} onChange={e => setValue(Number(e.target.value) || "")} placeholder="5.00" className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Publish to Job Board</Button>
                    </CardFooter>
                </form>
            </Card>

            {openContracts.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader><CardTitle className="text-lg text-zinc-200">Active RFPs ({openContracts.length})</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {openContracts.map(c => (
                            <div key={c.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-md">
                                <span className="text-zinc-200 font-medium">{c.title}</span>
                                <span className="text-emerald-400 font-bold">${c.baseValue.toFixed(2)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
