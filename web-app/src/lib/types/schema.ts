export enum Role {
    BOARD = "BOARD",
    CEO = "CEO"
}

export enum AgeGroup {
    JUNIOR = "JUNIOR",      // 6-9
    ASSOCIATE = "ASSOCIATE", // 10-15
    PARTNER = "PARTNER" // 16-21
}

export enum ChoreStatus {
    AVAILABLE = "AVAILABLE",
    IN_PROGRESS = "IN_PROGRESS",
    PENDING_QA = "PENDING_QA", // Work submitted, waiting for Board approval
    SETTLED = "SETTLED"        // Paid
}

export enum TaskStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    APPROVED = "APPROVED" // Verified by Board
}

export interface Family {
    id: string;
    companyName: string; // "The Smith Group"
    subscription: string;
    communityFund: number;           // Tax pot
    equipmentMaintenanceFund: number;// Tool rental pot
    countryCode?: string;
    currencyCode?: string;
    locale?: string;
    parentEmail?: string; // For Board alert delivery
}

export interface User {
    id: string; // matches Firebase Auth UID
    email: string;
    name: string;
    role: Role;
    ageGroup: AgeGroup;
    familyId: string;
    birthdayKey?: string; // "M-D"
    birthDate?: Date | any; // Firebase Timestamp
    pendingPromotionNotification?: boolean;
}

export interface Company {
    id: string;
    name: string; // "Sparkle & Shine Ltd."
    ceoId: string; // User ID
    familyId: string;

    // Financials
    creditScore: number;    // 300 - 850
    totalRevenue: number;
    spendingBalance: number; // Net Profit
    savingsBalance: number;
    reinvestBalance: number; // For tool upgrades
    overheadCost: number;    // Rental fees paid

    lastScoreUpdate?: Date | any; // Firebase Timestamp
    isRiskAlertSent?: boolean; // Duplicate email prevention flag
}

export interface AcademicLog {
    id: string;
    userId: string;
    familyId: string;
    subject: string;
    minutesSpent: number;
    status: TaskStatus; // COMPLETED until BOARD changes to APPROVED
    date: string; // YYYY-MM-DD
    createdAt: Date | any;
}

export interface Contract { // Chore
    id: string;
    familyId: string;
    title: string;
    description: string;
    baseValue: number; // Contract Price
    priority: number;
    status: ChoreStatus;

    assigneeId?: string; // Company/CEO handling it

    // QA
    proofImageUrl?: string;
    qaFeedback?: string;
    deduction?: number;

    createdAt: Date | any;
    updatedAt: Date | any;
}

export interface Equipment {
    id: string;
    familyId: string;
    name: string;
    category: string;
    rentalRate: number; // Per use/hour
    energyFee: number;
    condition: number; // 0-100
}

export interface Invoice {
    id: string;
    companyId: string;
    ceoId: string; // For security queries
    familyId: string;
    contractId: string;
    amount: number; // Gross
    status: "DRAFT" | "SENT" | "PAID" | "DISPUTED";

    // Breakdown after settlement
    breakdown?: {
        taxAmount: number;
        savingsAmount: number;
        reinvestAmount: number;
        toolRentalFees: number;
        netProfit: number;
    };

    createdAt: Date | any;
    settledAt?: Date | any;
}
