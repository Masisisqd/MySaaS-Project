import * as admin from 'firebase-admin';
import * as crypto from 'crypto';
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

function hashPin(pin: string, salt: string): string {
    return crypto.scryptSync(pin, salt, 64).toString('hex');
}

async function onboardParent(familyId: string, familyName: string, parentEmail: string, parentName: string, familyPin: string) {
    console.log(`👤 Onboarding Parent: ${parentName} (${parentEmail})`);
    
    let parentUid: string;
    try {
        const userRecord = await admin.auth().getUserByEmail(parentEmail);
        parentUid = userRecord.uid;
        console.log(`   Using existing UID: ${parentUid}`);
    } catch {
        const userRecord = await admin.auth().createUser({
            email: parentEmail,
            displayName: parentName,
            password: 'SecurePassword123!',
        });
        parentUid = userRecord.uid;
        console.log(`   Created new UID: ${parentUid}`);
    }

    await admin.auth().setCustomUserClaims(parentUid, { role: 'BOARD', familyId });

    const familyRef = db.collection('families').doc(familyId);
    await familyRef.set({
        name: familyName,
        communityFund: 0,
        equipmentMaintenanceFund: 0,
        boardMembers: [parentUid],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        countryCode: 'BW',
        currencyCode: 'BWP',
        locale: 'en-BW',
        timezone: 'Africa/Gaborone',
        parentEmail: parentEmail
    });

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedSecretPin = hashPin(familyPin, salt);
    await familyRef.collection('_secrets_').doc('auth').set({ hashedSecretPin, salt });

    await db.collection('users').doc(parentUid).set({
        name: parentName,
        email: parentEmail,
        role: 'BOARD',
        familyId: familyId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return parentUid;
}

async function onboardChild(familyId: string, childName: string, childPin: string, ageGroup: string, companyName: string) {
    console.log(`👶 Onboarding Child: ${childName} (${ageGroup})`);
    
    const userRecord = await admin.auth().createUser({ displayName: childName });
    const ceoId = userRecord.uid;

    await admin.auth().setCustomUserClaims(ceoId, { role: 'CEO', familyId });

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPin = hashPin(childPin, salt);
    await db.collection('users').doc(ceoId).collection('_secrets_').doc('auth').set({ hashedPin, salt });

    await db.collection('users').doc(ceoId).set({
        name: childName,
        role: 'CEO',
        ageGroup: age_group_map[ageGroup] || ageGroup,
        familyId: familyId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    const companyRef = db.collection('companies').doc();
    await companyRef.set({
        ceoId: ceoId,
        familyId: familyId,
        name: companyName,
        totalRevenue: 0,
        spendingBalance: 0,
        savingsBalance: 0,
        reinvestBalance: 0,
        creditScore: 700,
        overheadCost: 0,
        lastScoreUpdate: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return { ceoId, companyId: companyRef.id };
}

const age_group_map: any = {
    'JUNIOR': 'JUNIOR',
    'ASSOCIATE': 'ASSOCIATE',
    'PARTNER': 'PARTNER'
};

async function run() {
    const fId = 'botswana-holding';
    await onboardParent(fId, 'Botswana Holding Corp', 'board@botswana.corp', 'Main Board Member', '5555');
    await onboardChild(fId, 'Alice', '1111', 'JUNIOR', 'Junior CleanCo');
    await onboardChild(fId, 'Bob', '2222', 'ASSOCIATE', 'Associate MowMasters');
    await onboardChild(fId, 'Charlie', '3333', 'PARTNER', 'Partner Logistics');
    console.log('✨ Onboarding Complete!');
}

run().catch(console.error);
