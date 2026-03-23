"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, Star, Trophy, ShieldAlert } from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function JuniorDashboard({ user, theme }: { user: any, theme: string }) {
    const company = user?.company;
    // Neobrutalism styling variables
    const borderStyle = "border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]";
    const bgYellow = "bg-[#FFDE00]";
    const bgPink = "bg-[#FF90E8]";
    const bgCyan = "bg-[#2EE59D]";
    
    // Derived dummy data for avatar level and features
    const level = Math.max(1, Math.floor((company?.totalRevenue || 0) / 10));
    const nextLevelReq = level * 10;
    const progress = ((company?.totalRevenue || 0) % 10) / 10 * 100;
    
    const handleAudioAssist = () => {
        const msg = new SpeechSynthesisUtterance("Welcome to the Command Post! Let's complete some bounties to earn more stars!");
        window.speechSynthesis.speak(msg);
    };

    return (
        <div className={`space-y-8 max-w-4xl mx-auto p-4 md:p-8 rounded-[var(--radius)] min-h-screen ${theme} font-heading bg-[var(--background)] text-black`}>
            {/* Header & Avatar */}
            <div className={`flex items-center justify-between p-6 rounded-2xl ${bgYellow} ${borderStyle}`}>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className={`w-24 h-24 rounded-full border-4 border-black bg-white overflow-hidden flex items-center justify-center`}>
                            <span className="text-5xl">🤖</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black text-white px-2 py-1 rounded-md text-sm font-bold border-2 border-white">
                            LVL {level}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-black tracking-tight uppercase">The Command Post</h2>
                        <p className="text-black font-bold mt-1 uppercase">CEO {company?.name || "Company"}</p>
                    </div>
                </div>
                <Button 
                    onClick={handleAudioAssist}
                    className={`h-16 w-16 rounded-full border-4 border-black bg-white hover:bg-zinc-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none`}
                >
                    <Volume2 size={32} className="text-black" />
                </Button>
            </div>

            {/* Bounties & Stars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className={`rounded-xl overflow-hidden ${borderStyle} ${bgPink}`}>
                    <CardContent className="p-6 text-black">
                        <div className="flex items-center gap-2 mb-4">
                            <Star size={32} className="fill-black" />
                            <h3 className="text-2xl font-black uppercase">My Piggy Bank</h3>
                        </div>
                        <div className="text-6xl font-black mb-4">
                            {formatCurrency(company?.spendingBalance || 0, "en-US", "USD")}
                        </div>
                        <div className="w-full bg-white border-4 border-black h-8 rounded-full overflow-hidden">
                            <div className="bg-[#2EE59D] h-full border-r-4 border-black" style={{ width: `${progress}%` }}></div>
                        </div>
                        <div className="mt-2 text-sm font-bold uppercase text-right">
                            {100 - progress}% to next level
                        </div>
                    </CardContent>
                </Card>

                <Card className={`rounded-xl overflow-hidden ${borderStyle} bg-white`}>
                    <CardContent className="p-6 text-black flex flex-col items-center justify-center h-full">
                        <Trophy size={48} className="mb-4" />
                        <h3 className="text-2xl font-black uppercase mb-6">Active Bounties</h3>
                        <Button className={`w-full py-8 text-2xl font-black uppercase rounded-xl border-4 border-black ${bgCyan} text-black hover:bg-[#1bc683] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-none`}>
                            Hunt Bounties
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
