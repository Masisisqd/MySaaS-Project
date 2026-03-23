"use client";

import { useAuth } from "@/context/AuthContext";
import { RegistrationModal } from "@/components/RegistrationModal";

export default function OnboardingWizard() {
    const { user, userData } = useAuth();

    if (!user) return null;

    return (
        <RegistrationModal
            isOpen={true}
            onClose={() => window.location.reload()}
            userId={user.uid}
            familyId={userData?.familyId || ""}
        />
    );
}
