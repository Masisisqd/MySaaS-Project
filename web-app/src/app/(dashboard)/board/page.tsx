"use client";

import { useDemoData } from "@/lib/demo/DemoContext";
import { Card, CardContent } from "@/components/ui/card";
import { ChoreStatus } from "@/lib/types/schema";
import { formatCurrency } from "@/lib/currency";
import { ExportQBRButton } from "@/components/qbr/ExportQBRButton";

export default function BoardOverview() {
    const { family, companies, contracts, equipment, academicLogs } = useDemoData();

    const pendingQA = contracts.filter(c => c.status === ChoreStatus.PENDING_QA).length;
    const activeContracts = contracts.filter(c => c.status === ChoreStatus.IN_PROGRESS).length;
    const openRFPs = contracts.filter(c => c.status === ChoreStatus.AVAILABLE).length;
    const lowCondition = equipment.filter(e => e.condition < 50).length;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-extrabold text-zinc-100 tracking-tight">{family.companyName}</h2>
                <p className="text-zinc-400 mt-1">Board of Directors — Macro-Economic View</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Open RFPs</div>
                    <div className="text-3xl font-bold text-emerald-400">{openRFPs}</div>
                </CardContent></Card>

                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Active Contracts</div>
                    <div className="text-3xl font-bold text-indigo-400">{activeContracts}</div>
                </CardContent></Card>

                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Pending QA</div>
                    <div className="text-3xl font-bold text-amber-400">{pendingQA}</div>
                </CardContent></Card>

                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Tools Needing Repair</div>
                    <div className="text-3xl font-bold text-rose-400">{lowCondition}</div>
                </CardContent></Card>
            </div>

            {/* Family Funds */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Community Fund (Tax Pot)</div>
                    <div className="text-3xl font-bold text-emerald-400">{formatCurrency(family.communityFund, family.locale, family.currencyCode)}</div>
                    <div className="text-xs text-zinc-500 mt-1">For shared treats — pizza night, outings</div>
                </CardContent></Card>
                <Card className="bg-zinc-900 border-zinc-800"><CardContent className="p-5">
                    <div className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Equipment Maintenance Fund</div>
                    <div className="text-3xl font-bold text-indigo-400">{formatCurrency(family.equipmentMaintenanceFund, family.locale, family.currencyCode)}</div>
                    <div className="text-xs text-zinc-500 mt-1">From tool rental fees</div>
                </CardContent></Card>
            </div>

            {/* Company Overview */}
            <div>
                <h3 className="text-lg font-semibold text-zinc-200 mb-4">Subsidiary Companies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companies.map(company => (
                        <Card key={company.id} className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-5">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="font-semibold text-zinc-100 text-lg">{company.name}</div>
                                        <div className="text-sm text-zinc-400 mt-0.5">Revenue: <span className="text-emerald-400">{formatCurrency(company.totalRevenue, family.locale, family.currencyCode)}</span></div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-zinc-500">FICO</div>
                                        <div className={`text-2xl font-bold ${company.creditScore >= 750 ? "text-emerald-400" : company.creditScore >= 600 ? "text-amber-400" : "text-rose-400"}`}>
                                            {company.creditScore}
                                        </div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                                    <div>
                                        <div className="text-xs text-zinc-500">Spending</div>
                                        <div className="text-sm font-semibold text-zinc-200">{formatCurrency(company.spendingBalance, family.locale, family.currencyCode)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500">Savings</div>
                                        <div className="text-sm font-semibold text-zinc-200">{formatCurrency(company.savingsBalance, family.locale, family.currencyCode)}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-zinc-500">Reinvest</div>
                                        <div className="text-sm font-semibold text-zinc-200">{formatCurrency(company.reinvestBalance, family.locale, family.currencyCode)}</div>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-end">
                                    <ExportQBRButton companyId={company.id} />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
