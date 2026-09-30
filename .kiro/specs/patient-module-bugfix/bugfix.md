# Bugfix Requirements Document - Patient Module

## Introduction

The patient module contains multiple critical bugs spanning validation, data transformation, database operations, and service layer logic. These bugs affect patient registration, updates, verification, and draft management. This document outlines the defects in current behavior, expected corrections, and preserved behaviors.

## Bug Analysis

### Current Behavior (Defect)

#### Bug 1: Phone Number Normalization Fails in Draft Service

1.1 WHEN a patient draft is created or updated with a phone number containing spaces or country codes THEN the phone number is not normalized and spaces/codes remain in stored data

#### Bug 2: Email Validation Inconsistency Across Schemas

1.2 WHEN creating a patient with an empty email string or null value in `createPatientWithOrderSchema` THEN the email field passes validation despite being optional but empty

#### Bug 3: Communication Preference Merge Overwrites on Update

1.3 WHEN updating a patient with partial communication preferences THEN the existing preferences are completely overwritten instead of merged

#### Bug 4: Missing Null Check on Patient Verification

1.4 WHEN retrieving a patient verification record that doesn't exist THEN the system throws an error without proper null coalescing before accessing properties

#### Bug 5: Height/Weight Validation Accepts Invalid Values

1.5 WHEN submitting height or weight with value 0 THEN the system stores the value despite 0 being invalid for biometric measurements

#### Bug 6: PIN Code Validation Bypassed for Empty Strings

1.6 WHEN submitting an empty postalCode string THEN the validation does not enforce 6-digit format as it transforms empty string to undefined

#### Bug 7: Aadhaar Regex Missing Validation Check

1.7 WHEN submitting Aadhaar number with leading zero THEN the regex validation incorrectly rejects valid Aadhaar numbers that start with 0-1

#### Bug 8: Insurance Expiry Date Not Handled in Draft Finalization

1.8 WHEN finalizing a draft with an insurance expiry date THEN the date is not properly converted to Date type in finalization logic

#### Bug 9: BMI Calculation Missing in Draft Conversion

1.9 WHEN converting a draft to final patient with height and weight THEN BMI calculation is not performed during finalization

#### Bug 10: Duplicate Field Comparison Logic Flawed

1.10 WHEN checking for duplicates with multiple identity fields THEN the comparison uses strict equality instead of checking if provided fields match

#### Bug 11: Missing Validation Middleware Application

1.11 WHEN creating patients via `/verify/email` endpoint THEN the validation middleware is not applied to the request

#### Bug 12: Inconsistent Route Ordering

1.12 WHEN calling `/count` endpoint THEN the generic count route is checked after the specific `/:id` route due to incorrect route ordering

#### Bug 13: CreatePatientWithOrder Missing Item Validation

1.13 WHEN creating a patient with order containing items without testId THEN the system does not validate that each item has required fields

#### Bug 14: Date Parsing in Update Operation

1.14 WHEN updating a patient dateOfBirth with a string THEN the date is not consistently parsed as a Date object

### Expected Behavior (Correct)

#### Bug 1 Fix: Phone Number Normalization in Draft Service

2.1 WHEN a patient draft is created or updated with a phone number containing spaces or country codes THEN the phone number SHALL be normalized by removing spaces, '+', and country codes

#### Bug 2 Fix: Email Validation Consistency

2.2 WHEN creating a patient with an empty email string in `createPatientWithOrderSchema` THEN the email SHALL be transformed to undefined or null

#### Bug 3 Fix: Communication Preference Merge

2.3 WHEN updating a patient with partial communication preferences THEN the new preferences SHALL be merged with existing preferences, not overwrite them

#### Bug 4 Fix: Null Check on Patient Verification

2.4 WHEN retrieving a patient verification record THEN the system SHALL perform proper null checking before accessing properties to prevent errors

#### Bug 5 Fix: Height/Weight Validation

2.5 WHEN submitting height or weight with value 0 THEN the system SHALL reject the value as invalid for biometric measurements

#### Bug 6 Fix: PIN Code Validation

2.6 WHEN submitting an empty postalCode THEN the validation SHALL not attempt format validation and instead allow undefined/null

#### Bug 7 Fix: Aadhaar Validation

2.7 WHEN submitting any valid 12-digit Aadhaar number THEN the regex SHALL accept numbers starting with 2-9 per UIDAI specifications

#### Bug 8 Fix: Insurance Expiry Date in Draft Finalization

2.8 WHEN finalizing a draft with an insurance expiry date THEN the date SHALL be properly converted to a Date object

#### Bug 9 Fix: BMI Calculation in Draft Finalization

2.9 WHEN converting a draft to final patient with height and weight THEN BMI SHALL be calculated and stored in the final record

#### Bug 10 Fix: Duplicate Field Comparison

2.10 WHEN checking for duplicates THEN the system SHALL properly verify that provided field values match existing records before marking as duplicate

#### Bug 11 Fix: Email Verification Route Validation

2.11 WHEN verifying email via endpoint THEN the request SHALL be validated according to the verification schema before processing

#### Bug 12 Fix: Route Ordering

2.12 WHEN requesting `/count` endpoint THEN the count-specific route SHALL be matched before the generic `/:id` route

#### Bug 13 Fix: Order Item Validation

2.13 WHEN creating a patient with order THEN each item in the items array SHALL be validated to ensure testId is present

#### Bug 14 Fix: Consistent Date Parsing

2.14 WHEN updating a patient dateOfBirth THEN the value SHALL be consistently parsed as a Date object if provided

### Unchanged Behavior (Regression Prevention)

#### Preservation 1: Successful Patient Creation

3.1 WHEN creating a patient with valid data and no duplicates THEN the system SHALL CONTINUE TO create the patient with generated UHID and return success

#### Preservation 2: Patient Retrieval

3.2 WHEN retrieving an existing patient by ID THEN the system SHALL CONTINUE TO return patient details with associated doctor reference

#### Preservation 3: Patient Update with Valid Data

3.3 WHEN updating a patient with valid data that doesn't conflict with duplicates THEN the system SHALL CONTINUE TO update the record and return updated patient

#### Preservation 4: Patient Deletion

3.4 WHEN deleting an existing patient THEN the system SHALL CONTINUE TO remove the record and return success confirmation

#### Preservation 5: Draft Auto-Save

3.5 WHEN auto-saving draft data THEN the system SHALL CONTINUE TO update existing draft or create new draft as appropriate

#### Preservation 6: Draft Finalization

3.6 WHEN finalizing a complete draft with all required fields THEN the system SHALL CONTINUE TO convert draft to permanent patient and mark isDraft as false

#### Preservation 7: OTP Verification

3.7 WHEN verifying valid OTP with correct expiry THEN the system SHALL CONTINUE TO mark phone as verified and update verification status

#### Preservation 8: Email Token Verification

3.8 WHEN verifying valid email token within expiry window THEN the system SHALL CONTINUE TO mark email as verified and update verification status

#### Preservation 9: Duplicate Detection

3.9 WHEN searching for duplicates with phone/email/Aadhaar that matches existing patient THEN the system SHALL CONTINUE TO return the existing patient record

#### Preservation 10: Patient List Pagination

3.10 WHEN listing patients with page and limit parameters THEN the system SHALL CONTINUE TO return paginated results with correct pagination metadata

#### Preservation 11: Search Functionality

3.11 WHEN listing patients with search query THEN the system SHALL CONTINUE TO filter by first name, last name, UHID, or phone number

#### Preservation 12: Authorization Checks

3.12 WHEN accessing restricted endpoints without proper role THEN the system SHALL CONTINUE TO reject the request with authorization error

#### Preservation 13: Patient with Order Creation

3.13 WHEN creating patient and order together THEN the system SHALL CONTINUE TO create both in transaction and generate samples with tracking

#### Preservation 14: QR Code Generation

3.14 WHEN creating a patient THEN the system SHALL CONTINUE TO generate valid QR code data with patient ID and UHID

