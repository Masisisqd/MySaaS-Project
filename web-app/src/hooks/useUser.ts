"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { toast } from "sonner";

export function useUser() {
    const { user: authUser, userData: authUserData, loading: authLoading } = useAuth();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!authUser || authUserData?.role !== "CEO") {
            setLoading(false);
            return;
        }

        const fetchCompanyAndAssembleUser = async () => {
            try {
                // Determine if they have a company
                const q = query(collection(db, "companies"), where("ceoId", "==", authUser.uid));
                const querySnapshot = await getDocs(q);
                
                let companyData = null;
                if (!querySnapshot.empty) {
                    companyData = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
                }

                // Assemble the requested user object
                const assembledUser = {
                    id: authUser.uid,
                    ...authUserData,
                    company: companyData,
                    hasCompany: !!companyData,
                    ageGroup: authUserData.ageGroup 
                };

                // Trigger onboarding instead of dashboard if no company established
                if (!companyData) {
                    delete assembledUser.ageGroup;
                }

                setUser(assembledUser);

            } catch (err: any) {
                console.error("Failed to fetch user context", err);
                toast.error("Failed to load user info");
            } finally {
                setLoading(false);
            }
        };

        fetchCompanyAndAssembleUser();
    }, [authUser, authUserData, authLoading]);

    return { user, loading };
}
