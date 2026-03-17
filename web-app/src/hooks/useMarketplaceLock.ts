import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { TaskStatus } from "@/lib/types/schema";

export function useMarketplaceLock(userId: string | null, familyId: string | null) {
    const [isLocked, setIsLocked] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId || !familyId) {
            setIsLocked(true);
            setLoading(false);
            return;
        }

        const checkLockStatus = async () => {
            setLoading(true);
            try {
                const today = new Date().toISOString().split('T')[0];

                const q = query(
                    collection(db, "academicLogs"),
                    where("userId", "==", userId),
                    where("familyId", "==", familyId),
                    where("date", "==", today),
                    where("status", "==", TaskStatus.APPROVED)
                );

                const snapshot = await getDocs(q);
                // If there's at least one approved R&D log for today, unlock the marketplace
                setIsLocked(snapshot.empty);
            } catch (error) {
                console.error("Failed to check marketplace lock status:", error);
                setIsLocked(true);
            } finally {
                setLoading(false);
            }
        };

        checkLockStatus();
    }, [userId, familyId]);

    return { isLocked, loading };
}
