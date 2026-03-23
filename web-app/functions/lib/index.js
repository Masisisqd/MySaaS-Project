"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWeeklyCreditScore = exports.settleServiceInvoice = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const firestore_1 = require("firebase-admin/firestore");
admin.initializeApp();
const db = admin.firestore();
__exportStar(require("./auth"), exports);
__exportStar(require("./cron"), exports);
exports.settleServiceInvoice = functions.https.onCall(async (data, context) => {
    // 1. Security Check: MVP allows anyone for demo, but normally check: context.auth?.token.role === 'BOARD'
    const { invoiceId, companyId, familyId } = data;
    return db.runTransaction(async (transaction) => {
        const invoiceRef = db.collection("invoices").doc(invoiceId);
        const companyRef = db.collection("companies").doc(companyId);
        const familyRef = db.collection("families").doc(familyId);
        const invoiceSnap = await transaction.get(invoiceRef);
        const familySnap = await transaction.get(familyRef);
        if (!invoiceSnap.exists)
            throw new functions.https.HttpsError("not-found", "Invoice not found");
        const invoiceData = invoiceSnap.data();
        if ((invoiceData === null || invoiceData === void 0 ? void 0 : invoiceData.status) !== "DRAFT") {
            throw new functions.https.HttpsError("failed-precondition", "Invoice already settled");
        }
        const grossRevenue = (invoiceData === null || invoiceData === void 0 ? void 0 : invoiceData.amount) || 0;
        const toolRentalFees = (invoiceData === null || invoiceData === void 0 ? void 0 : invoiceData.toolRentalFees) || 0;
        // 2. The Business Logic Split
        const familyData = familySnap.data();
        const currencyCode = (familyData === null || familyData === void 0 ? void 0 : familyData.currencyCode) || "USD";
        const decimals = currencyCode === "JPY" ? 0 : 2; // ISO 4217 simplification for MVP
        const multiplier = Math.pow(10, decimals);
        const round = (val) => Math.round(val * multiplier) / multiplier;
        const taxRate = 0.20; // 20% Household Tax
        const savingsRate = 0.30; // 30% Long-term Savings
        const reinvestRate = 0.10; // 10% Business R&D Fund
        const taxAmount = round(grossRevenue * taxRate);
        const savingsAmount = round(grossRevenue * savingsRate);
        const reinvestAmount = round(grossRevenue * reinvestRate);
        // Net Profit is what's left after Tax, Savings, Reinvestment, and Tool Fees
        const netProfit = round(grossRevenue - (taxAmount + savingsAmount + reinvestAmount + toolRentalFees));
        // 3. Update the Company Ledger
        transaction.update(companyRef, {
            totalRevenue: firestore_1.FieldValue.increment(grossRevenue),
            spendingBalance: firestore_1.FieldValue.increment(netProfit),
            savingsBalance: firestore_1.FieldValue.increment(savingsAmount),
            reinvestBalance: firestore_1.FieldValue.increment(reinvestAmount),
            creditScore: firestore_1.FieldValue.increment(5) // Bonus for successful delivery
        });
        // 4. Update Family Holding Account (The "Tax" pot)
        transaction.update(familyRef, {
            communityFund: firestore_1.FieldValue.increment(taxAmount),
            equipmentMaintenanceFund: firestore_1.FieldValue.increment(toolRentalFees)
        });
        // 5. Finalize Invoice
        transaction.update(invoiceRef, {
            status: "SETTLED",
            settledAt: firestore_1.FieldValue.serverTimestamp(),
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
exports.updateWeeklyCreditScore = functions.pubsub.schedule("1 * * * *").onRun(async (context) => {
    var _a;
    const companiesSnap = await db.collection("companies").get();
    const batch = db.batch();
    const alertPromises = [];
    // Lazy-load Luxon in the function scope
    const { DateTime } = await Promise.resolve().then(() => require("luxon"));
    for (const companyDoc of companiesSnap.docs) {
        const companyData = companyDoc.data();
        const companyId = companyDoc.id;
        // Fetch Family to enforce the Local Reset Engine
        const familyDoc = await db.collection("families").doc(companyData.familyId).get();
        const familyTimezone = ((_a = familyDoc.data()) === null || _a === void 0 ? void 0 : _a.timezone) || "UTC";
        // Get live time relative to the family's geographical timezone
        const localNow = DateTime.now().setZone(familyTimezone);
        // Run strictly on local Sundays (1 = Mon, 7 = Sun)
        if (localNow.weekday !== 7)
            continue;
        // Prevent duplicate runs: only score if it's been at least 6 days since the last run
        if (companyData.lastScoreUpdate) {
            const lastUpdateJS = companyData.lastScoreUpdate.toDate();
            const daysSinceLastUpdate = DateTime.now().diff(DateTime.fromJSDate(lastUpdateJS), "days").days;
            if (daysSinceLastUpdate < 6)
                continue;
        }
        const oldCreditScore = companyData.creditScore || 600;
        const isRiskAlertSent = companyData.isRiskAlertSent || false;
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
        // Update Company Score
        const companyRef = db.collection("companies").doc(companyId);
        batch.update(companyRef, {
            creditScore: newCreditScore,
            lastScoreUpdate: firestore_1.FieldValue.serverTimestamp()
        });
        // ─── Risk Alert Trigger Logic ──────────────────────────────────
        // Trigger: Score just crossed below 500 AND alert not already sent
        if (newCreditScore < 500 && oldCreditScore >= 500 && !isRiskAlertSent) {
            const { getRiskFactors, sendRiskAlertEmails } = await Promise.resolve().then(() => require("./emails"));
            const alertPromise = (async () => {
                const riskFactors = await getRiskFactors(companyId, companyData.ceoId, companyData.familyId);
                await sendRiskAlertEmails(companyId, companyData.name || "Unknown Company", companyData.ceoId, companyData.familyId, newCreditScore, riskFactors);
            })();
            alertPromises.push(alertPromise);
        }
        // Recovery: Score climbed back above 500, reset the flag
        if (newCreditScore >= 500 && isRiskAlertSent) {
            batch.update(companyRef, {
                isRiskAlertSent: false
            });
        }
    }
    await batch.commit();
    // Wait for all alert emails to finish sending
    if (alertPromises.length > 0) {
        await Promise.allSettled(alertPromises);
        console.log(`Processed ${alertPromises.length} risk alert(s).`);
    }
    console.log("Weekly Credit Scores evaluated natively in Local Time.");
});
//# sourceMappingURL=index.js.map