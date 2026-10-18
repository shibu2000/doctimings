# DocTimings

> **Real-time Doctor Chamber Timings, Verified Clinic Schedules & Queue Intelligence**

DocTimings is a full-stack, cross-platform healthcare timing platform designed to solve outpatient queue uncertainty and reduce patient travel friction across West Bengal. Starting in Paschim Medinipur, the platform connects patients with verified specialist visiting hours, chamber locations, and live operational updates.

---

## System Architecture

DocTimings is organized as a unified monorepo encompassing the core backend API, web portals, and native mobile applications:

```
doctimings/
├── backend/            # Express & TypeScript REST API, Neon PostgreSQL, Auth & Access
├── web/                # Next.js (React 19) patient discovery web application
├── admin/              # Vite & React streamlined operations cockpit for Super Admin
├── app/                # Expo React Native patient application (English & Bengali)
├── app-partner/        # Expo React Native operational portal for clinic owners, staff & doctors
├── admin-design/       # UI/UX design specifications and assets for admin
├── app-design/         # Design system tokens and screens for patient app
└── app-partner-design/ # Workflow designs for partner portal
```

---

## Applications & Features

### 1. Backend API (`backend/`)
* **Stack**: Node.js, Express, TypeScript, Neon PostgreSQL (Serverless Postgres), Vitest.
* **Security & Access**:
  * Role-Based Access Control (`Super Admin`, `Operations Admin`, `Partner`, `Doctor`, `Staff`, `Patient`).
  * One-time 10-character cryptographically secure activation codes for facility handover.
  * Public claim request verification workflow for registered doctors.
  * Immediate token invalidation on password change or account suspension.
* **Testing**: 72 automated test suites covering security, platform routes, sitting calculations, and regression safety.

### 2. Patient Web App (`web/`)
* **Stack**: Next.js 16, React 19, Tailwind CSS, Lucide Icons.
* **Features**:
  * Zero-nesting compact doctor cards with prominent doctor typography and quick day tags.
  * Real-time search across doctors, specialties, and clinics.
  * Subdivision and hub selector with dynamic distance-based sorting.

### 3. Admin Operations Cockpit (`admin/`)
* **Stack**: Vite, React 19, Tailwind CSS.
* **Features**:
  * Daily operational cockpit (`TodayPage.tsx`) displaying all visiting doctors for the day.
  * Generation of one-time onboarding codes for clinics and doctors.
  * Review and approval queue for doctor profile claims and clinic roster additions.

### 4. Patient Mobile App (`app/`)
* **Stack**: React Native, Expo Router, TypeScript.
* **Features**:
  * Multilingual localization (English & Bengali / বাংলা).
  * Geolocation-based nearby doctor and clinic search (`expo-location`).
  * Offline-capable browsing of schedules and emergency contact numbers.

### 5. Partner Mobile App (`app-partner/`)
* **Stack**: React Native, Expo Router, TypeScript.
* **Features**:
  * **Today Cockpit**: Single-tap actions to broadcast emergency doctor leaves or delays (+15m, +30m, +45m, +1h).
  * **Roster Management**: Add and manage affiliated doctors and consultation fees.
  * **Counter Team**: Owner capability to generate single-use staff invite codes with native WhatsApp sharing.
  * **Claimed Doctor Mode**: Dedicated interface when an independent doctor logs in to manage their personal visiting schedule.

---

## Verified Regional Healthcare Dataset

The database contains 100% verified real healthcare data across 7 primary hubs in Paschim Medinipur:

| Hub | Establishments | Doctors | Focus Facilities |
| :--- | :---: | :---: | :--- |
| **Medinipur Town** | 6 | 9 | Kathamala, Peerless Chambers, Dristilok Hospital, KG Advanced Medicare |
| **Kharagpur** | 4 | 8 | GB Wellness (Malancha), Dolphin Clinic (Inda), Spandan Hospital, Kharagpur SDH |
| **Ghatal** | 9 | 14 | Ghatal SDH, Jeevan Deep, Save Life, G.F.C. Hospital, Apollo Clinic |
| **Khirpai** | 7 | 6 | Khirpai Rural Hospital, Roy Pharmacy, Ghoshal Pharmacy, MedPlus |
| **Chandrakona Town** | 6 | 5 | Chandrakona RH, Dishari Nursing Home, Mother Nursing Home |
| **Daspur (I & II)** | 3 | 3 | Daspur Rural Hospital, Sonakhali Rural Hospital, Seva Clinic |
| **Ramjibanpur** | 3 | 2 | Ramjibanpur PHC, Ramjibanpur Medical, Laxminarayan Pharmacy |

* All doctors have verified West Bengal Medical Council (**WBMC**) registration numbers.
* All facilities include verified GPS coordinates, physical street addresses, and local contact numbers.

---

## Quick Start & Local Development

### 1. Prerequisites
* Node.js 18+ (Node 20+ recommended)
* npm or pnpm
* PostgreSQL database (or free [Neon Serverless Postgres](https://neon.tech))

### 2. Clone the Repository
```bash
git clone https://github.com/shibu2000/doctimings.git
cd doctimings
```

### 3. Environment Configuration
Copy `.env.example` templates in each project directory:

```bash
# Root template overview
cp .env.example .env

# Backend configuration
cp backend/.env.example backend/.env

# Web configuration
cp web/.env.example web/.env.local

# Admin configuration
cp admin/.env.example admin/.env.development
```

### 4. Install Dependencies & Run

#### Backend API (Port 4000):
```bash
cd backend
npm install
npm run dev
```

#### Web Application (Port 3000 / 3001):
```bash
cd web
npm install
npm run dev
```

#### Admin Cockpit (Port 5173):
```bash
cd admin
npm install
npm run dev
```

#### Mobile Apps (Patient & Partner):
```bash
# Patient app
cd app
npm install
npx expo start

# Partner app
cd app-partner
npm install
npx expo start
```

---

## Testing & Quality Assurance

Run the comprehensive backend test suite:
```bash
cd backend
npm test
```
* **72 passing tests** across 9 test suites:
  * Authentication & Session Safety (`auth.test.ts`)
  * Establishment Access & Single-Use Codes (`access.test.ts`)
  * Roster Management & Doctor Verification (`doctors.test.ts`)
  * Weekly Sittings & Shift Formatting (`sittings.test.ts`)
  * Platform Security & Rate Limiting (`security.test.ts`)
  * Security Regression & Permission Enforcements (`audit-regressions.test.ts`)

---

## Production Deployment

* **Backend & Web**: Configured for deployment on Vercel or cloud compute environments.
* **Android Distribution**: Configured for production builds (`.apk` and `.aab`) via EAS Build for direct distribution and the **Indus Appstore**.

---

## Author & Maintainer

* **Author**: Shibu Dhara ([@shibu2000](https://github.com/shibu2000))
* **Organization**: DocTimings
