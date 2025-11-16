# 📌 Complete Postman API Flow with Refresh Token

## **Base URL**
```
http://localhost:8000/api/v1
```

---

## **AUTHENTICATION FLOW WITH REFRESH TOKEN**

### **STEP 1: Register Customer User**
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/register`
- **Body (JSON):**
```json
{
  "email": "customer@example.com",
  "full_name": "John Customer",
  "phone_number": "+1234567890",
  "role": "customer",
  "password": "SecurePass123"
}
```
- **Response:** Save the `id` (UUID) → `{{customer_id}}`

---

### **STEP 2: Register Maid User**
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/register`
- **Body (JSON):**
```json
{
  "email": "maid@example.com",
  "full_name": "Jane Maid",
  "phone_number": "+9876543210",
  "role": "maid",
  "password": "SecurePass456",
  "bio": "Professional cleaner with 5 years experience",
  "skills": "House Cleaning, Kitchen Cleaning, Bathroom Cleaning",
  "experience_years": 5,
  "hourly_rate": 25.50,
  "availability_schedule": "Monday to Friday, 9AM-5PM"
}
```
- **Response:** Save the `id` (UUID) → `{{maid_id}}`

---

### **STEP 3: Login as Customer (Get Access & Refresh Tokens)**
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/login`
- **Body (form-data):**
  - `username` = `customer@example.com`
  - `password` = `SecurePass123`
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
- **Postman Tip:** Add to `Tests` tab:
```javascript
var jsonData = pm.response.json();
pm.environment.set("customer_token", jsonData.access_token);
pm.environment.set("customer_refresh_token", jsonData.refresh_token);
```

---

### **STEP 4: Login as Maid (Get Access & Refresh Tokens)**
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/login`
- **Body (form-data):**
  - `username` = `maid@example.com`
  - `password` = `SecurePass456`
- **Response:** Same structure with tokens
- **Postman Tip:** Add to `Tests` tab:
```javascript
var jsonData = pm.response.json();
pm.environment.set("maid_token", jsonData.access_token);
pm.environment.set("maid_refresh_token", jsonData.refresh_token);
```

---

## **REFRESH TOKEN ENDPOINT**

### **Refresh Access Token**
- **Method:** `POST`
- **URL:** `{{base_url}}/auth/refresh`
- **Body (JSON):**
```json
{
  "refresh_token": "{{customer_refresh_token}}"
}
```
- **Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
- **Notes:**
  - Use when access token expires (30 minutes)
  - Refresh token lasts 7 days
  - Both tokens can be refreshed

---

## **TOKEN TIMELINE**

```
LOGIN
  ↓
Access Token: 30 min ⏱️
Refresh Token: 7 days ⏱️

After 30 min:
  ↓
Use Refresh Token to get New Access Token
  ↓
New Access Token: 30 min ⏱️
New Refresh Token: 7 days ⏱️

After 7 days:
  ↓
Must login again (refresh token expired)
```

---

## **COMPLETE API TESTING FLOW**

### **STEP 5: Get Current Customer Profile**
- **Method:** `GET`
- **URL:** `{{base_url}}/users/me`
- **Headers:**
  - `Authorization: Bearer {{customer_token}}`
- **Response:** Verify customer details

---

### **STEP 6: Get Current Maid Profile**
- **Method:** `GET`
- **URL:** `{{base_url}}/users/me`
- **Headers:**
  - `Authorization: Bearer {{maid_token}}`
- **Response:** Verify maid details

---

### **STEP 7: Browse All Maids**
- **Method:** `GET`
- **URL:** `{{base_url}}/maids/`
- **Response:** See all available maids

---

### **STEP 8: Browse Maids with Filters**
- **Method:** `GET`
- **URL:** `{{base_url}}/maids/?skill=Cleaning&min_experience=2&max_rate=30`
- **Query Params:**
  - `skill` = `Cleaning` (optional)
  - `min_experience` = `2` (optional)
  - `max_rate` = `30` (optional)
- **Response:** Filtered maids list

---

### **STEP 9: Get Specific Maid Profile**
- **Method:** `GET`
- **URL:** `{{base_url}}/maids/{{maid_id}}`
- **Response:** Detailed maid information

---

### **STEP 10: Create Booking (As Customer)**
- **Method:** `POST`
- **URL:** `{{base_url}}/bookings/`
- **Headers:**
  - `Authorization: Bearer {{customer_token}}`
- **Body (JSON):**
```json
{
  "maid_id": "{{maid_id}}",
  "service_type": "Deep House Cleaning",
  "booking_date": "2025-11-20T10:00:00",
  "time_slot": "10:00 AM - 2:00 PM",
  "notes": "Full 3 BHK apartment. Please bring cleaning supplies."
}
```
- **Response:** Save `id` (booking UUID) → `{{booking_id}}`
- **Response Status:** `PENDING`

---

### **STEP 11: Get My Bookings (As Customer)**
- **Method:** `GET`
- **URL:** `{{base_url}}/bookings/my-bookings`
- **Headers:**
  - `Authorization: Bearer {{customer_token}}`
- **Response:** Show customer's bookings

---

### **STEP 12: Get My Bookings (As Maid)**
- **Method:** `GET`
- **URL:** `{{base_url}}/bookings/my-bookings`
- **Headers:**
  - `Authorization: Bearer {{maid_token}}`
- **Response:** Show maid's received bookings

---

### **STEP 13: Accept Booking (As Maid)**
- **Method:** `PUT`
- **URL:** `{{base_url}}/bookings/{{booking_id}}`
- **Headers:**
  - `Authorization: Bearer {{maid_token}}`
- **Body (JSON):**
```json
{
  "status": "accepted",
  "notes": "I'll bring all supplies and tools"
}
```
- **Response:** Status changed to `ACCEPTED`

---

### **STEP 14: Complete Booking (As Maid)**
- **Method:** `PUT`
- **URL:** `{{base_url}}/bookings/{{booking_id}}`
- **Headers:**
  - `Authorization: Bearer {{maid_token}}`
- **Body (JSON):**
```json
{
  "status": "completed",
  "notes": "Cleaning completed successfully"
}
```
- **Response:** Status changed to `COMPLETED`

---

### **STEP 15: Create Review (As Customer - Only after COMPLETED)**
- **Method:** `POST`
- **URL:** `{{base_url}}/reviews/`
- **Headers:**
  - `Authorization: Bearer {{customer_token}}`
- **Body (JSON):**
```json
{
  "booking_id": "{{booking_id}}",
  "rating": 4.5,
  "comment": "Excellent service! Very professional and punctual. Will book again!"
}
```
- **Response:** Review created with UUID `id`

---

### **STEP 16: Get Reviews for Maid**
- **Method:** `GET`
- **URL:** `{{base_url}}/reviews/maid/{{maid_id}}`
- **Response:** All reviews for the maid

---

### **STEP 17: Update Maid Profile (Optional)**
- **Method:** `PUT`
- **URL:** `{{base_url}}/users/me`
- **Headers:**
  - `Authorization: Bearer {{maid_token}}`
- **Body (JSON):**
```json
{
  "full_name": "Jane Updated",
  "phone_number": "+1111111111",
  "bio": "Updated bio",
  "hourly_rate": 30.00
}
```
- **Response:** Updated profile

---

### **STEP 18: Get User by ID (Public)**
- **Method:** `GET`
- **URL:** `{{base_url}}/users/{{customer_id}}`
- **Response:** Public user profile

---

## **🔑 Postman Environment Variables Setup**

Create these environment variables in Postman:

| Variable | Value | Example |
|----------|-------|---------|
| `base_url` | Base API URL | `http://localhost:8000/api/v1` |
| `customer_id` | Customer UUID | `28c1792c-ffcd-4342-8c32-cb5814e9a131` |
| `maid_id` | Maid UUID | `19879952-c437-41eb-9964-86dee40046cf` |
| `customer_token` | Customer JWT (Access) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `customer_refresh_token` | Customer JWT (Refresh) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `maid_token` | Maid JWT (Access) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `maid_refresh_token` | Maid JWT (Refresh) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `booking_id` | Booking UUID | `4f358191-5daf-494c-a0ed-a66a90919203` |

---

## **🔄 Refreshing Token in Postman**

When access token expires:

**1. Use the refresh endpoint:**
```
POST {{base_url}}/auth/refresh
Body: {
  "refresh_token": "{{customer_refresh_token}}"
}
```

**2. Add to Tests tab to auto-update tokens:**
```javascript
var jsonData = pm.response.json();
pm.environment.set("customer_token", jsonData.access_token);
pm.environment.set("customer_refresh_token", jsonData.refresh_token);
```

**3. New tokens are valid for:**
- Access Token: 30 minutes
- Refresh Token: 7 days

---

## **✅ Security Best Practices**

✅ Access token: Short-lived (30 min) - used for API calls  
✅ Refresh token: Long-lived (7 days) - stored securely  
✅ Never expose tokens in URLs  
✅ Always use HTTPS in production  
✅ Refresh token rotates on each refresh  
✅ Both tokens contain user_id, email, role  

---

## **📋 Error Handling**

**Invalid Access Token:**
```json
{
  "detail": "Could not validate credentials"
}
```
→ Use refresh endpoint to get new access token

**Invalid Refresh Token:**
```json
{
  "detail": "Invalid or expired refresh token"
}
```
→ Must login again

**User Inactive:**
```json
{
  "detail": "Inactive user"
}
```
→ Contact admin

---

## **🚀 Complete Token Flow Diagram**

```
┌─────────────┐
│   LOGIN     │
└──────┬──────┘
       │
       ▼
┌──────────────────────────────┐
│  access_token (30 min)       │──► API Calls
│  refresh_token (7 days)      │
└──────────────────────────────┘
       │
    [30 min passes]
       │
       ▼
┌──────────────────────────────┐
│  POST /auth/refresh          │
│  Body: refresh_token         │
└──────────────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│  NEW access_token (30 min)   │──► API Calls Resume
│  NEW refresh_token (7 days)  │
└──────────────────────────────┘
       │
    [7 days pass]
       │
       ▼
┌──────────────────────────────┐
│   LOGIN AGAIN REQUIRED       │
│   (refresh token expired)    │
└──────────────────────────────┘
```

---

This is ready for implementation! ✅
