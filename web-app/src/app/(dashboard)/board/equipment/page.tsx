"use client";

import { useState } from "react";
import { useDemoData } from "@/lib/demo/DemoContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export default function EquipmentPage() {
    const { equipment, setEquipment } = useDemoData();
    const [name, setName] = useState("");
    const [rate, setRate] = useState<number | "">("");

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !rate) { toast.error("Name and rate required"); return; }
        setEquipment([{ id: `eq-${Date.now()}`, familyId: "family-smith", name, category: "General", rentalRate: Number(rate), energyFee: 0.05, condition: 100 }, ...equipment]);
        toast.success("Asset registered.");
        setName(""); setRate("");
    };

    const degrade = (id: string) => {
        setEquipment(equipment.map(e => e.id === id ? { ...e, condition: Math.max(0, e.condition - 10) } : e));
        toast.info("Simulated wear applied.");
    };

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">Motor Pool (Asset Health)</h2>
                <p className="text-zinc-400 mt-1">Register and monitor corporate assets available for lease.</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <form onSubmit={handleAdd}>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2 md:col-span-1">
                            <Label className="text-zinc-300">Tool Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Dyson V15" className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-zinc-300">Rate ($/use)</Label>
                            <Input type="number" step="0.05" min="0" value={rate} onChange={e => setRate(Number(e.target.value) || "")} placeholder="0.50" className="bg-zinc-950 border-zinc-700 text-zinc-100 placeholder:text-zinc-600" />
                        </div>
                        <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white h-10">Add Asset</Button>
                    </CardContent>
                </form>
            </Card>

            <div className="space-y-3">
                {equipment.map(item => (
                    <Card key={item.id} className="bg-zinc-900 border-zinc-800">
                        <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="w-full">
                                <div className="font-semibold text-zinc-100">{item.name}</div>
                                <div className="text-sm text-zinc-400 flex gap-4 mt-1">
                                    <span>Rate: <span className="text-emerald-400">${item.rentalRate.toFixed(2)}</span></span>
                                    <span>Condition: <span className={item.condition < 40 ? "text-rose-400" : "text-emerald-400"}>{item.condition}%</span></span>
                                </div>
                                <div className="w-full h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                    <div className={`h-full transition-all ${item.condition < 40 ? "bg-rose-500" : "bg-emerald-500"}`} style={{ width: `${item.condition}%` }} />
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 whitespace-nowrap" onClick={() => degrade(item.id)}>
                                Simulate Wear
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
