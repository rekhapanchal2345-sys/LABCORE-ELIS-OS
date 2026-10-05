# LabCore ELIS — Patients Module Clinical Architecture & Engineering Audit

**Standards Compliance**: India NABL (ISO 15189:2022) | ABDM / ABHA v0.5 | DPDP Act 2023  
**Audited Date**: October 2026  
**System**: LabCore Enterprise Laboratory Information System (ELIS OS)

---

## 1. Executive Summary & Control Inventory Resolution

All 11 critical discrepancies identified during the baseline audit of the Patients module have been resolved across the full-stack architecture:

| # | Discrepancy / Requirement | Root Cause | Engineering Solution |
|---|---|---|---|
| **1** | URL query state loss on search / filter | State was purely in React memory without URL binding | Integrated bidirectional URL parameter synchronization (`?q=`, `?chip=`, `?gender=`, `?bloodGroup=`, `?sortBy=`, `?viewMode=`, `?page=`, `?limit=`) with `replaceState` and `<Suspense>` boundaries. |
| **2** | Deep-link drawer loading (`?view=:uhid`) | Drawer only loaded from local state array | Integrated deep-fetching in `PixelPerfectPatientsPage.tsx` with fallback API resolution for unpaginated patients. |
| **3** | Unsaved changes risk in 5-step registration | Form lacked `isDirty` and navigation interceptors | Integrated `isDirty` guard, URL step sync (`?step=1..5`), and `beforeunload` browser listeners. |
| **4** | Dual UHID vs UUID route resolution | Backend only queried Prisma by UUID | Updated `patient.service.ts` to query `OR: [{ id }, { uhid: id }]`, preventing database primary key exposure. |
| **5** | Demographic & Age calculation bugs | Ad-hoc subtraction ignored leap years, newborn days, and future dates | Created centralized `patient-utils.ts` with `calculateClinicalAge` handling newborns (≤28 days), infants (<1 yr), and pediatrics (1–5 yrs). |
| **6** | DPDP Act 2023 Consent compliance | Consent card made false HIPAA claims and lacked granular checkboxes | Replaced with purpose-specific DPDP Act 2023 Consent Card (`v1.0`) for Diagnostic Testing, Digital Communication, and ABDM Interoperability. |
| **7** | PII Privacy Masking | Patients table exposed full phone numbers and emails | Integrated one-click `Mask PII` / `PII Masked` toggle across all views. |
| **8** | Roster KPI counter accuracy | Hardcoded `+12% MoM` and client-side page slicing | Added server-wide roster aggregation in `patient.service.ts` computing IST calendar KPIs (`totalRoster`, `activeCount`, `todayCount`, `criticalCount`, `pendingCount`, `seniorCount`). |
| **9** | False balance due & mock data | Patient detail page fell back to `setMockData()` with ₹2,500 due | Eliminated all mock fallbacks; balance due is computed in real-time from active database invoice ledger items. |
| **10** | Premature sample tracking lifecycle | Orders in "REGISTERED" state showed stages as completed | Implemented 7-stage state machine (`REGISTERED` $\rightarrow$ `COLLECTED` $\rightarrow$ `RECEIVED` $\rightarrow$ `PROCESSING` $\rightarrow$ `RESULTS_ENTERED` $\rightarrow$ `APPROVED` $\rightarrow$ `DISPATCHED`). |
| **11** | Phlebotomy vacutainer tube mismatch | Missing tube classification for specialized panels | Built multi-specimen classification engine (`getTubeDetailsForTest`) for EDTA, Fluoride, Citrate, SST Gold, and Heparin. |

---

## 2. Architecture & Directory Structure

```
c:/Users/nikil/Downloads/labcore-elis-backend-fixed/
├── backend/api/src/modules/
│   ├── patients/
│   │   ├── patient.controller.ts     # Request validation & HTTP handlers
│   │   ├── patient.service.ts        # Business logic, dual UUID/UHID lookup & IST KPIs
│   │   ├── patient.mapper.ts         # Strict schema sanitization & DTO formatting
│   │   ├── patient.validation.ts     # Zod schemas for all patient endpoints
│   │   └── patient.routes.ts         # Express routes with RBAC middleware
│   ├── barcode/
│   │   └── barcode.service.ts        # ORD-, SMP-, and UHID Code 128 barcode validation
│   └── abdm/
│       ├── abdm.gateway.client.ts    # ABDM v0.5 gateway client with token refresh
│       ├── abdm.controller.ts        # OTP and ABHA linking handlers
│       └── abdm.routes.ts            # Authenticated API and public webhook routes
└── frontend/apps/web/src/
    ├── lib/
    │   └── patient-utils.ts          # Central clinical utility library (Names, Age, E.164, Blood, ABHA)
    ├── app/patients/
    │   ├── page.tsx                  # Server component with Suspense boundary
    │   ├── new/page.tsx              # 5-Step Patient Registration Wizard
    │   └── [id]/
    │       ├── page.tsx              # Comprehensive Clinical Dossier & 7-Stage Tracker
    │       └── edit/page.tsx         # Full-field Patient Edit & Update Form
    └── components/
        ├── patients/
        │   ├── PixelPerfectPatientsPage.tsx  # Patient Dossier Roster, Filters, and Slide-over Drawer
        │   └── PixelPerfectPatientRegistration.tsx # 5-Step Registration Form with DPDP v1.0
        ├── barcodes/
        │   └── BarcodeLabelModal.tsx # Multi-specimen thermal label studio (50x25mm)
        └── abdm/
            ├── AbhaLinkModal.tsx     # Aadhaar/Mobile OTP & ABHA address verification modal
            └── AbhaCardModal.tsx     # Printable ABDM Digital Health Card with QR code
```

---

## 3. Centralized Clinical Utilities (`patient-utils.ts`)

- **`formatPatientFullName(p)`**: Builds `[Title] [First] [Middle] [Last]` with automatic whitespace normalization.
- **`calculateClinicalAge(dateOfBirth, fallbackAge)`**:
  - Newborns (0–28 days): `"Newborn (Day X)"` / `"X days"`
  - Infants (< 1 year): `"Xm Yd"` / `"X months"`
  - Pediatrics (1–5 years): `"X yrs Y mos"`
  - Adults & Seniors: `"X Yrs (Senior Citizen)"`
  - Future dates: Guarded and auto-corrected.
- **`formatIndianPhone(phone)`**: Validates 10-digit mobile numbers; produces E.164 (`+919876543210`) and display (`+91 98765 43210`).
- **`formatBloodGroup(bg)`**: Maps internal codes (`A_POSITIVE`, `APOSITIVE`) to clinical notation (`A+`, `Bombay (hh)`).
- **`formatAbhaNumber(num)`**: Formats 14-digit ABHA as `12-3456-7890-1234`.
- **`sanitizeMedicalConditions(input)`**: Strips junk strings (`"NO"`, `"NONE"`, `"Normal Profile"`, `"null"`, `"N/A"`, `"-"`).

---

## 4. API Endpoints Reference

### Core Patient Routes (`/api/patients`)
- `GET /api/patients`: Server-paginated roster with `search`, `activeChip`, `gender`, `page`, and `limit`. Returns roster KPIs.
- `GET /api/patients/:id`: Dual lookup by primary key UUID or UHID (`LC-000001`).
- `POST /api/patients`: Register patient with strict validation, duplicate check, and audit logging.
- `PATCH /api/patients/:id`: Partial update of demographic and clinical fields.
- `DELETE /api/patients/:id`: Admin-only soft/hard delete guard.
- `POST /api/patients/with-order`: Atomic transaction creating patient and initial diagnostic test order.
- `GET /api/patients/check-duplicate`: Pre-flight phone/Aadhaar/email duplicate verification.

### ABDM Interoperability Routes (`/api/abdm`)
- `POST /api/abdm/abha/generate/aadhaar/otp`: Initiate Aadhaar-based OTP enrollment.
- `POST /api/abdm/abha/generate/aadhaar/verify`: Verify Aadhaar OTP and receive ABHA profile.
- `POST /api/abdm/abha/generate/mobile/otp`: Initiate Mobile-based OTP enrollment.
- `POST /api/abdm/abha/generate/mobile/verify`: Verify Mobile OTP.
- `POST /api/abdm/abha/verify/init`: Verify existing ABHA address or number.
- `POST /api/abdm/abha/link-patient`: Link ABHA number and address to patient record.
- `POST /api/abdm/patient/:id/unlink`: Unlink ABHA profile from patient record.
- `GET /api/abdm/patient/:id/card`: Fetch ABHA Digital Card metadata with QR code payload.

---

## 5. Architectural Sign-Off Checklist

- [x] Full URL Query Synchronization on all views with `<Suspense>` boundaries.
- [x] DPDP Act 2023 Consent Card (`v1.0`) and toggleable PII masking.
- [x] Zero Mock Data fallbacks across all patient components.
- [x] Exact Clinical Age calculations with newborn and pediatric precision.
- [x] 7-Stage Specimen Lifecycle State Machine.
- [x] 50mm $\times$ 25mm Thermal Barcode Label Studio with vacutainer tube auto-classification.
- [x] Multi-template WhatsApp Diagnostic Dispatch Gateway.
- [x] Role-Based Access Control (RBAC) and database audit trails.
- [x] CSV Export Formula Injection protection and 400ms search debouncing.
