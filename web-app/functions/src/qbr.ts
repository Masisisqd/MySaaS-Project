import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const exportQBRData = functions.https.onCall(async (data, context) => {
    // Basic auth check
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to export QBR.");
    }

    const { companyId, startDateStr = "2026-01-01", endDateStr = "2026-03-26" } = data;

    if (!companyId) {
        throw new functions.https.HttpsError("invalid-argument", "companyId is required.");
    }

    try {
        const companyRef = db.collection("companies").doc(companyId);
        const companySnap = await companyRef.get();

        if (!companySnap.exists) {
            throw new functions.https.HttpsError("not-found", "Company not found.");
        }

        const companyData = companySnap.data();
        const ceoId = companyData?.ceoId;
        const familyId = companyData?.familyId;
        const creditScore = companyData?.creditScore || 0;

        const startTimestamp = admin.firestore.Timestamp.fromDate(new Date(`${startDateStr}T00:00:00Z`));
        const endTimestamp = admin.firestore.Timestamp.fromDate(new Date(`${endDateStr}T23:59:59Z`));

        // 1. Fetch Ledger Entries
        const ledgerQuery = await db.collection("ledger")
            .where("companyId", "==", companyId)
            .where("timestamp", ">=", startTimestamp)
            .where("timestamp", "<=", endTimestamp)
            .get();

        let totalGross = 0;
        let totalTax = 0;
        let totalSavings = 0;
        let totalExpenses = 0; // tool rentals
        let businessHours = 0; // 1 hour per chore entry

        ledgerQuery.forEach((doc) => {
            const data = doc.data();
            totalGross += data.gross || 0;
            totalTax += data.tax || 0;
            totalSavings += data.savings || 0;
            totalExpenses += data.tools || 0;
            if (data.type === "REVENUE") {
                businessHours += 1; // 1 hour assumed per completed chore/revenue entry
            }
        });

        // 2. Fetch Academic Logs
        const academicQuery = await db.collection("academicLogs")
            .where("userId", "==", ceoId)
            .where("date", ">=", startDateStr)
            .where("date", "<=", endDateStr)
            .get();

        let totalAcademicMinutes = 0;

        academicQuery.forEach((doc) => {
            const data = doc.data();
            // Count APPROVED or functionally count all
            totalAcademicMinutes += data.minutesSpent || 0;
        });

        const academicHours = totalAcademicMinutes / 60;
        const prodigyRatio = businessHours > 0 ? (academicHours / businessHours) : 0;

        // Fetch Family for Branding
        const familySnap = await db.collection("families").doc(familyId).get();
        const familyName = familySnap.data()?.companyName || "Unknown Family Group";

        return {
            success: true,
            data: {
                companyName: companyData?.name || "Unknown Company",
                familyName,
                creditScore,
                period: `${startDateStr} to ${endDateStr}`,
                financials: {
                    grossRevenue: totalGross,
                    totalTax,
                    totalSavings,
                    operatingExpenses: totalExpenses
                },
                compliance: {
                    academicHours,
                    businessHours,
                    prodigyRatio
                }
            }
        };

    } catch (error) {
        console.error("Error exporting QBR:", error);
        throw new functions.https.HttpsError("internal", "Failed to generate QBR data.");
    }
});
