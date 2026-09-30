# Enhanced Patient Management API Documentation

## Overview
This is a comprehensive API documentation for the upgraded Patient Registration Module with advanced features including verification, family management, medical history, analytics, and draft support.

---

## Table of Contents
1. [Core Patient CRUD](#core-patient-crud)
2. [Draft Management](#draft-management)
3. [Verification Features](#verification-features)
4. [Family Management](#family-management)
5. [Medical History](#medical-history)
6. [Consent Management](#consent-management)
7. [Analytics & Reports](#analytics--reports)
8. [Error Handling](#error-handling)

---

## Authentication
All endpoints require authentication. Include JWT token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Core Patient CRUD

### 1. Create Patient
Create a new patient with comprehensive details.

**Endpoint:** `POST /api/patients`

**Permissions:** ADMIN, FRONT_DESK

**Request Body:**
```json
{
  "firstName": "Rajesh",
  "middleName": "Kumar",
  "lastName": "Sharma",
  "dateOfBirth": "1990-05-15",
  "gender": "MALE",
  "phone": "9876543210",
  "alternatePhone": "9876543211",
  "email": "rajesh.sharma@example.com",
  "address": "123 MG Road",
  "landmark": "Near City Hospital",
  "city": "Mumbai",
  "state": "Maharashtra",
  "postalCode": "400001",
  "country": "India",
  "bloodGroup": "B+",
  "emergencyContactName": "Priya Sharma",
  "emergencyContactPhone": "9876543212",
  "emergencyContactRelationship": "SPOUSE",
  "aadhaarNumber": "123456789012",
  "panNumber": "ABCDE1234F",
  "patientType": "GENERAL",
  "maritalStatus": "MARRIED",
  "occupation": "Software Engineer",
  "nationality": "Indian",
  "allergies": ["Penicillin", "Peanuts"],
  "chronicDiseases": ["Hypertension"],
  "currentMedications": [
    {
      "name": "Amlodipine",
      "dosage": "5mg",
      "frequency": "Once daily"
    }
  ],
  "height": 175,
  "weight": 75,
  "fastingStatus": "NO",
  "doctorId": "doctor-uuid",
  "insuranceProvider": "ICICI Lombard",
  "insuranceNumber": "INS123456",
  "insuranceExpiryDate": "2025-12-31",
  "photoUrl": "https://example.com/photo.jpg",
  "preferredLanguage": "HINDI",
  "communicationPreference": {
    "sms": true,
    "email": true,
    "whatsapp": true,
    "call": false
  },
  "consentForTreatment": true,
  "consentForDataSharing": false,
  "consentForMarketing": false,
  "registrationSource": "WALK_IN",
  "notes": "VIP patient, handle with priority"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "id": "patient-uuid",
    "uhid": "LC-000001",
    "firstName": "Rajesh",
    "lastName": "Sharma",
    "qrCode": "{\"type\":\"PATIENT\",\"id\":\"patient-uuid\",\"uhid\":\"LC-000001\"}",
    "verificationStatus": "UNVERIFIED",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### 2. Check Duplicate Patient
Check if a patient with the same phone, email, Aadhaar, or PAN already exists.

**Endpoint:** `GET /api/patients/check-duplicate`

**Permissions:** ADMIN, FRONT_DESK

**Query Parameters:**
- `phone` (optional): Phone number
- `email` (optional): Email address
- `aadhaarNumber` (optional): Aadhaar number
- `panNumber` (optional): PAN number

**Example:**
```
GET /api/patients/check-duplicate?phone=9876543210&email=test@example.com
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Duplicate patient found",
  "data": {
    "isDuplicate": true,
    "existingPatient": {
      "id": "patient-uuid",
      "uhid": "LC-000001",
      "firstName": "Rajesh",
      "lastName": "Sharma",
      "phone": "9876543210",
      "email": "test@example.com"
    }
  }
}
```

### 3. Create Patient with Order
Register a new patient and create an order in a single transaction.

**Endpoint:** `POST /api/patients/with-order`

**Permissions:** ADMIN, FRONT_DESK

**Request Body:**
```json
{
  "patient": {
    "firstName": "Amit",
    "lastName": "Patel",
    "gender": "MALE",
    "phone": "9876543210",
    "email": "amit@example.com",
    "dateOfBirth": "1985-03-20"
  },
  "order": {
    "doctorId": "doctor-uuid",
    "notes": "Routine checkup",
    "discount": 100,
    "paidAmount": 500,
    "collectionType": "WALK_IN",
    "priority": "ROUTINE",
    "reportDeliveryWhatsApp": true,
    "reportDeliveryEmail": true,
    "items": [
      {
        "testId": "test-uuid-1",
        "discount": 50
      },
      {
        "testId": "test-uuid-2",
        "discount": 0
      }
    ]
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Patient and order created successfully",
  "data": {
    "patient": { },
    "order": { }
  }
}
```

### 4. List Patients
Get paginated list of patients with search.

**Endpoint:** `GET /api/patients`

**Permissions:** All authenticated users

**Query Parameters:**
- `search` (optional): Search by name, UHID, phone, email
- `page` (default: 1): Page number
- `limit` (default: 20, max: 100): Results per page

**Example:**
```
GET /api/patients?search=sharma&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Patients fetched successfully",
  "data": {
    "patients": [ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

### 5. Get Patient by ID
Get detailed patient information.

**Endpoint:** `GET /api/patients/:id`

**Permissions:** All authenticated users

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Patient fetched successfully",
  "data": {
    "id": "patient-uuid",
    "uhid": "LC-000001",
    "firstName": "Rajesh",
    "lastName": "Sharma",
    "referredBy": { },
    "allergies": ["Penicillin"],
    "chronicDiseases": ["Hypertension"],
    "verificationStatus": "PHONE_VERIFIED",
    "phoneVerified": true,
    "emailVerified": false,
    "kycVerified": false
  }
}
```

### 6. Update Patient
Update patient information.

**Endpoint:** `PATCH /api/patients/:id`

**Permissions:** ADMIN, FRONT_DESK

**Request Body:** (All fields optional)
```json
{
  "phone": "9876543219",
  "email": "newemail@example.com",
  "address": "New Address",
  "notes": "Updated notes"
}
```

**Response:** `200 OK`

### 7. Delete Patient
Delete a patient record.

**Endpoint:** `DELETE /api/patients/:id`

**Permissions:** ADMIN only

**Response:** `200 OK`

---

## Draft Management

### 1. Save/Update Draft (Auto-save)
Save form progress as draft for later completion.

**Endpoint:** `POST /api/patients/drafts`

**Permissions:** ADMIN, FRONT_DESK

**Request Body:**
```json
{
  "draftId": "draft-uuid",
  "firstName": "Rajesh",
  "lastName": "Sharma",
  "phone": "9876543210",
  "formStep": 2,
  "formProgress": 45,
  "lastEditedSection": "contact-info"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Draft auto-saved successfully",
  "data": {
    "draft": { },
    "isNew": false
  }
}
```

### 2. List Drafts
Get all saved drafts.

**Endpoint:** `GET /api/patients/drafts`

**Permissions:** ADMIN, FRONT_DESK

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Drafts fetched successfully",
  "data": {
    "drafts": [
      {
        "id": "draft-uuid",
        "uhid": "DRAFT-1234567890-1",
        "firstName": "Rajesh",
        "lastName": "Sharma",
        "formProgress": 45,
        "formStep": 2,
        "lastEditedSection": "contact-info",
        "updatedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": { }
  }
}
```

### 3. Get Single Draft
Get details of a specific draft.

**Endpoint:** `GET /api/patients/drafts/:id`

**Permissions:** ADMIN, FRONT_DESK (own drafts)

**Response:** `200 OK`

### 4. Finalize Draft
Convert draft to final patient record.

**Endpoint:** `POST /api/patients/drafts/:id/finalize`

**Permissions:** ADMIN, FRONT_DESK

**Request Body:** (Optional additional data)
```json
{
  "consentForTreatment": true,
  "consentForDataSharing": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Draft finalized and patient registered successfully",
  "data": {
    "patient": {
      "id": "patient-uuid",
      "uhid": "LC-000001",
      "isDraft": false
    }
  }
}
```

### 5. Duplicate Draft
Create a copy of existing draft for quick registration.

**Endpoint:** `POST /api/patients/drafts/:id/duplicate`

**Permissions:** ADMIN, FRONT_DESK

**Response:** `201 Created`

### 6. Delete Draft
Remove a draft.

**Endpoint:** `DELETE /api/patients/drafts/:id`

**Permissions:** ADMIN, FRONT_DESK

**Response:** `200 OK`

### 7. Get Form Progress Statistics
Get statistics about draft completion.

**Endpoint:** `GET /api/patients/drafts/stats`

**Permissions:** ADMIN, FRONT_DESK

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Progress statistics fetched successfully",
  "data": {
    "totalDrafts": 15,
    "averageProgress": 62.5,
    "sectionStats": {
      "basic-info": 5,
      "contact-info": 7,
      "medical-info": 3
    }
  }
}
```

### 8. Cleanup Old Drafts
Remove drafts older than 7 days.

**Endpoint:** `POST /api/patients/drafts/cleanup`

**Permissions:** ADMIN only

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Cleaned up 12 old drafts",
  "data": {
    "deletedCount": 12
  }
}
```

---

## Verification Features

### 1. Send Phone Verification OTP
Send OTP to patient's phone number.

**Endpoint:** `POST /api/patients/:id/verify/phone/send`

**Permissions:** ADMIN, FRONT_DESK

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "phone": "98765***10"
  }
}
```

### 2. Verify Phone OTP
Verify phone number with OTP.

**Endpoint:** `POST /api/patients/:id/verify/phone`

**Permissions:** ADMIN, FRONT_DESK

**Request Body:**
```json
{
  "otp": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Phone verified successfully",
  "data": {
    "verificationStatus": "PHONE_VERIFIED"
  }
}
```

### 3. Send Email Verification
Send verification link to email.

**Endpoint:** `POST /api/patients/:id/verify/email/send`

**Permissions:** ADMIN, FRONT_DESK

**Response:** `200 OK`

### 4. Verify Email
Verify email with token.

**Endpoint:** `POST /api/patients/verify/email`

**Permissions:** Public or authenticated

**Request Body:**
```json
{
  "verificationCode": "verification-token"
}
```

**Response:** `200 OK`

### 5. Mark KYC Verified
Mark patient as KYC verified (admin action).

**Endpoint:** `POST /api/patients/:id/verify/kyc`

**Permissions:** ADMIN only

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "KYC verification completed successfully",
  "data": {
    "verificationStatus": "KYC_VERIFIED"
  }
}
```

---

## Family Management

### 1. Get Family Members
Get all family members linked to a patient.

**Endpoint:** `GET /api/patients/:id/family`

**Permissions:** All authenticated users

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Family members fetched successfully",
  "data": {
    "familyHead": "family-head-uuid",
    "familyHeadDetails": { },
    "members": [
      {
        "id": "member-uuid",
        "uhid": "LC-000002",
        "firstName": "Priya",
        "lastName": "Sharma",
        "relationshipToHead": "SPOUSE"
      }
    ]
  }
}
```

### 2. Link to Family
Link a patient to a family.

**Endpoint:** `POST /api/patients/:id/family`

**Permissions:** ADMIN, FRONT_DESK

**Request Body:**
```json
{
  "familyHeadId": "family-head-uuid",
  "relationship": "CHILD"
}
```

**Response:** `200 OK`

### 3. Unlink from Family
Remove patient from family linkage.

**Endpoint:** `DELETE /api/patients/:id/family`

**Permissions:** ADMIN, FRONT_DESK

**Response:** `200 OK`

---

## Medical History

### 1. Get Medical History
Get patient's medical history.

**Endpoint:** `GET /api/patients/:id/history`

**Permissions:** All authenticated users

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Medical history fetched successfully",
  "data": [
    {
      "id": "history-uuid",
      "condition": "Hypertension",
      "diagnosedDate": "2020-05-15",
      "severity": "MODERATE",
      "status": "ACTIVE",
      "notes": "Under medication"
    }
  ]
}
```

### 2. Add Medical History
Add new medical history entry.

**Endpoint:** `POST /api/patients/:id/history`

**Permissions:** ADMIN, DOCTOR, LAB_TECH

**Request Body:**
```json
{
  "condition": "Diabetes Type 2",
  "diagnosedDate": "2023-01-10",
  "severity": "MODERATE",
  "status": "ACTIVE",
  "notes": "Requires regular monitoring"
}
```

**Response:** `201 Created`

### 3. Update Medical History
Update existing medical history entry.

**Endpoint:** `PATCH /api/patients/:id/history/:historyId`

**Permissions:** ADMIN, DOCTOR, LAB_TECH

**Request Body:**
```json
{
  "status": "MANAGED",
  "notes": "Blood sugar under control"
}
```

**Response:** `200 OK`

### 4. Delete Medical History
Remove medical history entry.

**Endpoint:** `DELETE /api/patients/:id/history/:historyId`

**Permissions:** ADMIN only

**Response:** `200 OK`

---

## Consent Management

### 1. Get Patient Consents
Get all consent records for a patient.

**Endpoint:** `GET /api/patients/:id/consents`

**Permissions:** All authenticated users

**Response:** `200 OK`

### 2. Record Consent
Record a new consent.

**Endpoint:** `POST /api/patients/:id/consents`

**Permissions:** ADMIN, FRONT_DESK, DOCTOR

**Request Body:**
```json
{
  "consentType": "DATA_SHARING",
  "consentGiven": true,
  "consentText": "I consent to share my data with medical research institutions."
}
```

**Response:** `201 Created`

### 3. Revoke Consent
Revoke a previously given consent.

**Endpoint:** `DELETE /api/patients/:id/consents/:consentId`

**Permissions:** ADMIN only

**Response:** `200 OK`

---

## Analytics & Reports

### 1. Get Registration Analytics
Get patient registration trends and statistics.

**Endpoint:** `GET /api/patients/analytics/registrations`

**Permissions:** ADMIN only

**Query Parameters:**
- `startDate` (optional): Start date (ISO format)
- `endDate` (optional): End date (ISO format)
- `groupBy` (default: "month"): day | week | month | year

**Example:**
```
GET /api/patients/analytics/registrations?startDate=2024-01-01&endDate=2024-12-31&groupBy=month
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Analytics fetched successfully",
  "data": {
    "summary": {
      "totalPatients": 1250,
      "dateRange": {
        "start": "2024-01-01",
        "end": "2024-12-31"
      },
      "groupBy": "month"
    },
    "registrationTrends": {
      "2024-01": 95,
      "2024-02": 110,
      "2024-03": 125
    },
    "genderDistribution": {
      "MALE": 650,
      "FEMALE": 580,
      "OTHER": 20
    },
    "patientTypeDistribution": {
      "GENERAL": 1100,
      "VIP": 50,
      "SENIOR_CITIZEN": 80,
      "CHILD": 20
    },
    "sourceDistribution": {
      "WALK_IN": 800,
      "ONLINE": 200,
      "PHONE": 150,
      "REFERRAL": 100
    },
    "verificationDistribution": {
      "UNVERIFIED": 400,
      "PHONE_VERIFIED": 300,
      "EMAIL_VERIFIED": 200,
      "VERIFIED": 250,
      "KYC_VERIFIED": 100
    }
  }
}
```

### 2. Get Demographics
Get patient demographic statistics.

**Endpoint:** `GET /api/patients/analytics/demographics`

**Permissions:** ADMIN only

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Demographics fetched successfully",
  "data": {
    "total": 1250,
    "byGender": [ ],
    "byAgeGroup": [
      { "age_group": "18-30", "count": 350 },
      { "age_group": "31-50", "count": 500 },
      { "age_group": "51-70", "count": 300 },
      { "age_group": "Over 70", "count": 100 }
    ],
    "byBloodGroup": [ ],
    "byVerificationStatus": [ ]
  }
}
```

### 3. Get Top Patients by Visits
Get patients with most visits/orders.

**Endpoint:** `GET /api/patients/analytics/top-patients`

**Permissions:** ADMIN, FRONT_DESK

**Query Parameters:**
- `limit` (default: 10): Number of results

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Top patients fetched successfully",
  "data": [
    {
      "id": "patient-uuid",
      "uhid": "LC-000001",
      "firstName": "Rajesh",
      "lastName": "Sharma",
      "visitCount": 25
    }
  ]
}
```

---

## Error Handling

All endpoints return consistent error responses:

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "phone",
      "message": "Invalid phone number format"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Forbidden (403)
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Patient not found"
}
```

### Conflict (409)
```json
{
  "success": false,
  "message": "Patient already exists with this phone. UHID: LC-000001"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Integration Notes

### QR Code Integration
Each patient gets a QR code stored in `qrCode` field. Use a QR code library to generate visual codes:

```javascript
import QRCode from 'qrcode';

const qrImageUrl = await QRCode.toDataURL(patient.qrCode);
```

### SMS/WhatsApp Integration
Phone verification uses OTP. Integrate with SMS gateway like:
- Twilio
- MSG91
- Gupshup

### Email Integration
Email verification requires email service:
- SendGrid
- AWS SES
- Mailgun

---

## Best Practices

1. **Always check for duplicates** before creating new patients
2. **Use draft feature** for incomplete registrations
3. **Verify phone/email** for important communications
4. **Link family members** for better tracking
5. **Record consents** for compliance
6. **Regularly cleanup old drafts** to maintain database health
7. **Use analytics** for insights and decision making

---

## Support

For issues or questions:
- Check error messages for guidance
- Ensure proper authentication and permissions
- Validate request body against schemas
- Contact system administrator for access issues
