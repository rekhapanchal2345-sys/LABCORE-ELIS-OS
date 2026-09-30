# 🚀 Quick Start Guide - Enhanced Patient Module

## 5-Minute Setup

### Step 1: Update Prisma Schema (2 minutes)

Add these to your `prisma/schema.prisma`:

```prisma
model Patient {
  // ... existing fields ...
  
  // NEW FIELDS - Add these:
  middleName                String?
  alternatePhone            String?
  landmark                  String?
  country                   String            @default("India")
  aadhaarNumber             String?           @unique
  panNumber                 String?           @unique
  patientType               PatientType       @default(GENERAL)
  maritalStatus             MaritalStatus?
  occupation                String?
  nationality               String            @default("Indian")
  allergies                 String[]          @default([])
  chronicDiseases           String[]          @default([])
  currentMedications        Json?
  height                    Float?
  weight                    Float?
  bmi                       Float?
  insuranceExpiryDate       DateTime?
  verificationStatus        VerificationStatus @default(UNVERIFIED)
  phoneVerified             Boolean           @default(false)
  emailVerified             Boolean           @default(false)
  kycVerified               Boolean           @default(false)
  kycVerifiedAt             DateTime?
  kycVerifiedById           String?
  kycVerifiedBy             User?             @relation("KYCVerifier", fields: [kycVerifiedById], references: [id])
  preferredLanguage         Language          @default(ENGLISH)
  communicationPreference   Json?
  consentForTreatment       Boolean           @default(false)
  consentForDataSharing     Boolean           @default(false)
  consentForMarketing       Boolean           @default(false)
  familyHeadId              String?
  familyHead                Patient?          @relation("FamilyMembers", fields: [familyHeadId], references: [id])
  familyMembers             Patient[]         @relation("FamilyMembers")
  relationshipToHead        FamilyRelationship?
  photoUrl                  String?
  qrCode                    String?
  isDraft                   Boolean           @default(false)
  formStep                  Int?
  formProgress              Int?
  lastEditedSection         String?
  registrationSource        RegistrationSource @default(WALK_IN)
  referralSource            String?
  notes                     String?           @db.Text
  
  verifications             PatientVerification[]
  medicalHistory            PatientMedicalHistory[]
  consents                  PatientConsent[]
}

// NEW MODELS - Add these:
model PatientVerification {
  id          String    @id @default(uuid())
  patientId   String
  patient     Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  type        VerificationType
  code        String
  verified    Boolean   @default(false)
  expiresAt   DateTime
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([patientId, type])
  @@index([code])
}

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

model PatientConsent {
  id              String    @id @default(uuid())
  patientId       String
  patient         Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  consentType     String
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

// NEW ENUMS - Add these:
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

// UPDATE User model - Add these relations:
model User {
  // ... existing fields ...
  
  kycVerifiedPatients  Patient[]         @relation("KYCVerifier")
  patientConsents      PatientConsent[]  @relation("PatientConsents")
}
```

### Step 2: Run Migration (1 minute)

```bash
cd backend
npx prisma migrate dev --name enhanced_patient_module
npx prisma generate
```

### Step 3: Restart Server (1 minute)

```bash
npm run dev
```

### Step 4: Test APIs (1 minute)

```bash
# Test patient creation
curl -X POST http://localhost:5000/api/patients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Patient",
    "gender": "MALE",
    "phone": "9876543210"
  }'

# Test draft save
curl -X POST http://localhost:5000/api/patients/drafts \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Draft",
    "lastName": "Patient",
    "phone": "9876543211"
  }'

# Test duplicate check
curl "http://localhost:5000/api/patients/check-duplicate?phone=9876543210" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Verification Checklist

- [ ] Prisma schema updated
- [ ] Migration successful
- [ ] Server starts without errors
- [ ] Can create patient
- [ ] Can save draft
- [ ] Can check duplicates
- [ ] Can list patients
- [ ] Can view analytics (admin)

---

## 🎯 Most Used APIs

### 1. Create Patient
```http
POST /api/patients
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "gender": "MALE",
  "phone": "9876543210"
}
```

### 2. Save Draft
```http
POST /api/patients/drafts
Content-Type: application/json

{
  "firstName": "Jane",
  "phone": "9876543211",
  "formStep": 1
}
```

### 3. Check Duplicate
```http
GET /api/patients/check-duplicate?phone=9876543210
```

### 4. Send Phone OTP
```http
POST /api/patients/{id}/verify/phone/send
```

### 5. Get Analytics
```http
GET /api/patients/analytics/registrations?groupBy=month
```

---

## 🔥 Pro Tips

1. **Auto-save drafts** every 30 seconds in your frontend
2. **Always check duplicates** before patient creation
3. **Use QR codes** for quick patient identification
4. **Link family members** for better tracking
5. **Verify phone/email** for important patients
6. **Run draft cleanup** weekly: `POST /api/patients/drafts/cleanup`

---

## 📱 Integration Examples

### React Hook for Auto-Save
```javascript
const useAutoSave = (formData, interval = 30000) => {
  useEffect(() => {
    const timer = setInterval(() => {
      fetch('/api/patients/drafts', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
    }, interval);
    
    return () => clearInterval(timer);
  }, [formData]);
};
```

### Duplicate Check Hook
```javascript
const useDuplicateCheck = (phone, email) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  
  useEffect(() => {
    if (phone || email) {
      fetch(`/api/patients/check-duplicate?phone=${phone}&email=${email}`)
        .then(res => res.json())
        .then(data => setIsDuplicate(data.data.isDuplicate));
    }
  }, [phone, email]);
  
  return isDuplicate;
};
```

---

## 🎨 UI Components Needed

1. **Multi-Step Form** (4 steps recommended)
   - Step 1: Basic Info (name, gender, DOB)
   - Step 2: Contact (phone, email, address)
   - Step 3: Medical (allergies, diseases, medications)
   - Step 4: Documents (Aadhaar, insurance, photo)

2. **Draft Selector**
   - List of saved drafts
   - Resume button
   - Delete draft option

3. **Duplicate Warning Modal**
   - Show existing patient details
   - Options: Create anyway / Edit existing

4. **Verification Badges**
   - Phone verified ✓
   - Email verified ✓
   - KYC verified ✓

5. **QR Code Display**
   - Patient card with QR
   - Print option

---

## 🐛 Common Issues

### "Column does not exist"
**Fix:** Run `npx prisma migrate dev`

### "Type error in Prisma"
**Fix:** Run `npx prisma generate`

### "Duplicate key error"
**Fix:** Use `/check-duplicate` endpoint before creation

### "OTP not sending"
**Fix:** Configure SMS gateway in `.env`

---

## 📚 Full Documentation

- Complete API Docs: `PATIENT_API_DOCUMENTATION.md`
- Schema Guide: `PATIENT_SCHEMA_MIGRATION.md`
- Full README: `PATIENT_MODULE_UPGRADE_README.md`

---

## 🎉 You're Ready!

Aapka patient module ab production-ready hai with advanced features! 

**Start building your premium UI now!** 🚀
