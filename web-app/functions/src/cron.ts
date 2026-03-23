import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const dailyPromotionCheck = functions.pubsub.schedule('0 1 * * *') // Runs at 1:00 AM daily
  .onRun(async (context) => {
    const today = new Date();
    const monthDay = `${today.getMonth() + 1}-${today.getDate()}`;

    const usersRef = admin.firestore().collection('users');
    // Find all children whose birthday is today
    const birthdaySnap = await usersRef.where('birthdayKey', '==', monthDay).get();

    const batch = admin.firestore().batch();

    birthdaySnap.forEach((doc) => {
      const userData = doc.data();
      const currentAge = calculateAge(userData.birthDate.toDate());
      let newAgeGroup = userData.ageGroup;

      // Logic for Tier Advancement
      if (currentAge === 10) newAgeGroup = 'ASSOCIATE';
      if (currentAge === 16) newAgeGroup = 'PARTNER';

      if (newAgeGroup !== userData.ageGroup) {
        batch.update(doc.ref, {
          ageGroup: newAgeGroup,
          promotionDate: admin.firestore.FieldValue.serverTimestamp(),
          pendingPromotionNotification: true // Triggers UI Celebration
        });
        
        // Log the Corporate Advancement in the Company Ledger
        const auditRef = admin.firestore().collection('auditLogs').doc();
        batch.set(auditRef, {
          familyId: userData.familyId,
          message: `Company ${userData.companyName} promoted to ${newAgeGroup} status.`,
          type: 'PROMOTION',
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    });

    return batch.commit();
  });

function calculateAge(birthDate: Date) {
  const diff = Date.now() - birthDate.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
