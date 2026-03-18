# Database Schema Documentation
## Fashion Couture - Employee Management System

### 📊 Entity Relationship Summary
The system utilizes a relational PostgreSQL database with a centralized `users` table serving as the primary hub for authentication and role-based permissions.

---

### 1. `users` (Personnel Registry)
Stores primary employee identities and authentication data.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Unique system-wide identifier. |
| `employee_id` | `VARCHAR(50)` | UNIQUE, NOT NULL | Human-readable company ID (e.g., EMP001). |
| `first_name` | `VARCHAR(100)` | NOT NULL | Employee's first name. |
| `last_name` | `VARCHAR(100)` | NOT NULL | Employee's last name. |
| `email` | `VARCHAR(255)` | UNIQUE, NOT NULL | Official work email for login. |
| `password` | `TEXT` | NOT NULL | Bcrypted hash. |
| `role` | `VARCHAR(20)` | DEFAULT 'Employee' | Access tier ('Admin', 'Employee'). |
| `department` | `VARCHAR(100)` | - | Assigned operational sector. |
| `shop_location` | `VARCHAR(100)` | - | Geopolitical deployment site. |
| `profile_image`| `TEXT` | - | URL or Base64 biometric data. |
| `otp` | `VARCHAR(6)` | - | Short-term PIN for recovery. |
| `otp_expires` | `TIMESTAMP` | - | Expiration for recovery tokens. |
| `created_at` | `TIMESTAMP` | DEFAULT CURRENT | Automatic entry timestamp. |

---

### 2. `attendance` (Biometric Logs)
Captures real-time presence events with geospatial telemetry and photographic proof.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Individual event identifier. |
| `user_id` | `UUID` | FK (users.id) | Link to the specific artisan. |
| `type` | `VARCHAR(20)`| NOT NULL | 'check-in' or 'check-out'. |
| `timestamp` | `TIMESTAMP` | DEFAULT CURRENT | Moment of event registration. |
| `latitude` | `DECIMAL(10,8)`| - | GPS Latitude coordinate. |
| `longitude` | `DECIMAL(11,8)`| - | GPS Longitude coordinate. |
| `selfie_url` | `TEXT` | - | Physical path to biometric asset. |
| `status` | `VARCHAR(50)`| - | 'Present', 'Late', 'Verified'. |

---

### 3. `notifications` (System Alerts)
Broadcasts operational alerts and shift reminders.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Unique notification ID. |
| `user_id` | `UUID` | FK (users.id) | Target recipient. |
| `title` | `VARCHAR(255)`| NOT NULL | Subject header. |
| `message` | `TEXT` | NOT NULL | Detailed payload content. |
| `type` | `VARCHAR(50)`| DEFAULT 'info' | Visual tier ('info', 'warning', 'success'). |
| `is_read` | `BOOLEAN` | DEFAULT FALSE | Acknowledgement status. |

---

### 4. `jobs` (Deployment Openings)
Publicly listed operational positions.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | PRIMARY KEY | Vacancy identifier. |
| `title` | `VARCHAR(255)`| NOT NULL | Operational role title. |
| `department` | `VARCHAR(100)`| NOT NULL | Sector for deployment. |
| `status` | `VARCHAR(20)`| DEFAULT 'Open'| Listing status ('Open', 'Closed'). |

---

### 5. `system_config` (Global Parameters)
Dynamic environment variables for the Geo-Gate protocol.

| Key | Type | Value Example | Description |
| :--- | :--- | :--- | :--- |
| `shop_lat` | `VARCHAR` | '11.045719' | Central shop Latitude. |
| `shop_lng` | `VARCHAR` | '76.111876' | Central shop Longitude. |
| `allowed_radius`| `VARCHAR` | '100' | Geofence perimeter in meters. |
| `shop_name` | `VARCHAR` | 'Fashion Couture'| Verified brand registry name. |
