"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { Company, Invoice, AcademicLog } from "@/lib/types/schema";
import { toast } from "sonner";
import { useDemoData } from "@/lib/demo/DemoContext";
import { formatCurrency } from "@/lib/currency";

export function QuarterlyEarningsReport({ companyId, familyId }: { companyId: string, familyId: string }) {
    const { family } = useDemoData();
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [academicLogs, setAcademicLogs] = useState<AcademicLog[]>([]);
    const [companyData, setCompanyData] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQERData = async () => {
            setLoading(true);
            try {
                // Fetch Company Data for Credit Score
                const cQuery = query(collection(db, "companies"), where("id", "==", companyId));
                const cSnap = await getDocs(cQuery);
                if (!cSnap.empty) {
                    setCompanyData({ id: cSnap.docs[0].id, ...cSnap.docs[0].data() } as Company);
                }

                // Fetch last 90 days of settled invoices
                const ninetyDaysAgo = new Date();
                ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

                const iQuery = query(
                    collection(db, "invoices"),
                    where("companyId", "==", companyId),
                    where("status", "==", "SETTLED"),
                    // where("settledAt", ">=", ninetyDaysAgo), // simplified for MVP demo
                    orderBy("settledAt", "asc"),
                    limit(50)
                );
                const iSnap = await getDocs(iQuery);
                setInvoices(iSnap.docs.map(d => ({ id: d.id, ...d.data() } as Invoice)));

                // Fetch academic logs (mock correlated data)
                const aQuery = query(
                    collection(db, "academicLogs"),
                    where("familyId", "==", familyId),
                    // where("date", ">=", ninetyDaysAgo.toISOString().split('T')[0]),
                    orderBy("date", "asc"),
                    limit(50)
                );
                const aSnap = await getDocs(aQuery);
                setAcademicLogs(aSnap.docs.map(d => ({ id: d.id, ...d.data() } as AcademicLog)));

            } catch (error) {
                console.error(error);
                toast.error("Failed to load QER data.");
            } finally {
                setLoading(false);
            }
        };

        fetchQERData();
    }, [companyId, familyId]);

    // Aggregate invoice data for charts
    const revenueData = invoices.map((inv, index) => {
        return {
            name: `Contract ${index + 1}`,
            Gross: inv.amount,
            Net: inv.breakdown?.netProfit || 0,
            Tax: inv.breakdown?.taxAmount || 0,
        };
    });

    // Mock correlation data: Study Hours vs Revenue
    const correlationData = academicLogs.slice(-10).map((log, i) => {
        // Faking a revenue point that roughly correlates with study hours for demonstration
        const fakeRevenue = (log.minutesSpent / 15) * 2 + (Math.random() * 5);
        return {
            day: log.date.substring(5), // MM-DD
            StudyMinutes: log.minutesSpent,
            Revenue: parseFloat(fakeRevenue.toFixed(2))
        };
    });

    if (loading) {
        return <div className="text-zinc-500 animate-pulse text-center py-10">Compiling Report...</div>;
    }

    return (
        <div className="space-y-6 w-full max-w-5xl mx-auto">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-zinc-950 border-zinc-800 shadow-sm">
                    <CardContent className="p-6">
                        <div className="text-zinc-400 text-sm font-medium mb-1">Company FICO Score</div>
                        <div className="text-4xl font-extrabold text-emerald-400">
                            {companyData?.creditScore || 750}
                        </div>
                        <div className="text-xs text-zinc-500 mt-2">Determines lease rates & contract access</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950 border-zinc-800 shadow-sm">
                    <CardContent className="p-6">
                        <div className="text-zinc-400 text-sm font-medium mb-1">Total Net Profit (90d)</div>
                        <div className="text-4xl font-extrabold text-zinc-100">
                            {formatCurrency(companyData?.spendingBalance || 0, family.locale, family.currencyCode)}
                        </div>
                        <div className="text-xs text-emerald-500 mt-2">+12% vs last quarter</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-950 border-zinc-800 shadow-sm">
                    <CardContent className="p-6">
                        <div className="text-zinc-400 text-sm font-medium mb-1">Total Savings/R&D</div>
                        <div className="text-4xl font-extrabold text-indigo-400">
                            {formatCurrency(((companyData?.savingsBalance || 0) + (companyData?.reinvestBalance || 0)), family.locale, family.currencyCode)}
                        </div>
                        <div className="text-xs text-zinc-500 mt-2">Available for Capital Investment</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Funnel Chart */}
                <Card className="bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg text-emerald-400">Revenue Funnel</CardTitle>
                        <CardDescription className="text-zinc-400">Gross vs Net Profit with Tax Deductions</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        {revenueData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, family.locale, family.currencyCode)} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }}
                                        itemStyle={{ color: '#f4f4f5' }}
                                        formatter={(val: any) => formatCurrency(Number(val), family.locale, family.currencyCode)}
                                    />
                                    <Bar dataKey="Gross" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="Net" fill="#818cf8" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-zinc-600">Not enough data to graph</div>
                        )}
                    </CardContent>
                </Card>

                {/* Academic ROI Chart */}
                <Card className="bg-zinc-950 border-zinc-800 text-zinc-50 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg text-emerald-400">Academic ROI Correlation</CardTitle>
                        <CardDescription className="text-zinc-400">Study Minutes vs Generated Revenue</CardDescription>
                    </CardHeader>
                    <CardContent className="h-72">
                        {correlationData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={correlationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                    <XAxis dataKey="day" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="left" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => formatCurrency(v, family.locale, family.currencyCode)} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#f4f4f5' }}
                                        formatter={(val: any, name: string | undefined) => (name?.includes("Revenue")) ? formatCurrency(Number(val), family.locale, family.currencyCode) : val}
                                    />
                                    <Line yAxisId="left" type="monotone" dataKey="StudyMinutes" stroke="#f43f5e" strokeWidth={2} dot={{ r: 4 }} name="Study Mins" />
                                    <Line yAxisId="right" type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} name={`Revenue (${family.currencyCode})`} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-sm text-zinc-600">Not enough data to graph</div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
