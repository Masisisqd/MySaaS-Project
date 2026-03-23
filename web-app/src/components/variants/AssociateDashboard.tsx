"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency";
import MarketClock from "@/components/MarketClock";
import { Activity, Briefcase, Filter, Box } from "lucide-react";

export default function AssociateDashboard({ user, theme }: { user: any, theme: string }) {
    const family = user?.family;
    const company = user?.company;
    // Linear / Notion style variables
    const efficiencyScore = 88; // Example derived score
    
    return (
        <div className={`min-h-screen p-4 md:p-8 ${theme} bg-[var(--background)] text-slate-800 font-heading`}>
        <div className="max-w-6xl mx-auto flex gap-6 mt-4">
            {/* Main Area: Kanban & Metrics */}
            <div className="flex-1 space-y-6">
                <header className="flex items-center justify-between pb-4 border-b border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
                            <Briefcase size={20} className="text-indigo-400" /> 
                            {company?.name || "The Micro-SaaS"}
                        </h1>
                        <p className="text-sm text-zinc-400 mt-1">Service Orders & Profit Margins</p>
                    </div>
                    {/* Timezone-Aware Market Clock */}
                    {family && <MarketClock timezone={family.timezone} />}
                </header>

                {/* Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-zinc-900 border-zinc-800 rounded-lg">
                        <CardContent className="p-4 flex flex-col justify-center h-full">
                            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Profit Margins</div>
                            <div className="text-2xl font-semibold text-zinc-100">{formatCurrency(company?.totalRevenue || 0, "en-US", "USD")}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 rounded-lg">
                        <CardContent className="p-4 flex flex-col justify-center h-full">
                            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Efficiency Score</div>
                            <div className="flex items-center gap-2">
                                <Activity size={20} className="text-emerald-400" />
                                <div className="text-2xl font-semibold text-zinc-100">{efficiencyScore}/100</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-zinc-900 border-zinc-800 rounded-lg">
                        <CardContent className="p-4 flex flex-col justify-center h-full">
                            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-1">Operating Overhead</div>
                            <div className="text-2xl font-semibold text-rose-400">{formatCurrency(company?.overheadCost || 0, "en-US", "USD")}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Kanban Board Placeholder */}
                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-medium text-zinc-100">Service Orders</h2>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm border border-zinc-800 rounded-md px-3 py-1 bg-zinc-900">
                            <Filter size={14} /> Filter
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 min-h-[300px]">
                            <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-zinc-500"></span> Inbox
                            </div>
                            <div className="bg-zinc-800 rounded-md p-3 text-sm text-zinc-300 shadow-sm border border-zinc-700">Clean the living room windows</div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 min-h-[300px]">
                            <div className="text-xs font-medium text-amber-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Active
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 min-h-[300px]">
                            <div className="text-xs font-medium text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> QA Review
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar: Tool Rental */}
            <div className="w-64 space-y-4">
                <Card className="bg-zinc-900 border-zinc-800 rounded-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-100 flex items-center gap-2">
                            <Box size={16} className="text-indigo-400" /> Tool Rental
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col gap-3">
                        <div className="text-xs text-zinc-500 mb-2">Lease tools from the Holding Corp to improve output.</div>
                        <div className="bg-zinc-950 border border-zinc-800 rounded p-2 flex justify-between items-center">
                            <span className="text-sm text-zinc-300">Dyson V15</span>
                            <span className="text-xs font-mono text-zinc-500">$0.50/hr</span>
                        </div>
                        <div className="bg-zinc-950 border border-zinc-800 rounded p-2 flex justify-between items-center">
                            <span className="text-sm text-zinc-300">Lawnmower</span>
                            <span className="text-xs font-mono text-zinc-500">$1.00/hr</span>
                        </div>
                        <button className="w-full mt-2 text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-900/50 hover:bg-indigo-900/20 rounded py-2 transition-colors">
                            Browse Tools
                        </button>
                    </CardContent>
                </Card>
            </div>
        </div>
        </div>
    );
}
