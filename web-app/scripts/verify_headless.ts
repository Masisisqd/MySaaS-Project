import * as admin from 'firebase-admin';

// Force Emulator
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

const PROJECT_ID = 'botswana-holding';

admin.initializeApp({ projectId: PROJECT_ID });
const db = admin.firestore();

async function verify() {
    console.log(`🔍 Verifying project: ${PROJECT_ID}`);
    
    // Check Families
    const families = await db.collection('families').get();
    console.log(`   Families found: ${families.size}`);
    families.docs.forEach(d => console.log(`      - ${d.id}: ${d.data()?.name}`));

    // Check Users
    const users = await db.collection('users').get();
    console.log(`   Users found: ${users.size}`);

    // Check Ledger
    const ledger = await db.collection('ledger').limit(1).get();
    console.log(`   Ledger check: ${ledger.empty ? 'EMPTY' : 'HAS DATA'}`);

    // Check Auth Users
    const authUsers = await admin.auth().listUsers();
    console.log(`   Auth Users found: ${authUsers.users.length}`);
    authUsers.users.forEach(u => console.log(`      - ${u.email}: ${u.uid}`));

    if (families.empty || authUsers.users.length === 0) {
        console.error('❌ Data is missing!');
        process.exit(1);
    }
    console.log('✅ Headless verification PASS!');
}

verify().catch(console.error);
