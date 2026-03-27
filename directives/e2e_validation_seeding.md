# Directive: E2E Validation & Historical Data Seeding (Botswana Holding Corp)

## Goal
Execute a full-stack E2E validation and seed 90 days of historical data for a "Botswana-Based Holding Corp" to test localization, business logic (Tax/Savings), and system performance.

## Prerequisites
- Firebase Emulators running (Auth, Firestore, Functions).
- Web app running locally on `http://localhost:3000`.
- Python environment with `firebase-admin` and `python-dotenv`.

## Step-by-Step Execution

### 1. Global Onboarding & Localization
1. **Signup**: Navigate to `/signup`. Use the "Synthetic Google Auth" bypass (programmatic or UI mock if available).
2. **Fiscal Setup**: 
    - Go to **Board Settings** -> **Global Fiscal**.
    - Select **Country**: Botswana.
3. **Validation**: 
    - Assert `Currency: BWP`, `Symbol: P`, and `Timezone: Africa/Gaborone`.
4. **Subsidiary Registration**:
    - Use the Board UI to register 3 CEOs:
        - Junior (CEO: Alice)
        - Associate (CEO: Bob)
        - Partner (CEO: Charlie)

### 2. Historical Data Seeding (90-Day Time-Machine)
Run the execution script:
```bash
python3 execution/seed_historical_data.py --familyId [FAMILY_ID]
```
The script performs:
- Back-dating 90 days from March 24, 2026 (starting Dec 24, 2025).
- Daily Revenue (P10 - P150).
- 20% Tax -> `communityFund`.
- 30% Savings -> `savingsBalance`.
- Weekly Tool Rental overheads for Associate/Partner.
- 90 days of Academic Logs (95% Approval).

### 3. Business Logic Validation
1. **Credit Score**: Verify the **Performance** tab shows a moving average graph.
2. **QER (Q1 2026)**: 
    - Trigger report generation in the Board UI.
    - Assert `Family Fund` = 20% of aggregate gross revenue.

### 4. Security & Integrity
1. **Auth Flow**: Log out as Parent. Log in as **Partner** CEO (Charlie) using his 4-digit PIN.
2. **Currency**: Verify dashboard shows `P` symbol before amounts.
3. **Teardown**: Log out and ensure session is invalidated.

## Expected Outputs
- A "Fiscal Health" summary report.
- Confirmation of Africa/Gaborone timezone reset triggers.
