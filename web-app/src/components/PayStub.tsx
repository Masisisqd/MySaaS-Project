"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDemoData } from "@/lib/demo/DemoContext";
import { formatCurrency, CountryCurrencyMap } from "@/lib/currency";

interface PayStubProps {
    grossRevenue: number;
    taxAmount: number;
    savingsAmount: number;
    reinvestAmount: number;
    toolRentalFees: number;
    netProfit: number;
    onClose: () => void;
}

export function PayStub({
    grossRevenue,
    taxAmount,
    savingsAmount,
    reinvestAmount,
    toolRentalFees,
    netProfit,
    onClose
}: PayStubProps) {
    const { family } = useDemoData();
    const currencyInfo = CountryCurrencyMap[family.countryCode || "USA"];

    return (
        <Card className="w-full max-w-sm bg-zinc-950 border-zinc-800 text-zinc-50 shadow-2xl">
            <CardHeader className="text-center pb-2 border-b border-zinc-800">
                <div className="mx-auto bg-emerald-900/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                    <span className="text-emerald-400 text-2xl font-bold">{currencyInfo.symbol}</span>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight text-zinc-100">
                    Invoice Settled
                </CardTitle>
                <CardDescription className="text-zinc-400">
                    Official Payment Stub
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-3 font-mono text-sm">
                    <div className="flex justify-between items-center text-zinc-300">
                        <span>Gross Revenue</span>
                        <span className="font-semibold text-zinc-100">{formatCurrency(grossRevenue, family.locale, family.currencyCode)}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-400/80">
                        <span>Tool Rental</span>
                        <span>-{formatCurrency(toolRentalFees, family.locale, family.currencyCode)}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-400/80">
                        <span>Household Tax (20%)</span>
                        <span>-{formatCurrency(taxAmount, family.locale, family.currencyCode)}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-400/80">
                        <span>Mandatory Savings (30%)</span>
                        <span>-{formatCurrency(savingsAmount, family.locale, family.currencyCode)}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-400/80 mb-2 pb-2 border-b border-dashed border-zinc-700">
                        <span>Business R&D (10%)</span>
                        <span>-{formatCurrency(reinvestAmount, family.locale, family.currencyCode)}</span>
                    </div>

                    <div className="flex justify-between items-center text-base pt-2">
                        <span className="text-zinc-100 font-bold">Net Profit</span>
                        <span className="text-emerald-400 font-bold text-lg">{formatCurrency(netProfit, family.locale, family.currencyCode)}</span>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2">
                <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full border-zinc-800 text-zinc-300 hover:bg-zinc-800"
                >
                    Close Stub
                </Button>
            </CardFooter>
        </Card>
    );
}
