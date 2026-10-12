# Sahayata (सहायता) – Functional Specification Document

**Indian Institute of Management Bodh Gaya (IIM Bodh Gaya)**  
*MBA Capstone Project: Enterprise Financial Assistance & Scholarship Portal*  
*Academic Year: 2026–27*

---

## 1. Executive Summary

**Sahayata** (meaning *Assistance* or *Support*) is an end-to-end, AI-powered financial aid management ecosystem engineered specifically for the Indian Institute of Management Bodh Gaya. 

Higher management education in India demands substantial capital investment. Talented students from economically challenged backgrounds often struggle with navigating complex fee waiver criteria, loan schemes, emergency grants, and government scholarship guidelines. Sahayata eliminates administrative opacity by providing:
1. An **empathetic, 24/7 bilingual AI assistant** that grounds answers in verified institute policies.
2. An **automated pre-screening rules engine** that instantly assesses eligibility across multiple institutional schemes.
3. A **multi-tier verification and governance workflow** connecting students, administrative verification staff, the Financial Aid Committee, and the Accounts/Disbursement Office.
4. **Institutional guardrails** ensuring the AI cannot make unauthorized financial commitments or leak sensitive student data.

---

## 2. User Roles & Permission Matrix

The portal enforces a strict Role-Based Access Control (RBAC) model across four distinct campus stakeholders:

| Capability / Module | Student (`student`) | Verification Staff (`staff`) | Aid Committee (`committee`) | Administrator (`admin`) |
| :--- | :---: | :---: | :---: | :---: |
| **Bilingual AI Policy Chat** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Scheme Pre-Screening Engine** | ✅ Self Profile | ✅ Any Student | ✅ Any Student | ✅ Any Student |
| **Submit Aid Application** | ✅ Self Profile | ❌ Prohibited | ❌ Prohibited | ❌ Prohibited |
| **Upload Verification Documents** | ✅ Self Profile | ❌ Prohibited | ❌ Prohibited | ❌ Prohibited |
| **Document Scrutiny Workbench** | ❌ No Access | ✅ Read/Verify | ✅ Read Only | ✅ Full Access |
| **Approve / Reject Applications** | ❌ No Access | ❌ No Access | ✅ Full Authority | ✅ Full Authority |
| **Sanction Disbursement Vouchers** | ❌ No Access | ❌ No Access | ✅ Recommend | ✅ Authorize |
| **Hardening & Guardrail Toggles** | ❌ No Access | ❌ No Access | ❌ No Access | ✅ Full Control |
| **Audit Logs & Red-Team Traces** | ❌ No Access | ❌ No Access | ❌ No Access | ✅ Full Control |
| **Knowledge Base Manifest Audit** | ❌ No Access | ❌ No Access | ❌ No Access | ✅ Full Control |

---

## 3. Core Functional Modules & User Journeys

### 3.1 Student Experience & Discovery Journey

#### A. Conversational Policy Assistant (`/chat`)
- **Natural Language Inquiry**: Students can pose complex, colloquial, or mixed-language questions (e.g., *"My family income is 2.8 lakhs, am I eligible for full tuition fee waiver under NBFA?"* or Hindi/Hinglish queries like *"Kya mujhe hostel fee me concession mil sakta hai?"*).
- **FAQ Short-Circuiting**: Standard questions (deadlines, office contact hours, SBI bank branch details) are resolved instantly via high-confidence cached knowledge routes.
- **Strict Citation Grounding**: Every response cites the authoritative policy clause (e.g., `[Scholarship Policy 2026-27, §3.1]`), eliminating student confusion.
- **Institutional Disclaimers**: If a student asks *"Have you approved my scholarship?"*, the assistant explains the criteria but clearly clarifies that only the human Committee has final approval power.
- **Distress Intervention**: If a student indicates acute financial or emotional distress (e.g., unable to afford meals or medical emergencies), the assistant immediately provides direct contact coordinates for the **Student Welfare Office** and **Campus Counselling Cell** (`counselling@iimbg.ac.in`).

#### B. Instant Eligibility Pre-Screener (`/check-eligibility`)
- **Self-Service Evaluation**: Students enter or confirm their Academic Programme (`PGP`, `PGP-DBM`, `IPM`), Annual Family Income (INR), Cumulative GPA (CGPA), and Social Category.
- **Instant Rule Evaluation**: Evaluates all configured schemes concurrently:
  - **Eligible Schemes**: Displays exact tuition waiver percentage or grant amount, justification breakdown, list of mandatory documents, and policy citations.
  - **Ineligible Schemes**: Outlines transparent, constructive explanations (e.g., *"Income exceeds maximum threshold of INR 6,00,000"* or *"CGPA 5.2 is below the minimum renewal requirement of 5.50"*).
- **One-Click Application Hand-Off**: Students can launch the application form directly with their eligibility details pre-populated.

#### C. Document Upload & Application Tracking (`/upload` & `/applications`)
- **Checklist Guidance**: Clear visual breakdown of required documents:
  - Valid Income Certificate issued by Revenue Authority (within 12 months)
  - Parents' Form 16 / ITR-V for preceding Financial Year
  - 6-month Bank Statements of all earning family members
  - Non-Judicial Stamp Paper Affidavit
- **Application Status Timeline**: Real-time tracking through 5 progressive lifecycle stages:
  1. `Submitted` ➔ 2. `Under Document Scrutiny` ➔ 3. `Committee Review` ➔ 4. `Approved / Sanctioned` ➔ 5. `Disbursed to Fee Account`.

---

### 3.2 Administrative & Verification Staff Workflow (`/applications`)

- **Document Cross-Verification**: Staff inspect uploaded documents against government criteria (validity dates, issuing authority, income thresholds).
- **Status Updates**: Staff mark applications as `Verified`, `Flagged for Clarification`, or `Discrepancy Found`.
- **Recommendation Formulation**: Staff compute and recommend the admissible fee waiver amount in accordance with the scheme slab before forwarding to the Committee.

---

### 3.3 Financial Aid Committee Governance Console (`/committee`)

- **Dual-Approval Framework**: High-value fee waivers (Tier 1 100% waivers amounting to INR 8,00,000+) require recorded approval by Committee members.
- **Decision Rationale Recording**: Committee members input mandatory written justification for every sanction or rejection, ensuring compliance with institutional audit guidelines.
- **Action Proposals Queue**: Displays AI-generated draft recommendations awaiting human committee authorization. No fund transfer or official notice is dispatched without human sign-off.

---

### 3.4 Accounts & Disbursement Reconciliation (`/accounts`)

- **Idempotency Protection**: Every disbursement note generated features a cryptographic idempotency key (preventing duplicate disbursement of the same fee waiver installment).
- **Accounts Adjustment Vouchers**: Generates formatted adjustment slips crediting the student's tuition ledger directly at the IIM Bodh Gaya Accounts Section.
- **Audit Trails**: Records timestamp, approving authority ID, amount disbursed, and target bank/ledger transaction details.

---

### 3.5 System Control & Observability Desk (`/admin`)

- **Policy Hardening Control Center (`/admin`)**: Interactive switches allowing campus administrators to toggle all 14 safety and governance guards on or off in real time without code deployment.
- **Red-Team Security Sandbox (`/admin/red-team`)**: Interactive security testing console containing pre-configured adversarial test attacks (Prompt Injection, Fake Commitment Coercion, PII Extraction, Hallucination Baits) to evaluate agent resistance.
- **Trace Logger & Performance Observability (`/admin/traces`)**: End-to-end request-by-request inspector displaying user role, masked input, fired guardrails, tokens used, latency breakdown, and INR costs.
- **Knowledge Base Manifest (`/admin/kb`)**: Complete inventory of all official documents indexed in the vector store, including version dates, active status, and access privilege levels.

---

## 4. Financial Aid Schemes Portfolio

Sahayata implements the complete scholarship and assistance taxonomy of IIM Bodh Gaya:

### 1. Need-Based Financial Assistance (NBFA) – Tier 1
- **Target**: Students from low-income households.
- **Income Limit**: Annual family income $\le$ **INR 3,00,000**.
- **Academic Requirement**: Minimum CGPA $\ge$ **5.50** (no active backlogs).
- **Benefit**: **100% Tuition Fee Waiver** across all academic terms.
- **Mandatory Documents**: Revenue Income Certificate, 3-year ITR, Bank Statements, Family Income Affidavit.

### 2. Need-Based Financial Assistance (NBFA) – Tier 2
- **Target**: Students from lower-middle income households.
- **Income Limit**: Annual family income between **INR 3,00,001 and INR 6,00,000**.
- **Academic Requirement**: Minimum CGPA $\ge$ **5.50**.
- **Benefit**: **50% Tuition Fee Waiver**.

### 3. Need-Based Financial Assistance (NBFA) – Tier 3
- **Target**: Students requiring partial fee cushioning.
- **Income Limit**: Annual family income between **INR 6,00,01 and INR 8,00,000**.
- **Academic Requirement**: Minimum CGPA $\ge$ **5.50**.
- **Benefit**: **25% Tuition Fee Waiver**.

### 4. Director’s Merit Scholarship (DMS)
- **Target**: Top academic performers in the PGP cohort.
- **Income Limit**: **No income ceiling**.
- **Academic Requirement**: Minimum CGPA $\ge$ **8.50** (top 5% of class).
- **Benefit**: **INR 1,00,000** one-time merit award.

### 5. Need-cum-Merit Scholarship
- **Target**: Meritorious students with moderate financial constraints.
- **Income Limit**: Family income $\le$ **INR 9,00,000**.
- **Academic Requirement**: Minimum CGPA $\ge$ **7.50**.
- **Benefit**: **INR 75,000** tuition fee concession.

### 6. SC / ST / PwD Special Financial Assistance
- **Target**: Students from historically marginalized groups and differently-abled students.
- **Benefit**: Living stipend allowance of **INR 6,000/month** plus full computer grant subsidy (up to INR 45,000).

### 7. Emergency Medical & Bereavement Assistance
- **Target**: Unforeseen catastrophic events during the academic term (loss of earning parent, critical illness).
- **Benefit**: Immediate contingency grant up to **INR 1,50,000** disbursed within 48 hours following Director's approval.

### 8. Institutional Education Loan Guidance (SBI Scholar Scheme)
- **Partner**: State Bank of India (IIM Bodh Gaya Campus Branch).
- **Collateral**: **100% Collateral-Free** loan up to INR 20,00,000.
- **Concessional Interest**: Special repo-linked rate for premier institutions with zero processing charges.

---

## 5. Institutional Compliance & Privacy

1. **Digital Personal Data Protection (DPDP) Act Compliance**: All personal identifiers (Aadhaar, PAN, phone numbers, bank accounts) are automatically scrubbed and redacted at the input boundary before being forwarded to any AI model.
2. **Deterministic Versioning**: The system rejects obsolete or superseded policies. If an archived policy document from 2023 exists in the knowledge base, the system tags it as `superseded` and guarantees answers reference the active **2026–27** handbook only.
3. **Auditability**: Every AI inference session generates an immutable trace containing latency metrics, cost calculations, safety flags, and source citations.
