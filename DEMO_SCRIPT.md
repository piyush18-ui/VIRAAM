# VIRAAM — 3-Minute Judge Demo Script

> **Tagline:** *Pause the panic. Protect the payment.*  
> **Target Audience:** Hackathon Evaluators, FinTech Security Experts, Policy Judges.

---

## ⏱️ Minute 0:00 – 0:45: The Problem & Live Hero Hook

1. **Open Landing Page (`/`):**
   - Point out the headline: *"Pause the panic. Protect the payment."*
   - Highlight the **Silo Problem visual**:
     - *Telco* sees a 38-minute call with an unsaved number, but cannot see payments.
     - *Bank* sees a genuine UPI PIN entered, but cannot see the coercive call.
     - *Viraam* merges the cross-silo signals to intervene in real-time.
   - Point to the **Trust Strip**: *"Synthetic-data prototype · No call audio · Explainable decisions · Consent-based holds"*.
2. **Interactive Mini-Demo (Scroll to Section 6):**
   - Drag the **Active Call Duration** slider to `38 mins`.
   - Toggle on **Remote Access** (AnyDesk/TeamViewer).
   - Observe the live gauge jump to **94 / 100 (Critical Band)**.
   - Show how the plain-language reasons update instantly: *"You've been on an active call for 38 minutes... Remote screen access is running"*.
3. **Click "Open Workspace"** in the top navbar.

---

## ⏱️ Minute 0:45 – 1:45: Command Center & Case Intervention

1. **Command Center (`/workspace`):**
   - Show the **KPI Row**: 14,280 Transfers Screened, 342 Holds Placed, ₹1.84 Cr Loss Prevented, 1.4s Median Time-to-Hold.
   - Point to the **Live Transaction Feed**: Real-time SSE stream scoring transactions with color-coded risk badges.
2. **Launch Simulator (`/workspace/simulator`):**
   - Select **Scenario 1: Digital Arrest Coercion**.
   - Set speed to **5x** and click **Run Scenario**.
   - Watch the **Citizen Phone Mockup**:
     - Call banner appears: *"+91 98110 09823 (CBI Cyber Cell) • 38:42"*.
     - BharatPay payment of ₹4,85,000 is initiated.
     - **Interruption Screen fires**: Amber pause ring pulses, cooling-off countdown timer activates (15:00), and plain-language warning reminds the citizen: *"Government agencies never demand instant UPI transfers over calls"*.
3. **Family Safe-Phrase Co-Sign:**
   - Look at the right device mockup (**Priya's Phone**):
     - Receives urgent co-sign request for Ramesh Verma.
     - Shows rotating safe-phrase: e.g. `"lotus banyan"`.
     - Click **"Deny & Maintain Hold"** to demonstrate how family locks the protection and stops the scam cold.

---

## ⏱️ Minute 1:45 – 2:30: Golden-Hour Mule Tracing Graph

1. **Navigate to Money Trail (`/workspace/graph`):**
   - View the **NetworkX Multi-Hop Graph**:
     - `ACC_1042 (Victim)` → `MULE_L1_01 (HDFC)` → `MULE_L2_01 / L2_02 (ICICI / Axis)` → `Dispersal` → `Crypto P2P OTC / ATM Grid`.
   - Click on `MULE_L1_01` to open the **Node Inspector**:
     - Account age: 4 days.
     - Inbound velocity: 14.0 txns/hr.
     - Predicted Next-Hop Probability: 84.2% to Crypto OTC off-ramp.
2. **Execute Freeze Plan:**
   - Inspect the **Ranked Freeze Plan Table** (ranked strictly by $E[\text{Recoverable}] \times P \times \text{Urgency}$).
   - Click **"Execute Freeze Plan"**:
     - Visual locks snap onto `MULE_L1_01` and L2 nodes.
     - Compare the recovery outcome card:
       - **With Viraam:** ₹4,55,900 (94.0%) recovered in golden hour.
       - **Without Viraam:** ₹29,100 (6.0%) recovered post-facto.

---

## ⏱️ Minute 2:30 – 3:00: Verification of Precision & Policy Readiness

1. **Verify False-Positive Handling:**
   - Return to Simulator (`/workspace/simulator`) and select **Scenario 3: Legitimate Transfer (Control)**.
   - Click **Run Scenario**:
     - Citizen transfers ₹2,50,000 for a property advance while on call with their saved broker.
     - Risk engine scores low/medium (e.g. 22.4).
     - **Result:** Directly marked as `completed` without hold. Demonstrates precision.
2. **Audit Ledger (`/workspace/audit`):**
   - Point out the immutable ledger with timestamps, actors, and details.
   - Click **Export Audit CSV** to demonstrate regulatory compliance.
3. **Model Insights (`/workspace/model`):**
   - Show the offline evaluation metrics (Precision 94.2%, ROC-AUC 0.964) and the transparent disclaimer that this is evaluated on a synthetic benchmark partition.
