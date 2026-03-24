# MedAssist Frontend: Client Architecture

The frontend is a high-performance web application built with **Next.js 15 (App Router)** and **TypeScript**. It serves as the primary data visualization and management portal.

## 1. Architectural Patterns

The application follows the modern Next.js folder structure, separating concerns between route-based components and shared logic.

### Directory Structure
- **`src/app/`**: Contains the App Router hierarchy.
  - **`(dashboard)/caretaker/`**: Protected routes for health providers.
  - **`(dashboard)/patient/`**: Simplified routes for end-users.
- **`src/components/`**: Atomic design patterns.
  - **`shared/`**: Common UI elements (Cards, Badges, Modals).
  - **`ui/`**: Low-level primitives from `shadcn/ui`.
- **`src/lib/`**: Core utilities including the API client and date formatting logic.

## 2. API Integration and State Management

### Axios Interceptor Logic (`src/lib/api.ts`)
The communication layer is managed via a centralized Axios instance with dual interceptors:
1.  **Request Interceptor**: Automatically attaches the JWT `access_token` from local storage to every outgoing request's `Authorization` header.
2.  **Response Interceptor (Token Refresh)**: If an API call fails with a `401 Unauthorized` status, the interceptor automatically attempts to use the `refresh_token` to get a new access key. If successful, it retries the original request seamlessly.

### Data Fetching
- **Client-Side Rendering (CSR)**: Used for highly interactive dashboards where real-time adherence updates are frequent.
- **Optimistic UI**: When a patient marks a medication as "Taken", the UI updates the stats immediately while the background API call is still processing, ensuring a zero-latency feel.

## 3. Component Deep-Dive

### Caretaker Monitoring Hub
- **Risk Visualization**: Integrates with the backend's `predictions` API to render color-coded risk badges.
- **D3/Chart.js Integration**: Visualizes patient adherence history over 30-day windows.
- **OCR Reviewer**: A specialized component that allows caretakers to edit and confirm fields extracted by the backend's Azure AI service.

### Patient Simplified UI
- **Large-Scale UI**: Designed for elderly accessibility with high-contrast elements and simplified navigation.
- **Status Filtering**: Dynamically filters the `TodaySchedule` into Taken, Late, and Missed categories for clear task prioritization.
- **Audible Alerts (Local TTS)**: Integrated **Web Speech API** for dashboard voice notifications (Zero-Cost). The UI speaks medication names directly via the browser's native engine.
- **Universal WebPush**: Service Worker (`sw.js`) implementation for background alerts using **VAPID keys** (no Firebase required).

## 4. Security & Authentication

- **Middleware Protection**: Routes are guarded by `middleware.ts` which checks for valid session tokens before allowing access to the dashboard.
- **Role-Based Routing**: Users are automatically redirected to either `/caretaker` or `/patient` based on the role stored in their JWT payload.

## 5. Development Setup

```bash
npm install
npm run dev
```

**Environment Configuration**: Ensure `NEXT_PUBLIC_API_URL` points to your running Django server.

## 6. Technical Implementation Guides

- [**Data Flow Mapping**](./docs/technical-guides/data-dictionary.md): UI to Backend field mapping.
- [**The Scan Lifecycle**](./docs/technical-guides/prescription-flow-trace.md): OCR review and validation flow.

---
*Technical Lead: Ramya*
