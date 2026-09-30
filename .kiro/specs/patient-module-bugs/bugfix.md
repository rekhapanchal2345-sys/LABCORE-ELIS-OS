# Bugfix Requirements Document

## Introduction

This document addresses multiple critical bugs discovered in the Patient Module across both backend and frontend components. The bugs include database schema mismatches, missing database tables, type errors, validation issues, incorrect data handling, and API integration problems. These issues cause runtime errors, data corruption, and failed patient registrations.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN the `patient.advanced.service.ts` attempts to create a `PatientVerification` record THEN the system throws a runtime error because the `PatientVerification` table does not exist in the Prisma schema.

1.2 WHEN the `patient.advanced.service.ts` attempts to create a `PatientMedicalHistory` record THEN the system throws a runtime error because the `PatientMedicalHistory` table does not exist in the Prisma schema.

1.3 WHEN the `patient.advanced.service.ts` attempts to create a `PatientConsent` record THEN the system throws a runtime error because the `PatientConsent` table does not exist in the Prisma schema.

1.4 WHEN the `patient.service.ts` attempts to save patient data with fields like `middleName`, `country`, `landmark`, `alternatePhone`, `aadhaarNumber`, `panNumber`, `patientType`, `maritalStatus`, `occupation`, `nationality`, `allergies`, `chronicDiseases`, `currentMedications`, `height`, `weight`, `bmi`, `preferredLanguage`, `communicationPreference`, `consentForTreatment`, `consentForDataSharing`, `consentForMarketing`, `familyHeadId`, `relationshipToHead`, `notes`, `isDraft`, `registrationSource`, `referralSource`, `qrCode`, `verificationStatus`, `phoneVerified`, `emailVerified`, `kycVerified`, `kycVerifiedAt`, `kycVerifiedById`, `photoUrl`, `insuranceExpiryDate`, `formStep`, `formProgress`, or `lastEditedSection` THEN the system throws a database error because these fields do not exist in the Prisma Patient model.

1.5 WHEN the `patient.draft.service.ts` attempts to use `formStep`, `formProgress`, or `lastEditedSection` fields THEN the system throws a database error because these fields are not defined in the Patient schema.

1.6 WHEN the frontend `PatientRegistrationForm.tsx` submits an empty string for `gender` field THEN the backend validation passes but the database insert fails because gender is a required enum field.

1.7 WHEN the `checkDuplicatePatient` function in `patient.service.ts` is called with multiple fields THEN the function incorrectly checks if ALL fields match the same patient instead of checking if ANY field matches ANY patient.

1.8 WHEN the `updatePatient` function receives `communicationPreference` object THEN the system overwrites all preferences instead of merging with existing preferences.

1.9 WHEN the `finalizeDraft` function in `patient.draft.service.ts` processes insurance expiry date THEN the system passes a string value instead of a Date object to Prisma.

1.10 WHEN the `createPatientWithOrder` function in `patient.service.ts` creates sample tracking history THEN the `metadata` field is passed as a plain object instead of being properly serialized for Prisma's Json type.

1.11 WHEN the `verifyEmail` endpoint is called in `patient.routes.ts` THEN the validation schema `verifyPatientEmailSchema` is applied but the route path `POST /verify/email` conflicts with authenticated routes pattern.

1.12 WHEN the `/count` endpoint is requested THEN the route matches `/:id` pattern returning a patient with id "count" instead of the patient count because route ordering is incorrect.

1.13 WHEN the frontend `DraftSelector.tsx` displays draft data THEN the `formStep` and `formProgress` fields may be undefined causing undefined display values.

1.14 WHEN the `patient.service.ts` creates a patient with `dateOfBirth` field THEN the date string is not properly validated before conversion to Date object, potentially causing invalid date errors.

1.15 WHEN the `patient.service.ts` creates a patient with `insuranceExpiryDate` field THEN the date string is not properly validated before conversion to Date object.

1.16 WHEN the `patient.controller.ts` (in controllers folder) creates a patient THEN the UHID is expected to be provided by the client, but the `patient.service.ts` auto-generates UHID, creating inconsistent behavior between the two controllers.

1.17 WHEN the `patient.service.ts` saves `currentMedications` as an array of objects THEN the Prisma schema does not define this field type, causing potential serialization issues.

1.18 WHEN the `patient.validation.ts` validates `postalCode` field THEN the refine function returns the original value instead of the transformed value, causing validation to pass with incorrect data format.

1.19 WHEN the `patient.draft.service.ts` normalizes phone numbers THEN the function removes country codes but the validation regex in `patient.validation.ts` expects exact 10-digit format.

1.20 WHEN the frontend `PatientRegistrationForm.tsx` auto-saves draft THEN the function references `formData` in the setInterval closure which may cause stale data to be saved.

1.21 WHEN the `patient.service.ts` generates UHID THEN there is a race condition where concurrent requests might generate duplicate UHIDs.

1.22 WHEN the `patient.advanced.service.ts` retrieves family members THEN the query assumes `familyHeadId` exists on Patient model but this field is not in the schema.

1.23 WHEN the `patient.routes.ts` validates `checkDuplicateSchema` THEN the query schema validation passes with undefined values if none of the fields are provided.

1.24 WHEN the `patient.draft.service.ts` calculates BMI THEN the calculation fails silently if height or weight are stored as strings instead of numbers.

1.25 WHEN the frontend `PatientRegistrationForm.tsx` displays BMI THEN the calculation happens on each render without memoization, potentially causing performance issues.

### Expected Behavior (Correct)

2.1 WHEN the `patient.advanced.service.ts` attempts to create verification, medical history, or consent records THEN the system SHALL successfully persist data to the database with properly defined Prisma models.

2.2 WHEN the `patient.service.ts` saves patient data THEN the system SHALL only use fields that are defined in the Prisma Patient model, storing extended data in properly typed JSON fields or creating additional database columns.

2.3 WHEN the `patient.draft.service.ts` manages draft patients THEN the system SHALL use fields that are defined in the Prisma Patient model or properly handle the absence of draft-specific fields.

2.4 WHEN the frontend submits form data with empty required fields THEN the backend validation SHALL reject the request with a clear error message instead of attempting database insertion.

2.5 WHEN the `checkDuplicatePatient` function is called THEN the system SHALL return any patient that matches ANY of the provided identifiers (phone OR email OR aadhaarNumber OR panNumber).

2.6 WHEN the `updatePatient` function receives `communicationPreference` object THEN the system SHALL merge with existing preferences, preserving unspecified preference values.

2.7 WHEN the `finalizeDraft` function processes insurance expiry date THEN the system SHALL properly parse and convert the date string to a Date object before database insertion.

2.8 WHEN the `createPatientWithOrder` function creates sample tracking history THEN the `metadata` field SHALL be properly typed as Prisma.JsonObject.

2.9 WHEN the email verification endpoint is called THEN the route SHALL use a distinct path that does not conflict with the `/:id/verify/email/send` pattern.

2.10 WHEN the `/count` endpoint is requested THEN the route handler SHALL match before the `/:id` route handler.

2.11 WHEN the frontend displays draft data THEN the system SHALL handle undefined fields gracefully with default values.

2.12 WHEN the `patient.service.ts` creates a patient with date fields THEN the system SHALL validate date strings before conversion and reject invalid dates.

2.13 WHEN creating a patient through either controller THEN the system SHALL use consistent UHID generation logic.

2.14 WHEN the `patient.service.ts` saves complex objects like `currentMedications` THEN the system SHALL properly serialize them for Prisma's Json type.

2.15 WHEN the `patient.validation.ts` validates phone numbers THEN the validation SHALL account for the phone normalization logic in the draft service.

2.16 WHEN the frontend auto-saves draft THEN the function SHALL use a ref or callback to access current form data instead of closure variable.

2.17 WHEN the `patient.service.ts` generates UHID THEN the system SHALL use database-level locking or atomic operations to prevent race conditions.

2.18 WHEN the `patient.advanced.service.ts` retrieves family members THEN the system SHALL use fields that exist in the schema or properly handle the absence of family relationship fields.

2.19 WHEN the `patient.draft.service.ts` calculates BMI THEN the system SHALL handle type conversion and return undefined for invalid inputs.

2.20 WHEN the frontend displays BMI THEN the system SHALL use memoization to prevent unnecessary recalculations.

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a patient is created with valid basic information (firstName, lastName, gender) THEN the system SHALL CONTINUE TO successfully create the patient record with generated UHID.

3.2 WHEN patients are searched by name, phone, or UHID THEN the system SHALL CONTINUE TO return matching patients with proper pagination.

3.3 WHEN a patient is retrieved by ID THEN the system SHALL CONTINUE TO return complete patient details including related orders and doctor information.

3.4 WHEN a patient is updated with valid data using existing schema fields THEN the system SHALL CONTINUE TO successfully persist changes.

3.5 WHEN a patient is deleted by an admin THEN the system SHALL CONTINUE TO remove the patient record from the database.

3.6 WHEN duplicate check is performed with no matching fields THEN the system SHALL CONTINUE TO return no duplicates found.

3.7 WHEN the frontend form validates required fields THEN the system SHALL CONTINUE TO display appropriate validation messages.

3.8 WHEN draft auto-save occurs THEN the system SHALL CONTINUE TO preserve form progress for resumption.
