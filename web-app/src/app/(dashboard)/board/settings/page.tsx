"use client";

import { useDemoData } from "@/lib/demo/DemoContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CountryCurrencyMap } from "@/lib/currency";
import { toast } from "sonner";
import { Globe, Check } from "lucide-react";

export default function BoardSettingsPage() {
    const { family, updateFamilySettings } = useDemoData();

    const handleCountryChange = (countryKey: string) => {
        const config = CountryCurrencyMap[countryKey];
        if (config) {
            updateFamilySettings({
                countryCode: countryKey,
                currencyCode: config.currencyCode,
                locale: config.locale
            });
            toast.success(`Currency updated to ${config.currencyCode} (${config.symbol})`);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Global Settings</h1>
                <p className="text-zinc-400 mt-1">Configure your family organization's jurisdiction and currency standards.</p>
            </div>

            <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                    <div className="flex items-center gap-2 text-emerald-400 mb-1">
                        <Globe className="w-5 h-5" />
                        <CardTitle className="text-lg">Jurisdiction & Currency</CardTitle>
                    </div>
                    <CardDescription className="text-zinc-500">
                        Select your country to automatically set the local currency and formatting rules (ISO 4217).
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {Object.entries(CountryCurrencyMap).map(([key, info]) => {
                            const isSelected = family.countryCode === key;
                            return (
                                <button
                                    key={key}
                                    onClick={() => handleCountryChange(key)}
                                    className={`flex flex-col p-4 rounded-xl border-2 transition-all text-left group ${
                                        isSelected
                                            ? "border-emerald-500 bg-emerald-500/10"
                                            : "border-zinc-800 bg-zinc-950 hover:border-zinc-700 hover:bg-zinc-900"
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400">
                                            {key}
                                        </span>
                                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                    <div className="text-lg font-bold text-zinc-100">{info.currencyCode}</div>
                                    <div className="text-sm text-zinc-500 flex items-center gap-1">
                                        Symbol: <span className="text-zinc-300 font-mono">{info.symbol}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="bg-zinc-950 rounded-lg p-4 border border-zinc-800">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-2">Current Configuration Preview</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Country</Label>
                                <div className="text-zinc-100 font-medium">{family.countryCode || "Not Set"}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Currency</Label>
                                <div className="text-zinc-100 font-medium">{family.currencyCode || "USD"}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Locale</Label>
                                <div className="text-zinc-100 font-medium">{family.locale || "en-US"}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Format Example</Label>
                                <div className="text-emerald-400 font-bold">
                                    {new Intl.NumberFormat(family.locale || "en-US", { style: 'currency', currency: family.currencyCode || 'USD' }).format(1250.50)}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
