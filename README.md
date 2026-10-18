# Eduvora — Smart Multi-Tenant Education Management SaaS Platform 🎓✨

[![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-6.4-2d3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel Deployment](https://img.shields.io/badge/Deployed-Vercel-success?style=for-the-badge&logo=vercel)](https://eduvora-lac.vercel.app/)

> **Eduvora** is a next-generation, multi-tenant Education Management SaaS designed for **Schools, Degree Colleges, Universities, and Coaching Academies**. It replaces fragmented legacy software and manual spreadsheets with an automated, cloud-native operational suite featuring strict tenant data isolation, Pakistani Rupee (`PKR` / `Rs.`) financial workflows, 7 specialized role portals, and real-time academic tracking.

🔗 **Live Deployment:** [https://eduvora-lac.vercel.app/](https://eduvora-lac.vercel.app/)  
📦 **GitHub Repository:** [https://github.com/AhmedRaza2007/eduvora](https://github.com/AhmedRaza2007/eduvora)

---

## 🌟 Key Highlights & Architectural Pillars

### 1. 🏢 Multi-Tenant Architecture & Multi-Campus Hierarchy
- **Strict Data Isolation:** Institutions and campuses operate in complete isolation. Student, teacher, fee, or exam records from Institution A never leak into Institution B.
- **Super Admin Platform:** Platform owners can provision institutions, activate/suspend accounts, monitor cross-institution growth analytics, and manage institution admins.
- **Multi-Branch Support:** Support for main and satellite campuses (e.g., *Main Campus*, *North Campus*, *Gulshan Campus*) with branch-level user permissions.

### 2. 🔐 7 Specialized Role-Based Access Control (RBAC) Portals
Eduvora enforces server-side and client-side authorization via cryptographic HMAC SHA-256 session cookies:
- **`SUPER_ADMIN`**: Global platform owner with full multi-institution governance and account provisioning.
- **`ADMIN`**: Campus director/principal managing student intakes, teachers, staff, fees, and settings.
- **`TEACHER`**: Dedicated academic portal for class attendance, grading, exams, and timetables.
- **`ACCOUNTANT`**: Financial ledger, fee invoicing, partial payment collections, receipts, and payroll.
- **`RECEPTIONIST`**: Front-office desk for visitor inquiries, new admissions, and notice boards.
- **`PARENT`**: Child-specific portal for fee vouchers, attendance tracking, and report cards.
- **`STUDENT`**: Self-service portal for enrolled subjects, homework, exam schedules, and results.

### 3. 🇵🇰 Native Pakistani Rupee (`PKR` / `Rs.`) Financial Engine
- Standardized formatting across all ledgers, invoices, salary pay-slips, and receipts (`Rs. 25,000`, `Rs. 150,000`).
- **Partial Payment Tracking:** Automatically computes paid amounts, outstanding dues, and invoice statuses (`PAID`, `PARTIAL`, `UNPAID`, `OVERDUE`).
- **One-Click Printable Receipts:** Modal receipts ready for thermal or standard A4 printing.
- **Net Salary Engine:** Calculates staff payroll dynamically:  
  $$\text{Net Salary} = \text{Base Salary} + \text{Bonuses} - \text{Deductions} - \text{Advances}$$

### 4. 🎓 End-to-End Academic & Student Lifecycle
- **8-Tab Student Profile:** Complete dossier covering Academic info, Attendance logs, Fee history, Exam results, Uploaded documents, Parent/Guardian records, and Activity audit trails.
- **Smart Attendance Grid:** Real-time daily marking with duplicate-entry prevention and monthly analytics.
- **Examinations & GPA Calculator:** Term exam schedules, subject mark entries, automated grade assignments, and downloadable result cards.

### 5. 🌙 Modern SaaS UX & Dark Mode
- Built with **Tailwind CSS v4** featuring selector-based `@custom-variant dark` support.
- Seamless toggle between **Light**, **Dark**, and **System** themes with hydration-safe persistence.
- Zero horizontal layout overflow on mobile and tablet devices.

### 6. 🎬 Built-in 35-Second LinkedIn Video Section
- High-definition 1080p promotional launch video embedded directly on the homepage under the **"Discover Eduvora"** section.
- Custom interactive HTML5 player with play/pause, volume control, timeline scrubber, and fullscreen.
- Real 1-click **Download Video (.mp4)** button using optimized H.264/AAC encoding.

---

## 📊 RBAC Permission Matrix

| Role | Primary Scope | Permitted Modules & Routes |
| :--- | :--- | :--- |
| **`SUPER_ADMIN`** | Platform-Wide | All institutions, branch configuration, platform analytics, global user provisioning (`/super-admin`, `/dashboard/*`) |
| **`ADMIN`** | Single Institution | Student admissions, staff rosters, campus timetables, fees, exams, settings (`/dashboard/*`) |
| **`TEACHER`** | Academic Roster | Assigned classes, daily attendance, grade entries, exam reports (`/dashboard/teachers`, `/dashboard/attendance`, `/dashboard/exams`) |
| **`ACCOUNTANT`** | Institutional Finance | Fee vouchers, partial collections, receipt generation, expenses, staff salaries (`/dashboard/fees`, `/dashboard/expenses`, `/dashboard/salaries`) |
| **`RECEPTIONIST`**| Front Desk | Admission intake, visitor logs, student directory, notices (`/reception`, `/dashboard/admissions`) |
| **`PARENT`** | Children Only | Children's attendance logs, pending fee vouchers, term report cards (`/parent`) |
| **`STUDENT`** | Individual Profile | Enrolled subjects, timetable schedules, homework, exam marks (`/student`) |

---

## 🛠️ Tech Stack & Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Eduvora Tech Stack                   │
├─────────────────┬──────────────────────────────────────┤
│ Framework       │ Next.js 16.3 (App Router + Turbopack)│
│ Core UI         │ React 19, Lucide React Icons         │
│ Language        │ TypeScript 5.7 (Strict Typecheck)    │
│ Styling         │ Tailwind CSS v4, Next Themes         │
│ Database & ORM  │ PostgreSQL / Supabase, Prisma ORM 6.4│
│ Auth & Security │ HMAC SHA-256 HTTP Cookies, RBAC      │
│ Financials      │ Localized PKR (Rs.) Currency Engine  │
│ Video Media     │ HTML5 Canvas, MediaRecorder, FFmpeg  │
│ Deployment      │ Vercel Edge Network CI/CD            │
└─────────────────┴──────────────────────────────────────┘
```

---

## 📁 Repository Directory Structure

```text
eduvora/
├── prisma/
│   ├── schema.prisma          # Database schema (Institutions, Branches, Users, Students, Fees, etc.)
│   └── seed.ts                # Database seeding script with multi-role sample data
├── public/
│   ├── Eduvora-Promotional-Video.mp4  # 1080p MP4 promotional launch video
│   ├── video_thumbnail.jpg            # Poster thumbnail for video player
│   ├── eduvora-launch-video.webm      # High-bitrate WebM video backup
│   └── promo-video.html               # Standalone 16:9 interactive video studio player
├── src/
│   ├── app/
│   │   ├── api/               # Protected REST API routes (users, fees, students, auth, etc.)
│   │   ├── dashboard/         # Role-governed administration dashboards
│   │   │   ├── admissions/    # Intake management
│   │   │   ├── attendance/    # Smart attendance grid
│   │   │   ├── fees/          # PKR Fee invoicing & receipts
│   │   │   ├── salaries/      # Payroll engine
│   │   │   ├── students/      # 8-tab student records
│   │   │   ├── teachers/      # Faculty rosters
│   │   │   └── users/         # Staff account management
│   │   ├── super-admin/       # Multi-tenant institution governance & audit logs
│   │   ├── globals.css        # Tailwind v4 dark variant & theme tokens
│   │   ├── layout.tsx         # Root layout with RoleProvider & ThemeProvider
│   │   ├── page.tsx           # High-converting landing page with "Discover Eduvora"
│   │   └── proxy.ts           # Next.js 16 role-based route middleware
│   ├── components/
│   │   ├── landing/
│   │   │   └── VideoSection.tsx   # Custom video player & MP4 download component
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # Header navigation bar
│   │   │   └── RoleSwitcher.tsx   # Interactive session role dropdown
│   │   └── ui/
│   │       ├── ReceiptModal.tsx   # Printable fee invoice receipt modal
│   │       └── ThemeSelector.tsx  # Light / Dark / System theme switcher
│   ├── context/
│   │   └── RoleContext.tsx    # Session synchronization & active role state
│   └── lib/
│       ├── auth.ts            # Password hashing & HMAC session verification
│       ├── currency.ts        # formatPKR() utility (Rs. formatting)
│       └── prisma.ts          # Singleton Prisma client instance
├── scripts/
│   └── render_video.js        # Headless Chrome script for automated video compilation
├── package.json
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: `v20.x` or `v22.x` (LTS recommended)
- **npm** or **pnpm**
- **PostgreSQL Database**: A local instance or a cloud database (e.g. Supabase, Neon, Railway).

### 1. Clone the Repository
```bash
git clone https://github.com/AhmedRaza2007/eduvora.git
cd eduvora
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the root directory:
```env
# Database Connection (PostgreSQL / Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[REF].supabase.co:5432/postgres"

# Authentication Secret
JWT_SECRET="your-super-secure-secret-key-at-least-32-characters"

# Next.js Environment
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### 4. Push Database Schema & Seed Data
```bash
# Push Prisma schema to the database
npx prisma db push

# Generate Prisma Client
npx prisma generate

# (Optional) Seed demo institutions, branches, students, and users
npm run db:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚡ Role Demonstration & Quick Exploration

To test the application without manual re-registration:
1. Open the landing page or dashboard at `http://localhost:3000`.
2. Click the **"Switch Role ▾"** dropdown in the top header.
3. Select any role (**Super Admin**, **Teacher**, **Accountant**, **Receptionist**, **Parent**, or **Student**).
4. Eduvora will automatically issue a signed cryptographic session cookie for that role and navigate to its dedicated portal with appropriate permissions.

---

## 🧪 Production Build & Quality Assurance

To verify strict TypeScript adherence and Next.js optimization:

```bash
# 1. TypeScript verification
npx tsc --noEmit

# 2. Production build compilation
npm run build
```

Expected result:
```text
✓ Compiled successfully in ~6s
✓ Finished TypeScript and lint checks
✓ Generating static pages (60/60)
✓ Finalizing page optimization
```

---

## 🚢 Deployment

Eduvora is optimized for one-click deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the repository into your [Vercel Dashboard](https://vercel.com/new).
3. Set your environment variables (`DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`).
4. Set Build Command: `npm run build` (runs `prisma generate && next build`).
5. Deploy!

---

## 🤝 Contributing & License

Contributions, issues, and feature requests are welcome!  
Feel free to open an issue or submit a pull request on the [GitHub repository](https://github.com/AhmedRaza2007/eduvora).

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  <b>Built with ❤️ by Ahmed Raza</b><br>
  <i>Empowering education institutions through modern cloud software.</i>
</p>
