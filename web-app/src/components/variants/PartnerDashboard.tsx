"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { ArrowUpRight, TrendingUp, DollarSign, Percent, FileText } from "lucide-react";

export default function PartnerDashboard({ user, theme }: { user: any, theme: string }) {
    const company = user?.company;
    // Stripe / FinTech styling variables
    const data = [
        { day: "Mon", revenue: 15 },
        { day: "Tue", revenue: 20 },
        { day: "Wed", revenue: 8 },
        { day: "Thu", revenue: 35 },
        { day: "Fri", revenue: 12 },
        { day: "Sat", revenue: 45 },
        { day: "Sun", revenue: 22 },
    ];

    return (
        <div className={`min-h-screen p-4 md:p-8 ${theme} bg-[var(--background)] text-slate-100 font-heading`}>
        <div className="max-w-5xl mx-auto space-y-6 pt-2">
            <header className="flex items-center justify-between pb-4 border-b border-zinc-800">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-white flex items-center gap-2">
                        {company?.name || "Enterprise ERP"} 
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-zinc-800 text-zinc-400">Partner</span>
                    </h1>
                    <p className="text-sm text-zinc-500 mt-1">SLA Compliance & Operating Expenses</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-medium text-white rounded-md transition-colors">
                        Issue Invoice
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white rounded-md transition-colors flex items-center gap-1">
                        View Statement <ArrowUpRight size={14} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
                            <DollarSign size={14} /> Gross Rev
                        </div>
                        <div className="text-3xl font-light text-white">{formatCurrency(company?.totalRevenue || 0, "en-US", "USD")}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
                            <TrendingUp size={14} /> OpEx
                        </div>
                        <div className="text-3xl font-light text-rose-400">{formatCurrency(company?.overheadCost || 0, "en-US", "USD")}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
                            <Percent size={14} /> Tax/Liability
                        </div>
                        <div className="text-3xl font-light text-amber-500">{formatCurrency(((company?.totalRevenue || 0) * 0.2), "en-US", "USD")}</div>
                        <div className="text-xs text-zinc-500 mt-1">~20% Corporate Tax</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-2">
                            <TrendingUp size={14} /> Q. Dividends
                        </div>
                        <div className="text-3xl font-light text-emerald-500">{formatCurrency(company?.savingsBalance || 0, "en-US", "USD")}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800 col-span-2">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-zinc-400 mb-6">90-Day Revenue Projection</h3>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                    <Tooltip contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px" }} itemStyle={{ color: "#a78bfa" }} />
                                    <Line type="monotone" dataKey="revenue" stroke="#818cf8" strokeWidth={3} dot={{ r: 4, fill: "#818cf8" }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                        <h3 className="text-sm font-medium text-zinc-400 mb-6">B2B Tutoring Invoices</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex flex-col gap-1 border-b border-zinc-800 pb-3 last:border-0">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-zinc-200">#INV-{1000 + i}</span>
                                        <span className="text-emerald-500">$25.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-zinc-500">
                                        <span>Algebra Tutoring</span>
                                        <span className="px-1.5 py-0.5 bg-zinc-800 rounded text-[9px] uppercase tracking-wide">Paid</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-4 flex items-center justify-center gap-2 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                            <FileText size={14} /> View All Invoices
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
        </div>
    );
}
