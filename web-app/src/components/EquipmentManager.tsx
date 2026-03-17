"use client";

import { useState, useEffect } from "react";
import { addDoc, collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Equipment } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function EquipmentManager({ familyId }: { familyId: string }) {
    const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
    const [loading, setLoading] = useState(true);

    // New equipment form state
    const [name, setName] = useState("");
    const [category, setCategory] = useState("Cleaning");
    const [rentalRate, setRentalRate] = useState<number | "">("");
    const [isAdding, setIsAdding] = useState(false);

    const fetchEquipment = async () => {
        setLoading(true);
        try {
            const q = query(
                collection(db, "equipments"),
                where("familyId", "==", familyId)
            );
            const snapshot = await getDocs(q);
            const fetched = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Equipment));
            setEquipmentList(fetched);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load equipment list");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEquipment();
    }, [familyId]);

    const handleAddEquipment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !rentalRate) {
            toast.error("Name and Rental Rate are required");
            return;
        }

        setIsAdding(true);
        try {
            const newEquip = {
                familyId,
                name,
                category,
                rentalRate: Number(rentalRate),
                energyFee: 0.05,
                condition: 100,
                createdAt: new Date()
            };
            const docRef = await addDoc(collection(db, "equipments"), newEquip);

            setEquipmentList([{ id: docRef.id, ...newEquip } as Equipment, ...equipmentList]);
            toast.success("Equipment added successfully!");
            setName("");
            setRentalRate("");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to add equipment: " + error.message);
        } finally {
            setIsAdding(false);
        }
    };

    // Mock function to drop condition by 5% manually for demo purposes
    const degradeCondition = async (id: string, currentCondition: number) => {
        try {
            const newCond = Math.max(0, currentCondition - 5);
            await updateDoc(doc(db, "equipments", id), { condition: newCond });
            setEquipmentList(equipmentList.map(e => e.id === id ? { ...e, condition: newCond } : e));
            toast.success("Condition degraded for testing.");
        } catch (error) {
            toast.error("Update failed.");
        }
    };

    return (
        <div className="w-full max-w-3xl space-y-6">
            <Card className="bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-emerald-400 font-bold tracking-tight">
                        Register Corporate Asset
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Add household tools that Service Providers must lease.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleAddEquipment}>
                    <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="eqName" className="text-zinc-300">Tool Name</Label>
                            <Input
                                id="eqName"
                                placeholder="e.g. Dyson V15 Vacuum"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="eqRate" className="text-zinc-300">Rate ($/use)</Label>
                            <Input
                                id="eqRate"
                                type="number"
                                step="0.05"
                                min="0"
                                placeholder="0.50"
                                value={rentalRate}
                                onChange={(e) => setRentalRate(Number(e.target.value) || "")}
                                className="bg-zinc-900 border-zinc-700 text-zinc-100 placeholder:text-zinc-500"
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isAdding}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white w-full h-10"
                        >
                            {isAdding ? "Adding..." : "Add Asset"}
                        </Button>
                    </CardContent>
                </form>
            </Card>

            <Card className="bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
                <CardHeader>
                    <CardTitle className="text-xl text-emerald-400 font-bold tracking-tight">
                        The Motor Pool (Asset Health)
                    </CardTitle>
                    <CardDescription className="text-zinc-400">
                        Monitor tool condition and manage depreciation.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-zinc-500 animate-pulse">Loading Assets...</div>
                    ) : equipmentList.length === 0 ? (
                        <div className="text-sm text-zinc-500 italic">No assets registered yet.</div>
                    ) : (
                        <div className="space-y-3">
                            {equipmentList.map(item => (
                                <div key={item.id} className="flex flex-col sm:flex-row justify-between items-center bg-zinc-900 border border-zinc-800 p-4 rounded-md gap-4">
                                    <div className="w-full">
                                        <div className="font-semibold text-zinc-100">{item.name}</div>
                                        <div className="text-sm text-zinc-400 flex gap-4 mt-1">
                                            <span>Rate: <span className="text-emerald-400">${item.rentalRate.toFixed(2)}</span></span>
                                            <span>Condition:
                                                <span className={item.condition < 40 ? "text-rose-400 ml-1" : "text-emerald-400 ml-1"}>
                                                    {item.condition}%
                                                </span>
                                            </span>
                                        </div>
                                        {/* Basic progress bar for condition */}
                                        <div className="w-full h-2 bg-zinc-800 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className={`h-full ${item.condition < 40 ? 'bg-rose-500' : 'bg-emerald-500'}`}
                                                style={{ width: `${item.condition}%` }}
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 whitespace-nowrap"
                                        onClick={() => degradeCondition(item.id, item.condition)}
                                    >
                                        Simulate Wear
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
