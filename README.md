# ContainerCheck AI — Shipping Container Inspection Mobile Application

A production-quality mobile application UI for **ContainerCheck AI**, an AI-powered maritime shipping container inspection platform for Android, iOS, and responsive web preview.

## Architecture & Technology Stack

- **Framework**: React 19, TypeScript, Vite, Tailwind CSS 4
- **State Management**: Zustand stores (`useAuthStore`, `useInspectionStore`, `useSyncStore`, `useCreditStore`, `useNotificationStore`)
- **Native Mobile Runtime**: Capacitor configuration (`capacitor.config.ts`) supporting iOS (`App/App.xcodeproj`) and Android (`android/app`)
- **Container Standard**: ISO 6346 container number parsing & Modulus-11 check digit verification algorithm (`src/utils/iso6346.ts`)
- **Maritime Defect Standards**: IICL-6 & ISO 1496-1 tolerance verification for dry freight & reefer containers
- **Backend API Integration Layer**: Centralized API Client (`src/services/apiClient.ts`) configured via `VITE_API_BASE_URL` with resilient mock fallbacks for standalone development.

---

## Key Features & Workflows

1. **Maritime Navy & Teal Aesthetics**:
   - Primary Navy (`#142B45`), Accent Teal (`#12A89D`), Background (`#F5F7FA`), Surface (`#FFFFFF`).
   - Anti-AI slop compliance: clean unboxed metadata with subtle typographic separators, zero pills on static text.
   - High-fidelity industrial port and container photography generated specifically for this application.

2. **Mobile Ergonomics & Navigation**:
   - Fixed Bottom Navigation Bar with 5 destinations (Home, Inspections, Prominent Center New Survey button, Reports, Profile).
   - Secondary Navigation Drawer for switching active operating organizations (e.g. *Maersk Line Marine Ops*, *Hapag-Lloyd*, *Independent Marine Surveyors*), Credit Wallet, and security settings.
   - Mobile Frame Simulator Toggle at top header allowing desktop reviewers to preview the app inside an iPhone/Android touch frame or expand to full responsive desktop preview.

3. **Multi-Step Inspection Wizard**:
   - **Step 1 — Protocol**: Empty Container (11 criteria) vs. Loaded Container (8 criteria + high-security bolt seal check).
   - **Step 2 — Container Data & ISO 6346 OCR**: Real-time validation of 3-letter owner code, equipment identifier (`U`, `J`, `Z`), 6-digit serial, and ISO calculated check digit with live camera OCR scanning.
   - **Step 3 — Guided Photography**: 8 standard ISO angles (Front/Doors, Rear, Left Side, Right Side, Roof, Interior, Markings, CSC Plate) + additional damage shots.
   - **Step 4 — Inspection Checklist**: Interactive physical checklist with Good, Minor Damage, Major Damage, N/A, Not Inspected, comments and tolerance measurements.
   - **Step 5 — Review & Submit**: Comprehensive audit, credit reservation (1 credit per survey), and offline handling.

4. **Field Offline & Synchronization Center**:
   - Built-in online/offline detector with a 1-tap "Simulate Offline" toggle for testing.
   - Seamless offline SQLite/storage persistence when surveying in steel container yards or low-connectivity port berths.
   - Synchronization queue with progress bars, retry logic, and credit validation.

5. **AI Vision Damage Detection & Human Surveyor Sign-off**:
   - Interactive container photograph viewer with clickable SVG bounding boxes.
   - Defect classifications: Dents, Holes, Cracks, Bulges, Rust, Corrosion, Door/Hinge wear, Locking mechanism wear, Floor damage.
   - Surveyor verification workflow: Accept finding, Reject finding, Edit finding, or Add manual finding.
   - Formal Human Approval Modal requiring explicit declaration under professional maritime regulations before issuing signed inspection certificates.

6. **Credit Wallet & Stripe Checkout**:
   - Credit balances: Available, Reserved in Queue, Total Consumed, Total Purchased.
   - Configurable package tiers: Starter (10 credits), Professional (50 credits), Terminal Business (200 credits), Global Enterprise (1000 credits).
   - Stripe Checkout modal interface with card entry and instant replenishment simulation.
   - Complete ledger transaction history.

7. **Reports & Official Inspection Certificate**:
   - Official maritime container survey certificate modal with ISO 1496-1 compliance seals, digital hashes, and surveyor sign-off.
   - Download PDF and Share PDF actions.

---

## Connecting to the FastAPI Backend

The application is architected with a service abstraction layer (`src/services/`):
Set the backend URL in `.env`:

```bash
VITE_API_BASE_URL="https://api.yourdomain.com/v1"
```

Endpoints expected by the client:
- `POST /auth/login` & `POST /auth/2fa/verify`
- `GET /inspections` & `POST /inspections`
- `GET /inspections/{id}` & `POST /inspections/{id}/approve`
- `POST /ai/analyze-photos`
- `GET /credits/balance` & `POST /credits/checkout-session`
- `GET /reports/{id}/pdf`
