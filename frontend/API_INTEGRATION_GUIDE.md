# Frontend API Integration Guide - MaidEase

## Overview
This document outlines the robust API integration architecture implemented in the MaidEase frontend to handle all API requests seamlessly and prevent 422 Unprocessable Entity errors.

## Problem Identified
The frontend was sending payloads with extra fields that didn't match the backend schema expectations, causing 422 errors:
- **Booking Creation**: Sending `booking_time`, `duration_hours`, `address`, `city`, `zip_code`, `special_notes` but backend expects `maid_id`, `service_type`, `booking_date`, `time_slot`, `notes` (optional)
- **User Update**: Sending `email` but backend doesn't accept it in updates
- **Review Creation**: Field naming and structure mismatches

## Solution Architecture

### 1. Payload Validator (`src/utils/payloadValidator.js`)
Centralized validation module that ensures all API payloads match backend schema exactly.

#### Key Functions:

**validateBookingPayload(data)**
- Input: Form data with mixed field names
- Output: Validated payload matching backend BookingCreate schema
- Handles: Field name mapping (`booking_time` → `time_slot`), required field validation
- Accepted Fields:
  - `maid_id` (required)
  - `service_type` (required, defaults to 'house_cleaning')
  - `booking_date` (required)
  - `time_slot` / `booking_time` (required)
  - `notes` / `special_notes` (optional)

**validateReviewPayload(data)**
- Input: Review form data
- Output: Validated payload matching backend ReviewCreate schema
- Validation: Rating (1-5), booking_id required, comment optional
- Accepted Fields:
  - `booking_id` (required)
  - `rating` (required, 1-5)
  - `comment` (optional)

**validateUserUpdatePayload(data, userRole)**
- Input: User profile form data, user role
- Output: Validated payload matching backend UserUpdate schema
- Role-Aware: Includes maid-specific fields only for 'maid' role
- Validation: Field length, numeric ranges, role-based field filtering
- Accepted Fields (All Optional):
  - `full_name` (1-100 chars)
  - `phone_number` (max 20 chars)
  - For Maids Only:
    - `bio` (max 500 chars)
    - `skills` (max 200 chars)
    - `experience_years` (0-50)
    - `hourly_rate` (0-10000)
    - `availability_schedule`

**validateBookingStatusPayload(data)**
- Input: Booking status update data
- Output: Validated payload for backend BookingUpdate schema
- Validation: Valid status values, notes cleanup
- Accepted Fields (All Optional):
  - `status` (pending|confirmed|completed|cancelled)
  - `notes` (optional)

**getApiErrorMessage(error)**
- Extracts meaningful error messages from various API error formats
- Handles: Pydantic validation errors, detailed error responses, standard HTTP errors
- Returns: User-friendly error string

### 2. Component Integration

#### BookingForm.jsx
```jsx
// Before: Sending extra fields
const bookingPayload = {
  maid_id: maidId,
  booking_date: formData.booking_date,
  booking_time: formData.booking_time,
  duration_hours: formData.duration_hours,  // ❌ Extra field
  address: formData.address,                  // ❌ Extra field
  city: formData.city,                        // ❌ Extra field
  zip_code: formData.zip_code,                // ❌ Extra field
  special_notes: formData.special_notes,      // ❌ Wrong field name
};

// After: Using validator
const bookingPayload = validateBookingPayload({
  maid_id: maidId,
  service_type: formData.service_type,
  booking_date: formData.booking_date,
  booking_time: formData.booking_time,
});
```

**Key Changes:**
- Removed unnecessary fields (duration_hours, address, city, zip_code)
- Added service_type field
- Uses validateBookingPayload() for schema compliance
- Enhanced error handling with getApiErrorMessage()

#### ReviewForm.jsx
**Key Changes:**
- Uses validateReviewPayload() to ensure rating is properly formatted
- Uses getApiErrorMessage() for better error reporting
- Validates comment presence before submission

#### UserProfile.jsx
**Key Changes:**
- Removed email field from update (not in UserUpdate schema)
- Uses validateUserUpdatePayload() with user role
- Role-based field validation (maid fields only for maids)
- Enhanced error messages with getApiErrorMessage()
- Only sends fields that have changed

#### AuthContext.jsx
**Key Changes:**
- Uses getApiErrorMessage() for login/register errors
- Provides detailed error feedback to components

#### BookingsList.jsx
**Key Changes:**
- Uses getApiErrorMessage() for all error states
- Better error context for debugging

### 3. Backend Schema Reference

#### Booking Schemas
```python
# BookingCreate (POST /bookings/)
{
  "maid_id": "UUID",
  "service_type": "string",           # e.g., "house_cleaning"
  "booking_date": "datetime",         # ISO format
  "time_slot": "string",              # e.g., "09:00"
  "notes": "string?" (optional)
}

# BookingResponse
{
  "id": "UUID",
  "customer_id": "UUID",
  "maid_id": "UUID",
  "service_type": "string",
  "booking_date": "datetime",
  "time_slot": "string",
  "notes": "string?",
  "status": "pending|confirmed|completed|cancelled",
  "total_amount": "float?",
  "created_at": "datetime"
}
```

#### Review Schemas
```python
# ReviewCreate (POST /reviews/)
{
  "booking_id": "UUID",
  "rating": "float",                  # 1-5
  "comment": "string?" (optional)
}

# ReviewResponse
{
  "id": "UUID",
  "booking_id": "UUID",
  "customer_id": "UUID",
  "maid_id": "UUID",
  "rating": "float",
  "comment": "string?",
  "created_at": "datetime"
}
```

#### User Schemas
```python
# UserCreate (POST /auth/register/)
{
  "email": "email",
  "full_name": "string",              # 1-100 chars
  "phone_number": "string?" (optional),
  "role": "customer|maid",
  "password": "string"                # 8-128 chars, must have letter + digit
}

# UserUpdate (PUT /users/me/)
{
  "full_name": "string?" (optional),
  "phone_number": "string?" (optional),
  "bio": "string?" (optional),        # Maid only
  "skills": "string?" (optional),     # Maid only
  "experience_years": "int?" (optional),    # Maid only, 0-50
  "hourly_rate": "float?" (optional), # Maid only, 0-10000
  "availability_schedule": "string?" (optional)  # Maid only
}

# UserResponse
{
  "id": "UUID",
  "email": "email",
  "full_name": "string",
  "phone_number": "string?",
  "role": "customer|maid",
  "is_active": "boolean",
  "bio": "string?",
  "skills": "string?",
  "experience_years": "int?",
  "hourly_rate": "float?",
  "availability_schedule": "string?",
  "average_rating": "float?",
  "created_at": "datetime"
}
```

## Error Handling Strategy

### 1. Client-Side Validation
Performed by validators before sending request:
```jsx
try {
  const validatedPayload = validateBookingPayload(formData);
  // Send to API
} catch (err) {
  setError(err.message);  // Validation error
}
```

### 2. API Error Processing
Comprehensive error extraction:
```jsx
try {
  await bookingAPI.createBooking(payload);
} catch (err) {
  const errorMessage = getApiErrorMessage(err);
  setError(errorMessage);
  // Handles: Pydantic validation, detail responses, HTTP errors
}
```

### 3. User Feedback
Immediate, detailed feedback for debugging:
- Validation errors: "Field X is required"
- API errors: "Field.location: Field error message"
- HTTP errors: "422 Unprocessable Entity"

## Testing Checklist

### Booking Creation
- [ ] Date in future
- [ ] Valid time format
- [ ] Service type selection
- [ ] Error on missing fields
- [ ] Check network tab for exact payload sent

### Review Submission
- [ ] Rating 1-5
- [ ] Comment not empty
- [ ] Proper UUID for booking_id
- [ ] Check network tab for exact payload

### User Profile Update
- [ ] Customer: Only name + phone updates
- [ ] Maid: All fields update correctly
- [ ] No email in payload
- [ ] Empty strings not sent
- [ ] Numeric fields as numbers

### Network Inspection
1. Open DevTools → Network tab
2. Submit form
3. Check POST/PUT request
4. Verify payload matches backend schema
5. Verify response status (201 for POST, 200 for PUT)

## Common Issues & Solutions

### Issue: 422 Unprocessable Entity
**Cause:** Payload doesn't match backend schema
**Solution:** 
1. Check validators in `payloadValidator.js`
2. Review backend schema in `backend/app/schemas/`
3. Use network tab to inspect exact payload
4. Verify field names and types match exactly

### Issue: Extra Fields in Payload
**Cause:** Form has fields not in backend schema
**Solution:** 
1. Remove form fields not in backend schema
2. Use validator to filter fields
3. See backend schema reference above

### Issue: Field Type Mismatch
**Cause:** Sending string when backend expects number
**Solution:**
1. Check validator for type conversion
2. Parse fields before validation
3. Review schema for expected types

## Future Improvements

1. **Type Safety:** Consider TypeScript for payload validation
2. **Auto-Generation:** Generate validators from OpenAPI/Swagger
3. **Centralized Schema:** Single source of truth for schemas
4. **API Documentation:** Auto-generate from backend schemas
5. **Error Recovery:** Implement retry logic for transient errors

## References

- Backend API: `backend/app/api/v1/`
- Backend Schemas: `backend/app/schemas/`
- Frontend Validator: `frontend/src/utils/payloadValidator.js`
- Frontend Endpoints: `frontend/src/api/endpoints.js`
- Frontend Client: `frontend/src/api/client.js`
