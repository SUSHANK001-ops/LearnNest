# LearnNest - System Architecture 

## 🏗️ Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│                     http://localhost:5173                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌───────────────┐  ┌───────────────┐  ┌──────────────────┐   │
│  │  Public Routes│  │Protected Routes│ │  Components      │   │
│  ├───────────────┤  ├───────────────┤  ├──────────────────┤   │
│  │ /login        │  │ /superadmin/  │  │ InstitutionTable │   │
│  │ /register     │  │   dashboard   │  │ AddInstModal     │   │
│  └───────────────┘  │ /superadmin/  │  │ MyInstCard       │   │
│                     │   create-admin│  │ Login/Register   │   │
│                     │ /admin/       │  └──────────────────┘   │
│                     │   dashboard   │                          │
│                     └───────────────┘                          │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP Requests (JWT Token)
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      BACKEND (Express)                           │
│                    http://localhost:4000                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware Layer                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ • CORS                                                    │  │
│  │ • express.json()                                          │  │
│  │ • verifyToken (auth.js)                                   │  │
│  │ • requireAuth (auth.js)                                   │  │
│  │ • checkRole(['superadmin']) (roleMiddleware.js)          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Routes Layer                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ /api/auth/*         → authRoutes (existing)              │  │
│  │ /api/institutions/* → institutionRoutes (new)            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Controllers Layer                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ authController.js        (existing)                      │  │
│  │ institutionController.js (new)                           │  │
│  │   • createInstitution                                    │  │
│  │   • getAllInstitutions                                   │  │
│  │   • getInstitutionById                                   │  │
│  │   • updateInstitution                                    │  │
│  │   • deleteInstitution                                    │  │
│  │   • getMyInstitution                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Models Layer                          │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │ User.js         (existing, with institutionId field)     │  │
│  │ Institution.js  (new)                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
└────────────────────────┬────────────────────────────────────────┘
                         │ MongoDB Queries
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      DATABASE (MongoDB)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌─────────────────────────┐      │
│  │   users          │         │   institutions          │      │
│  ├──────────────────┤         ├─────────────────────────┤      │
│  │ _id              │◄────────┤ createdBy (ref: User)   │      │
│  │ fullname         │         │ _id                     │      │
│  │ email            │         │ name                    │      │
│  │ password         │         │ email                   │      │
│  │ role             │    ┌───►│ address                 │      │
│  │ institutionId ───┼────┘    │ domain (unique)         │      │
│  │ createdAt        │         │ createdAt               │      │
│  │ updatedAt        │         │ updatedAt               │      │
│  └──────────────────┘         └─────────────────────────┘      │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagrams

### 1. SuperAdmin Creates Institution

```
SuperAdmin Dashboard
        │
        │ Click "Add Institution"
        ▼
AddInstitutionModal
        │
        │ Fill form & submit
        ▼
POST /api/institutions
        │
        │ JWT Token in headers
        ▼
Middleware Chain:
  1. verifyToken    → Decode JWT, fetch User
  2. requireAuth    → Ensure user exists
  3. checkRole      → Verify role = 'superadmin'
        │
        ▼
institutionController.createInstitution()
        │
        │ Validate data
        │ Check domain uniqueness
        ▼
Institution.create()
        │
        │ Save to MongoDB
        ▼
Response (201 Created)
        │
        ▼
Frontend updates table
```

---

### 2. Institution Admin Views Their Institution

```
Admin Dashboard (mounted)
        │
        │ useEffect → fetchMyInstitution()
        ▼
GET /api/institutions/my
        │
        │ JWT Token in headers
        ▼
Middleware Chain:
  1. verifyToken    → Decode JWT, fetch User (with institutionId)
  2. requireAuth    → Ensure user exists
        │
        ▼
institutionController.getMyInstitution()
        │
        │ Get req.user.institutionId
        ▼
Institution.findById(institutionId)
        │
        │ Populate createdBy
        ▼
Response (200 OK)
        │
        ▼
MyInstitutionCard displays data
```

---

### 3. User Login & Role-Based Redirect

```
Login Page
        │
        │ Submit credentials
        ▼
POST /api/auth/login
        │
        │ Validate email & password
        ▼
Generate JWT Token
(payload: { id, role })
        │
        ▼
Response: { token, user }
        │
        │ Store in localStorage
        ▼
Frontend decodes token.role
        │
        ├─── role = 'superadmin' ────► Navigate to /superadmin/dashboard
        │
        └─── role = 'institution_admin' ───► Navigate to /admin/dashboard
```

---

## 🔐 Authentication & Authorization Flow

```
┌───────────────────────────────────────────────────────────────┐
│                    Request Flow                                │
└───────────────────────────────────────────────────────────────┘

Client (Browser)
      │
      │ 1. Include JWT in Authorization header
      │    Authorization: Bearer <token>
      ▼
verifyToken Middleware
      │
      │ 2. Extract token from header
      │ 3. Verify with JWT_SECRET
      │ 4. Decode payload { id, role }
      │ 5. Fetch User from DB by id
      │ 6. Attach user to req.user
      ▼
requireAuth Middleware
      │
      │ 7. Check if req.user exists
      │ 8. If not, return 401 Unauthorized
      ▼
checkRole Middleware (if needed)
      │
      │ 9. Check if req.user.role in allowedRoles
      │ 10. If not, return 403 Forbidden
      ▼
Controller Function
      │
      │ 11. Access req.user safely
      │ 12. Perform business logic
      │ 13. Return response
      ▼
Client receives response
```

---

## 📊 Database Relationships

```
┌──────────────────────────────────────────────────────────────┐
│                   User ↔ Institution                          │
└──────────────────────────────────────────────────────────────┘

User Model
┌─────────────────────────┐
│ _id: ObjectId           │
│ email: String           │
│ role: String            │
│   - superadmin          │
│   - institution_admin   │
│ institutionId: ObjectId │─────┐
└─────────────────────────┘     │
                                 │
                                 │ References
                                 │
                                 ▼
                    Institution Model
                    ┌─────────────────────────┐
                    │ _id: ObjectId           │
                    │ name: String            │
                    │ domain: String (unique) │
                    │ createdBy: ObjectId ────┼──┐
                    └─────────────────────────┘  │
                                                 │
                                                 │ References
                                                 │
                                                 ▼
                                            User (SuperAdmin)

Relationships:
• One Institution can have MANY Institution Admins (1:N)
• One Institution is created by ONE SuperAdmin (N:1)
• One Institution Admin belongs to ONE Institution (N:1)
```

---

## 🎭 Role-Based Access Matrix

```
┌────────────────────┬─────────────┬──────────────────┐
│      Action        │ SuperAdmin  │ Institution Admin│
├────────────────────┼─────────────┼──────────────────┤
│ Create Institution │      ✅     │        ❌        │
│ View All Insts     │      ✅     │        ❌        │
│ View My Inst       │      ✅     │        ✅        │
│ Edit Institution   │      ✅     │        ❌        │
│ Delete Institution │      ✅     │        ❌        │
│ Create Admin       │      ✅     │        ❌        │
│ Assign Admin       │      ✅     │        ❌        │
└────────────────────┴─────────────┴──────────────────┘
```

---

## 🗂️ Project Folder Structure

```
LearnNest/
│
├── client/                         # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AddInstitutionModal.jsx       ✨ NEW
│   │   │   ├── InstitutionTable.jsx          ✨ NEW
│   │   │   ├── MyInstitutionCard.jsx         ✨ NEW
│   │   │   ├── CreateInstitutionAdmin.jsx    ✏️ UPDATED
│   │   │   ├── Login.jsx                     ✏️ UPDATED
│   │   │   └── Register.jsx                  ✏️ UPDATED
│   │   │
│   │   ├── pages/
│   │   │   ├── SuperAdminDashboard.jsx       ✨ NEW
│   │   │   └── AdminDashboard.jsx            ✨ NEW
│   │   │
│   │   ├── App.jsx                           ✏️ UPDATED
│   │   ├── config.js                         ✏️ UPDATED
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── vite.config.js
│
├── server/                         # Backend (Node + Express)
│   ├── Admins/
│   │   ├── controller/
│   │   │   └── authController.js
│   │   ├── models/
│   │   │   └── user.js                       (has institutionId)
│   │   └── Routes/
│   │       └── auth.js
│   │
│   ├── controllers/
│   │   └── institutionController.js          ✨ NEW
│   │
│   ├── middleware/
│   │   ├── auth.js                           ✏️ UPDATED
│   │   └── roleMiddleware.js                 ✨ NEW
│   │
│   ├── models/
│   │   └── Institution.js                    ✨ NEW
│   │
│   ├── routes/
│   │   └── institutionRoutes.js              ✨ NEW
│   │
│   ├── config/
│   │   └── db.js
│   │
│   ├── server.js                             ✏️ UPDATED
│   └── package.json
│
├── docs/
│
├── DAY3_IMPLEMENTATION.md                     ✨ NEW
├── QUICK_START.md                             ✨ NEW
├── DAY3_SUMMARY.md                            ✨ NEW
├── ARCHITECTURE.md                            ✨ NEW (this file)
└── README.md
```

---

## 🌐 API Endpoints Map

```
BASE_URL: http://localhost:4000

/api
 │
 ├── /auth                          (Existing)
 │    ├── POST   /signup           → Register new user
 │    └── POST   /login            → User login
 │
 └── /institutions                  (NEW - Day 3)
      │
      ├── POST   /                  → Create institution (SuperAdmin)
      │    Auth: Bearer Token
      │    Role: superadmin
      │    Body: { name, email, address, domain }
      │
      ├── GET    /                  → Get all institutions (SuperAdmin)
      │    Auth: Bearer Token
      │    Role: superadmin
      │
      ├── GET    /my                → Get my institution (Institution Admin)
      │    Auth: Bearer Token
      │    Role: institution_admin
      │
      ├── GET    /:id               → Get single institution (SuperAdmin)
      │    Auth: Bearer Token
      │    Role: superadmin
      │
      ├── PUT    /:id               → Update institution (SuperAdmin)
      │    Auth: Bearer Token
      │    Role: superadmin
      │    Body: { name, email, address, domain }
      │
      └── DELETE /:id               → Delete institution (SuperAdmin)
           Auth: Bearer Token
           Role: superadmin
```

---

## 🔄 Component Hierarchy

```
App (Router)
 │
 ├── Public Routes
 │    ├── Login
 │    └── Register
 │
 └── Protected Routes
      │
      ├── SuperAdmin Routes
      │    ├── SuperAdminDashboard
      │    │    ├── InstitutionTable
      │    │    └── AddInstitutionModal
      │    │
      │    └── CreateInstitutionAdmin
      │
      └── Institution Admin Routes
           └── AdminDashboard
                └── MyInstitutionCard
```

---

## 🎯 State Management

```
┌─────────────────────────────────────────────────┐
│              Component State                     │
├─────────────────────────────────────────────────┤
│                                                  │
│  SuperAdminDashboard:                           │
│    • institutions (array)                       │
│    • loading (boolean)                          │
│    • error (string)                             │
│    • isModalOpen (boolean)                      │
│                                                  │
│  AdminDashboard:                                │
│    • institution (object)                       │
│    • loading (boolean)                          │
│    • error (string)                             │
│                                                  │
│  AddInstitutionModal:                           │
│    • formData (object)                          │
│    • loading (boolean)                          │
│    • error (string)                             │
│                                                  │
│  Login/Register:                                │
│    • form fields (strings)                      │
│    • loading (boolean)                          │
│    • error (string)                             │
│                                                  │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│           Persistent Storage                     │
├─────────────────────────────────────────────────┤
│                                                  │
│  localStorage:                                   │
│    • token (JWT string)                         │
│    • user (JSON string)                         │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 🛡️ Security Measures

```
┌─────────────────────────────────────────────────┐
│              Security Features                   │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. JWT Authentication                          │
│     • Tokens signed with secret                 │
│     • Tokens verified on every request          │
│     • Payload includes user ID and role         │
│                                                  │
│  2. Password Security                           │
│     • Bcrypt hashing with salt rounds           │
│     • Passwords never stored in plain text      │
│     • Minimum length validation                 │
│                                                  │
│  3. Input Validation                            │
│     • Email format validation                   │
│     • Domain pattern validation                 │
│     • Required field checking                   │
│     • SQL injection prevention (Mongoose)       │
│                                                  │
│  4. Access Control                              │
│     • Role-based middleware                     │
│     • Route-level protection                    │
│     • Frontend route guards                     │
│                                                  │
│  5. CORS Configuration                          │
│     • Origin validation                         │
│     • Credentials support                       │
│                                                  │
│  6. Data Isolation                              │
│     • Institution Admins see only their data    │
│     • Domain uniqueness enforced               │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📈 Scalability Considerations

### Current Implementation
- Single database (MongoDB)
- Monolithic backend
- Client-side routing
- Local state management

### Future Enhancements
- Database sharding by institution
- Microservices architecture
- Redis caching layer
- Global state management (Redux/Zustand)
- CDN for static assets
- Load balancing
- Horizontal scaling

---

**Architecture Version**: 1.0  
**Last Updated**: October 25, 2025  
