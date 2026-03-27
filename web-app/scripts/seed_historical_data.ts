import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

const PROJECT_ID = 'botswana-holding';

// Force Emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();
db.settings({ host: '127.0.0.1:8080', ssl: false });

async function seedData(familyId: string) {
    console.log(`🚀 Seeding 90-day history for Family: ${familyId}`);
    
    const familyRef = db.collection('families').doc(familyId);
    const companiesSnap = await db.collection('companies').where('familyId', '==', familyId).get();
    
    if (companiesSnap.empty) {
        console.log('❌ No companies found for this family.');
        return;
    }

    // Dec 24, 2025 to Mar 24, 2026
    let currentDate = new Date('2025-12-24T12:00:00Z');
    const endDate = new Date('2026-03-24T12:00:00Z');
    
    while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        console.log(`📅 Processing: ${dateStr}`);
        
        let dailyTaxTotal = 0;
        let dailyMaintenanceTotal = 0;

        for (const companyDoc of companiesSnap.docs) {
            const companyId = companyDoc.id;
            const companyData = companyDoc.data();
            const ceoId = companyData.ceoId;
            
            const grossRevenue = Math.round((Math.random() * 140 + 10) * 100) / 100;
            
            const taxRate = 0.20;
            const savingsRate = 0.30;
            const reinvestRate = 0.10;
            
            const taxAmount = Math.round(grossRevenue * taxRate * 100) / 100;
            const savingsAmount = Math.round(grossRevenue * savingsRate * 100) / 100;
            const reinvestAmount = Math.round(grossRevenue * reinvestRate * 100) / 100;
            
            let toolRentalFees = 0;
            if (currentDate.getUTCDay() === 1) { // Monday
                if (companyData.name.includes('Associate') || companyData.name.includes('Partner')) {
                    toolRentalFees = 25.00;
                }
            }
            
            const netProfit = Math.round((grossRevenue - (taxAmount + savingsAmount + reinvestAmount + toolRentalFees)) * 100) / 100;
            
            // Ledger
            await db.collection('ledger').add({
                companyId,
                familyId,
                type: 'REVENUE',
                description: `Daily Chore Revenue - ${dateStr}`,
                gross: grossRevenue,
                tax: taxAmount,
                savings: savingsAmount,
                reinvest: reinvestAmount,
                tools: toolRentalFees,
                net: netProfit,
                timestamp: admin.firestore.Timestamp.fromDate(new Date(currentDate)),
            });
            
            // Academic Log
            const status = Math.random() < 0.95 ? 'APPROVED' : 'COMPLETED';
            await db.collection('academicLogs').add({
                userId: ceoId,
                familyId,
                subject: ['Math', 'Science', 'History', 'Business'][Math.floor(Math.random() * 4)],
                minutesSpent: Math.floor(Math.random() * 90 + 30),
                status,
                date: dateStr,
                createdAt: admin.firestore.Timestamp.fromDate(new Date(currentDate))
            });
            
            // Update Company
            await db.collection('companies').doc(companyId).update({
                totalRevenue: admin.firestore.FieldValue.increment(grossRevenue),
                spendingBalance: admin.firestore.FieldValue.increment(netProfit),
                savingsBalance: admin.firestore.FieldValue.increment(savingsAmount),
                reinvestBalance: admin.firestore.FieldValue.increment(reinvestAmount),
                overheadCost: admin.firestore.FieldValue.increment(toolRentalFees)
            });
            
            dailyTaxTotal += taxAmount;
            dailyMaintenanceTotal += toolRentalFees;
        }

        // Update Family
        await familyRef.update({
            communityFund: admin.firestore.FieldValue.increment(dailyTaxTotal),
            equipmentMaintenanceFund: admin.firestore.FieldValue.increment(dailyMaintenanceTotal)
        });
        
        currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    console.log('✅ Seeding Complete!');
}

const familyId = process.argv[2] || 'botswana-holding';
seedData(familyId).catch(console.error);
