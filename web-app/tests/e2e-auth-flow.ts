import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCustomToken, signOut, connectAuthEmulator } from "firebase/auth";
import { getFirestore, doc, getDoc, connectFirestoreEmulator } from "firebase/firestore";
import { getFunctions, httpsCallable, connectFunctionsEmulator } from "firebase/functions";
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.local') });

// Setup a realistic testing app instance utilizing Environment Variables matching the client
// Because we are using Emulators, dummy values are sufficient for initialization
const firebaseConfig = {
    apiKey: "dummy-api-key-for-emulators",
    authDomain: "dummy-project.firebaseapp.com",
    projectId: "dummy-project-id",
    storageBucket: "dummy-project.appspot.com",
    messagingSenderId: "000000000000",
    appId: "1:000000000000:web:abcdef1234567890"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Use Emulators if configured, else bypass for live dev project
const USE_EMULATORS = true;
if (USE_EMULATORS) {
    console.log("🟡 Using Firebase Emulators");
    connectAuthEmulator(auth, "http://127.0.0.1:9099");
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    connectFunctionsEmulator(functions, "127.0.0.1", 5001);
}

// Ensure tests are run consecutively and cleanly
const parentEmail = `parent_${Date.now()}@testing.familycorp`;
const parentPassword = "SecurePassword123!";
let parentUid = "";
const familyId = `family-${Date.now()}`;
let cleanCoId = "";
let mowMastersId = "";

async function executeTest() {
    console.log("=========================================");
    console.log("🚀 STARTING: Family Corp E2E Test Suite");
    console.log("=========================================\n");

    try {
        // ------------------------------------------------------------------------------------------------
        console.log("▶️ Scenario 1: Parent Organization Setup");

        try {
            // Setup synthetic Google OAuth bypass (Mock creating a user)
            const userCredential = await createUserWithEmailAndPassword(auth, parentEmail, parentPassword);
            parentUid = userCredential.user.uid;
            console.log(`   [Action] Generated Parent Auth Identity: ${parentEmail}`);

            const createFamilyFn = httpsCallable(functions, "createFamilyFn");
            await createFamilyFn({
                familyId: familyId,
                familyName: "The Real Test Group",
                familySecretPin: "5555" // Secure PIN for kids registration
            });
            console.log(`   [Action] Initialized Holding Corp with Family ID: ${familyId}`);

            // Re-authenticate to ensure token claims are updated
            await userCredential.user.getIdToken(true);

            // Verify
            const familyRef = doc(db, "families", familyId);
            const familySnap = await getDoc(familyRef);
            if (!familySnap.exists()) throw new Error("Family Document not found in Firestore.");
            if (!familySnap.data().boardMembers.includes(parentUid)) throw new Error("BOARD role improperly attached.");

            console.log("   ✅ PASS: Parent Organization Setup\n");
        } catch (error: any) {
            console.log("   ❌ FAIL: Parent Organization Setup");
            throw error;
        }

        // ------------------------------------------------------------------------------------------------
        console.log("▶️ Scenario 2: Subsidiary Registration (Child CEOs)");

        try {
            const registerChildFn = httpsCallable(functions, "registerChildFn");

            // Spin up CleanCo
            const child1Result = await registerChildFn({
                familyId: familyId,
                familySecretPin: "5555",
                childName: "Alice",
                childPin: "1111"
            }) as any;
            cleanCoId = child1Result.data.ceoId;
            console.log(`   [Action] Registered Alice as CEO (CleanCo) with ID: ${cleanCoId}`);

            // Spin up MowMasters
            const child2Result = await registerChildFn({
                familyId: familyId,
                familySecretPin: "5555",
                childName: "Bob",
                childPin: "2222"
            }) as any;
            mowMastersId = child2Result.data.ceoId;
            console.log(`   [Action] Registered Bob as CEO (MowMasters) with ID: ${mowMastersId}`);

            // Verification: Since we are still logged in as the Parent (BOARD), we can read ANY user in family
            const aliceDoc = await getDoc(doc(db, "users", cleanCoId));
            const bobDoc = await getDoc(doc(db, "users", mowMastersId));

            if (!aliceDoc.exists() || !bobDoc.exists()) throw new Error("Subsidiary entries missing in standard queries");

            console.log("   ✅ PASS: Subsidiary Registration (Child CEOs)\n");
        } catch (error: any) {
            console.log("   ❌ FAIL: Subsidiary Registration (Child CEOs)");
            throw error;
        }

        // ------------------------------------------------------------------------------------------------
        console.log("▶️ Scenario 3: PIN-Auth & Data Isolation");

        try {
            // Parent is Logging Out
            await signOut(auth);
            console.log("   [Action] Parent signed out.");

            const loginChildFn = httpsCallable(functions, "loginChildFn");

            // CleanCo logs in with their unique 4 PIN
            const childLoginResp = await loginChildFn({
                ceoId: cleanCoId,
                childPin: "1111"
            }) as any;

            const customToken = childLoginResp.data.customToken;
            console.log("   [Action] Mapped CleanCo PIN to Custom Auth Token.");

            // Authenticate natively
            await signInWithCustomToken(auth, customToken);
            console.log(`   [Action] Authenticated Alice (CleanCo). Native UID matches: ${auth.currentUser?.uid === cleanCoId}`);

            // Assert CleanCo can read their own data
            const selfDoc = await getDoc(doc(db, "users", cleanCoId));
            if (!selfDoc.exists()) throw new Error("Alice cannot read her own profile.");
            console.log("   [Action] Alice successfully retrieved their own Ledger via Firestore Rules.");

            // ** SECURITY CHECK: Assert CleanCo CANNOT read MowMasters data **
            let unauthorizedAccessCaught = false;
            try {
                await getDoc(doc(db, "users", mowMastersId));
            } catch (err: any) {
                if (err.code === "permission-denied") {
                    unauthorizedAccessCaught = true;
                } else {
                    throw err;
                }
            }
            if (!unauthorizedAccessCaught) {
                throw new Error("SECURITY BREACH: CleanCo was able to read MowMasters Data. Fix Firestore rule C.");
            }
            console.log("   [Action] Security Rule C Caught & Rejected Alice's read to Bob's Company.");

            console.log("   ✅ PASS: PIN-Auth & Data Isolation\n");
        } catch (error: any) {
            console.log("   ❌ FAIL: PIN-Auth & Data Isolation");
            throw error;
        }

        // ------------------------------------------------------------------------------------------------
        console.log("▶️ Scenario 4: Session Termination");

        try {
            await signOut(auth);
            console.log("   [Action] Alice (CleanCo) Session Cleared.");

            if (auth.currentUser !== null) {
                throw new Error("Client still holds auth reference.");
            }

            let unauthorizedAccessCaught = false;
            try {
                // Must mock an isolated getDoc as unauthenticated
                await getDoc(doc(db, "users", cleanCoId));
            } catch (err: any) {
                if (err.code === "permission-denied" || err.code === "unauthenticated") { // varies slightly based on specific sdk version checks
                    unauthorizedAccessCaught = true;
                }
            }

            if (!unauthorizedAccessCaught) {
                throw new Error("SECURITY BREACH: Session terminated but Data remains cached/readable.");
            }

            console.log("   ✅ PASS: Session Termination\n");
        } catch (error: any) {
            console.log("   ❌ FAIL: Session Termination");
            throw error;
        }

        console.log("=========================================");
        console.log("🎉 ALL TESTS PASSED: Auth Flow End-to-End");
        console.log("=========================================\n");
        process.exit(0);
    } catch (e: any) {
        console.error("\n💥 FATAL TEST ERROR:");
        console.error(e);
        process.exit(1);
    }
}

executeTest();
