# 🎨 Frontend Integration Guide - Patient Registration Module

## Overview
Complete guide to integrate the advanced patient registration form with multi-step flow, auto-save drafts, and premium UI.

---

## 📁 File Structure

```
frontend/src/
├── components/
│   └── PatientRegistration/
│       ├── PatientRegistrationForm.tsx     (Main form component)
│       ├── PatientRegistrationForm.css     (Form styling)
│       ├── DraftSelector.tsx               (Draft management UI)
│       ├── DraftSelector.css               (Draft selector styling)
│       ├── PatientVerificationModal.tsx    (Verification modal)
│       ├── FamilyMembersView.tsx           (Family display)
│       └── index.ts                        (Exports)
├── pages/
│   └── PatientRegistration.tsx             (Page wrapper)
└── PATIENT_REGISTRATION_INTEGRATION.md     (This file)
```

---

## 🚀 Installation

### Step 1: Copy Components
Copy all files from `frontend/src/components/PatientRegistration/` to your project.

### Step 2: Install Dependencies
```bash
npm install react-hook-form axios
# or
yarn add react-hook-form axios
```

### Step 3: Create Page Component
Create `frontend/src/pages/PatientRegistration.tsx`:

```typescript
import React, { useState } from 'react';
import { PatientRegistrationForm, DraftSelector } from '../components/PatientRegistration';

const PatientRegistrationPage: React.FC = () => {
  const [showDraftSelector, setShowDraftSelector] = useState(true);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);

  return (
    <div className="patient-registration-page">
      {showDraftSelector && !selectedDraftId ? (
        <DraftSelector
          onSelectDraft={(draftId) => {
            setSelectedDraftId(draftId);
            setShowDraftSelector(false);
          }}
          onNewRegistration={() => {
            setSelectedDraftId(null);
            setShowDraftSelector(false);
          }}
        />
      ) : (
        <PatientRegistrationForm draftId={selectedDraftId} />
      )}
    </div>
  );
};

export default PatientRegistrationPage;
```

### Step 4: Add Route
```typescript
// In your router configuration
import PatientRegistrationPage from './pages/PatientRegistration';

const routes = [
  // ... other routes
  {
    path: '/patients/register',
    element: <PatientRegistrationPage />,
  },
];
```

---

## 🎨 Usage

### Basic Implementation
```typescript
import { PatientRegistrationForm } from './components/PatientRegistration';

function App() {
  return <PatientRegistrationForm />;
}
```

### With Draft Support
```typescript
import { PatientRegistrationForm, DraftSelector } from './components/PatientRegistration';
import { useState } from 'react';

function App() {
  const [draftId, setDraftId] = useState<string | null>(null);

  if (!draftId) {
    return (
      <DraftSelector
        onSelectDraft={setDraftId}
        onNewRegistration={() => setDraftId(null)}
      />
    );
  }

  return <PatientRegistrationForm draftId={draftId} />;
}
```

---

## 🔧 Configuration

### API Endpoints
Update your API base URL in `.env.local`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_JWT_TOKEN=your-jwt-token-here
```

### Form Validation Rules
All validation rules are built-in:

- **Phone**: 10-digit Indian format (6-9 start)
- **Email**: Valid email format
- **Aadhaar**: 12-digit number (2-9 start)
- **PAN**: Format ABCDE1234F
- **PIN Code**: Exactly 6 digits

### Customization
Modify form behavior by editing `PatientRegistrationForm.tsx`:

```typescript
// Change number of steps
const totalSteps = 4; // or 5, 6, etc.

// Modify validation rules
rules: { 
  phone: {
    required: 'Custom message',
    pattern: { value: /your-regex/, message: 'Custom error' }
  }
}

// Add custom fields
// ... add in form step and form data interface
```

---

## 🎯 Features

### 1. Multi-Step Form (4 Steps)
**Step 1: Basic Information**
- First, Middle, Last Name
- Date of Birth, Gender
- Patient Type (General, VIP, Staff, Senior, Child)

**Step 2: Contact Information**
- Phone, Alternate Phone
- Email, Address
- City, State, PIN Code

**Step 3: Medical Information**
- Blood Group, Height, Weight
- BMI (auto-calculated)
- Allergies, Chronic Diseases
- Fasting Status

**Step 4: Documents & Verification**
- Aadhaar, PAN
- Insurance Details
- Consents (Treatment, Data Sharing, Marketing)

### 2. Auto-Save Drafts
- Automatically saves every 30 seconds
- Shows "Saving..." status
- Resumes incomplete registrations
- Visible auto-save indicator

### 3. Duplicate Detection
- Real-time checking as you type
- Shows warning if patient exists
- Displays existing patient UHID
- Phone and email checking

### 4. Form Progress Tracking
- Progress bar showing completion percentage
- Section-wise progress calculation
- Visual step indicator
- Step numbers clickable for direct navigation

### 5. Validation
- Real-time validation
- Field-specific error messages
- Error indicators on inputs
- Required field markers (*)

### 6. Responsive Design
- Mobile-friendly layout
- Tablet optimized
- Desktop full-featured view
- Adaptive grid system

---

## 📱 Mobile Optimization

The form is fully responsive:

```css
/* Automatically adapts to screen sizes */
- Desktop: 3-4 fields per row
- Tablet: 2 fields per row
- Mobile: 1 field per row
```

Test on mobile:
```bash
# Use Chrome DevTools or
npm run dev  # Open on mobile device
```

---

## 🔐 Security Features

### 1. Authentication
All requests include JWT token:
```typescript
headers: { 
  Authorization: `Bearer ${localStorage.getItem('token')}`
}
```

### 2. Input Validation
- Client-side validation with zod/react-hook-form
- Server-side validation on backend
- Sanitization of inputs

### 3. Secure Data
- Sensitive fields (Aadhaar, PAN) masked in display
- HTTPS enforced
- No sensitive data in URLs

---

## 🧪 Testing

### Test Scenarios

```typescript
// Test Case 1: Create patient
it('should create patient successfully', async () => {
  // Fill all required fields
  // Click submit
  // Verify success message
  // Verify UHID generated
});

// Test Case 2: Draft save
it('should auto-save draft every 30 seconds', async () => {
  // Fill some fields
  // Wait 30 seconds
  // Verify draft saved
  // Refresh page
  // Verify data persisted
});

// Test Case 3: Duplicate check
it('should detect duplicate phone', async () => {
  // Enter phone of existing patient
  // Verify warning appears
  // Verify existing UHID shown
});

// Test Case 4: Validation
it('should show error for invalid Aadhaar', async () => {
  // Enter invalid Aadhaar
  // Verify error message
  // Verify form not submitted
});
```

### Manual Testing Checklist

- [ ] Form loads correctly
- [ ] All 4 steps visible
- [ ] Step navigation works
- [ ] Validation triggers
- [ ] Draft auto-saves
- [ ] Duplicate detection works
- [ ] Form submits successfully
- [ ] Success message shows
- [ ] Phone verification available
- [ ] Email verification available
- [ ] Mobile responsive
- [ ] Keyboard navigation works
- [ ] Error messages clear
- [ ] Progress bar updates
- [ ] Auto-save status shows

---

## 🎨 Customization Examples

### Change Color Scheme
Edit `PatientRegistrationForm.css`:

```css
/* Replace gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* Change to */
background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
```

### Add Custom Field
1. Add to interface:
```typescript
interface PatientFormData {
  // ... existing fields
  customField?: string;
}
```

2. Add to form:
```typescript
<div className="form-group">
  <label>Custom Field</label>
  <Controller
    name="customField"
    control={control}
    render={({ field }) => <input {...field} />}
  />
</div>
```

### Change Form Steps
1. Modify step numbers
2. Restructure form sections
3. Update step indicator
4. Adjust validation

---

## 🐛 Troubleshooting

### Issue: Form not loading
**Solution:**
- Check imports are correct
- Verify component paths
- Ensure CSS files are loaded
- Check browser console for errors

### Issue: Validation not working
**Solution:**
- Check React Hook Form version
- Verify validation rules syntax
- Test in browser console
- Check for JavaScript errors

### Issue: Auto-save not working
**Solution:**
- Check JWT token is valid
- Verify API endpoint is correct
- Check network tab in DevTools
- Ensure localStorage has token

### Issue: Duplicate check not working
**Solution:**
- Verify backend `/check-duplicate` endpoint
- Check network requests in DevTools
- Ensure proper error handling
- Test with existing phone number

### Issue: Mobile layout broken
**Solution:**
- Check CSS media queries
- Test on actual mobile device
- Use Chrome DevTools mobile emulation
- Verify responsive grid

---

## 📚 Component Props

### PatientRegistrationForm

```typescript
interface PatientRegistrationFormProps {
  draftId?: string;  // Optional draft ID to resume
  onSuccess?: (patient: Patient) => void;  // Success callback
  onError?: (error: Error) => void;  // Error callback
  readOnly?: boolean;  // Read-only mode
  showQRCode?: boolean;  // Show QR after registration
}
```

### DraftSelector

```typescript
interface DraftSelectorProps {
  onSelectDraft: (draftId: string) => void;  // When draft selected
  onNewRegistration: () => void;  // When new registration clicked
  showStats?: boolean;  // Show draft statistics
  maxDrafts?: number;  // Limit number of drafts shown
}
```

---

## 🎯 Advanced Features

### 1. QR Code Display
After registration, show QR code:

```typescript
import QRCode from 'qrcode.react';

<QRCode value={patient.qrCode} size={200} />
```

### 2. Phone Verification
Add OTP verification modal:

```typescript
const [showOtpModal, setShowOtpModal] = useState(false);

// In form submission:
if (formData.phone) {
  await sendPhoneOTP(patient.id);
  setShowOtpModal(true);
}
```

### 3. Medical History Preview
Show existing medical records:

```typescript
const [medicalHistory, setMedicalHistory] = useState([]);

useEffect(() => {
  if (patientId) {
    fetchMedicalHistory(patientId);
  }
}, [patientId]);
```

### 4. Family Members Linking
Link to existing family:

```typescript
<FamilyMembersView
  patientId={patient.id}
  onLink={(familyHeadId, relationship) => {
    // Handle linking
  }}
/>
```

---

## 🚀 Performance Optimization

### 1. Code Splitting
```typescript
const PatientRegistrationForm = lazy(() => 
  import('./PatientRegistrationForm')
);
```

### 2. Memoization
```typescript
const MemoizedForm = React.memo(PatientRegistrationForm);
```

### 3. Lazy Loading
```typescript
// Load drafts only when needed
const drafts = useLazyQuery(GET_DRAFTS);
```

### 4. Debouncing
```typescript
// Debounce duplicate check
const debouncedCheck = useCallback(
  debounce((phone) => checkDuplicate(phone), 1000),
  []
);
```

---

## 📊 Analytics Integration

Track form interactions:

```typescript
// Track step changes
useEffect(() => {
  analytics.trackEvent('patient_form_step_changed', {
    step: currentStep,
    progress: formProgress,
  });
}, [currentStep]);

// Track draft saves
const saveDraft = async () => {
  analytics.trackEvent('patient_draft_saved', {
    draftId,
    progress: formProgress,
  });
  // ... save logic
};

// Track form submission
const onSubmit = async (data) => {
  analytics.trackEvent('patient_registered', {
    patientType: data.patientType,
    registrationSource: 'online',
  });
  // ... submit logic
};
```

---

## 🔄 State Management (Optional)

If using Redux or Context:

```typescript
// Redux example
const dispatch = useDispatch();

const onSubmit = async (data) => {
  dispatch(registerPatient(data));
};
```

---

## 📝 Form Data Export

Export filled form data:

```typescript
const exportFormData = () => {
  const dataStr = JSON.stringify(formData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'patient-data.json';
  link.click();
};
```

---

## 🎓 Best Practices

1. **Always validate on backend** - Don't trust client-side validation alone
2. **Use HTTPS** - Especially for medical data
3. **Implement rate limiting** - Prevent abuse of API
4. **Log user actions** - For audit trails
5. **Test on real devices** - Especially mobile
6. **Optimize for accessibility** - Use semantic HTML, ARIA labels
7. **Cache drafts locally** - For better UX
8. **Implement error recovery** - Handle network failures gracefully

---

## 🆘 Support

For issues or questions:
1. Check the documentation files in backend
2. Review component code comments
3. Check browser console for errors
4. Test API endpoints with Postman
5. Contact development team

---

## 📦 Production Checklist

- [ ] All components imported correctly
- [ ] API endpoints configured
- [ ] JWT token setup complete
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Mobile tested on real device
- [ ] Validation working
- [ ] Draft auto-save tested
- [ ] Duplicate detection tested
- [ ] Security headers set
- [ ] HTTPS enforced
- [ ] Performance optimized
- [ ] Analytics integrated
- [ ] Accessibility verified
- [ ] Unit tests written
- [ ] Integration tests passed

---

**Version:** 1.0.0  
**Last Updated:** January 2024  
**Status:** ✅ Ready for Production
