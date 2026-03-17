"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDemoData } from "@/lib/demo/DemoContext";
import { Role } from "@/lib/types/schema";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// ─── Professional Nav (Teens / Adults) ───────────────────────────

const boardLinks = [
    { href: "/board", label: "Overview", icon: "📊" },
    { href: "/board/compliance", label: "R&D Compliance", icon: "🎓" },
    { href: "/board/contracts", label: "Post RFP", icon: "📋" },
    { href: "/board/qa", label: "QA Center", icon: "✅" },
    { href: "/board/equipment", label: "Motor Pool", icon: "🔧" },
    { href: "/board/settings", label: "Global Settings", icon: "⚙️" },
];

const ceoLinks = [
    { href: "/ceo", label: "My Company", icon: "🏢" },
    { href: "/ceo/rd", label: "Log R&D", icon: "📚" },
    { href: "/ceo/marketplace", label: "Marketplace", icon: "🛒" },
    { href: "/ceo/active", label: "Active Jobs", icon: "⚡" },
    { href: "/ceo/earnings", label: "Earnings Report", icon: "📈" },
];

// ─── Kid-Friendly Nav (Ages 6-9) ──────────────────────────────────

const kidLinks = [
    { href: "/ceo", label: "My Shop", icon: "🏠" },
    { href: "/ceo/rd", label: "Study Time", icon: "📖" },
    { href: "/ceo/marketplace", label: "Chore Store", icon: "🌟" },
    { href: "/ceo/active", label: "My Tasks", icon: "🎯" },
    { href: "/ceo/earnings", label: "My Piggy Bank", icon: "🐷" },
];

export function Sidebar() {
    const pathname = usePathname();
    const { currentUser, switchRole, switchChild, isJunior, currentCompany, companies } = useDemoData();
    const isBoard = currentUser.role === Role.BOARD;
    const links = isBoard ? boardLinks : (isJunior ? kidLinks : ceoLinks);

    // ─── Kid-Friendly Sidebar ────────────────────────────────────
    if (!isBoard && isJunior) {
        return (
            <aside className="w-64 min-h-screen flex flex-col" style={{ background: "linear-gradient(180deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)" }}>
                {/* Kid Header */}
                <div className="p-5 text-center border-b border-amber-300/50">
                    <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-3">
                        <Image src="/assets/avatar-girl.png" alt="Your Avatar" width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-xl font-extrabold text-amber-900 tracking-tight">
                        Hi, {currentUser.name.split(" ")[0]}! 👋
                    </h1>
                    <p className="text-sm text-amber-700 mt-1">{currentCompany?.name || "My Little Shop"}</p>
                </div>

                {/* Stars / Score */}
                <div className="px-5 py-3 text-center border-b border-amber-300/50">
                    <div className="text-3xl">⭐⭐⭐⭐</div>
                    <div className="text-xs text-amber-800 mt-1 font-semibold">Super Star Helper!</div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 px-3 py-4 space-y-2">
                    {links.map(link => {
                        const active = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${active
                                    ? "bg-white shadow-md text-amber-900 scale-[1.02]"
                                    : "text-amber-800 hover:bg-white/60 hover:shadow-sm"
                                    }`}
                            >
                                <span className="text-2xl">{link.icon}</span>
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Switcher */}
                <div className="p-4 border-t border-amber-300/50 space-y-2">
                    <div className="text-xs text-amber-700 uppercase font-bold mb-1">Switch</div>
                    <Button size="sm" onClick={() => switchRole(Role.BOARD)} className="w-full text-xs bg-amber-600 hover:bg-amber-500 text-white rounded-xl">
                        Parent View
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => switchChild("child-1")} className="w-full text-xs border-amber-400 text-amber-800 hover:bg-amber-200 rounded-xl">
                        Leo (Teen)
                    </Button>
                </div>
            </aside>
        );
    }

    // ─── Professional Sidebar (Board or Teen CEO) ────────────────
    return (
        <aside className="w-64 min-h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                    <Image src="/assets/logo.png" alt="Prodigy Chore Suite" width={36} height={36} className="rounded-md" />
                    <div>
                        <h1 className="text-base font-extrabold text-emerald-400 tracking-tight leading-tight">
                            Prodigy
                        </h1>
                        <p className="text-[10px] text-zinc-500 leading-tight">Chore Suite</p>
                    </div>
                </div>
            </div>

            {/* Role Badge */}
            <div className="px-5 py-4 border-b border-zinc-800">
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Logged in as</div>
                <div className="font-semibold text-zinc-100">{currentUser.name}</div>
                <div className="text-xs text-zinc-400 mt-0.5">
                    {isBoard ? "Board of Directors" : currentCompany?.name || "CEO"}
                </div>
                {!isBoard && (
                    <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-zinc-500">FICO:</span>
                        <span className="text-sm font-bold text-emerald-400">{currentCompany?.creditScore || 750}</span>
                    </div>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-3 py-4 space-y-1">
                {links.map(link => {
                    const active = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${active
                                ? "bg-emerald-900/30 text-emerald-400 font-medium"
                                : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900"
                                }`}
                        >
                            <span className="text-base">{link.icon}</span>
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Role Switcher */}
            <div className="p-4 border-t border-zinc-800 space-y-2">
                <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">Demo: Switch View</div>
                <Button
                    size="sm"
                    variant={isBoard ? "default" : "outline"}
                    className={`w-full text-xs ${isBoard ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"}`}
                    onClick={() => switchRole(Role.BOARD)}
                >
                    Board (Parent)
                </Button>
                <Button
                    size="sm"
                    variant={!isBoard && !isJunior ? "default" : "outline"}
                    className={`w-full text-xs ${!isBoard && !isJunior ? "bg-emerald-600 hover:bg-emerald-500 text-white" : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"}`}
                    onClick={() => switchChild("child-1")}
                >
                    Leo (Teen CEO)
                </Button>
                <Button
                    size="sm"
                    variant={isJunior ? "default" : "outline"}
                    className={`w-full text-xs ${isJunior ? "bg-amber-500 hover:bg-amber-400 text-white" : "border-zinc-700 text-zinc-400 hover:bg-zinc-800"}`}
                    onClick={() => switchChild("child-2")}
                >
                    Mia (Junior 🧒)
                </Button>
            </div>
        </aside>
    );
}
