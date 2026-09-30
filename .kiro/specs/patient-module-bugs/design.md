# Patient Module Comprehensive Bugfix Design

## Overview

This design document addresses 25 critical bugs in the Patient Module spanning database schema mismatches, validation issues, data handling problems, race conditions, and frontend performance issues. The bugs affect patient registration, draft management, verification workflows, and data integrity. This document provides a systematic approach to fixing each bug while preserving existing functionality.

The fixes are organized into categories:
1. **Database Schema Issues** (Bugs 1.1-1.3): Missing Prisma models for verification, medical history, and consent
2. **Schema Field Mismatches** (Bugs 1.4-1.5): Service layer using fields not defined in Prisma schema
3. **Validation Issues** (Bugs 1.6, 1.18, 1.19): Empty string handling, transform issues, phone normalization conflicts
4. **Data Handling** (Bugs 1.7-1.10, 1.14, 1.15, 1.17): Duplicate checking, preference merging, date parsing, JSON serialization
5. **Route Configuration** (Bugs 1.11-1.12): Validation middleware, route ordering
6. **Frontend Issues** (Bugs 1.13, 1.20, 1.25): Undefined fields, stale closures, performance
7. **Race Conditions** (Bug 1.21): UHID generation concurrency
8. **Type/Conversion Issues** (Bugs 1.16, 1.22, 1.24): Inconsistent behavior, missing fields, silent failures

## Glossary

- **Bug_Condition (C)**: The specific input or state that triggers the bug
- **Property (P)**: The desired correct behavior when the bug condition is met
- **Preservation**: Existing behaviors that must remain unchanged by the fixes
- **PatientVerification**: Model for tracking phone/email verification status (needs to be created)
- **PatientMedicalHistory**: Model for storing patient medical history records (needs to be created)
- **PatientConsent**: Model for recording patient consents (needs to be created)
- **UHID**: Unique Health ID - generated identifier for each patient
- **Draft**: Partially completed patient registration saved for later completion
- **BMI**: Body Mass Index calculated from height (cm) and weight (kg)
- **Normalization**: Process of standardizing phone numbers (removing spaces, country codes)
- **Race Condition**: Concurrent execution leading to inconsistent results
- **Memoization**: Caching computed values to prevent recalculation

---

## Bug Details

### Bug 1.1: Missing PatientVerification Table

**Bug Condition:**
When `patient.advanced.service.ts` attempts to create a `PatientVerification` record, the system throws a runtime error because the `PatientVerification` table does not exist in the Prisma schema.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is a verification creation request
  OUTPUT: boolean
  
  RETURN (input.service = "patient.advanced.service") AND
         (input.operation = "create PatientVerification") AND
         (PatientVerification_table_not_in_schema())
END FUNCTION
```

**Examples:**
- Calling `sendPhoneVerificationOTP()` → Prisma error: "Table 'PatientVerification' does not exist"
- Calling `sendEmailVerification()` → Same error

---

### Bug 1.2: Missing PatientMedicalHistory Table

**Bug Condition:**
When `patient.advanced.service.ts` attempts to create a `PatientMedicalHistory` record, the system throws a runtime error.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is a medical history creation request
  OUTPUT: boolean
  
  RETURN (input.operation = "create PatientMedicalHistory") AND
         (PatientMedicalHistory_table_not_in_schema())
END FUNCTION
```

---

### Bug 1.3: Missing PatientConsent Table

**Bug Condition:**
When `patient.advanced.service.ts` attempts to create a `PatientConsent` record, the system throws a runtime error.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is a consent creation request
  OUTPUT: boolean
  
  RETURN (input.operation = "create PatientConsent") AND
         (PatientConsent_table_not_in_schema())
END FUNCTION
```

---

### Bug 1.4: Patient Service Using Non-Existent Schema Fields

**Bug Condition:**
When `patient.service.ts` attempts to save patient data with extended fields not in the Prisma schema, the system throws a database error.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is patient creation/update with extended fields
  OUTPUT: boolean
  
  RETURN (input.fields IN [middleName, country, landmark, alternatePhone, 
                           aadhaarNumber, panNumber, patientType, maritalStatus,
                           occupation, nationality, allergies, chronicDiseases,
                           currentMedications, height, weight, bmi, preferredLanguage,
                           communicationPreference, consentForTreatment, consentForDataSharing,
                           consentForMarketing, familyHeadId, relationshipToHead, notes,
                           isDraft, registrationSource, referralSource, qrCode,
                           verificationStatus, phoneVerified, emailVerified, kycVerified,
                           kycVerifiedAt, kycVerifiedById, photoUrl, insuranceExpiryDate,
                           formStep, formProgress, lastEditedSection]) AND
         (ANY(input.fields) NOT IN PrismaPatientModel.fields)
END FUNCTION
```

**Analysis:**
Comparing the Prisma Patient model with the service code:
- **Fields that EXIST in schema**: id, uhid, firstName, lastName, gender, dateOfBirth, phone, email, bloodGroup, address, city, state, pincode, emergencyContact, referredById, createdById, emergencyContactName, emergencyContactRelationship, fastingStatus, insuranceNumber, insuranceProvider, nationalId
- **Fields MISSING from schema**: middleName, country, landmark, alternatePhone, aadhaarNumber, panNumber, patientType, maritalStatus, occupation, nationality, allergies, chronicDiseases, currentMedications, height, weight, bmi, preferredLanguage, communicationPreference, consentForTreatment, consentForDataSharing, consentForMarketing, familyHeadId, relationshipToHead, notes, isDraft, registrationSource, referralSource, qrCode, verificationStatus, phoneVerified, emailVerified, kycVerified, kycVerifiedAt, kycVerifiedById, photoUrl, insuranceExpiryDate, formStep, formProgress, lastEditedSection

---

### Bug 1.5: Draft Service Using Non-Existent Form Progress Fields

**Bug Condition:**
When `patient.draft.service.ts` uses `formStep`, `formProgress`, or `lastEditedSection` fields, the system throws a database error.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is draft operation
  OUTPUT: boolean
  
  RETURN (input.operation IN [saveDraft, getUserDrafts, finalizeDraft]) AND
         (input.fields IN [formStep, formProgress, lastEditedSection]) AND
         (ANY(input.fields) NOT IN PrismaPatientModel.fields)
END FUNCTION
```

---

### Bug 1.6: Empty Gender String Validation Bypass

**Bug Condition:**
When the frontend submits an empty string for `gender` field, the backend validation passes but the database insert fails.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is patient creation request
  OUTPUT: boolean
  
  RETURN (input.gender = "" OR input.gender = null) AND
         (validation_passes()) AND
         (database_insert_fails())
END FUNCTION
```

**Examples:**
- Input: `{firstName: "John", lastName: "Doe", gender: ""}` → Validation passes → Database error

---

### Bug 1.7: Incorrect Duplicate Checking Logic

**Bug Condition:**
When `checkDuplicatePatient` is called with multiple fields, the function checks if ALL fields match the same patient instead of checking if ANY field matches ANY patient.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is duplicate check with multiple identifier fields
  OUTPUT: boolean
  
  RETURN (COUNT(input.identifiers) > 1) AND
         (check_returns_patient_only_if_all_fields_match_same_patient()) AND
         (NOT check_returns_patient_if_any_field_matches_any_patient())
END FUNCTION
```

**Current Code Issue:**
The current implementation builds an AND condition requiring all provided fields to match:
```typescript
const whereCondition: any = {};
if (phone) whereCondition.phone = phone;
if (email) whereCondition.email = email;
// This requires ALL fields to match, not ANY
```

**Expected:**
Should return patients matching ANY of the provided identifiers.

---

### Bug 1.8: Communication Preference Overwrite

**Bug Condition:**
When `updatePatient` receives a `communicationPreference` object, the system overwrites all preferences instead of merging.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is update with partial communicationPreference
  OUTPUT: boolean
  
  RETURN (input.communicationPreference is partial) AND
         (existing_preferences_overwritten_not_merged())
END FUNCTION
```

**Examples:**
- Existing: `{sms: true, email: true, whatsapp: true, call: false}`
- Update with: `{email: false}`
- Current result: `{email: false}` (all others lost)
- Expected result: `{sms: true, email: false, whatsapp: true, call: false}`

---

### Bug 1.9: Insurance Expiry Date String Not Converted

**Bug Condition:**
When `finalizeDraft` processes insurance expiry date, the system passes a string value instead of a Date object to Prisma.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: draft finalization with insuranceExpiryDate as string
  OUTPUT: boolean
  
  RETURN (input.insuranceExpiryDate is string) AND
         (date_not_converted_to_Date_object())
END FUNCTION
```

---

### Bug 1.10: Sample Tracking Metadata Not Properly Typed

**Bug Condition:**
When `createPatientWithOrder` creates sample tracking history, the `metadata` field is passed as a plain object instead of being properly serialized for Prisma's Json type.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input is sample tracking history creation
  OUTPUT: boolean
  
  RETURN (input.metadata is plain_object) AND
         (NOT properly_typed_as_prisma_json())
END FUNCTION
```

---

### Bug 1.11: Email Verification Route Path Conflict

**Bug Condition:**
When the `verifyEmail` endpoint is called, the route path `POST /verify/email` conflicts with authenticated routes pattern.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: POST /patients/verify/email request
  OUTPUT: boolean
  
  RETURN (route_path_conflicts_with_authenticated_pattern()) OR
         (validation_middleware_not_applied())
END FUNCTION
```

---

### Bug 1.12: Route Ordering Causes /count to Match /:id

**Bug Condition:**
When the `/count` endpoint is requested, the route matches `/:id` pattern returning a patient with id "count".

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: GET /patients/count request
  OUTPUT: boolean
  
  RETURN (/:id_route_comes_before_/count_route()) AND
         (count_returns_patient_with_id_"count"_instead_of_count)
END FUNCTION
```

---

### Bug 1.13: Frontend Draft Selector Undefined Fields

**Bug Condition:**
When `DraftSelector.tsx` displays draft data, the `formStep` and `formProgress` fields may be undefined causing undefined display values.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: draft data display request
  OUTPUT: boolean
  
  RETURN (draft.formStep is undefined OR draft.formProgress is undefined) AND
         (undefined_values_displayed_without_default())
END FUNCTION
```

---

### Bug 1.14: Date of Birth Not Validated Before Conversion

**Bug Condition:**
When `patient.service.ts` creates a patient with `dateOfBirth` field, the date string is not properly validated before conversion.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: patient creation with dateOfBirth string
  OUTPUT: boolean
  
  RETURN (input.dateOfBirth is invalid_date_string) AND
         (conversion_attempted_without_validation()) AND
         (invalid_date_error_thrown())
END FUNCTION
```

---

### Bug 1.15: Insurance Expiry Date Not Validated

**Bug Condition:**
When `patient.service.ts` creates a patient with `insuranceExpiryDate` field, the date string is not properly validated before conversion.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: patient creation with insuranceExpiryDate string
  OUTPUT: boolean
  
  RETURN (input.insuranceExpiryDate is invalid_date_string) AND
         (conversion_attempted_without_validation())
END FUNCTION
```

---

### Bug 1.16: Inconsistent UHID Generation Between Controllers

**Bug Condition:**
When `patient.controller.ts` creates a patient, UHID handling differs from `patient.service.ts` auto-generation.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: patient creation through different controllers
  OUTPUT: boolean
  
  RETURN (patient_controller_expects_uhid_from_client()) AND
         (patient_service_auto_generates_uhid()) AND
         (inconsistent_behavior_between_controllers())
END FUNCTION
```

---

### Bug 1.17: Current Medications Serialization Issue

**Bug Condition:**
When `patient.service.ts` saves `currentMedications` as an array of objects, the Prisma schema does not define this field type.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: patient with currentMedications array
  OUTPUT: boolean
  
  RETURN (input.currentMedications is array_of_objects) AND
         (field_not_defined_in_prisma_schema()) AND
         (potential_serialization_issues())
END FUNCTION
```

---

### Bug 1.18: Postal Code Validation Transform Issue

**Bug Condition:**
When `patient.validation.ts` validates `postalCode` field, the refine function returns the original value instead of the transformed value.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: postalCode validation
  OUTPUT: boolean
  
  RETURN (refine_returns_original_value_not_transformed()) AND
         (validation_passes_with_incorrect_format())
END FUNCTION
```

---

### Bug 1.19: Phone Normalization Conflict with Validation

**Bug Condition:**
When `patient.draft.service.ts` normalizes phone numbers, the function removes country codes but the validation regex expects exact 10-digit format.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: phone number normalization and validation
  OUTPUT: boolean
  
  RETURN (draft_service_normalizes_phone()) AND
         (validation_regex_expects_exact_10_digit()) AND
         (normalized_phone_fails_validation_if_country_code_removed())
END FUNCTION
```

---

### Bug 1.20: Frontend Auto-Save Stale Closure

**Bug Condition:**
When `PatientRegistrationForm.tsx` auto-saves draft, the function references `formData` in the setInterval closure causing stale data to be saved.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: auto-save interval execution
  OUTPUT: boolean
  
  RETURN (setInterval_references_formData_closure()) AND
         (stale_data_saved_not_current_formData())
END FUNCTION
```

---

### Bug 1.21: UHID Generation Race Condition

**Bug Condition:**
When `patient.service.ts` generates UHID, there is a race condition where concurrent requests might generate duplicate UHIDs.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: concurrent patient creation requests
  OUTPUT: boolean
  
  RETURN (multiple_concurrent_create_requests()) AND
         (uhid_generation_not_atomic()) AND
         (duplicate_uhids_generated())
END FUNCTION
```

**Current Code Issue:**
```typescript
const generateUHID = async () => {
  const count = await prisma.patient.count(); // Not atomic
  const number = String(count + 1).padStart(6, "0");
  const uhid = `LC-${number}`;
  
  const existing = await prisma.patient.findUnique({ where: { uhid } });
  // Race condition: between count and create, another request might use same number
  ...
};
```

---

### Bug 1.22: Family Members Query Using Non-Existent Field

**Bug Condition:**
When `patient.advanced.service.ts` retrieves family members, the query assumes `familyHeadId` exists on Patient model.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: family members retrieval request
  OUTPUT: boolean
  
  RETURN (query_uses_familyHeadId_field()) AND
         (familyHeadId_not_in_patient_schema())
END FUNCTION
```

---

### Bug 1.23: Check Duplicate Schema Passes with Undefined Values

**Bug Condition:**
When `patient.routes.ts` validates `checkDuplicateSchema`, the query schema validation passes with undefined values if none of the fields are provided.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: check-duplicate request with no fields
  OUTPUT: boolean
  
  RETURN (all_fields_undefined()) AND
         (validation_passes_without_error())
END FUNCTION
```

---

### Bug 1.24: BMI Calculation Silent Failure

**Bug Condition:**
When `patient.draft.service.ts` calculates BMI, the calculation fails silently if height or weight are stored as strings instead of numbers.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: BMI calculation with string values
  OUTPUT: boolean
  
  RETURN (height OR weight is string) AND
         (calculation_fails_silently()) AND
         (bmi_undefined_or_nan())
END FUNCTION
```

---

### Bug 1.25: Frontend BMI Memoization Missing

**Bug Condition:**
When `PatientRegistrationForm.tsx` displays BMI, the calculation happens on each render without memoization.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: component render with BMI display
  OUTPUT: boolean
  
  RETURN (bmi_calculated_on_every_render()) AND
         (no_memoization_used())
END FUNCTION
```

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
1. Patient creation with valid basic information (firstName, lastName, gender) must continue to work with generated UHID
2. Patient search by name, phone, or UHID must continue to return matching patients with proper pagination
3. Patient retrieval by ID must continue to return complete patient details including related orders and doctor information
4. Patient updates with valid data using existing schema fields must continue to persist changes
5. Patient deletion by admin must continue to remove the patient record
6. Duplicate check with no matching fields must continue to return no duplicates
7. Frontend form validation of required fields must continue to display appropriate messages
8. Draft auto-save must continue to preserve form progress for resumption

**Scope:**
All inputs that do not trigger any of the 25 bug conditions should be completely unaffected by these fixes.

---

## Hypothesized Root Causes

### Category 1: Missing Prisma Models (Bugs 1.1-1.3)
- `PatientVerification`, `PatientMedicalHistory`, and `PatientConsent` models were designed but never added to the Prisma schema
- Service code was written expecting these models to exist

### Category 2: Schema Evolution Drift (Bugs 1.4-1.5, 1.17, 1.22)
- The service layer interfaces define fields that were never added to the Prisma Patient model
- This represents a disconnect between interface design and database schema implementation
- Fields were added to TypeScript interfaces but corresponding Prisma schema migrations were not created

### Category 3: Validation Logic Gaps (Bugs 1.6, 1.18, 1.19, 1.23)
- Zod validation schemas don't handle edge cases like empty strings for required enums
- Transform and refine order in Zod can cause unexpected behavior
- Validation in frontend and backend have inconsistent expectations

### Category 4: Incorrect Business Logic (Bugs 1.7, 1.8)
- Duplicate checking uses AND logic when it should use OR logic
- Communication preference update uses direct assignment instead of merge

### Category 5: Type Conversion Issues (Bugs 1.9, 1.10, 1.14, 1.15, 1.24)
- Date strings not properly converted to Date objects before Prisma operations
- JSON fields not properly typed for Prisma
- String-to-number conversion missing in calculations

### Category 6: Route Configuration (Bugs 1.11, 1.12)
- Route ordering issues in Express (specific routes must come before parameterized routes)
- Validation middleware not consistently applied

### Category 7: Frontend State Management (Bugs 1.13, 1.20, 1.25)
- Undefined values not handled with defaults
- Closure variables in setInterval causing stale data
- Missing memoization for computed values

### Category 8: Concurrency Issues (Bug 1.21)
- UHID generation is not atomic
- Count-then-create pattern has race condition window

### Category 9: Controller Consistency (Bug 1.16)
- Different controllers have different expectations for UHID handling
- Need to standardize on auto-generation

---

## Correctness Properties

Property 1: Bug Condition - Missing Verification Table

_For any_ request to create a PatientVerification record through patient.advanced.service, the fixed system SHALL have a properly defined Prisma model that allows successful persistence of verification data including patientId, type, token, otp, expiresAt, and verifiedAt fields.

**Validates: Requirements 2.1**

---

Property 2: Bug Condition - Missing Medical History Table

_For any_ request to create a PatientMedicalHistory record, the fixed system SHALL have a properly defined Prisma model that allows successful persistence of medical history data.

**Validates: Requirements 2.1**

---

Property 3: Bug Condition - Missing Consent Table

_For any_ request to create a PatientConsent record, the fixed system SHALL have a properly defined Prisma model that allows successful persistence of consent data.

**Validates: Requirements 2.1**

---

Property 4: Bug Condition - Schema Field Mismatches

_For any_ patient creation or update operation, the fixed service SHALL only use fields that are defined in the Prisma Patient model, storing extended data in properly typed JSON fields or additional database columns added via migration.

**Validates: Requirements 2.2**

---

Property 5: Bug Condition - Draft Form Progress Fields

_For any_ draft operation using formStep, formProgress, or lastEditedSection, the fixed system SHALL either have these fields defined in the Prisma schema or properly handle their absence without throwing database errors.

**Validates: Requirements 2.3**

---

Property 6: Bug Condition - Empty Gender Validation

_For any_ patient creation request with an empty string or null for the required gender field, the fixed validation SHALL reject the request with a clear error message instead of attempting database insertion.

**Validates: Requirements 2.4**

---

Property 7: Bug Condition - Duplicate Patient Detection

_For any_ duplicate check with multiple identifier fields (phone, email, aadhaarNumber, panNumber), the fixed function SHALL return any patient that matches ANY of the provided identifiers, not only patients where ALL fields match.

**Validates: Requirements 2.5**

---

Property 8: Bug Condition - Communication Preference Merge

_For any_ patient update with partial communication preferences, the fixed updatePatient function SHALL merge new preferences with existing preferences, preserving unspecified preference values.

**Validates: Requirements 2.6**

---

Property 9: Bug Condition - Insurance Date Parsing

_For any_ draft finalization with insurance expiry date, the fixed finalizeDraft function SHALL properly parse and convert the date string to a Date object before database insertion.

**Validates: Requirements 2.7**

---

Property 10: Bug Condition - Sample Tracking Metadata

_For any_ sample tracking history creation, the fixed createPatientWithOrder function SHALL properly type the metadata field as Prisma.JsonObject.

**Validates: Requirements 2.8**

---

Property 11: Bug Condition - Email Verification Route

_For any_ email verification request, the fixed route SHALL use a distinct path that does not conflict with authenticated routes and SHALL apply validation middleware.

**Validates: Requirements 2.9**

---

Property 12: Bug Condition - Route Ordering

_For any_ GET request to /patients/count, the fixed router SHALL match the count-specific route before the generic /:id route through correct route ordering.

**Validates: Requirements 2.10**

---

Property 13: Bug Condition - Frontend Undefined Fields

_For any_ draft data display where formStep or formProgress is undefined, the fixed frontend SHALL handle undefined fields gracefully with default values.

**Validates: Requirements 2.11**

---

Property 14: Bug Condition - Date of Birth Validation

_For any_ patient creation with dateOfBirth field, the fixed service SHALL validate the date string before conversion and reject invalid dates.

**Validates: Requirements 2.12**

---

Property 15: Bug Condition - Insurance Expiry Validation

_For any_ patient creation with insuranceExpiryDate field, the fixed service SHALL validate the date string before conversion.

**Validates: Requirements 2.12**

---

Property 16: Bug Condition - UHID Generation Consistency

_For any_ patient creation through any controller, the fixed system SHALL use consistent UHID auto-generation logic.

**Validates: Requirements 2.13**

---

Property 17: Bug Condition - Current Medications Serialization

_For any_ patient save with currentMedications array, the fixed system SHALL properly serialize the data for storage (JSON field or separate table).

**Validates: Requirements 2.14**

---

Property 18: Bug Condition - Phone Validation Coordination

_For any_ phone number validation, the fixed validation SHALL account for the phone normalization logic (removing country codes and spaces).

**Validates: Requirements 2.15**

---

Property 19: Bug Condition - Auto-Save Stale Closure

_For any_ auto-save operation, the fixed frontend SHALL use a ref or callback to access current form data instead of closure variable.

**Validates: Requirements 2.16**

---

Property 20: Bug Condition - UHID Race Condition

_For any_ concurrent patient creation requests, the fixed UHID generation SHALL use database-level locking or atomic operations to prevent duplicate UHIDs.

**Validates: Requirements 2.17**

---

Property 21: Bug Condition - Family Members Query

_For any_ family members retrieval, the fixed query SHALL only use fields that exist in the schema or properly handle the absence of familyHeadId.

**Validates: Requirements 2.18**

---

Property 22: Bug Condition - Duplicate Schema Validation

_For any_ check-duplicate request with no fields provided, the fixed validation SHALL reject the request with a validation error.

**Validates: Requirements 2.23**

---

Property 23: Bug Condition - BMI Calculation Type Safety

_For any_ BMI calculation, the fixed service SHALL handle type conversion (string to number) and return undefined for invalid inputs.

**Validates: Requirements 2.19**

---

Property 24: Bug Condition - Frontend BMI Memoization

_For any_ BMI display in the frontend, the fixed component SHALL use memoization to prevent unnecessary recalculations.

**Validates: Requirements 2.20**

---

Property 25: Preservation - Successful Patient Creation

_For any_ valid patient creation request with correct data and no duplicate conflicts, the fixed code SHALL continue to create the patient with generated UHID and return success.

**Validates: Requirements 3.1**

---

Property 26: Preservation - Patient Search

_For any_ patient search by name, phone, or UHID, the fixed code SHALL continue to return matching patients with proper pagination.

**Validates: Requirements 3.2**

---

Property 27: Preservation - Patient Retrieval

_For any_ patient retrieval by ID, the fixed code SHALL continue to return complete patient details including related orders and doctor information.

**Validates: Requirements 3.3**

---

Property 28: Preservation - Patient Update

_For any_ patient update with valid data using existing schema fields, the fixed code SHALL continue to successfully persist changes.

**Validates: Requirements 3.4**

---

Property 29: Preservation - Patient Deletion

_For any_ patient deletion by admin, the fixed code SHALL continue to remove the patient record from the database.

**Validates: Requirements 3.5**

---

Property 30: Preservation - Duplicate Check

_For any_ duplicate check with no matching fields, the fixed code SHALL continue to return no duplicates found.

**Validates: Requirements 3.6**

---

Property 31: Preservation - Form Validation

_For any_ frontend form validation of required fields, the fixed code SHALL continue to display appropriate validation messages.

**Validates: Requirements 3.7**

---

Property 32: Preservation - Draft Auto-Save

_For any_ draft auto-save operation, the fixed code SHALL continue to preserve form progress for resumption.

**Validates: Requirements 3.8**

---

## Fix Implementation

### Phase 1: Database Schema Updates

**File:** `backend/prisma/schema.prisma`

**Changes Required:**

1. **Add PatientVerification Model:**
```prisma
model PatientVerification {
  id          String   @id @default(cuid())
  patientId   String
  type        String   // "PHONE" or "EMAIL"
  token       String?  @unique // For email verification
  otp         String?  // For phone verification
  expiresAt   DateTime
  verifiedAt  DateTime?
  createdAt   DateTime @default(now())
  
  patient     Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  @@index([patientId])
  @@index([token])
  @@map("patient_verifications")
}
```

2. **Add PatientMedicalHistory Model:**
```prisma
model PatientMedicalHistory {
  id              String   @id @default(cuid())
  patientId       String
  condition       String
  diagnosedDate   DateTime?
  notes           String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  patient         Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  @@index([patientId])
  @@map("patient_medical_histories")
}
```

3. **Add PatientConsent Model:**
```prisma
model PatientConsent {
  id              String   @id @default(cuid())
  patientId       String
  consentType     String   // "TREATMENT", "DATA_SHARING", "MARKETING"
  consented       Boolean  @default(false)
  consentedAt     DateTime?
  revokedAt       DateTime?
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  patient         Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  @@unique([patientId, consentType])
  @@index([patientId])
  @@map("patient_consents")
}
```

4. **Add Missing Fields to Patient Model:**
```prisma
model Patient {
  // ... existing fields ...
  
  // Extended patient information
  middleName                   String?
  alternatePhone               String?   @db.VarChar(15)
  landmark                     String?
  country                      String?   @default("India")
  aadhaarNumber                String?   @unique
  panNumber                    String?   @unique
  patientType                  String?   @default("GENERAL")
  maritalStatus                String?
  occupation                   String?
  nationality                  String?   @default("Indian")
  allergies                    Json?     // Array of strings
  chronicDiseases              Json?     // Array of strings
  currentMedications           Json?     // Array of medication objects
  height                       Float?    // in cm
  weight                       Float?    // in kg
  bmi                          Float?
  preferredLanguage            String?   @default("ENGLISH")
  communicationPreference      Json?     // {sms, email, whatsapp, call}
  consentForTreatment          Boolean   @default(false)
  consentForDataSharing        Boolean   @default(false)
  consentForMarketing          Boolean   @default(false)
  familyHeadId                 String?
  relationshipToHead           String?
  notes                        String?   @db.VarChar(1000)
  isDraft                      Boolean   @default(false)
  registrationSource           String?   @default("WALK_IN")
  referralSource               String?
  qrCode                       String?
  verificationStatus           String?   @default("UNVERIFIED")
  phoneVerified                Boolean   @default(false)
  emailVerified                Boolean   @default(false)
  kycVerified                  Boolean   @default(false)
  kycVerifiedAt                DateTime?
  kycVerifiedById              String?
  photoUrl                     String?
  insuranceExpiryDate          DateTime?
  formStep                     Int?
  formProgress                 Float?
  lastEditedSection            String?
  
  // Relations for new models
  verifications                PatientVerification[]
  medicalHistories             PatientMedicalHistory[]
  consents                     PatientConsent[]
  familyMembers                Patient[]              @relation("FamilyMembers")
  familyHead                   Patient?               @relation("FamilyMembers", fields: [familyHeadId], references: [id])
  
  // ... rest of model ...
}
```

### Phase 2: Service Layer Fixes

**File:** `backend/api/src/modules/patients/patient.service.ts`

**Fix 1.7: Duplicate Check - Use OR Logic:**
```typescript
export const checkDuplicatePatient = async (
  phone?: string,
  email?: string,
  aadhaarNumber?: string,
  panNumber?: string,
  excludePatientId?: string
) => {
  const conditions = [];
  
  if (phone) conditions.push({ phone });
  if (email) conditions.push({ email });
  if (aadhaarNumber) conditions.push({ aadhaarNumber });
  if (panNumber) conditions.push({ panNumber });
  
  if (conditions.length === 0) return null;
  
  const existingPatient = await prisma.patient.findFirst({
    where: {
      OR: conditions,  // ANY field match
      ...(excludePatientId && { id: { not: excludePatientId } })
    },
    select: { id: true, uhid: true, firstName: true, lastName: true, 
              phone: true, email: true, aadhaarNumber: true, panNumber: true }
  });
  
  return existingPatient;
};
```

**Fix 1.8: Communication Preference Merge (Already Fixed in Code):**
The current code already implements merging:
```typescript
let communicationPref = undefined;
if (data.communicationPreference) {
  communicationPref = {
    ...(patient.communicationPreference as any || {}),
    ...data.communicationPreference,
  };
}
```

**Fix 1.14, 1.15: Date Validation Before Conversion:**
```typescript
// Helper function to safely parse dates
const safeParseDate = (dateString: string | undefined | null): Date | undefined => {
  if (!dateString) return undefined;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date format: ${dateString}`);
  }
  return date;
};

// In createPatient:
dateOfBirth: safeParseDate(data.dateOfBirth),
insuranceExpiryDate: safeParseData(data.insuranceExpiryDate),
```

**Fix 1.21: Atomic UHID Generation:**
```typescript
const generateUHID = async (tx?: PrismaClient | Prisma.TransactionClient) => {
  const client = tx || prisma;
  
  // Use raw query with database-level locking
  const result = await client.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) as count FROM patients WHERE "isDraft" = false FOR UPDATE
  `;
  
  const count = Number(result[0].count);
  const number = String(count + 1).padStart(6, "0");
  let uhid = `LC-${number}`;
  
  // Check existence within transaction
  const existing = await client.patient.findUnique({
    where: { uhid }
  });
  
  if (existing) {
    // Use random suffix on collision
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    uhid = `LC-${number}-${randomSuffix}`;
  }
  
  return uhid;
};
```

**Fix 1.10: Metadata JSON Type:**
```typescript
await tx.sampleTrackingHistory.create({
  data: {
    // ...
    metadata: {
      orderNumber,
      sampleNumber: sample.sampleNumber,
      barcode: sample.barcode,
    } as Prisma.JsonObject,  // Explicit type
  },
});
```

### Phase 3: Draft Service Fixes

**File:** `backend/api/src/modules/patients/patient.draft.service.ts`

**Fix 1.9: Insurance Date Conversion (Already Fixed):**
The code already converts dates properly.

**Fix 1.24: BMI Calculation Type Safety:**
```typescript
const calculateBMI = (height: number | string | null | undefined, 
                       weight: number | string | null | undefined): number | undefined => {
  const h = typeof height === 'string' ? parseFloat(height) : height;
  const w = typeof weight === 'string' ? parseFloat(weight) : weight;
  
  if (!h || !w || isNaN(h) || isNaN(w) || h <= 0 || w <= 0) {
    return undefined;
  }
  
  const heightInMeters = h / 100;
  return parseFloat((w / (heightInMeters * heightInMeters)).toFixed(2));
};
```

### Phase 4: Validation Fixes

**File:** `backend/api/src/modules/patients/patient.validation.ts`

**Fix 1.6: Gender Empty String Handling:**
```typescript
gender: z.enum(["MALE", "FEMALE", "OTHER"], {
  errorMap: () => ({ message: "Gender must be MALE, FEMALE, or OTHER" })
}).refine(val => val !== "", "Gender is required"),
```

**Fix 1.18: Postal Code Transform Order:**
```typescript
postalCode: z.string()
  .max(20)
  .optional()
  .or(z.literal(''))
  .or(z.null())
  .transform(val => (val === '' ? undefined : val?.trim() || undefined))
  .refine((val) => {
    if (!val) return true;
    return /^\d{6}$/.test(val);
  }, "Invalid PIN code format (6 digits required)"),
```

**Fix 1.19: Phone Validation with Normalization:**
```typescript
phone: z.string()
  .min(10, "Phone number must be at least 10 digits")
  .max(15, "Phone number cannot exceed 15 digits")  // Allow for country codes
  .optional()
  .or(z.literal(''))
  .or(z.null())
  .transform(val => val ? val.replace(/\s/g, '').replace(/^\+91/, '').replace(/^\+/, '') : undefined)
  .refine((val) => {
    if (!val) return true;
    // After normalization, expect 10 digits
    return /^[6-9]\d{9}$/.test(val) || val.length >= 10;
  }, "Invalid phone number format"),
```

**Fix 1.23: Check Duplicate Schema Require At Least One Field:**
```typescript
export const checkDuplicateSchema = {
  query: z.object({
    phone: z.string().optional(),
    email: z.string().email().optional(),
    aadhaarNumber: z.string().optional(),
    panNumber: z.string().optional(),
  }).refine(
    (data) => {
      const hasPhone = data.phone && data.phone.trim() !== '';
      const hasEmail = data.email && data.email.trim() !== '';
      const hasAadhaar = data.aadhaarNumber && data.aadhaarNumber.trim() !== '';
      const hasPan = data.panNumber && data.panNumber.trim() !== '';
      return hasPhone || hasEmail || hasAadhaar || hasPan;
    },
    { message: "At least one identifier field is required for duplicate check" }
  ),
};
```

### Phase 5: Route Fixes

**File:** `backend/api/src/modules/patients/patient.routes.ts`

**Fix 1.12: Route Ordering (Already Fixed):**
The code already has `/count` before `/:id`.

**Fix 1.11: Email Verification Validation (Already Fixed):**
The route already includes validation middleware.

### Phase 6: Frontend Fixes

**File:** `frontend/src/components/PatientRegistration/PatientRegistrationForm.tsx`

**Fix 1.20: Auto-Save Stale Closure:**
```typescript
// Use useRef to access current form data
const formDataRef = useRef(formData);
formDataRef.current = formData;

useEffect(() => {
  const interval = setInterval(() => {
    if (autoSaveEnabled) {
      saveDraft(formDataRef.current);  // Always gets current data
    }
  }, 30000);
  
  return () => clearInterval(interval);
}, [autoSaveEnabled]);
```

**Fix 1.25: BMI Memoization:**
```typescript
const calculatedBMI = useMemo(() => {
  if (!formData.height || !formData.weight) return undefined;
  const heightInMeters = Number(formData.height) / 100;
  return parseFloat((Number(formData.weight) / (heightInMeters * heightInMeters)).toFixed(2));
}, [formData.height, formData.weight]);
```

**Fix 1.13: Draft Selector Default Values:**
```typescript
// In DraftSelector.tsx
<span>{draft.formStep ?? 1}</span>
<span>{draft.formProgress ?? 0}%</span>
```

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code, then verify the fix works correctly and preserves existing behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix.

**Test Cases:**

1. **Missing Tables Test**: Attempt to create verification, medical history, and consent records. Expected: Prisma error on unfixed code.

2. **Schema Field Mismatch Test**: Create patient with extended fields. Expected: Database error for missing columns.

3. **Empty Gender Test**: Submit patient with `gender: ""`. Expected: Validation passes but database fails.

4. **Duplicate Check Test**: Check duplicate with phone="123" and email="a@b.com" where Patient A has phone="123" only. Expected: Should return Patient A.

5. **Communication Preference Test**: Update patient with partial preferences. Expected: Other preferences lost.

6. **Date Parsing Test**: Submit invalid date strings. Expected: Invalid date stored or error.

7. **Route Ordering Test**: GET /patients/count. Expected: Returns patient with id="count" on unfixed code.

8. **UHID Race Test**: Send concurrent patient creation requests. Expected: Potential duplicate UHIDs.

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds, the fixed function produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedFunction(input)
  ASSERT expectedBehavior(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold, the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalFunction(input) = fixedFunction(input)
END FOR
```

### Unit Tests

- Test patient creation with all valid fields
- Test duplicate detection with various field combinations
- Test communication preference merging
- Test date validation and conversion
- Test UHID generation uniqueness
- Test BMI calculation with various inputs

### Property-Based Tests

- Generate random patient data and verify creation succeeds
- Generate random update operations and verify preservation of unspecified fields
- Test concurrent UHID generation for race conditions
- Test BMI calculation with edge cases (strings, nulls, negatives)

### Integration Tests

- Test full patient registration flow
- Test draft creation, auto-save, and finalization
- Test verification workflows
- Test family member linking
- Test consent recording

---

## Implementation Priority

### Priority 1: Database Schema (Blocking)
- Bugs 1.1-1.3: Missing tables cause runtime errors
- Bug 1.4-1.5: Missing fields cause data loss

### Priority 2: Data Integrity (Critical)
- Bug 1.7: Duplicate check affects patient identification
- Bug 1.8: Preference merge affects user settings
- Bug 1.21: UHID race condition can create duplicates

### Priority 3: Validation (Important)
- Bug 1.6: Empty gender causes silent failures
- Bug 1.14-1.15: Date validation prevents data corruption

### Priority 4: API Correctness (Medium)
- Bug 1.11-1.12: Route issues affect API behavior
- Bug 1.23: Validation bypass allows invalid requests

### Priority 5: Frontend (Lower)
- Bug 1.13, 1.20, 1.25: User experience improvements
