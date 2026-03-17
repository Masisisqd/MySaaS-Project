"use client";

import { useDemoData } from "@/lib/demo/DemoContext";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStatus } from "@/lib/types/schema";
import Image from "next/image";
import { formatCurrency } from "@/lib/currency";

// ─── Junior Dashboard (Ages 6-9) ─────────────────────────────────

function JuniorDashboard() {
    const { currentUser, currentCompany, academicLogs, family } = useDemoData();
    const todayApproved = academicLogs.some(l => l.userId === currentUser.id && l.status === TaskStatus.APPROVED);

    const spending = currentCompany?.spendingBalance || 0;
    const savings = currentCompany?.savingsBalance || 0;
    const piggyTotal = spending + savings;

    // Stars: 1 star per $10 earned
    const starCount = Math.min(5, Math.floor((currentCompany?.totalRevenue || 0) / 10));

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            {/* Greeting */}
            <div className="text-center">
                <h2 className="text-4xl font-extrabold text-amber-900">
                    Welcome back, {currentUser.name.split(" ")[0]}! 🎉
                </h2>
                <p className="text-lg text-amber-700 mt-2">
                    {todayApproved
                        ? "Great job on your homework! The Chore Store is open! 🌟"
                        : "Do your Study Time first to unlock the Chore Store! 📚"}
                </p>
            </div>

            {/* Piggy Bank */}
            <Card className="border-2 border-pink-300 overflow-hidden" style={{ background: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)" }}>
                <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-36 h-36 flex-shrink-0">
                        <Image src="/assets/piggy-bank.png" alt="Piggy Bank" width={144} height={144} className="w-full h-full object-contain drop-shadow-lg" />
                    </div>
                    <div className="text-center sm:text-left flex-1">
                        <div className="text-pink-600 text-sm font-bold uppercase tracking-wider mb-1">My Piggy Bank 🐷</div>
                        <div className="text-5xl font-extrabold text-pink-800">{formatCurrency(piggyTotal, family.locale, family.currencyCode)}</div>
                        <div className="mt-3 grid grid-cols-2 gap-3">
                            <div className="bg-white/60 rounded-xl p-3 text-center">
                                <div className="text-xs text-pink-600 font-bold">🎯 Pocket Money</div>
                                <div className="text-xl font-bold text-pink-800">{formatCurrency(spending, family.locale, family.currencyCode)}</div>
                            </div>
                            <div className="bg-white/60 rounded-xl p-3 text-center">
                                <div className="text-xs text-pink-600 font-bold">🏦 Savings</div>
                                <div className="text-xl font-bold text-pink-800">{formatCurrency(savings, family.locale, family.currencyCode)}</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Star Rating */}
            <Card className="border-2 border-amber-300" style={{ background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)" }}>
                <CardContent className="p-5 text-center">
                    <div className="text-amber-800 font-bold mb-2">My Helper Stars</div>
                    <div className="text-5xl tracking-wider">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < starCount ? "" : "opacity-20"}>{i < starCount ? "⭐" : "☆"}</span>
                        ))}
                    </div>
                    <div className="text-sm text-amber-700 mt-2">
                        {starCount < 5 ? `Keep going! ${5 - starCount} more star${5 - starCount > 1 ? "s" : ""} to earn!` : "WOW! You're a SUPER STAR! 🏆"}
                    </div>
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="border-2 border-emerald-300" style={{ background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)" }}>
                    <CardContent className="p-5 text-center">
                        <div className="text-4xl mb-2">💰</div>
                        <div className="text-sm text-emerald-800 font-bold">Total Earned</div>
                        <div className="text-2xl font-extrabold text-emerald-900">{formatCurrency(currentCompany?.totalRevenue || 0, family.locale, family.currencyCode)}</div>
                    </CardContent>
                </Card>
                <Card className="border-2 border-blue-300" style={{ background: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)" }}>
                    <CardContent className="p-5 text-center">
                        <div className="text-4xl mb-2">{todayApproved ? "✅" : "📚"}</div>
                        <div className="text-sm text-blue-800 font-bold">Study Time</div>
                        <div className="text-2xl font-extrabold text-blue-900">{todayApproved ? "Done!" : "Do it!"}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// ─── Professional Dashboard (Ages 10+) ────────────────────────────

function ProDashboard() {
    const { currentUser, currentCompany, academicLogs, family } = useDemoData();
    const todayApproved = academicLogs.some(l => l.userId === currentUser.id && l.status === TaskStatus.APPROVED);

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">{currentCompany?.name || "Your Company"}</h2>
                <p className="text-zinc-400 mt-1">CEO: {currentUser.name} · Marketplace {todayApproved ? <span className="text-emerald-400 font-semibold">🟢 Unlocked</span> : <span className="text-rose-400 font-semibold">🔒 Locked</span>}</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-6 flex items-center gap-8">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <svg className="absolute inset-0" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#27272a" strokeWidth="8" />
                            <circle cx="60" cy="60" r="54" fill="none" stroke="#10b981" strokeWidth="8"
                                strokeDasharray={`${((currentCompany?.creditScore || 750) - 300) / 550 * 339} 339`}
                                strokeLinecap="round" transform="rotate(-90 60 60)" />
                        </svg>
                        <div className="text-center">
                            <div className="text-3xl font-extrabold text-emerald-400">{currentCompany?.creditScore || 750}</div>
                            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">FICO</div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="text-zinc-400 text-sm">Your credit score determines tool lease rates and access to premium contracts.</div>
                        <div className="grid grid-cols-3 gap-4 mt-2">
                            <div><div className="text-xs text-zinc-500">Spending</div><div className="text-lg font-bold text-zinc-100">{formatCurrency(currentCompany?.spendingBalance || 0, family.locale, family.currencyCode)}</div></div>
                            <div><div className="text-xs text-zinc-500">Savings</div><div className="text-lg font-bold text-indigo-400">{formatCurrency(currentCompany?.savingsBalance || 0, family.locale, family.currencyCode)}</div></div>
                            <div><div className="text-xs text-zinc-500">R&D Fund</div><div className="text-lg font-bold text-amber-400">{formatCurrency(currentCompany?.reinvestBalance || 0, family.locale, family.currencyCode)}</div></div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Total Revenue</div>
                    <div className="text-2xl font-bold text-emerald-400">{formatCurrency(currentCompany?.totalRevenue || 0, family.locale, family.currencyCode)}</div>
                </CardContent></Card>
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Overhead Costs</div>
                    <div className="text-2xl font-bold text-rose-400">{formatCurrency(currentCompany?.overheadCost || 0, family.locale, family.currencyCode)}</div>
                </CardContent></Card>
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">R&D Status Today</div>
                    <div className="text-2xl font-bold">{todayApproved ? <span className="text-emerald-400">✓ Verified</span> : <span className="text-amber-400">Pending</span>}</div>
                </CardContent></Card>
            </div>
        </div>
    );
}

// ─── Route ─────────────────────────────────────────────────────────

export default function CEODashboard() {
    const { isJunior } = useDemoData();
    return isJunior ? <JuniorDashboard /> : <ProDashboard />;
}
