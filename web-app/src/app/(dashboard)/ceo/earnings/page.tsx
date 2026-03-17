"use client";

import { useDemoData } from "@/lib/demo/DemoContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import Image from "next/image";

// ─── Junior Earnings (Piggy Bank View) ─────────────────────────────

function JuniorEarnings() {
    const { currentCompany, invoices } = useDemoData();
    const myInvoices = invoices.filter(i => i.companyId === currentCompany?.id && i.status === "PAID");

    const spending = currentCompany?.spendingBalance || 0;
    const savings = currentCompany?.savingsBalance || 0;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-amber-900">🐷 My Piggy Bank</h2>
                <p className="text-amber-700 mt-1">See how much money you&apos;ve earned and saved!</p>
            </div>

            {/* Big Piggy Bank */}
            <Card className="border-2 border-pink-300 overflow-hidden" style={{ background: "linear-gradient(135deg, #fce7f3, #fbcfe8)" }}>
                <CardContent className="p-6 text-center">
                    <div className="w-32 h-32 mx-auto mb-4">
                        <Image src="/assets/piggy-bank.png" alt="Piggy Bank" width={128} height={128} className="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    <div className="text-5xl font-extrabold text-pink-800 mb-2">${(spending + savings).toFixed(2)}</div>
                    <div className="text-pink-600 font-bold">Total Money! 🎉</div>
                </CardContent>
            </Card>

            {/* Money Jars */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-emerald-300" style={{ background: "linear-gradient(135deg, #d1fae5, #a7f3d0)" }}>
                    <CardContent className="p-5 text-center">
                        <div className="text-4xl mb-2">💸</div>
                        <div className="text-sm text-emerald-800 font-bold">Pocket Money</div>
                        <div className="text-3xl font-extrabold text-emerald-900">${spending.toFixed(2)}</div>
                        <div className="text-xs text-emerald-700 mt-1">For toys & treats!</div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-indigo-300" style={{ background: "linear-gradient(135deg, #e0e7ff, #c7d2fe)" }}>
                    <CardContent className="p-5 text-center">
                        <div className="text-4xl mb-2">🏦</div>
                        <div className="text-sm text-indigo-800 font-bold">Savings Jar</div>
                        <div className="text-3xl font-extrabold text-indigo-900">${savings.toFixed(2)}</div>
                        <div className="text-xs text-indigo-700 mt-1">For something BIG!</div>
                    </CardContent>
                </Card>
            </div>

            {/* Chore History */}
            {myInvoices.length > 0 && (
                <Card className="border-2 border-amber-300" style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)" }}>
                    <CardContent className="p-5">
                        <h3 className="font-bold text-amber-900 text-lg mb-3 text-center">💰 Money I Earned</h3>
                        <div className="space-y-2">
                            {myInvoices.map((inv, i) => (
                                <div key={inv.id} className="flex justify-between items-center bg-white/60 p-3 rounded-xl">
                                    <span className="font-bold text-amber-900">Chore #{i + 1}</span>
                                    <span className="text-emerald-700 font-extrabold">${inv.amount.toFixed(2)} ⭐</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// ─── Pro Earnings (unchanged) ──────────────────────────────────────

function ProEarnings() {
    const { currentCompany, invoices } = useDemoData();
    const myInvoices = invoices.filter(i => i.companyId === currentCompany?.id && i.status === "PAID");

    const chartData = myInvoices.map((inv, i) => ({
        name: `Job ${i + 1}`,
        Gross: inv.amount,
        Net: inv.breakdown?.netProfit || 0,
    }));

    return (
        <div className="space-y-8 max-w-5xl">
            <div>
                <h2 className="text-2xl font-bold text-zinc-100">Quarterly Earnings Report</h2>
                <p className="text-zinc-400 mt-1">{currentCompany?.name} — Financial Performance</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">FICO Score</div>
                    <div className="text-4xl font-extrabold text-emerald-400">{currentCompany?.creditScore || 750}</div>
                </CardContent></Card>
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Net Profit</div>
                    <div className="text-4xl font-extrabold text-zinc-100">${(currentCompany?.spendingBalance || 0).toFixed(2)}</div>
                </CardContent></Card>
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Savings + R&D</div>
                    <div className="text-4xl font-extrabold text-indigo-400">${((currentCompany?.savingsBalance || 0) + (currentCompany?.reinvestBalance || 0)).toFixed(2)}</div>
                </CardContent></Card>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <CardTitle className="text-lg text-emerald-400">Revenue Funnel</CardTitle>
                    <CardDescription className="text-zinc-400">Gross vs Net Profit per Contract</CardDescription>
                </CardHeader>
                <CardContent className="h-72">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                                <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }} />
                                <Bar dataKey="Gross" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Net" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-sm text-zinc-600">Complete more contracts to see your earnings graph</div>
                    )}
                </CardContent>
            </Card>

            {myInvoices.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader><CardTitle className="text-lg text-zinc-200">Invoice History</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        {myInvoices.map(inv => (
                            <div key={inv.id} className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-3 rounded-md">
                                <div><span className="text-zinc-200 font-medium">Invoice</span><span className="text-zinc-500 text-sm ml-2">Gross: ${inv.amount.toFixed(2)}</span></div>
                                <span className="text-emerald-400 font-bold">Net: ${(inv.breakdown?.netProfit || 0).toFixed(2)}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default function EarningsPage() {
    const { isJunior } = useDemoData();
    return isJunior ? <JuniorEarnings /> : <ProEarnings />;
}
