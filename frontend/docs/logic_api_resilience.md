# API Resilience & State Deep-Dive

This document explains how the frontend stays robust even when the network is shaky or the server is busy.

## 1. The Axios Interceptor Tier
**File**: `frontend/src/lib/api.ts`

Traditional apps crash when a token expires. MedAssist uses **Axios Interceptors** to handle this silently.

### The Refresh Flow:
1. **Unauthorized!**: The app makes an API call, but the server returns a `401 Unauthorized` (Token expired).
2. **Intercept**: The response interceptor catches this error *before* the component even sees it.
3. **Renewal**: It automatically hits `/api/auth/refresh/` using a hidden `refresh_token`.
4. **Retry**: If the refresh is successful, it retries the original API call with the brand-new token.
5. **Transparency**: To the user, it looks like the app never stopped working.

---

## 2. Optimistic UI Updates
When a patient clicks "Take Medication," we don't wait 2 seconds for the server to reply.

**The Logic**:
1. **Click**: User clicks the button.
2. **Local Update**: We immediately change the button to "Done" in the local State.
3. **Background Sync**: We send the POST request to the backend.
4. **Rollback (Rare)**: If the server actually returns an error, we "undo" the change and show a toast alert to the user.

*This makes the app feel incredibly fast and responsive.*

---

## 3. Role-Based Routing
The app uses a single dashboard route structure but differentiates content based on **User Roles**.

- **Caretaker Context**: Data is fetched using a `patient_id` parameter.
- **Patient Context**: The backend automatically identifies the user via their JWT token, so no ID is passed in the URL.

---

## 4. State Management with Next.js
We use `useEffect` hooks combined with `axios` to fetch data on mount. 
- **Loading States**: Every page uses a `loading` boolean to show a skeleton UI, preventing "Layout Shift" which can be confusing for elderly users.
- **Effect Dependency**: Data is re-fetched whenever a medication is added or a scan is completed, ensuring the dashboard is always current.

---

## 5. Audible Reminders (Zero-Cost Logic)
**File**: `sw.js` & `WebPushRegistration.tsx`

To support elderly accessibility, the frontend integrates with the **Web Speech API**:
1. **Background Listener**: The Service Worker (`sw.js`) listens for incoming push messages.
2. **Signal Propagation**: When a message contains a `speech_text` payload, the SW sends a `postMessage` to all active windows.
3. **Local Synthesis**: The `WebPushRegistration` component receives the message and triggers `window.speechSynthesis.speak()` locally.
