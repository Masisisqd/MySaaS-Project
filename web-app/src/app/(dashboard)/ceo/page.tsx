"use client";

import DashboardRouter from "@/components/DashboardRouter";
import { AnimatePresence, motion } from "framer-motion";

export default function CEODashboardPage() {
    return (
        <AnimatePresence mode="popLayout">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
            >
                <DashboardRouter />
            </motion.div>
        </AnimatePresence>
    );
}
