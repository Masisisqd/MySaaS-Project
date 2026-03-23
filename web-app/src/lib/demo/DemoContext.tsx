"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { Role, AgeGroup, ChoreStatus, TaskStatus } from "@/lib/types/schema";
import type { Family, User, Company, Contract, AcademicLog, Equipment, Invoice } from "@/lib/types/schema";

// ─── Demo Seed Data ───────────────────────────────────────────────

const DEMO_FAMILY: Family = {
    id: "family-smith",
    companyName: "The Smith Group",
    subscription: "FREE",
    communityFund: 24.50,
    equipmentMaintenanceFund: 3.80,
    countryCode: "USA",
    currencyCode: "USD",
    locale: "en-US",
};

const DEMO_USERS: User[] = [
    { id: "parent-1", email: "dad@smith.co", name: "David Smith", role: Role.BOARD, ageGroup: AgeGroup.PARTNER, familyId: "family-smith" },
    { id: "child-1", email: "leo@smith.co", name: "Leo Smith", role: Role.CEO, ageGroup: AgeGroup.ASSOCIATE, familyId: "family-smith" },
    { id: "child-2", email: "mia@smith.co", name: "Mia Smith", role: Role.CEO, ageGroup: AgeGroup.JUNIOR, familyId: "family-smith" },
];

const DEMO_COMPANIES: Company[] = [
    { id: "company-leo", name: "SwiftScrub Solutions", ceoId: "child-1", familyId: "family-smith", creditScore: 780, totalRevenue: 87.50, spendingBalance: 34.75, savingsBalance: 26.25, reinvestBalance: 8.75, overheadCost: 4.50 },
    { id: "company-mia", name: "Sparkle & Shine Ltd.", ceoId: "child-2", familyId: "family-smith", creditScore: 720, totalRevenue: 42.00, spendingBalance: 16.80, savingsBalance: 12.60, reinvestBalance: 4.20, overheadCost: 2.00 },
];

const DEMO_EQUIPMENT: Equipment[] = [
    { id: "eq-1", familyId: "family-smith", name: "Dyson V15 Vacuum", category: "Cleaning", rentalRate: 0.50, energyFee: 0.05, condition: 82 },
    { id: "eq-2", familyId: "family-smith", name: "Honda Lawnmower", category: "Gardening", rentalRate: 1.00, energyFee: 0.10, condition: 65 },
    { id: "eq-3", familyId: "family-smith", name: "Dish Rack Deluxe", category: "Kitchen", rentalRate: 0.25, energyFee: 0.02, condition: 95 },
];

const today = new Date().toISOString().split("T")[0];

const DEMO_ACADEMIC_LOGS: AcademicLog[] = [
    { id: "al-1", userId: "child-1", familyId: "family-smith", subject: "Algebra Homework", minutesSpent: 45, status: TaskStatus.APPROVED, date: today, createdAt: new Date() },
    { id: "al-2", userId: "child-2", familyId: "family-smith", subject: "Reading — Charlotte's Web", minutesSpent: 30, status: TaskStatus.COMPLETED, date: today, createdAt: new Date() },
];

const DEMO_CONTRACTS: Contract[] = [
    { id: "c-1", familyId: "family-smith", title: "Kitchen Sanitation Detail", description: "Deep clean all countertops, mop floor, and sanitize sink.", baseValue: 5.00, priority: 1, status: ChoreStatus.AVAILABLE, createdAt: new Date(), updatedAt: new Date() },
    { id: "c-2", familyId: "family-smith", title: "Lawn Maintenance", description: "Mow front and back lawns. Trim edges.", baseValue: 10.00, priority: 2, status: ChoreStatus.AVAILABLE, createdAt: new Date(), updatedAt: new Date() },
    { id: "c-3", familyId: "family-smith", title: "Bathroom Deep Clean", description: "Scrub toilet, tub, mirrors. Restock towels.", baseValue: 7.50, priority: 1, status: ChoreStatus.IN_PROGRESS, assigneeId: "child-1", createdAt: new Date(), updatedAt: new Date() },
    { id: "c-4", familyId: "family-smith", title: "Living Room Tidy-Up", description: "Vacuum carpets, dust shelves, organize cushions.", baseValue: 4.00, priority: 1, status: ChoreStatus.PENDING_QA, assigneeId: "child-1", proofImageUrl: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=400&h=400&fit=crop", createdAt: new Date(), updatedAt: new Date() },
];

const DEMO_INVOICES: Invoice[] = [
    { id: "inv-1", companyId: "company-leo", ceoId: "child-1", familyId: "family-smith", contractId: "c-old-1", amount: 10.00, status: "PAID", breakdown: { taxAmount: 2.00, savingsAmount: 3.00, reinvestAmount: 1.00, toolRentalFees: 0.50, netProfit: 3.50 }, createdAt: new Date(Date.now() - 7 * 86400000), settledAt: new Date(Date.now() - 7 * 86400000) },
    { id: "inv-2", companyId: "company-leo", ceoId: "child-1", familyId: "family-smith", contractId: "c-old-2", amount: 5.00, status: "PAID", breakdown: { taxAmount: 1.00, savingsAmount: 1.50, reinvestAmount: 0.50, toolRentalFees: 0.25, netProfit: 1.75 }, createdAt: new Date(Date.now() - 3 * 86400000), settledAt: new Date(Date.now() - 3 * 86400000) },
    { id: "inv-3", companyId: "company-leo", ceoId: "child-1", familyId: "family-smith", contractId: "c-old-3", amount: 7.50, status: "PAID", breakdown: { taxAmount: 1.50, savingsAmount: 2.25, reinvestAmount: 0.75, toolRentalFees: 0.50, netProfit: 2.50 }, createdAt: new Date(Date.now() - 1 * 86400000), settledAt: new Date(Date.now() - 1 * 86400000) },
];

// ─── Context ──────────────────────────────────────────────────────

interface DemoContextType {
    family: Family;
    users: User[];
    currentUser: User;
    switchRole: (role: Role) => void;
    switchChild: (userId: string) => void;
    isJunior: boolean;
    companies: Company[];
    currentCompany: Company | null;
    equipment: Equipment[];
    setEquipment: React.Dispatch<React.SetStateAction<Equipment[]>>;
    academicLogs: AcademicLog[];
    setAcademicLogs: React.Dispatch<React.SetStateAction<AcademicLog[]>>;
    contracts: Contract[];
    setContracts: React.Dispatch<React.SetStateAction<Contract[]>>;
    invoices: Invoice[];
    setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
    updateFamilySettings: (settings: Partial<Family>) => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function useDemoData() {
    const ctx = useContext(DemoContext);
    if (!ctx) throw new Error("useDemoData must be used within DemoProvider");
    return ctx;
}

export function DemoProvider({ children }: { children: ReactNode }) {
    const [currentRole, setCurrentRole] = useState<Role>(Role.BOARD);
    const [currentChildId, setCurrentChildId] = useState<string>("child-1");
    const [equipment, setEquipment] = useState<Equipment[]>(DEMO_EQUIPMENT);
    const [academicLogs, setAcademicLogs] = useState<AcademicLog[]>(DEMO_ACADEMIC_LOGS);
    const [contracts, setContracts] = useState<Contract[]>(DEMO_CONTRACTS);
    const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
    const [demoFamily, setDemoFamily] = useState<Family>(DEMO_FAMILY);

    const currentUser = currentRole === Role.BOARD
        ? DEMO_USERS[0]
        : DEMO_USERS.find(u => u.id === currentChildId) || DEMO_USERS[1];

    const currentCompany = currentRole === Role.CEO
        ? DEMO_COMPANIES.find(c => c.ceoId === currentUser.id) || null
        : null;

    const isJunior = currentUser.ageGroup === AgeGroup.JUNIOR;

    const switchRole = (role: Role) => setCurrentRole(role);
    const switchChild = (userId: string) => { setCurrentChildId(userId); setCurrentRole(Role.CEO); };
    const updateFamilySettings = (settings: Partial<Family>) => {
        setDemoFamily(prev => ({ ...prev, ...settings }));
    };

    return (
        <DemoContext.Provider value={{
            family: demoFamily,
            users: DEMO_USERS,
            currentUser,
            switchRole,
            switchChild,
            isJunior,
            companies: DEMO_COMPANIES,
            currentCompany,
            equipment,
            setEquipment,
            academicLogs,
            setAcademicLogs,
            contracts,
            setContracts,
            invoices,
            setInvoices,
            updateFamilySettings,
        }}>
            {children}
        </DemoContext.Provider>
    );
}
