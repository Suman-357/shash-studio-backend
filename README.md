# SHASH Studios Backend API (MERN Stack)

Enterprise-grade, secure, and resilient MVC REST API powering **SHASH Studios — Karnataka's Premier Holistic Yoga & Wellness Sanctuary (Mysuru)**.

---

## 🏛️ Architecture Overview

The backend is built following the **Model-View-Controller (MVC)** architectural design pattern:

```
backend/
├── .env.example                     # Sample environment configurations
├── package.json                     # Production dependencies & scripts
├── server.js                        # Process lifecycle, graceful shutdown, MongoDB init
└── src/
    ├── app.js                       # Express application assembly & security middleware chain
    ├── config/
    │   ├── db.js                    # Resilient Mongoose connection with pooling & event monitoring
    │   └── env.js                   # Validated environment configuration with fallback defaults
    ├── models/
    │   ├── Workshop.js              # Yoga program schema with bilingual support & pricing
    │   ├── Registration.js          # Student enrollment, auto-generated SHASH-XXXXXX ID, payment status
    │   ├── Inquiry.js               # Contact form messages and coordinator status tracking
    │   └── Admin.js                 # Admin user schema with bcrypt password hashing & JWT
    ├── controllers/
    │   ├── workshopController.js    # CRUD operations, category filtering, batch details
    │   ├── registrationController.js # Multi-step registration, instant verification, receipts
    │   ├── inquiryController.js     # Student inquiry intake & management
    │   └── authController.js        # Admin login, profile, and JWT issue
    ├── routes/
    │   ├── workshopRoutes.js        # /api/v1/workshops
    │   ├── registrationRoutes.js    # /api/v1/registrations
    │   ├── inquiryRoutes.js         # /api/v1/inquiries
    │   ├── authRoutes.js            # /api/v1/auth
    │   └── index.js                 # Unified v1 router with health checks
    ├── middlewares/
    │   ├── authMiddleware.js        # JWT token verification and Role-Based Access Control (RBAC)
    │   ├── validationMiddleware.js  # Input validation & sanitization against injection
    │   ├── rateLimiter.js           # Rate-limiting middleware (anti-DDoS / bot spam)
    │   └── errorHandler.js          # Centralized error handler with standardized JSON output
    └── utils/
        ├── apiResponse.js           # Standardized API response envelope { success, data, message }
        ├── apiError.js              # Custom operational error class
        ├── seedData.js              # Complete Mysuru curriculum seed dataset
        └── seeder.js                # CLI utility script to seed or destroy DB collections
```

---

## 🔒 Security & Performance Features

- **Helmet Security Headers**: Protection against XSS, clickjacking, MIME-sniffing, and HSTS.
- **CORS Allowlist**: Configurable origin controls with credentials support.
- **Gzip Compression**: Ultra-fast response delivery for mobile clients.
- **Express Rate Limiting**: General API limiter + stricter 20/hr limiter on form submissions to prevent bot spam.
- **Centralized Error Handling**: Safe error shielding that masks internal stack traces in production.
- **Graceful Shutdown**: Intercepts `SIGTERM` and `SIGINT` to safely drain existing connections.

---

## 🚀 Setup & Execution

### 1. Manual Dependency Installation
Navigate to the `backend` folder and run:
```bash
cd backend
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your MongoDB instance is running locally or specify your MongoDB Atlas connection string:
```env
MONGODB_URI=mongodb://127.0.0.1:27017/shash_studios
PORT=5000
JWT_SECRET=your_secure_jwt_secret_key_2026
```

### 3. Seed Database with Mysuru Curriculum
Populate all 6 workshops, the All-Access Combo Pass, and the default admin user:
```bash
npm run seed
```
> **Default Admin Account:**
> - Email: `admin@shashstudios.com`
> - Password: `ShashMysuru@2026`

### 4. Run Development Server
```bash
npm run dev
```
The API will run at `http://localhost:5000/api/v1`.

---

## 📡 Key API Endpoints

### 🩺 Health Check
- `GET /api/v1/health` — Verifies service status & server time.

### 🧘 Workshops
- `GET /api/v1/workshops` — Fetch all active workshops (supports query `?category=holistic|sleep|women|strength|vinyasa|kids`).
- `GET /api/v1/workshops/:idOrSlug` — Fetch single workshop by ID or slug (e.g., `/api/v1/workshops/21day`).
- `POST /api/v1/workshops` *(Protected, Admin)* — Create a new batch.
- `PUT /api/v1/workshops/:id` *(Protected, Admin)* — Update batch details.
- `DELETE /api/v1/workshops/:id` *(Protected, Superadmin)* — Delete a batch.

### 📝 Registrations / Enrollments
- `POST /api/v1/registrations` *(Rate-Limited)* — Register a student for a workshop.
  ```json
  {
    "fullName": "Ananya Rao",
    "whatsapp": "9876543210",
    "email": "ananya@example.com",
    "workshopId": "21day",
    "workshopTitle": "21-Day Holistic Challenge",
    "slot": "5:30 AM - 6:30 AM IST",
    "amount": 499,
    "languagePref": "both",
    "healthNotes": "beginner"
  }
  ```
- `GET /api/v1/registrations/:bookingId` — Retrieve receipt & enrollment status by booking ID (`SHASH-XXXXXX`).
- `GET /api/v1/registrations` *(Protected, Admin)* — List all enrolled students with search & pagination.
- `PATCH /api/v1/registrations/:bookingId/status` *(Protected, Admin)* — Update payment status (`completed`, `pending`, `refunded`).

### ✉️ Contact & Inquiries
- `POST /api/v1/inquiries` *(Rate-Limited)* — Student message from the contact form.
- `GET /api/v1/inquiries` *(Protected, Admin)* — Coordinator desk inbox.
- `PATCH /api/v1/inquiries/:id` *(Protected, Admin)* — Update inquiry status (`new`, `contacted`, `resolved`).

### 🔑 Authentication
- `POST /api/v1/auth/login` — Coordinator/Admin login, returns JWT token.
- `GET /api/v1/auth/me` *(Protected)* — Profile details of logged-in coordinator.
