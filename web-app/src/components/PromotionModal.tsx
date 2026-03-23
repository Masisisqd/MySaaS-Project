"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Loader2, Crown, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function PromotionModal({ user, onClose }: { user: any, onClose: () => void }) {
    const [accepting, setAccepting] = useState(false);

    useEffect(() => {
        // Fire confetti magically on mount
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const handleAccept = async () => {
        setAccepting(true);
        try {
            await updateDoc(doc(db, "users", user.id), {
                pendingPromotionNotification: false
            });
            onClose(); 
        } catch (error) {
            console.error("Failed to dismiss promotion notification", error);
            toast.error("Network error. Could not accept promotion right now.");
            setAccepting(false);
        }
    };

    const isPartner = user.ageGroup === "PARTNER";
    const isAssociate = user.ageGroup === "ASSOCIATE";

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="max-w-md w-full bg-zinc-900 border-2 border-emerald-500/50 rounded-2xl p-8 text-center space-y-6 shadow-2xl overflow-hidden relative"
                    initial={{ scale: 0.8, y: 50, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.5, duration: 0.8 }}
                >
                    {/* Glowing background effect */}
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-600 opacity-20 blur-2xl -z-10 animate-pulse" />

                    <div className="mx-auto w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                        <Crown className="w-10 h-10 text-emerald-400" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white">New Tier Unlocked!</h2>
                        <p className="text-zinc-400">
                            Congratulations! You've officially been promoted to {user.ageGroup} status.
                        </p>
                    </div>

                    <div className="bg-zinc-950/50 rounded-xl p-5 border border-zinc-800 text-left space-y-3">
                        <p className="text-sm font-medium text-emerald-400 uppercase tracking-widest mb-1">New Capabilities</p>
                        <ul className="space-y-3">
                            {isPartner && (
                                <>
                                    <li className="flex items-start gap-3 text-zinc-300 text-sm">
                                        <Star className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span>Full Enterprise Dashboard access with SLA metrics and corporate taxation tools.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-zinc-300 text-sm">
                                        <Star className="w-5 h-5 text-emerald-500 shrink-0" />
                                        <span>Submit B2B invoices directly for major contracts.</span>
                                    </li>
                                </>
                            )}
                            {isAssociate && (
                                <>
                                    <li className="flex items-start gap-3 text-zinc-300 text-sm">
                                        <Star className="w-5 h-5 text-indigo-400 shrink-0" />
                                        <span>Pro-style Kanban tracker for managing Service Orders independently.</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-zinc-300 text-sm">
                                        <Star className="w-5 h-5 text-indigo-400 shrink-0" />
                                        <span>Access to premium Tool Rentals (Lawnmowers, vacuums) for higher yield chores.</span>
                                    </li>
                                </>
                            )}
                            {!isPartner && !isAssociate && (
                                <li className="flex items-start gap-3 text-zinc-300 text-sm">
                                    <Star className="w-5 h-5 text-emerald-500 shrink-0" />
                                    <span>Welcome to Prodigy! Level up your Avatar by finishing bounties.</span>
                                </li>
                            )}
                        </ul>
                    </div>

                    <button
                        onClick={handleAccept}
                        disabled={accepting}
                        className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                    >
                        {accepting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                Accept Promotion <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
