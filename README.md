# EMS
An Employee Management System (EMS) that enables attendance using real-time GPS location verification. It captures a selfie via camera during check-in and check-out to ensure the user is physically present at the location.

# Employee Management System (EMS) - Tactical Presence Hub

A high-fidelity, biometric-secure attendance and personnel management system built with Next.js and Node.js.

## 🚀 Key Features

- **Biometric Hub**: Real-time GPS verification combined with mandatory selfie capture for high-integrity check-ins.
- **Geo-Gate Security**: Automated distance calculation ensures personnel are within the authorized store perimeter.
- **Live Tracking**: Interactive Google Maps integration with real-time positional updates.
- **Audit Logging**: Comprehensive session history with indexed GPS coordinates and photographic evidence.
- **Daily Lock**: Prevents duplicate check-ins/check-outs, ensuring single-session integrity per day.
- **Admin Command Center**: Complete oversight of global shifts, late entry tracking, and personnel management.

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, Tailwind CSS, Lucide Icons, Material UI.4
- **Backend**: Node.js, Express, PostgreSQL.
- **Storage**: Local file system for secure biometric asset storage.
- **APIs**: RESTful architecture with JWT authentication.

## 📂 Project Structure

```
EMS/
├── frontend/               # Next.js Application
│   ├── app/                # App Router (Pages & Layouts)
│   ├── components/         # Premium UI Components
│   ├── lib/                # API Helpers & Shared Logic
│   └── public/             # Static Assets
└── backend/                # Node.js Express Server
    ├── src/
    │   ├── controllers/    # Business Logic Handlers
    │   ├── routes/         # API Endpoint Definitions
    │   ├── config/         # Database & App Config
    │   └── utils/          # System Initializers
    ├── uploads/            # Biometric Asset Storage
    └── init_db.sql         # Database Schema Definition
```

## ⚙️ Setup & Installation

### Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** (Active instance)
- **Git**

### 1. Database Initialization
1. Create a new PostgreSQL database named `ems_db`.
2. Execute the `backend/init_db.sql` script to initialize the schema and seed default values.
   ```bash
   psql -U postgres -d ems_db -f backend/init_db.sql
   ```

### 2. Backend Orchestration
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install system dependencies:
   ```bash
   npm install
   ```
3. Configure the environment (`.env`):
   ```env
   PORT=5000
   DB_USER=postgres
   DB_HOST=localhost
   DB_NAME=ems_db
   DB_PASS=your_password
   DB_PORT=5432
   JWT_SECRET=fashion_couture_secure_key
   ```
4. Launch the terminal:
   ```bash
   npm run dev
   ```

### 3. Frontend Deployment
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install UI dependencies:
   ```bash
   npm install
   ```
3. Configure environment (`.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```
4. Initialize the interface:
   ```bash
   npm run dev
   ```

## 📄 Documentation

For deep-dive technical specifications, refer to:
- [**Database Schema**](./SCHEMA.md): Complete data architecture and ER definitions.
- [**API Documentation**](./API_DOCUMENTATION.md): Comprehensive REST endpoint registry.
- [**Initialization Script**](./backend/init_db.sql): Raw SQL for database synchronization.

## 🛡️ Security Implementation

- **Biometric FS-Layer**: Direct file system storage for high-resolution images to maintain database performance.
- **Geofence Protocol**: Real-time server-side distance validation against authorized shop coordinates.
- **Session Integrity**: JWT-protected routes with specific Admin/Employee clearance levels.
- **Lockout Logic**: Single-record guard prevents duplicate check-ins within the same operational day.
