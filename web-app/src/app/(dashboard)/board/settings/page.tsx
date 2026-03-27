"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { COUNTRIES, type CountryInfo } from "@/lib/countries";
import { formatCurrency } from "@/lib/currency";
import { toast } from "sonner";
import { Globe, Check, AlertTriangle, Search, Shield, Clock } from "lucide-react";
import { Command } from "cmdk";

export default function BoardSettingsPage() {
    const { user, userData } = useAuth();
    const [familyData, setFamilyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [tzSearch, setTzSearch] = useState("");
    const [open, setOpen] = useState(false);
    const [tzOpen, setTzOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    
    // Timezones cache
    const timezones = Intl.supportedValuesOf('timeZone');

    // Fetch family data from Firestore
    useEffect(() => {
        if (!userData?.familyId) {
            setLoading(false);
            return;
        }
        const fetchFamily = async () => {
            try {
                const familyDoc = await getDoc(doc(db, "families", userData.familyId));
                if (familyDoc.exists()) {
                    setFamilyData({ id: familyDoc.id, ...familyDoc.data() });
                }
            } catch (err) {
                console.error("Failed to fetch family settings", err);
                toast.error("Failed to load family settings");
            } finally {
                setLoading(false);
            }
        };
        fetchFamily();
    }, [userData?.familyId]);

    const handleCountrySelect = async (country: CountryInfo) => {
        if (!familyData?.id) return;
        setSaving(true);
        setOpen(false);

        try {
            await updateDoc(doc(db, "families", familyData.id), {
                countryCode: country.code,
                currencyCode: country.currencyCode,
                locale: country.locale,
            });

            setFamilyData((prev: any) => ({
                ...prev,
                countryCode: country.code,
                currencyCode: country.currencyCode,
                locale: country.locale,
            }));

            toast.success(`Jurisdiction updated: ${country.name} → ${country.currencyCode} (${country.symbol})`);
        } catch (err) {
            console.error("Failed to update currency settings", err);
            toast.error("Permission denied or network error");
        } finally {
            setSaving(false);
        }
    };

    const handleTimezoneSelect = async (tz: string) => {
        if (!familyData?.id) return;
        setSaving(true);
        setTzOpen(false);

        try {
            await updateDoc(doc(db, "families", familyData.id), {
                timezone: tz,
            });

            setFamilyData((prev: any) => ({
                ...prev,
                timezone: tz,
            }));

            toast.success(`Timezone updated to ${tz}`);
        } catch (err) {
            console.error("Failed to update timezone settings", err);
            toast.error("Permission denied or network error");
        } finally {
            setSaving(false);
        }
    };

    const selectedCountry = COUNTRIES.find(c => c.code === familyData?.countryCode);
    const currentLocale = familyData?.locale || "en-US";
    const currentCurrency = familyData?.currencyCode || "USD";
    const currentTimezone = familyData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    if (loading) {
        return <div className="text-zinc-400 p-8 animate-pulse text-lg">Loading Global Settings...</div>;
    }

    return (
        <div className="space-y-8 max-w-4xl">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-zinc-100 tracking-tight">Global Settings</h1>
                <p className="text-zinc-400 mt-1">Configure your family organization's jurisdiction and currency standards.</p>
            </div>

            {/* Core Infrastructure Warning */}
            <div className="flex items-start gap-3 bg-amber-950/30 border border-amber-800/50 rounded-xl p-4">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                    <p className="text-sm font-semibold text-amber-400">Core Infrastructure — Board Only</p>
                    <p className="text-xs text-amber-600 mt-1">
                        Changing the operating currency is a macro-economic decision that affects all subsidiaries.
                        This setting is restricted to Board members only. CEO accounts cannot access these controls.
                    </p>
                </div>
            </div>

            {/* Jurisdiction & Currency Card */}
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

                    {/* Searchable Country Combobox */}
                    <div className="relative">
                        <Label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                            <Shield className="w-3 h-3 inline mr-1" />
                            Operating Jurisdiction
                        </Label>

                        {/* Trigger Button */}
                        <button
                            onClick={() => setOpen(!open)}
                            disabled={saving}
                            className="w-full flex items-center justify-between px-4 py-3 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-left hover:border-zinc-700 transition-colors disabled:opacity-50"
                        >
                            {selectedCountry ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-zinc-100 font-medium">{selectedCountry.name}</span>
                                    <span className="text-xs font-mono text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded">
                                        {selectedCountry.currencyCode} • {selectedCountry.symbol}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-zinc-500">Select a country...</span>
                            )}
                            <Search className="w-4 h-4 text-zinc-500" />
                        </button>

                        {/* Dropdown */}
                        {open && (
                            <div className="absolute z-50 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
                                <Command className="bg-transparent">
                                    <div className="flex items-center gap-2 px-3 border-b border-zinc-800">
                                        <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                                        <Command.Input
                                            value={search}
                                            onValueChange={setSearch}
                                            placeholder="Search 195+ countries..."
                                            className="w-full py-3 bg-transparent text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <Command.List className="max-h-[300px] overflow-y-auto p-1">
                                        <Command.Empty className="p-4 text-center text-sm text-zinc-500">
                                            No countries found.
                                        </Command.Empty>
                                        {COUNTRIES.map((country) => {
                                            const isSelected = country.code === familyData?.countryCode;
                                            return (
                                                <Command.Item
                                                    key={country.code}
                                                    value={`${country.name} ${country.currencyCode} ${country.code}`}
                                                    onSelect={() => handleCountrySelect(country)}
                                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-100 text-zinc-400 hover:text-zinc-200"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="font-medium text-zinc-200">{country.name}</span>
                                                        <span className="text-xs font-mono text-zinc-600">({country.code})</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-mono text-zinc-500">
                                                            {country.currencyCode} {country.symbol}
                                                        </span>
                                                        {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                                                    </div>
                                                </Command.Item>
                                            );
                                        })}
                                    </Command.List>
                                </Command>
                            </div>
                        )}
                    </div>

                    {/* Searchable Timezone Combobox */}
                    <div className="relative mt-4">
                        <Label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">
                            <Clock className="w-3 h-3 inline mr-1" />
                            Local Reset Timezone
                        </Label>

                        {/* Trigger Button */}
                        <button
                            onClick={() => setTzOpen(!tzOpen)}
                            disabled={saving}
                            className="w-full flex items-center justify-between px-4 py-3 bg-zinc-950 border-2 border-zinc-800 rounded-xl text-left hover:border-zinc-700 transition-colors disabled:opacity-50"
                        >
                            <span className="text-zinc-100 font-medium font-mono">{currentTimezone}</span>
                            <Search className="w-4 h-4 text-zinc-500" />
                        </button>

                        {/* Dropdown */}
                        {tzOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden max-h-[300px]">
                                <Command className="bg-transparent">
                                    <div className="flex items-center gap-2 px-3 border-b border-zinc-800">
                                        <Search className="w-4 h-4 text-zinc-500 shrink-0" />
                                        <Command.Input
                                            value={tzSearch}
                                            onValueChange={setTzSearch}
                                            placeholder="Search timezones (e.g., America/New_York)..."
                                            className="w-full py-3 bg-transparent text-zinc-100 text-sm outline-none placeholder:text-zinc-600"
                                        />
                                    </div>
                                    <Command.List className="overflow-y-auto p-1">
                                        <Command.Empty className="p-4 text-center text-sm text-zinc-500">
                                            No timezone found.
                                        </Command.Empty>
                                        {timezones.map((tz) => {
                                            const isSelected = tz === currentTimezone;
                                            return (
                                                <Command.Item
                                                    key={tz}
                                                    value={tz}
                                                    onSelect={() => handleTimezoneSelect(tz)}
                                                    className="flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-100 text-zinc-400 hover:text-zinc-200"
                                                >
                                                    <span className="font-medium text-zinc-200">{tz}</span>
                                                    {isSelected && <Check className="w-4 h-4 text-emerald-500" />}
                                                </Command.Item>
                                            );
                                        })}
                                    </Command.List>
                                </Command>
                            </div>
                        )}
                    </div>

                    {/* Live Config Preview */}
                    <div className="bg-zinc-950 rounded-xl p-5 border border-zinc-800">
                        <h4 className="text-sm font-semibold text-zinc-300 mb-3">Current Configuration Preview</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Country</Label>
                                <div className="text-zinc-100 font-medium">{selectedCountry?.name || "Not Set"}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Currency (ISO 4217)</Label>
                                <div className="text-zinc-100 font-medium">{currentCurrency}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Locale</Label>
                                <div className="text-zinc-100 font-medium">{currentLocale}</div>
                            </div>
                            <div>
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider">Format Example</Label>
                                <div className="text-emerald-400 font-bold">
                                    {formatCurrency(1250.50, currentLocale, currentCurrency)}
                                </div>
                            </div>
                            <div className="col-span-2 sm:col-span-4 mt-2 pt-4 border-t border-zinc-800/50">
                                <Label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-1">Live Local Time (SLA / Deadlines)</Label>
                                <div className="text-zinc-300 font-mono text-sm tracking-tight">
                                    {new Intl.DateTimeFormat(currentLocale, { 
                                        timeZone: currentTimezone, 
                                        dateStyle: 'full', 
                                        timeStyle: 'long' 
                                    }).format(new Date())}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
