# Patient Module Database Schema Migration Guide

## Overview
This document outlines the database schema changes required for the enhanced patient registration module with advanced features.

## Required Prisma Schema Updates

Add these models and fields to your `schema.prisma` file:

### 1. Enhanced Patient Model

Add these new fields to the existing `Patient` model:

```prisma
model Patient {
  // ... existing fields ...
  
  // Additional Name Fields
  middleName                String?
  
  // Additional Contact
  alternatePhone            String?
  
  // Enhanced Address
  landmark                  String?
  country                   String            @default("India")
  
  // Identity Documents
  aadhaarNumber             String?           @unique
  panNumber                 String?           @unique
  
  // Patient Classification
  patientType               PatientType       @default(GENERAL)
  maritalStatus             MaritalStatus?
  occupation                String?
  nationality               String            @default("Indian")
  
  // Medical Information
  allergies                 String[]          @default([])
  chronicDiseases           String[]          @default([])
  currentMedications        Json?             // Array of {name, dosage, frequency}
  height                    Float?            // in cm
  weight                    Float?            // in kg
  bmi                       Float?            // calculated
  
  // Insurance Extended
  insuranceExpiryDate       DateTime?
  
  // Verification & KYC
  verificationStatus        VerificationStatus @default(UNVERIFIED)
  phoneVerified             Boolean           @default(false)
  emailVerified             Boolean           @default(false)
  kycVerified               Boolean           @default(false)
  kycVerifiedAt             DateTime?
  kycVerifiedById           String?
  kycVerifiedBy             User?             @relation("KYCVerifier", fields: [kycVerifiedById], references: [id])
  
  // Communication & Preferences
  preferredLanguage         Language          @default(ENGLISH)
  communicationPreference   Json?             // {sms, email, whatsapp, call}
  
  // Consents
  consentForTreatment       Boolean           @default(false)
  consentForDataSharing     Boolean           @default(false)
  consentForMarketing       Boolean           @default(false)
  
  // Family Relationships
  familyHeadId              String?
  familyHead                Patient?          @relation("FamilyMembers", fields: [familyHeadId], references: [id])
  familyMembers             Patient[]         @relation("FamilyMembers")
  relationshipToHead        FamilyRelationship?
  
  // Digital Features
  photoUrl                  String?
  qrCode                    String?
  
  // Registration Metadata
  isDraft                   Boolean           @default(false)
  registrationSource        RegistrationSource @default(WALK_IN)
  referralSource            String?
  
  // Additional Notes
  notes                     String?           @db.Text
  
  // Relations
  verifications             PatientVerification[]
  medicalHistory            PatientMedicalHistory[]
  consents                  PatientConsent[]
  
  // ... existing relations ...
}
```

### 2. Patient Verification Model (NEW)

```prisma
model PatientVerification {
  id          String    @id @default(uuid())
  patientId   String
  patient     Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  type        VerificationType // PHONE, EMAIL, DOCUMENT
  code        String    // OTP or verification token
  verified    Boolean   @default(false)
  expiresAt   DateTime
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([patientId, type])
  @@index([code])
}
```

### 3. Patient Medical History Model (NEW)

```prisma
model PatientMedicalHistory {
  id            String    @id @default(uuid())
  patientId     String
  patient       Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  condition     String
  diagnosedDate DateTime?
  severity      Severity  @default(MODERATE)
  status        ConditionStatus @default(ACTIVE)
  notes         String?   @db.Text
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([patientId])
}
```

### 4. Patient Consent Model (NEW)

```prisma
model PatientConsent {
  id              String    @id @default(uuid())
  patientId       String
  patient         Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  consentType     String    // TREATMENT, DATA_SHARING, MARKETING, RESEARCH
  consentGiven    Boolean
  consentText     String    @db.Text
  consentDate     DateTime  @default(now())
  revokedAt       DateTime?
  
  consentedById   String?
  consentedBy     User?     @relation("PatientConsents", fields: [consentedById], references: [id])
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([patientId])
}
```

### 5. New Enums

```prisma
enum PatientType {
  GENERAL
  VIP
  STAFF
  SENIOR_CITIZEN
  CHILD
}

enum MaritalStatus {
  SINGLE
  MARRIED
  DIVORCED
  WIDOWED
  OTHER
}

enum VerificationStatus {
  UNVERIFIED
  PHONE_VERIFIED
  EMAIL_VERIFIED
  VERIFIED
  KYC_VERIFIED
}

enum VerificationType {
  PHONE
  EMAIL
  DOCUMENT
}

enum Language {
  ENGLISH
  HINDI
  BENGALI
  TAMIL
  TELUGU
  MARATHI
  GUJARATI
  KANNADA
  MALAYALAM
  PUNJABI
  OTHER
}

enum FamilyRelationship {
  SELF
  SPOUSE
  CHILD
  PARENT
  SIBLING
  OTHER
}

enum RegistrationSource {
  WALK_IN
  ONLINE
  PHONE
  MOBILE_APP
  REFERRAL
}

enum Severity {
  MILD
  MODERATE
  SEVERE
  CRITICAL
}

enum ConditionStatus {
  ACTIVE
  RESOLVED
  MANAGED
  CHRONIC
}
```

### 6. Update User Model

Add this relation to the `User` model:

```prisma
model User {
  // ... existing fields ...
  
  kycVerifiedPatients  Patient[]         @relation("KYCVerifier")
  patientConsents      PatientConsent[]  @relation("PatientConsents")
  
  // ... existing relations ...
}
```

## Migration Steps

### Step 1: Update schema.prisma
Copy the above models and enums into your `schema.prisma` file.

### Step 2: Generate Migration
```bash
cd backend
npx prisma migrate dev --name enhanced_patient_module
```

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: (Optional) Seed Default Data
```bash
npm run seed
```

## Breaking Changes

### Renamed Fields
- `emergencyContactRelationship` is now an enum instead of string

### New Required Fields (with defaults)
- `patientType` (default: GENERAL)
- `verificationStatus` (default: UNVERIFIED)
- `preferredLanguage` (default: ENGLISH)
- `registrationSource` (default: WALK_IN)

### Data Migration Notes

If you have existing data, you may need to:

1. **Update emergency contact relationships** to match new enum values:
```sql
UPDATE "Patient" 
SET "emergencyContactRelationship" = 'OTHER' 
WHERE "emergencyContactRelationship" NOT IN ('FATHER', 'MOTHER', 'SPOUSE', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'FRIEND', 'OTHER');
```

2. **Set default values** for new required fields (Prisma will handle this automatically with migrations)

## Testing

After migration, test these scenarios:

1. ✅ Create new patient with all fields
2. ✅ Update existing patient
3. ✅ Add medical history
4. ✅ Record consent
5. ✅ Verify phone/email
6. ✅ Link family members
7. ✅ Check duplicate detection
8. ✅ Generate analytics

## Rollback

If you need to rollback:

```bash
npx prisma migrate resolve --rolled-back <migration-name>
```

## Support

For issues or questions, check:
- Prisma documentation: https://www.prisma.io/docs
- Migration guide: https://www.prisma.io/docs/guides/database/developing-with-prisma-migrate
