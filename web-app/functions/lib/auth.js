"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFamilyProfilesFn = exports.loginChildFn = exports.registerChildFn = exports.createFamilyFn = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const crypto = require("crypto");
const firestore_1 = require("firebase-admin/firestore");
const db = admin.firestore();
// Helper to hash a PIN with a given salt
function hashPin(pin, salt) {
    return crypto.scryptSync(pin, salt, 64).toString("hex");
}
exports.createFamilyFn = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in with Google");
    }
    const { familyId, familyName, familySecretPin } = data;
    if (!familyId || !familyName || !familySecretPin) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    const uid = context.auth.uid;
    return db.runTransaction(async (transaction) => {
        const familyRef = db.collection("families").doc(familyId);
        const familySnap = await transaction.get(familyRef);
        if (familySnap.exists) {
            throw new functions.https.HttpsError("already-exists", "Family ID already taken");
        }
        // 1. Create Family Document
        transaction.set(familyRef, {
            name: familyName,
            communityFund: 0,
            equipmentMaintenanceFund: 0,
            boardMembers: [uid],
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 2. Create Family Auth Secrets
        const secretSalt = crypto.randomBytes(16).toString("hex");
        const hashedSecretPin = hashPin(familySecretPin, secretSalt);
        const familySecretsRef = familyRef.collection("_secrets_").doc("auth");
        transaction.set(familySecretsRef, {
            hashedSecretPin,
            salt: secretSalt,
        });
        // 3. Create User Document for Board Member
        const userRef = db.collection("users").doc(uid);
        transaction.set(userRef, {
            name: context.auth.token.name || context.auth.token.email || "Parent",
            role: "BOARD",
            familyId: familyId,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 4. Update Claims
        await admin.auth().setCustomUserClaims(uid, { role: "BOARD", familyId });
        return { success: true, familyId };
    });
});
exports.registerChildFn = functions.https.onCall(async (data, context) => {
    const { familyId, familySecretPin, childName, childPin } = data;
    if (!familyId || !familySecretPin || !childName || !childPin) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    if (childPin.length !== 4) {
        throw new functions.https.HttpsError("invalid-argument", "Child PIN must be 4 digits");
    }
    return db.runTransaction(async (transaction) => {
        // 1. Verify Family and Secret PIN
        const familyRef = db.collection("families").doc(familyId);
        const familySnap = await transaction.get(familyRef);
        if (!familySnap.exists) {
            throw new functions.https.HttpsError("not-found", "Family not found");
        }
        const familySecretsRef = familyRef.collection("_secrets_").doc("auth");
        const familySecretsSnap = await transaction.get(familySecretsRef);
        if (!familySecretsSnap.exists) {
            throw new functions.https.HttpsError("failed-precondition", "Family auth secrets not configured");
        }
        const { hashedSecretPin, salt } = familySecretsSnap.data();
        const providedHash = hashPin(familySecretPin, salt);
        if (providedHash !== hashedSecretPin) {
            throw new functions.https.HttpsError("permission-denied", "Invalid Family Secret PIN");
        }
        // 2. Create the child user in Firebase Auth
        // Using a dummy email/phone is not strictly necessary if we rely entirely on custom tokens,
        // but Firebase auth requires a unique uid. We can just create one.
        const userRecord = await admin.auth().createUser({
            displayName: childName,
        });
        const ceoId = userRecord.uid;
        // 3. Set custom claims for the CEO
        await admin.auth().setCustomUserClaims(ceoId, { role: "CEO", familyId });
        // 4. Save Child PIN Hash
        const childSalt = crypto.randomBytes(16).toString("hex");
        const hashedChildPin = hashPin(childPin, childSalt);
        const childSecretRef = db.collection("users").doc(ceoId).collection("_secrets_").doc("auth");
        transaction.set(childSecretRef, {
            hashedPin: hashedChildPin,
            salt: childSalt,
        });
        // 5. Create User Document
        const userRef = db.collection("users").doc(ceoId);
        transaction.set(userRef, {
            name: childName,
            role: "CEO",
            familyId: familyId,
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // 6. Create Initial Company Document for the Child
        const companyRef = db.collection("companies").doc();
        transaction.set(companyRef, {
            ceoId: ceoId,
            familyId: familyId,
            name: `${childName}'s Company`,
            totalRevenue: 0,
            spendingBalance: 0,
            savingsBalance: 0,
            reinvestBalance: 0,
            creditScore: 700, // starting score
            lastScoreUpdate: firestore_1.FieldValue.serverTimestamp(),
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
        return { success: true, ceoId, companyId: companyRef.id };
    });
});
exports.loginChildFn = functions.https.onCall(async (data, context) => {
    const { ceoId, childPin } = data;
    if (!ceoId || !childPin) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    // 1. Get the Child Auth Secrets
    const childSecretRef = db.collection("users").doc(ceoId).collection("_secrets_").doc("auth");
    const childSecretSnap = await childSecretRef.get();
    if (!childSecretSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Child credentials not found");
    }
    const { hashedPin, salt } = childSecretSnap.data();
    const providedHash = hashPin(childPin, salt);
    if (providedHash !== hashedPin) {
        throw new functions.https.HttpsError("permission-denied", "Invalid PIN");
    }
    // 2. Fetch User to get familyId for custom claims
    const userRef = db.collection("users").doc(ceoId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
        throw new functions.https.HttpsError("not-found", "User document not found");
    }
    const userData = userSnap.data();
    // 3. Mint Custom Token
    const customToken = await admin.auth().createCustomToken(ceoId, {
        role: "CEO",
        familyId: userData.familyId,
    });
    return { success: true, customToken };
});
exports.getFamilyProfilesFn = functions.https.onCall(async (data, context) => {
    const { familyId } = data;
    if (!familyId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing familyId");
    }
    // This exposes first names of CEOs in a family. 
    // In a production app with stricter privacy, we might require a device-link token.
    const usersRef = db.collection("users");
    const snapshot = await usersRef
        .where("familyId", "==", familyId)
        .where("role", "==", "CEO")
        .get();
    const profiles = snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
    }));
    return { success: true, profiles };
});
//# sourceMappingURL=auth.js.map