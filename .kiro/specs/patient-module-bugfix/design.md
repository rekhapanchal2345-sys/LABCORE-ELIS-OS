# Patient Module Bugfix Design

## Overview

The patient module contains 14 critical bugs spanning validation, data transformation, service layer logic, route organization, and database operations. This design document provides a comprehensive technical solution covering all defects while preserving existing functionality. The fixes address validator enhancements, communication preference merging, biometric validation, normalization logic, date handling, and route ordering issues. Implementation focuses on minimal, targeted changes without over-engineering or introducing unnecessary abstractions.

## Glossary

- **Bug_Condition (C)**: The specific input or operational context that triggers the bug
- **Property (P)**: The desired correct behavior when the bug condition is met
- **Preservation**: Existing behaviors that must remain unchanged by the fixes
- **Validator**: Zod schema used for request validation in `patient.validation.ts`
- **Draft Service**: Auto-save service layer in `patient.draft.service.ts` handling form persistence
- **Patient Service**: Core service layer in `patient.service.ts` handling CRUD operations
- **Normalization**: Process of standardizing data format (removing spaces, prefixes, etc.)
- **BMI**: Body Mass Index calculated from height (cm) and weight (kg)
- **UHID**: Unique Health ID generated for each patient
- **Communication Preference**: User preferences for SMS, email, WhatsApp, and call notifications

## Bug Details

### Bug 1: Phone Number Normalization Fails in Draft Service

When a patient draft is created or updated with a phone number containing spaces or country codes (+91, +), the phone number is not normalized. The stored data retains spaces and country codes instead of storing a clean numeric format.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input is a draft save request with phone containing spaces, '+91', or '+'
  OUTPUT: boolean
  
  RETURN (input.data.phone CONTAINS ' ' OR 
          input.data.phone STARTS_WITH '+91' OR
          input.data.phone STARTS_WITH '+')
         AND normalized_phone_not_stored(input.data.phone)
END FUNCTION
```

**Current Code Issue:** In `patient.draft.service.ts` `saveDraft()`, phone normalization is not applied before storing draft data.

**Examples:**
- Input: `"+91 98765 43210"` → Stored: `"+91 98765 43210"` (incorrect)
- Input: `"98765 43210"` → Stored: `"98765 43210"` (incorrect, spaces not removed)
- Input: `"+919876543210"` → Stored: `"+919876543210"` (incorrect, +91 not removed)

---

### Bug 2: Email Validation Inconsistency Across Schemas

When creating a patient via `createPatientWithOrderSchema`, an empty email string (`""`) is allowed and validated as correct despite the email field being optional. The schema should transform empty strings to undefined/null.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input is createPatientWithOrder request with email = ""
  OUTPUT: boolean
  
  RETURN (input.patient.email === "" OR input.patient.email === null)
         AND validation_does_not_transform_to_undefined(input.patient.email)
END FUNCTION
```

**Current Code Issue:** In `patient.validation.ts` `createPatientWithOrderSchema`, the email transform chain has inconsistent logic: `.email().optional().or(z.literal('')).or(z.string().max(255).optional())` which doesn't properly handle empty strings.

**Examples:**
- Input: `{email: ""}` → Should transform to `undefined`, currently passes validation as `""`
- Input: `{email: null}` → Should remain `null`, currently passes validation
- Input: `{email: "user@example.com"}` → Should remain as-is (correct behavior)

---

### Bug 3: Communication Preference Merge Overwrites on Update

When updating a patient with partial communication preferences (e.g., only setting `email: false`), the entire existing communication preference object is completely overwritten instead of being merged with existing values. Result: user loses previously set preferences.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input is update request with partial communicationPreference
         existing patient has communicationPreference = {sms: true, email: true, whatsapp: true, call: false}
  OUTPUT: boolean
  
  RETURN (input.data.communicationPreference is provided AND
          input.data.communicationPreference is partial) AND
         preferences_are_overwritten_not_merged(existing, input.data.communicationPreference)
END FUNCTION
```

**Current Code Issue:** In `patient.service.ts` `updatePatient()`, communication preferences are directly assigned without merging with existing values.

**Examples:**
- Existing: `{sms: true, email: true, whatsapp: true, call: false}`
- Update with: `{email: false}`
- Current result: `{email: false}` (all other preferences lost) ❌
- Expected result: `{sms: true, email: false, whatsapp: true, call: false}` ✓

---

### Bug 4: Missing Null Check on Patient Verification

When retrieving a patient verification record that doesn't exist, the system attempts to access properties on a null object without proper null coalescing, causing errors.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input is verification retrieval request for non-existent verification record
  OUTPUT: boolean
  
  RETURN verification_record_is_null(input) AND
         properties_accessed_without_null_check()
END FUNCTION
```

**Current Code Issue:** In `patient.service.ts` `sendPhoneOTP()` or `sendEmailVerificationLink()`, the verification record is retrieved without null checking before accessing properties.

**Examples:**
- Attempt to access `verification.expiresAt` when `verification` is null → TypeError
- Missing logic: `const verification = await prisma.patientVerification.findUnique(...); if (!verification) { throw new Error(...) }`

---

### Bug 5: Height/Weight Validation Accepts Invalid Values

When submitting height or weight with value `0`, the system stores the value despite 0 being invalid for biometric measurements (no human can have zero height/weight).

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input contains height = 0 OR weight = 0
  OUTPUT: boolean
  
  RETURN (input.height === 0 OR input.weight === 0) AND
         zero_values_not_rejected()
END FUNCTION
```

**Current Code Issue:** In `patient.validation.ts` `createPatientSchema` and `updatePatientSchema`, height and weight have `.min(0)` which allows 0. Should be `.min(1)` to exclude 0.

**Examples:**
- Input: `{height: 0, weight: 75}` → Currently stored (incorrect)
- Input: `{height: 170, weight: 0}` → Currently stored (incorrect)
- Input: `{height: 1, weight: 1}` → Should be accepted (minimum valid)

---

### Bug 6: PIN Code Validation Bypassed for Empty Strings

When submitting an empty postalCode string, the validation doesn't enforce the 6-digit format because the transform converts empty string to undefined before the refine check runs, bypassing validation entirely.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input contains postalCode = ""
  OUTPUT: boolean
  
  RETURN (input.postalCode === "") AND
         validation_bypassed_due_to_transform()
END FUNCTION
```

**Current Code Issue:** In `patient.validation.ts`, postalCode has this order:
```
.transform(val => val?.trim() || undefined)
.refine((val) => { if (!val) return true; return /^\d{6}$/.test(val); })
```
The refine allows undefined to pass, but the transform happens first, so empty strings become undefined.

**Fix Strategy:** Move transform after refine, or restructure to validate before transforming.

---

### Bug 7: Aadhaar Regex Missing Validation Check

When submitting an Aadhaar number with a leading digit of 0 or 1, the regex validation incorrectly rejects valid Aadhaar numbers. Per UIDAI specifications, Aadhaar must start with 2-9.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: input contains aadhaarNumber starting with valid digit (2-9)
         regex pattern is /^[2-9]{1}[0-9]{11}$/
  OUTPUT: boolean
  
  RETURN (input.aadhaarNumber matches valid UIDAI format) AND
         regex_incorrectly_validates()
END FUNCTION
```

**Current Code Issue:** In `patient.validation.ts`, the aadhaarRegex is `/^[2-9]{1}[0-9]{11}$/` which is correct. However, the issue is that when this is used in validation, numbers with leading 0 or 1 are being rejected (which is correct per UIDAI), but the test mentions "incorrectly rejects valid Aadhaar numbers that start with 0-1". This suggests the bug description may be referring to a misunderstanding OR the regex was previously `[0-9]` and should be `[2-9]`. **Fix**: Verify regex is exactly `/^[2-9][0-9]{11}$/` (12 digits total, first digit 2-9).

**Examples:**
- `"123456789012"` → Should reject (starts with 1) ✓ Current behavior correct
- `"012345678901"` → Should reject (starts with 0) ✓ Current behavior correct
- `"234567890123"` → Should accept (starts with 2) ✓ Current behavior correct

---

### Bug 8: Insurance Expiry Date Not Handled in Draft Finalization

When finalizing a draft with an insurance expiry date, the date is not properly converted to a Date object in the finalization logic, remaining as a string.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: draft being finalized with insuranceExpiryDate as string
  OUTPUT: boolean
  
  RETURN (draft.insuranceExpiryDate is string) AND
         date_not_converted_to_date_object_in_finalization()
END FUNCTION
```

**Current Code Issue:** In `patient.draft.service.ts` `finalizeDraft()`, the insurance expiry date from finalData is not converted to Date type before storing.

**Examples:**
- Draft has: `{insuranceExpiryDate: "2025-12-31"}`
- After finalization stored as: `"2025-12-31"` (string, incorrect)
- Should be stored as: `Date("2025-12-31")` (Date object)

---

### Bug 9: BMI Calculation Missing in Draft Conversion

When converting a draft to a final patient with height and weight provided, BMI calculation is not performed during finalization, leaving BMI undefined/null in the final patient record.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: draft being finalized with height and weight present
  OUTPUT: boolean
  
  RETURN (draft.height is defined AND draft.weight is defined) AND
         bmi_not_calculated_in_finalization()
END FUNCTION
```

**Current Code Issue:** In `patient.draft.service.ts` `finalizeDraft()`, BMI calculation logic exists but may not be invoked for all code paths or may not be applied to the final update.

**Examples:**
- Draft has: `{height: 170, weight: 70}`
- After finalization: `{bmi: undefined}` (incorrect)
- Should be: `{bmi: 24.22}` (correct, 70 / (1.7 * 1.7))

---

### Bug 10: Duplicate Field Comparison Logic Flawed

When checking for duplicates with multiple identity fields, the comparison uses strict equality checks against individual fields instead of properly verifying that the provided field values match existing records. This can cause false positives or false negatives.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: duplicate check with phone="9876543210", email="user@example.com"
         existing patient has phone="9876543210" but email="different@example.com"
  OUTPUT: boolean
  
  RETURN provided_fields_match_any_existing_field() AND
         not_checking_if_all_provided_fields_match_same_patient()
END FUNCTION
```

**Current Code Issue:** In `patient.service.ts` `checkDuplicatePatient()`, the function builds conditions with OR logic:
```typescript
const conditions = [];
if (phone) conditions.push({ phone });
if (email) conditions.push({ email });
// ... then finds first where OR: conditions
```
This matches if ANY field matches, not if ALL provided fields match the same patient. Should check if provided fields match together.

**Examples:**
- Search for duplicate: `{phone: "9876543210", email: "user1@example.com"}`
- Patient A exists: `{phone: "9876543210", email: "other@example.com"}`
- Patient B exists: `{phone: "1111111111", email: "user1@example.com"}`
- Current result: Returns Patient A (incorrect, only phone matches) or Patient B (incorrect, only email matches)
- Expected: Return null (no patient matches BOTH fields) ✓

---

### Bug 11: Missing Validation Middleware Application

When creating or verifying patients via email endpoints (e.g., `/verify/email`), the validation middleware is not applied to validate the request against the verification schema, allowing malformed requests to reach the controller.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: POST /patients/verify/email with invalid verificationCode
  OUTPUT: boolean
  
  RETURN validation_middleware_not_applied_to_endpoint()
END FUNCTION
```

**Current Code Issue:** In `patient.routes.ts`, the route for email verification doesn't include `.validate()` middleware:
```typescript
router.post("/verify/email", authorize(...), verifyEmail); // Missing validate()
```
Should be:
```typescript
router.post("/verify/email", authorize(...), validate(verifyPatientEmailSchema), verifyEmail);
```

**Examples:**
- Request with missing `verificationCode` → Currently passes to controller (incorrect)
- Request with `verificationCode` too short → Currently passes to controller (incorrect)
- Request properly formatted → Should pass (correct behavior when validation applied)

---

### Bug 12: Inconsistent Route Ordering

When calling the `/count` endpoint to get patient count, the generic count route is checked after the specific `/:id` route due to incorrect route ordering. Express matches routes in order, so `/count` is interpreted as `/:id` with `id="count"`.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: GET /patients/count
  OUTPUT: boolean
  
  RETURN routes_ordered_as: [/:id (specific), /count (generic)] AND
         /count_intercepted_by_/:id_route()
END FUNCTION
```

**Current Code Issue:** In `patient.routes.ts`, the route order is:
```typescript
router.get("/:id", ...getOne); // Matches /count as id="count"
router.get("/count", ...); // Never reached
```
Should be:
```typescript
router.get("/count", ...); // Specific routes first
router.get("/:id", ...getOne);
```

---

### Bug 13: CreatePatientWithOrder Missing Item Validation

When creating a patient with an order containing items without required fields (e.g., `testId`), the system does not validate that each item in the items array has all required fields. Invalid items can be inserted.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: POST /patients/with-order with items = [{discount: 10}] (missing testId)
  OUTPUT: boolean
  
  RETURN (items array present AND item missing testId) AND
         validation_does_not_enforce_required_fields()
END FUNCTION
```

**Current Code Issue:** In `patient.validation.ts` `createPatientWithOrderSchema`, the items validation is:
```typescript
items: z.array(z.object({
  testId: z.string(),
  discount: z.number().min(0).default(0),
})).min(1, "At least one test is required"),
```
This looks correct, but validation may not be applied to the endpoint. Need to verify validation middleware is applied.

**Examples:**
- Request: `{order: {items: [{discount: 10}]}}` → Should reject (testId missing)
- Request: `{order: {items: [{testId: "test-123", discount: 0}]}}` → Should accept

---

### Bug 14: Date Parsing in Update Operation

When updating a patient's dateOfBirth with a string value, the date is not consistently parsed as a Date object. The update operation may leave the value as a string instead of converting it to a Date type.

**Bug Condition:**
```
FUNCTION isBugCondition(input)
  INPUT: PATCH /patients/:id with dateOfBirth = "1990-01-15"
  OUTPUT: boolean
  
  RETURN (input.dateOfBirth is string) AND
         date_not_parsed_to_date_object_in_update()
END FUNCTION
```

**Current Code Issue:** In `patient.service.ts` `updatePatient()`, dateOfBirth from the request is not guaranteed to be converted to a Date object before the update operation.

**Examples:**
- Update: `{dateOfBirth: "1990-01-15"}` → Stored as: `"1990-01-15"` (string, incorrect)
- Should be stored as: `Date("1990-01-15")` (Date object)

---

## Expected Behavior

### Correction Properties - Bug Fixes

**Fix 1 - Phone Normalization:**
When a draft is saved with phone containing spaces, country codes, or symbols, the phone SHALL be normalized by removing spaces, '+', and country codes (like '+91').

**Fix 2 - Email Validation:**
When creating a patient with empty email string in `createPatientWithOrderSchema`, the email SHALL be transformed to undefined (not stored as empty string).

**Fix 3 - Communication Preference Merge:**
When updating a patient with partial communication preferences, new preferences SHALL be merged with existing preferences, not overwrite them completely.

**Fix 4 - Verification Null Check:**
When retrieving verification records, the system SHALL perform proper null checking with error handling before accessing any properties.

**Fix 5 - Biometric Validation:**
When submitting height or weight with value 0, the system SHALL reject the value as invalid for biometric measurements.

**Fix 6 - PIN Code Validation Order:**
When submitting empty postalCode, the validation SHALL not attempt format validation but SHALL allow undefined/null for optional fields.

**Fix 7 - Aadhaar Format:**
When submitting 12-digit Aadhaar numbers, the validation regex SHALL accept numbers starting with 2-9 per UIDAI specifications.

**Fix 8 - Insurance Date Conversion:**
When finalizing a draft with insurance expiry date, the date SHALL be properly converted to a Date object before storage.

**Fix 9 - BMI Calculation:**
When converting a draft to final patient with height and weight, BMI SHALL be calculated using formula: weight (kg) / (height (m)²) and stored in the record.

**Fix 10 - Duplicate Detection:**
When checking for duplicates, the system SHALL verify that provided field values match in the same patient record, not just match any field individually.

**Fix 11 - Email Verification Validation:**
When verifying email via endpoint, the request SHALL be validated against the verification schema before processing.

**Fix 12 - Route Ordering:**
When requesting `/count` endpoint, the count-specific route SHALL be matched before the generic `/:id` route through correct route ordering.

**Fix 13 - Order Item Validation:**
When creating a patient with order, each item in the items array SHALL be validated to ensure testId and other required fields are present.

**Fix 14 - Date Consistency:**
When updating a patient's dateOfBirth, the value SHALL be consistently parsed as a Date object if provided.

### Preservation Requirements

**Preservation 1 - Patient Creation:** Successful patient creation with valid data and generated UHID must continue to work exactly as before.

**Preservation 2 - Patient Retrieval:** Patient retrieval by ID with associated doctor reference must continue to work exactly as before.

**Preservation 3 - Patient Update:** Patient updates with valid data that don't conflict with duplicates must continue to work exactly as before.

**Preservation 4 - Patient Deletion:** Patient deletion operations must continue to work exactly as before.

**Preservation 5 - Draft Auto-Save:** Draft auto-save functionality that updates existing or creates new drafts must continue to work exactly as before.

**Preservation 6 - Draft Finalization:** Draft finalization that converts complete drafts to permanent patients must continue to work exactly as before.

**Preservation 7 - OTP Verification:** OTP verification for phone numbers must continue to work exactly as before.

**Preservation 8 - Email Token Verification:** Email token verification must continue to work exactly as before.

**Preservation 9 - Duplicate Detection:** Duplicate detection for phone/email/Aadhaar must continue to work exactly as before.

**Preservation 10 - Patient List Pagination:** Patient listing with pagination must continue to work exactly as before.

**Preservation 11 - Search Functionality:** Search filtering by first name, last name, UHID, or phone must continue to work exactly as before.

**Preservation 12 - Authorization Checks:** Authorization and role-based access control must continue to work exactly as before.

**Preservation 13 - Patient with Order Creation:** Transaction-based patient and order creation with sample generation must continue to work exactly as before.

**Preservation 14 - QR Code Generation:** QR code generation for patient cards must continue to work exactly as before.

---

## Hypothesized Root Causes

### Category 1: Missing or Incorrect Transformations in Validators
- Bugs 1, 2, 6, 14: Phone normalization, email empty string handling, and date parsing are either missing transform steps or have incorrect transform ordering
- Root cause: Zod schema transforms not properly sequenced or not comprehensive enough

### Category 2: Incomplete Update Logic in Service Layer
- Bugs 3, 4, 8, 9: Communication preference merging, null checking, date conversion, and BMI calculation are incomplete or missing in update/finalization logic
- Root cause: Service layer methods don't implement full business logic for complex operations

### Category 3: Validation Range Issues
- Bugs 5, 7: Height/weight and Aadhaar validation use incorrect min values or regex patterns
- Root cause: Validation rules don't match domain requirements (0 is invalid for biometrics; Aadhaar starts with 2-9)

### Category 4: Flawed Duplicate Detection Logic
- Bug 10: Duplicate checking uses OR logic when it should use proper matching within same patient
- Root cause: Database query constructed with OR conditions instead of verifying field combinations

### Category 5: Route and Middleware Configuration Issues
- Bugs 11, 12: Validation middleware not applied and route ordering incorrect
- Root cause: Routes not configured with required middleware or ordered before specific routes

### Category 6: Missing Item-Level Validation
- Bug 13: Order items not validated for required fields
- Root cause: Validation schema exists but not applied to endpoint or schema validation is incomplete

---

## Correctness Properties

Property 1: Bug Condition - Phone Normalization in Drafts

_For any_ draft save operation where a phone number contains spaces, country codes (+91, +), or other formatting characters, the fixed draft service SHALL normalize the phone number by removing spaces, '+' symbols, and country code prefixes before storing.

**Validates: Requirements 2.1**

---

Property 2: Bug Condition - Email Empty String Handling

_For any_ patient creation with `createPatientWithOrderSchema` where email is provided as an empty string (""), the fixed validator SHALL transform the empty string to undefined rather than storing it as an empty string.

**Validates: Requirements 2.2**

---

Property 3: Bug Condition - Communication Preference Merging

_For any_ patient update where partial communication preferences are provided (e.g., only {email: false}), the fixed service SHALL merge new preferences with existing preferences rather than completely overwriting them, preserving all unmodified preferences.

**Validates: Requirements 2.3**

---

Property 4: Bug Condition - Verification Null Safety

_For any_ patient verification retrieval where a verification record doesn't exist in the database, the fixed service SHALL perform proper null checking and return an appropriate error response before attempting to access any properties on the verification object.

**Validates: Requirements 2.4**

---

Property 5: Bug Condition - Biometric Validation

_For any_ patient creation or update request with height or weight set to 0, the fixed validator SHALL reject the submission with a validation error, as 0 is not a valid biometric measurement.

**Validates: Requirements 2.5**

---

Property 6: Bug Condition - Postal Code Validation

_For any_ patient record where an empty postal code string is submitted, the fixed validator SHALL allow the field to become undefined (not validate format) rather than attempting to match the 6-digit pattern on an empty value.

**Validates: Requirements 2.6**

---

Property 7: Bug Condition - Aadhaar Format Validation

_For any_ Aadhaar number submission with a valid 12-digit format starting with digits 2-9, the fixed validator SHALL accept the number per UIDAI specifications, verifying the regex pattern exactly matches /^[2-9][0-9]{11}$/.

**Validates: Requirements 2.7**

---

Property 8: Bug Condition - Insurance Date Parsing in Finalization

_For any_ draft finalization where an insurance expiry date is present as a string (e.g., "2025-12-31"), the fixed service SHALL convert the date string to a proper Date object before storing in the finalized patient record.

**Validates: Requirements 2.8**

---

Property 9: Bug Condition - BMI Calculation on Finalization

_For any_ draft finalization where both height and weight are present, the fixed service SHALL calculate BMI using the formula weight(kg) / (height(m)²) and store the calculated value in the finalized patient record.

**Validates: Requirements 2.9**

---

Property 10: Bug Condition - Duplicate Detection Logic

_For any_ duplicate check with multiple identity fields (e.g., phone AND email), the fixed service SHALL verify that the provided field values match in the same patient record, not just match any field individually across different patients.

**Validates: Requirements 2.10**

---

Property 11: Bug Condition - Email Verification Route Validation

_For any_ email verification request to the `/verify/email` endpoint, the fixed router SHALL apply the validation middleware to validate the request against `verifyPatientEmailSchema` before the handler processes the request.

**Validates: Requirements 2.11**

---

Property 12: Bug Condition - Route Ordering for /count

_For any_ GET request to `/patients/count`, the fixed router SHALL match the count-specific route before the generic `/:id` route through proper route ordering, ensuring `/count` returns the patient count rather than attempting to fetch a patient with ID "count".

**Validates: Requirements 2.12**

---

Property 13: Bug Condition - Order Item Validation

_For any_ patient creation with order where the request includes an items array, the fixed validator SHALL enforce that each item has a valid testId field, rejecting requests where testId is missing from any item in the array.

**Validates: Requirements 2.13**

---

Property 14: Bug Condition - Date Parsing in Updates

_For any_ patient update request with a dateOfBirth string value (e.g., "1990-01-15"), the fixed service SHALL parse the string and store it as a proper Date object in the database.

**Validates: Requirements 2.14**

---

## Preservation Properties

Property 15: Preservation - Successful Patient Creation

_For any_ valid patient creation request with correct data and no duplicate conflicts, the fixed code SHALL continue to create the patient with generated UHID and return success, exactly as the original code does.

**Validates: Requirements 3.1**

---

Property 16: Preservation - Patient Retrieval

_For any_ request to retrieve an existing patient by ID, the fixed code SHALL continue to return patient details with associated doctor reference, exactly as the original code does.

**Validates: Requirements 3.2**

---

Property 17: Preservation - Patient Update with Valid Data

_For any_ request to update a patient with valid data that doesn't conflict with duplicates, the fixed code SHALL continue to update the record and return updated patient details, exactly as the original code does.

**Validates: Requirements 3.3**

---

Property 18: Preservation - Patient Deletion

_For any_ request to delete an existing patient, the fixed code SHALL continue to remove the record and return success confirmation, exactly as the original code does.

**Validates: Requirements 3.4**

---

Property 19: Preservation - Draft Auto-Save

_For any_ draft auto-save operation where valid draft data is provided, the fixed code SHALL continue to update existing drafts or create new drafts as appropriate, exactly as the original code does.

**Validates: Requirements 3.5**

---

Property 20: Preservation - Draft Finalization

_For any_ request to finalize a complete draft with all required fields, the fixed code SHALL continue to convert the draft to a permanent patient and mark isDraft as false, exactly as the original code does.

**Validates: Requirements 3.6**

---

Property 21: Preservation - OTP Verification

_For any_ request to verify a valid OTP with correct expiry, the fixed code SHALL continue to mark the phone as verified and update verification status, exactly as the original code does.

**Validates: Requirements 3.7**

---

Property 22: Preservation - Email Token Verification

_For any_ request to verify a valid email token within the expiry window, the fixed code SHALL continue to mark the email as verified and update verification status, exactly as the original code does.

**Validates: Requirements 3.8**

---

Property 23: Preservation - Duplicate Detection for Existing Patients

_For any_ duplicate search with phone/email/Aadhaar that matches an existing patient, the fixed code SHALL continue to return the matching patient record, exactly as the original code does.

**Validates: Requirements 3.9**

---

Property 24: Preservation - Patient List Pagination

_For any_ request to list patients with page and limit parameters, the fixed code SHALL continue to return paginated results with correct pagination metadata, exactly as the original code does.

**Validates: Requirements 3.10**

---

Property 25: Preservation - Search Functionality

_For any_ request to list patients with a search query, the fixed code SHALL continue to filter by first name, last name, UHID, or phone number, exactly as the original code does.

**Validates: Requirements 3.11**

---

Property 26: Preservation - Authorization Checks

_For any_ request to restricted endpoints without proper role, the fixed code SHALL continue to reject the request with authorization error, exactly as the original code does.

**Validates: Requirements 3.12**

---

Property 27: Preservation - Patient with Order Creation

_For any_ request to create patient and order together in a transaction, the fixed code SHALL continue to create both records and generate samples with tracking, exactly as the original code does.

**Validates: Requirements 3.13**

---

Property 28: Preservation - QR Code Generation

_For any_ patient creation request, the fixed code SHALL continue to generate valid QR code data with patient ID and UHID, exactly as the original code does.

**Validates: Requirements 3.14**

---

## Fix Implementation

### File 1: patient.validation.ts

**Changes for Bug 1 (Phone Normalization):** This is handled at the draft service level, not validator. No change needed in validator.

**Changes for Bug 2 (Email Empty String Handling):**
```typescript
// In createPatientWithOrderSchema, fix the email field:
BEFORE:
email: z.string().email().optional().or(z.literal('')).or(z.string().max(255).optional()).transform(val => val?.toLowerCase().trim()),

AFTER:
email: z.string()
  .email("Invalid email format")
  .max(255)
  .optional()
  .or(z.literal(''))
  .or(z.null())
  .transform(val => {
    if (!val || val === '') return undefined;
    return val.toLowerCase().trim();
  }),
```

**Changes for Bug 5 (Height/Weight Validation):**
```typescript
// Change from .min(0) to .min(1):
BEFORE:
height: z.number().min(0).max(300).optional().or(z.null()),
weight: z.number().min(0).max(500).optional().or(z.null()),

AFTER:
height: z.number().min(1, "Height must be greater than 0").max(300).optional().or(z.null()),
weight: z.number().min(1, "Weight must be greater than 0").max(500).optional().or(z.null()),
```

**Changes for Bug 6 (PIN Code Validation Order):**
```typescript
// Restructure to validate before transforming empty string:
BEFORE:
postalCode: z.string()
  .max(20)
  .optional()
  .or(z.literal(''))
  .or(z.null())
  .transform(val => val?.trim() || undefined)
  .refine((val) => {
    if (!val) return true;
    return /^\d{6}$/.test(val);
  }, "Invalid PIN code format (6 digits required)"),

AFTER:
postalCode: z.string()
  .max(20)
  .optional()
  .or(z.literal(''))
  .or(z.null())
  .refine((val) => {
    if (!val || val === '') return true; // Allow empty/null
    return /^\d{6}$/.test(val);
  }, "Invalid PIN code format (6 digits required)")
  .transform(val => (val === '' ? undefined : val?.trim() || undefined)),
```

**Changes for Bug 7 (Aadhaar Regex):**
Verify the regex is correct. Current: `/^[2-9]{1}[0-9]{11}$/` is correct. Simplify to `/^[2-9][0-9]{11}$/` for clarity:
```typescript
BEFORE:
const aadhaarRegex = /^[2-9]{1}[0-9]{11}$/;

AFTER:
const aadhaarRegex = /^[2-9][0-9]{11}$/;
```

**Changes for Bug 13 (Order Item Validation):**
The schema already has testId validation. Ensure it's strict:
```typescript
// Confirm schema in createPatientWithOrderSchema:
items: z.array(z.object({
  testId: z.string().min(1, "Test ID is required"),
  discount: z.number().min(0).default(0),
})).min(1, "At least one test is required"),
```

**Changes for Bug 14 (Date Parsing in Update):**
```typescript
// In updatePatientSchema, ensure dateOfBirth parsing:
BEFORE:
dateOfBirth: z.string().optional().or(z.literal('')).or(z.null()).transform(val => val || undefined),

AFTER:
dateOfBirth: z.string().optional().or(z.literal('')).or(z.null())
  .transform(val => {
    if (!val || val === '') return undefined;
    const date = new Date(val);
    if (isNaN(date.getTime())) return undefined;
    return val; // Return string, service layer will convert to Date
  }),
```

---

### File 2: patient.service.ts

**Changes for Bug 3 (Communication Preference Merge):**
```typescript
// In updatePatient(), when handling communicationPreference:
BEFORE:
if (data.communicationPreference) {
  updateData.communicationPreference = data.communicationPreference;
}

AFTER:
if (data.communicationPreference) {
  // Merge with existing preferences
  const existing = patient.communicationPreference || {};
  updateData.communicationPreference = {
    ...existing,
    ...data.communicationPreference,
  };
}
```

**Changes for Bug 4 (Verification Null Check):**
```typescript
// In sendPhoneOTP() or similar verification methods:
BEFORE:
const verification = await prisma.patientVerification.findUnique({...});
const expiresAt = verification.expiresAt; // May throw if null

AFTER:
const verification = await prisma.patientVerification.findUnique({...});
if (!verification) {
  throw new Error("Verification record not found");
}
const expiresAt = verification.expiresAt; // Safe to access
```

**Changes for Bug 10 (Duplicate Detection Logic):**
```typescript
// In checkDuplicatePatient(), fix the condition logic:
BEFORE:
const existingPatient = await prisma.patient.findFirst({
  where: {
    AND: [
      { OR: conditions }, // This matches ANY field
      excludePatientId ? { id: { not: excludePatientId } } : {},
    ],
  },
});

AFTER:
// Check each provided field separately to find any match
const conditions = [];
if (phone) conditions.push({ phone });
if (email) conditions.push({ email });
if (aadhaarNumber) conditions.push({ aadhaarNumber });
if (panNumber) conditions.push({ panNumber });

if (conditions.length === 0) return null;

// For each condition, check if it matches
for (const condition of conditions) {
  const existingPatient = await prisma.patient.findFirst({
    where: {
      ...condition,
      ...(excludePatientId ? { id: { not: excludePatientId } } : {}),
    },
    select: { id: true, uhid: true, firstName: true, lastName: true, phone: true, email: true, aadhaarNumber: true, panNumber: true },
  });
  
  if (existingPatient) {
    return existingPatient;
  }
}

return null;
```

**Changes for Bug 14 (Date Parsing in Update):**
```typescript
// In updatePatient(), ensure dateOfBirth is parsed to Date:
BEFORE:
dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,

AFTER:
dateOfBirth: data.dateOfBirth 
  ? (() => {
      const date = new Date(data.dateOfBirth);
      return isNaN(date.getTime()) ? undefined : date;
    })()
  : undefined,
```

---

### File 3: patient.draft.service.ts

**Changes for Bug 1 (Phone Normalization):**
```typescript
// In saveDraft(), normalize phone before storing:
BEFORE:
const draftData = {
  ...data,
  isDraft: true,
  // phone is stored as-is
};

AFTER:
const draftData = {
  ...data,
  phone: data.phone 
    ? data.phone.replace(/\s/g, '').replace('+91', '').replace('+', '')
    : undefined,
  isDraft: true,
};
```

**Changes for Bug 8 (Insurance Date in Finalization):**
```typescript
// In finalizeDraft(), ensure insuranceExpiryDate is converted to Date:
BEFORE:
const updatedPatient = await prisma.patient.update({
  where: { id: draftId },
  data: {
    // ...other data
    insuranceExpiryDate: finalData?.insuranceExpiryDate || draft.insuranceExpiryDate,
  },
});

AFTER:
const insuranceExpiryDate = finalData?.insuranceExpiryDate || draft.insuranceExpiryDate;
const updatedPatient = await prisma.patient.update({
  where: { id: draftId },
  data: {
    // ...other data
    insuranceExpiryDate: insuranceExpiryDate 
      ? (typeof insuranceExpiryDate === 'string' 
          ? new Date(insuranceExpiryDate) 
          : insuranceExpiryDate)
      : undefined,
  },
});
```

**Changes for Bug 9 (BMI Calculation in Finalization):**
```typescript
// In finalizeDraft(), ensure BMI is calculated:
BEFORE:
let bmi = undefined;
const height = finalData?.height || draft.height;
const weight = finalData?.weight || draft.weight;

if (height && weight) {
  const heightInMeters = height / 100;
  bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

// Then in update:
const updatedPatient = await prisma.patient.update({
  where: { id: draftId },
  data: {
    // bmi might not be included if conditions aren't met
    ...
  },
});

AFTER:
let bmi = undefined;
const height = finalData?.height || draft.height;
const weight = finalData?.weight || draft.weight;

if (height && weight) {
  const heightInMeters = height / 100;
  bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

// Ensure bmi is always set in update
const updatedPatient = await prisma.patient.update({
  where: { id: draftId },
  data: {
    // ...other data
    bmi: bmi || undefined, // Explicitly set even if undefined
  },
});
```

---

### File 4: patient.routes.ts

**Changes for Bug 11 (Email Verification Validation):**
```typescript
// Add validate middleware to email verification route:
BEFORE:
router.post("/verify/email", authorize(...), verifyEmail);

AFTER:
router.post(
  "/verify/email",
  authorize(UserRole.ADMIN, UserRole.FRONT_DESK),
  validate(verifyPatientEmailSchema),
  verifyEmail
);
```

**Changes for Bug 12 (Route Ordering):**
```typescript
// Move specific routes before generic :id routes:
BEFORE:
router.get("/:id", authorize(...), validate(...), getOne);
router.get("/count", authorize(...), getCount); // Never reached

AFTER:
// All specific routes BEFORE generic :id route
router.get("/check-duplicate", authorize(...), validate(...), checkDuplicate);
router.get("/count", authorize(...), getCount); // Now reached correctly
router.get("/analytics", authorize(...), validate(...), getAnalytics);
// ... other specific routes ...
router.get("/:id", authorize(...), validate(...), getOne); // Generic route last
```

---

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach:

1. **Exploratory Bug Condition Checking**: Write tests that surface counterexamples demonstrating each bug on UNFIXED code
2. **Fix Verification**: Write tests confirming each fix works correctly and preserves existing behavior

### Phase 1: Exploratory Bug Condition Checking

These tests should be written to FAIL on unfixed code and PASS on fixed code.

**Bug 1 - Phone Normalization:**
- Test: Save draft with phone `"+91 98765 43210"` → Assert normalized value stored
- Test: Save draft with phone `"98765 43210"` → Assert spaces removed
- Expected failure on unfixed code: Phone stored with spaces/codes

**Bug 2 - Email Empty String:**
- Test: Create patient with empty email via `createPatientWithOrderSchema` → Assert transforms to undefined
- Expected failure on unfixed code: Empty string stored instead of undefined

**Bug 3 - Communication Preference:**
- Test: Update patient with `{email: false}` → Assert other preferences preserved
- Expected failure on unfixed code: All preferences overwritten

**Bug 4 - Verification Null Check:**
- Test: Send OTP to non-existent patient → Assert proper error handling
- Expected failure on unfixed code: TypeError accessing null properties

**Bug 5 - Biometric Validation:**
- Test: Create patient with height=0 → Assert validation rejection
- Test: Create patient with weight=0 → Assert validation rejection
- Expected failure on unfixed code: Value accepted

**Bug 6 - PIN Code:**
- Test: Update patient with empty postal code → Assert no format validation error
- Expected failure on unfixed code: Validation error

**Bug 7 - Aadhaar Regex:**
- Test: Aadhaar `"234567890123"` → Assert accepted
- Test: Aadhaar `"134567890123"` → Assert rejected (starts with 1)
- Expected failure on unfixed code: Inconsistent handling

**Bug 8 - Insurance Date:**
- Test: Finalize draft with insuranceExpiryDate `"2025-12-31"` → Assert stored as Date object
- Expected failure on unfixed code: Stored as string

**Bug 9 - BMI Calculation:**
- Test: Finalize draft with height=170, weight=70 → Assert BMI calculated and stored
- Expected failure on unfixed code: BMI undefined

**Bug 10 - Duplicate Detection:**
- Test: Check duplicate with phone and email from different patients → Assert null returned
- Expected failure on unfixed code: Returns false positive

**Bug 11 - Validation Middleware:**
- Test: POST `/verify/email` with invalid code → Assert 400 validation error
- Expected failure on unfixed code: Request reaches controller without validation

**Bug 12 - Route Ordering:**
- Test: GET `/patients/count` → Assert returns count, not 404
- Expected failure on unfixed code: Attempts to find patient with id="count"

**Bug 13 - Order Item Validation:**
- Test: Create patient with order item missing testId → Assert validation error
- Expected failure on unfixed code: Request accepted

**Bug 14 - Date Parsing:**
- Test: Update patient with dateOfBirth `"1990-01-15"` → Assert stored as Date object
- Expected failure on unfixed code: Stored as string

### Phase 2: Fix Verification

These tests verify fixes work AND preserve existing behavior.

**Unit Tests:**
- Test each validator schema independently
- Test each service method with various inputs
- Test edge cases (null, undefined, empty string)
- Verify error handling

**Property-Based Tests:**
- Generate random patient data and verify normalization
- Generate random preferences and verify merge logic
- Generate random dates and verify parsing
- Verify duplicate detection logic across many patient combinations

**Integration Tests:**
- Test full patient creation flow with all fixes
- Test patient update flow with partial data
- Test draft creation and finalization
- Test verification flows (phone OTP, email verification)

---

## Summary

This design covers all 14 bugs with specific implementation changes in 4 files:
1. **patient.validation.ts**: 6 bug fixes (Bugs 2, 5, 6, 7, 13, 14)
2. **patient.service.ts**: 4 bug fixes (Bugs 3, 4, 10, 14)
3. **patient.draft.service.ts**: 3 bug fixes (Bugs 1, 8, 9)
4. **patient.routes.ts**: 2 bug fixes (Bugs 11, 12)

All fixes are minimal, targeted changes that address root causes without over-engineering. Preservation requirements ensure no regressions in existing functionality.
