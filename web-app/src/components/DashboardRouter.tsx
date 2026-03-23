"use client";

import React from "react";
import { useUser } from "@/hooks/useUser";
import JuniorDashboard from "./variants/JuniorDashboard";
import AssociateDashboard from "./variants/AssociateDashboard";
import PartnerDashboard from "./variants/PartnerDashboard";
import LoadingScreen from "@/components/ui/LoadingScreen";
import OnboardingWizard from "@/components/OnboardingWizard";
import PromotionModal from "@/components/PromotionModal";

const DashboardRouterComponent = ({ user }: { user: any }) => {
    // Strategy Pattern based on Age Group
    switch (user?.ageGroup) {
        case "JUNIOR": // 6-9
            return <JuniorDashboard user={user} theme="theme-junior" />;

        case "ASSOCIATE": // 10-15
            return <AssociateDashboard user={user} theme="theme-associate" />;

        case "PARTNER": // 16-21
            return <PartnerDashboard user={user} theme="theme-partner" />;

        default:
            return <OnboardingWizard />;
    }
};

export default function DashboardRouter() {
    const { user, loading } = useUser();

    if (loading) return <LoadingScreen />;

    if (user && user.pendingPromotionNotification) {
        return (
            <>
                <DashboardRouterComponent user={user} />
                <PromotionModal user={user} onClose={() => window.location.reload()} />
            </>
        )
    }

    return <DashboardRouterComponent user={user} />;
}
