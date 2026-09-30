# Bugfix Requirements Document

## Introduction

The patient registration form has TypeScript type errors where checkbox `onChange` handlers for boolean consent fields are passing incorrect values. The fields `consentForTreatment`, `consentForDataSharing`, and `consentForMarketing` are defined as boolean types in the `PatientFormData` interface, but the react-hook-form Controller is not properly handling checkbox values, causing TypeScript compilation errors and potential runtime data type mismatches.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user interacts with the "I consent to medical treatment" checkbox (consentForTreatment field) THEN the react-hook-form Controller passes the default field spread behavior which may not correctly capture `e.target.checked` value

1.2 WHEN a user interacts with the "I consent to share my medical data" checkbox (consentForDataSharing field) THEN the react-hook-form Controller passes the default field spread behavior which may not correctly capture `e.target.checked` value

1.3 WHEN a user interacts with the "I consent to receive marketing communications" checkbox (consentForMarketing field) THEN the react-hook-form Controller passes the default field spread behavior which may not correctly capture `e.target.checked` value

1.4 WHEN TypeScript compiles the component THEN type errors occur because boolean fields are not receiving boolean values from checkbox inputs

### Expected Behavior (Correct)

2.1 WHEN a user interacts with the "I consent to medical treatment" checkbox (consentForTreatment field) THEN the system SHALL correctly capture `e.target.checked` boolean value and update the form state with a boolean type

2.2 WHEN a user interacts with the "I consent to share my medical data" checkbox (consentForDataSharing field) THEN the system SHALL correctly capture `e.target.checked` boolean value and update the form state with a boolean type

2.3 WHEN a user interacts with the "I consent to receive marketing communications" checkbox (consentForMarketing field) THEN the system SHALL correctly capture `e.target.checked` boolean value and update the form state with a boolean type

2.4 WHEN TypeScript compiles the component THEN the system SHALL compile without type errors because boolean fields receive boolean values

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user interacts with text input fields (firstName, lastName, email, etc.) THEN the system SHALL CONTINUE TO correctly capture and store string values

3.2 WHEN a user interacts with select dropdown fields (gender, patientType, bloodGroup, etc.) THEN the system SHALL CONTINUE TO correctly capture and store string values

3.3 WHEN a user interacts with number input fields (height, weight) THEN the system SHALL CONTINUE TO correctly capture and store number values

3.4 WHEN a user submits the form with all valid data THEN the system SHALL CONTINUE TO successfully register the patient

3.5 WHEN the form validates input fields THEN the system SHALL CONTINUE TO display validation errors correctly

3.6 WHEN the form saves drafts automatically THEN the system SHALL CONTINUE TO save draft data correctly

3.7 WHEN a user navigates between form steps THEN the system SHALL CONTINUE TO preserve form data across steps


---

## Bug Condition Methodology

### Bug Condition Function

The bug condition identifies inputs that trigger the TypeScript type error and incorrect value handling:

```pascal
FUNCTION isBugCondition(field)
  INPUT: field of type FormField
  OUTPUT: boolean
  
  // Returns true when the field is a boolean checkbox consent field
  RETURN (field.name = "consentForTreatment" OR 
          field.name = "consentForDataSharing" OR 
          field.name = "consentForMarketing") AND 
         field.type = "checkbox" AND
         field.dataType = "boolean"
END FUNCTION
```

### Property Specification

**Fix Checking Property** - Ensures buggy inputs are handled correctly:

```pascal
// Property: Fix Checking - Checkbox Boolean Value Handling
FOR ALL field WHERE isBugCondition(field) DO
  userInteraction ← checkboxClick(field)
  capturedValue ← field.onChange(userInteraction)
  ASSERT typeof(capturedValue) = "boolean" AND
         capturedValue = userInteraction.target.checked AND
         no_type_errors_on_compile()
END FOR
```

### Preservation Property

**Preservation Checking** - Ensures non-buggy inputs remain unchanged:

```pascal
// Property: Preservation Checking
FOR ALL field WHERE NOT isBugCondition(field) DO
  ASSERT field.onChange_behavior_after_fix = field.onChange_behavior_before_fix AND
         field.value_capture_after_fix = field.value_capture_before_fix
END FOR
```

**Key Definitions:**
- **F**: The original Controller implementation with default field spread (`{...field}`)
- **F'**: The fixed Controller implementation with explicit `onChange` handling for checkboxes

### Counterexample

A concrete example demonstrating the bug:

**Scenario**: User checks the "I consent to medical treatment" checkbox

**Before Fix (F)**:
```typescript
<Controller
  name="consentForTreatment"
  control={control}
  render={({ field }) => (
    <input {...field} type="checkbox" />
  )}
/>
```
**Issue**: The spread `{...field}` may not correctly handle checkbox's boolean value, leading to type errors.

**After Fix (F')**:
```typescript
<Controller
  name="consentForTreatment"
  control={control}
  render={({ field }) => (
    <input 
      type="checkbox"
      checked={field.value}
      onChange={(e) => field.onChange(e.target.checked)}
    />
  )}
/>
```
**Result**: Explicitly captures `e.target.checked` (boolean) and passes it to `field.onChange`, ensuring type safety.
