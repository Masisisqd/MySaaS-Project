import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

admin.initializeApp();
const db = admin.firestore();

export * from "./auth";
export * from "./cron";

export const settleServiceInvoice = functions.https.onCall(async (data, context) => {
    // 1. Security Check: MVP allows anyone for demo, but normally check: context.auth?.token.role === 'BOARD'

    const { invoiceId, companyId, familyId } = data;

    return db.runTransaction(async (transaction) => {
        const invoiceRef = db.collection("invoices").doc(invoiceId);
        const companyRef = db.collection("companies").doc(companyId);
        const familyRef = db.collection("families").doc(familyId);

        const invoiceSnap = await transaction.get(invoiceRef);
        const familySnap = await transaction.get(familyRef);

        if (!invoiceSnap.exists) throw new functions.https.HttpsError("not-found", "Invoice not found");

        const invoiceData = invoiceSnap.data();
        if (invoiceData?.status !== "DRAFT") {
            throw new functions.https.HttpsError("failed-precondition", "Invoice already settled");
        }

        const grossRevenue = invoiceData?.amount || 0;
        const toolRentalFees = invoiceData?.toolRentalFees || 0;

        // 2. The Business Logic Split
        const familyData = familySnap.data();
        const currencyCode = familyData?.currencyCode || "USD";
        const decimals = currencyCode === "JPY" ? 0 : 2; // ISO 4217 simplification for MVP
        const multiplier = Math.pow(10, decimals);

        const round = (val: number) => Math.round(val * multiplier) / multiplier;

        const taxRate = 0.20;       // 20% Household Tax
        const savingsRate = 0.30;   // 30% Long-term Savings
        const reinvestRate = 0.10;  // 10% Business R&D Fund

        const taxAmount = round(grossRevenue * taxRate);
        const savingsAmount = round(grossRevenue * savingsRate);
        const reinvestAmount = round(grossRevenue * reinvestRate);

        // Net Profit is what's left after Tax, Savings, Reinvestment, and Tool Fees
        const netProfit = round(grossRevenue - (taxAmount + savingsAmount + reinvestAmount + toolRentalFees));

        // 3. Update the Company Ledger
        transaction.update(companyRef, {
            totalRevenue: FieldValue.increment(grossRevenue),
            spendingBalance: FieldValue.increment(netProfit),
            savingsBalance: FieldValue.increment(savingsAmount),
            reinvestBalance: FieldValue.increment(reinvestAmount),
            creditScore: FieldValue.increment(5) // Bonus for successful delivery
        });

        // 4. Update Family Holding Account (The "Tax" pot)
        transaction.update(familyRef, {
            communityFund: FieldValue.increment(taxAmount),
            equipmentMaintenanceFund: FieldValue.increment(toolRentalFees)
        });

        // 5. Finalize Invoice
        transaction.update(invoiceRef, {
            status: "SETTLED",
            settledAt: FieldValue.serverTimestamp(),
            breakdown: {
                taxAmount,
                savingsAmount,
                reinvestAmount,
                toolRentalFees,
                netProfit
            }
        });

        return {
            success: true,
            breakdown: {
                grossRevenue,
                taxAmount,
                savingsAmount,
                reinvestAmount,
                toolRentalFees,
                netProfit
            }
        };
    });
});

export const updateWeeklyCreditScore = functions.pubsub.schedule("0 0 * * 0").onRun(async (context) => {
    const companiesSnap = await db.collection("companies").get();
    const batch = db.batch();

    for (const doc of companiesSnap.docs) {
        // companyData unused
        const companyId = doc.id;

        // In a full production app, these would query historical data:
        // SLA Score = (on time contracts / total contracts) * 1.0
        // RD Score = docs in academicLogs where status=APPROVED / 7 days
        // QA Score = Pass vs Rework ratio
        // Fiscal = Did they tap into savings? 
        // Here we use mock functions for the FICO calculation

        const slaScore = 0.9;
        const rdScore = 0.85;
        const qaScore = 0.95;
        const fiscalScore = 1.0;

        // Apply Weights
        const weightedAverage = (slaScore * 0.4) + (rdScore * 0.3) + (qaScore * 0.2) + (fiscalScore * 0.1);

        // Map to 300-850 Scale
        const newCreditScore = Math.round(300 + (550 * weightedAverage));

        // Update Company
        const companyRef = db.collection("companies").doc(companyId);
        batch.update(companyRef, {
            creditScore: newCreditScore,
            lastScoreUpdate: FieldValue.serverTimestamp()
        });
    }

    await batch.commit();
    console.log("Weekly Credit Scores updated successfully.");
});
