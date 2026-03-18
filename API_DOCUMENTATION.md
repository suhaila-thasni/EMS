# API Documentation
## Fashion Couture - Tactical Presence Hub API

**Base URL**: `http://localhost:5000/api` (Local Development)

### 🔐 Authentication (`/auth`)               
Endpoints for personnel identification and session management.

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Enroll new personnel. | `{ employeeId, email, password, firstName, lastName, department, shopLocation }` |
| `POST` | `/auth/login` | Synchronize session. | `{ email, password }` |
| `POST` | `/auth/forgot-password` | Initiate recovery. | `{ email }` |
| `POST` | `/auth/reset-password` | Update credentials. | `{ token, newPassword }` |

---

### 🕒 Attendance (`/attendance`)
Real-time biometric registration and geospatial tracking.

| Method | Endpoint | Description | Payload / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/attendance/record` | Log check-in/out. | `{ userId, type, latitude, longitude, selfieB64, status }` |
| `GET` | `/attendance/history/:uid` | Personnel audit feed. | Returns array of biometric events for user. |
| `GET` | `/attendance/all` | Global feed (Admin). | returns all system-wide attendance records. |
| `PUT` | `/attendance/:id` | Override record (Admin). | `{ type, status, timestamp }` |
| `DELETE`| `/attendance/:id` | Purge record (Admin). | Irrevocable deletion of event logs. |

---

### 👥 Personnel Hub (`/employees`)
Data management for the global artisan registry.

| Method | Endpoint | Description | Notes |
| :--- | :--- | :--- | :--- |
| `GET` | `/employees` | List all personnel. | Supports search/filter query params. |
| `GET` | `/employees/:id` | Retrieval by ID. | Comprehensive profile data + performance metrics. |
| `PUT` | `/employees/:id` | Update identity. | Modify roles, departments, or biometric paths. |
| `DELETE`| `/employees/:id` | Terminate access. | Removes user and all associated telemetry. |

---

### ⚙️ System Configuration (`/config`)
Global environment parameters for the operational perimeter.

| Method | Endpoint | Description | Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/config/shop` | Fetch Geo-Gate. | Returns shop coordinates and allowed radius. |
| `POST` | `/config/location` | Update Perimeter. | `{ lat, lng, name, radius }` (Admin only). |
| `GET` | `/config/stats` | Executive Insights. | Aggregate metrics (Total staff, currently on floor). |

---

### ✅ Compliance & Comms (`/notifications`, `/jobs`, `/messages`)
Operational alerts and professional deployment listings.

| Endpoint | Method | Action |
| :--- | :--- | :--- |
| `/notifications` | `GET` | List active alerts for current session. |
| `/notifications/:id` | `PUT` | Mark alert as acknowledged (read). |
| `/jobs` | `GET` | List available deployment slots. |
| `/messages` | `GET` | Fetch global command announcements. |







