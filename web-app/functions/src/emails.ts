import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as sgMail from "@sendgrid/mail";

const SENDER_EMAIL = "alerts@prodigychoresuite.com";
const SENDER_NAME = "Prodigy Chore Suite";

// ─── Risk Factor Queries ───────────────────────────────────────────────────

export async function getRiskFactors(companyId: string, ceoId: string, familyId: string) {
    const db = admin.firestore();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]; // YYYY-MM-DD

    // Academic Breach: Days without approved R&D in the last 7 days
    const academicSnap = await db.collection("academicLogs")
        .where("userId", "==", ceoId)
        .where("date", ">=", sevenDaysAgoStr)
        .where("status", "==", "APPROVED")
        .get();
    const approvedDays = new Set(academicSnap.docs.map(d => d.data().date)).size;
    const academicBreaches = Math.max(0, 7 - approvedDays);

    // SLA Violations: Past-due or available contracts assigned to this company
    const slaSnap = await db.collection("contracts")
        .where("familyId", "==", familyId)
        .where("assigneeId", "==", ceoId)
        .where("status", "in", ["AVAILABLE", "IN_PROGRESS"])
        .get();
    const slaViolations = slaSnap.size;

    // QA Rejections: Contracts with deductions (rework required)
    const qaSnap = await db.collection("contracts")
        .where("familyId", "==", familyId)
        .where("assigneeId", "==", ceoId)
        .where("status", "==", "PENDING_QA")
        .get();
    // Count those with deductions as rejections
    const qaRejections = qaSnap.docs.filter(d => (d.data().deduction || 0) > 0).length;

    return { academicBreaches, slaViolations, qaRejections };
}

// ─── Email Template: Board Alert (Parents) ─────────────────────────────────

export function buildBoardAlertEmail(
    companyName: string,
    childName: string,
    score: number,
    riskFactors: { academicBreaches: number; slaViolations: number; qaRejections: number },
    dashboardUrl: string
): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0f172a;color:#e2e8f0;">
<div style="max-width:600px;margin:0 auto;padding:32px 24px;">

  <!-- Header -->
  <div style="text-align:center;margin-bottom:32px;">
    <div style="display:inline-block;background:#7f1d1d;border:1px solid #991b1b;border-radius:8px;padding:8px 20px;font-size:13px;color:#fca5a5;font-weight:600;letter-spacing:0.5px;">
      ⚠️ ACTION REQUIRED: OPERATIONAL RISK ALERT
    </div>
  </div>

  <!-- Body -->
  <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:32px;margin-bottom:24px;">
    <p style="margin:0 0 16px;color:#94a3b8;">Dear Board of Directors,</p>
    <p style="margin:0 0 16px;color:#cbd5e1;">This is an automated notification from the Prodigy Chore Suite monitoring system.</p>
    <p style="margin:0 0 24px;color:#cbd5e1;">We are writing to inform you that the business credit score for <strong style="color:#f1f5f9;">${companyName}</strong>, led by CEO <strong style="color:#f1f5f9;">${childName}</strong>, has dropped into the <span style="color:#f87171;font-weight:700;">"High-Risk"</span> zone.</p>

    <!-- Score Badge -->
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;background:#450a0a;border:2px solid #dc2626;border-radius:12px;padding:16px 32px;">
        <div style="font-size:12px;color:#fca5a5;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Current Score</div>
        <div style="font-size:42px;font-weight:800;color:#ef4444;">${score}</div>
      </div>
    </div>

    <!-- Risk Factors -->
    <h3 style="color:#f1f5f9;font-size:15px;margin:28px 0 12px;border-bottom:1px solid #334155;padding-bottom:8px;">🔍 What Triggered This Alert?</h3>
    <p style="color:#94a3b8;font-size:13px;margin:0 0 12px;">Our algorithms have identified the following primary risk factors:</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <tr><td style="padding:10px 12px;background:#0f172a;border-radius:6px;color:#fbbf24;font-weight:600;font-size:13px;">📚 Academic Breach</td><td style="padding:10px 12px;background:#0f172a;border-radius:6px;color:#e2e8f0;text-align:right;font-size:13px;">${riskFactors.academicBreaches} consecutive days unlogged</td></tr>
      <tr><td style="padding:4px 0;" colspan="2"></td></tr>
      <tr><td style="padding:10px 12px;background:#0f172a;border-radius:6px;color:#fb923c;font-weight:600;font-size:13px;">⏱️ Service Interruption</td><td style="padding:10px 12px;background:#0f172a;border-radius:6px;color:#e2e8f0;text-align:right;font-size:13px;">${riskFactors.slaViolations} past-due contracts</td></tr>
      <tr><td style="padding:4px 0;" colspan="2"></td></tr>
      <tr><td style="padding:10px 12px;background:#0f172a;border-radius:6px;color:#f87171;font-weight:600;font-size:13px;">🔄 Quality Control</td><td style="padding:10px 12px;background:#0f172a;border-radius:6px;color:#e2e8f0;text-align:right;font-size:13px;">${riskFactors.qaRejections} rejected invoices</td></tr>
    </table>

    <!-- Impact -->
    <h3 style="color:#f1f5f9;font-size:15px;margin:28px 0 12px;border-bottom:1px solid #334155;padding-bottom:8px;">📉 Impact on Business Operations</h3>
    <p style="color:#94a3b8;font-size:13px;margin:0 0 12px;">Per the Micro-Enterprise Operating Agreement, the following restrictions are now active:</p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#cbd5e1;font-size:13px;line-height:2;">
      <li><strong style="color:#fbbf24;">Contract Freeze:</strong> Access to "Prime" (high-value) contracts is temporarily suspended.</li>
      <li><strong style="color:#fb923c;">Increased Overhead:</strong> Tool rental fees have been increased by 5% due to higher risk-adjustment.</li>
      <li><strong style="color:#f87171;">Tax Penalty:</strong> A 5% Risk Surcharge will be applied to all future payouts until the score recovers.</li>
    </ul>

    <!-- Recommended Action -->
    <h3 style="color:#f1f5f9;font-size:15px;margin:28px 0 12px;border-bottom:1px solid #334155;padding-bottom:8px;">✅ Recommended Board Action</h3>
    <p style="color:#94a3b8;font-size:13px;margin:0 0 8px;">We suggest scheduling an emergency Performance Review Meeting with the CEO today. Use this time to:</p>
    <ul style="margin:0 0 24px;padding-left:20px;color:#cbd5e1;font-size:13px;line-height:2;">
      <li>Review the Academic Logs for hidden obstacles.</li>
      <li>Recalibrate the Service Schedule to ensure deliverables are realistic.</li>
      <li>Discuss a Restructuring Plan to bring the company back to "Good Standing."</li>
    </ul>

    <p style="color:#94a3b8;font-size:13px;font-style:italic;margin:0 0 24px;">Prodigy Chore Suite is designed to build resilience through accountability. This is a vital learning moment for your young professional.</p>

    <!-- CTA -->
    <div style="text-align:center;">
      <a href="${dashboardUrl}" style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:14px;">View Full Credit Report →</a>
    </div>
  </div>

  <!-- Footer -->
  <p style="text-align:center;color:#475569;font-size:11px;margin:0;">
    Sent via Prodigy Chore Suite — Where Academic Discipline Meets Enterprise Growth.
  </p>
</div>
</body>
</html>`;
}

// ─── Email Template: CEO Recovery (Child) ──────────────────────────────────

export function buildCEORecoveryEmail(companyName: string, childName: string, score: number): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;background:#0f172a;color:#e2e8f0;">
<div style="max-width:520px;margin:0 auto;padding:32px 24px;">

  <div style="background:#1e293b;border:1px solid #334155;border-radius:12px;padding:32px;text-align:center;">
    <div style="font-size:48px;margin-bottom:12px;">📈</div>
    <h1 style="margin:0 0 8px;color:#f1f5f9;font-size:22px;">Your Growth Plan</h1>
    <p style="margin:0 0 24px;color:#94a3b8;font-size:14px;">Let's get <strong style="color:#34d399;">${companyName}</strong> back on top!</p>

    <p style="color:#cbd5e1;font-size:14px;line-height:1.7;margin:0 0 24px;">
      Hey ${childName} 👋<br/><br/>
      Your credit score took a dip to <strong style="color:#fbbf24;">${score}</strong>, but every great CEO faces a turnaround challenge.
      The best companies in history bounced back stronger than ever — and so will yours!
    </p>

    <div style="background:#064e3b;border:1px solid #059669;border-radius:8px;padding:16px;margin:0 0 24px;text-align:left;">
      <p style="margin:0 0 8px;color:#6ee7b7;font-weight:600;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;">🎯 Recovery Mission</p>
      <p style="margin:0;color:#a7f3d0;font-size:13px;line-height:1.7;">
        Complete <strong>3 consecutive days</strong> of R&D (schoolwork) to unlock your <strong>"Recovery Bonus"</strong> and start climbing back to Elite status!
      </p>
    </div>

    <p style="color:#64748b;font-size:12px;font-style:italic;margin:0;">
      Remember: A setback is just a setup for a comeback. 🚀
    </p>
  </div>

  <p style="text-align:center;color:#475569;font-size:11px;margin:16px 0 0;">
    Sent via Prodigy Chore Suite — Where Academic Discipline Meets Enterprise Growth.
  </p>
</div>
</body>
</html>`;
}

// ─── Send Risk Alert Emails ────────────────────────────────────────────────

export async function sendRiskAlertEmails(
    companyId: string,
    companyName: string,
    ceoId: string,
    familyId: string,
    newScore: number,
    riskFactors: { academicBreaches: number; slaViolations: number; qaRejections: number }
) {
    const db = admin.firestore();

    // Initialize SendGrid
    const apiKey = functions.config().sendgrid?.key;
    if (!apiKey) {
        console.error("SendGrid API key not configured. Run: firebase functions:config:set sendgrid.key=\"YOUR_KEY\"");
        return;
    }
    sgMail.setApiKey(apiKey);

    // 1. Fetch parent email from family document
    const familyDoc = await db.collection("families").doc(familyId).get();
    const familyData = familyDoc.data();
    const parentEmail = familyData?.parentEmail;

    if (!parentEmail) {
        console.warn(`No parentEmail found for family ${familyId}. Skipping board alert.`);
    }

    // 2. Fetch child user data
    const ceoDoc = await db.collection("users").doc(ceoId).get();
    const ceoData = ceoDoc.data();
    const childName = ceoData?.name || "CEO";
    const childEmail = ceoData?.email;

    const dashboardUrl = `https://prodigychoresuite.com/board?familyId=${familyId}`;

    // 3. Send Board Alert (Parents)
    if (parentEmail) {
        try {
            await sgMail.send({
                to: parentEmail,
                from: { email: SENDER_EMAIL, name: SENDER_NAME },
                subject: `⚠️ ACTION REQUIRED: Operational Risk Alert for ${companyName}`,
                html: buildBoardAlertEmail(companyName, childName, newScore, riskFactors, dashboardUrl),
            });
            console.log(`Board alert sent to ${parentEmail} for company ${companyName}`);
        } catch (err) {
            console.error(`Failed to send board alert to ${parentEmail}:`, err);
        }
    }

    // 4. Send CEO Recovery (Child)
    if (childEmail) {
        try {
            await sgMail.send({
                to: childEmail,
                from: { email: SENDER_EMAIL, name: SENDER_NAME },
                subject: `📈 Your Growth Plan: Let's get ${companyName} back on top!`,
                html: buildCEORecoveryEmail(companyName, childName, newScore),
            });
            console.log(`CEO recovery email sent to ${childEmail} for company ${companyName}`);
        } catch (err) {
            console.error(`Failed to send CEO recovery email to ${childEmail}:`, err);
        }
    }

    // 5. Set duplicate prevention flag
    await db.collection("companies").doc(companyId).update({
        isRiskAlertSent: true,
    });
}
