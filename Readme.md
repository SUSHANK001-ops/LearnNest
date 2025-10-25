# LearnNest 🎓

**Build, manage, and grow your digital classrooms — all in one nest.**

A comprehensive multi-tenant Learning Management System (LMS) built with the MERN stack.

---

## 🚀 Current Features 

### Multi-Tenant Institution Management
- ✅ Create, view, edit, and delete institutions
- ✅ Unique domain-based institution identification
- ✅ Institution admin assignment and management

### Role-Based Access Control
- ✅ **SuperAdmin**: Full system access, institution management
- ✅ **Institution Admin**: View and manage assigned institution
- ✅ Secure JWT-based authentication
- ✅ Protected routes and API endpoints

### Professional UI/UX
- ✅ Modern, responsive design with Tailwind CSS
- ✅ Intuitive dashboards for each role
- ✅ Real-time data updates
- ✅ Comprehensive error handling and loading states

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS 4** - Utility-first CSS framework

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Bcrypt** - Password hashing

---

## 📁 Project Structure

```
LearnNest/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── App.jsx      # Main app with routing
│   │   └── config.js    # Configuration
│   └── package.json
│
├── server/              # Express backend
│   ├── models/          # MongoDB schemas
│   ├── controllers/     # Request handlers
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── config/          # Database config
│   └── server.js        # Entry point
│
└── docs/                # Documentation
```

---

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v16+)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/SUSHANK001-ops/LearnNest.git
cd LearnNest
```

### 2. Setup Backend
```bash
cd server
npm install

# Create .env file
echo "PORT=4000
MONGODB_URI=mongodb://localhost:27017/learnnest
JWT_SECRET=your_super_secret_key
SUPERADMIN_EMAIL=admin@learnnest.com
SUPERADMIN_PASSWORD=Admin@123" > .env

# Start server
npm start
```

### 3. Setup Frontend
```bash
cd ../client
npm install
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Login: `admin@learnnest.com` / `Admin@123`

---

## 👥 User Roles

### SuperAdmin
- Create and manage all institutions
- Create institution administrators
- Assign admins to institutions
- Full system access

### Institution Admin
- View assigned institution details
- Manage students, teachers, courses (coming soon)
- Institution-specific analytics (coming soon)

---

## 📚 Documentation

- **[Day 3 Implementation](./DAY3_IMPLEMENTATION.md)** - Detailed feature documentation
- **[Quick Start Guide](./QUICK_START.md)** - Testing scenarios and examples
- **[Architecture](./ARCHITECTURE.md)** - System design and data flow
- **[Day 3 Summary](./DAY3_SUMMARY.md)** - Build summary and statistics
- **[Checklist](./DAY3_CHECKLIST.md)** - Complete task breakdown

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login

### Institutions (SuperAdmin)
- `POST /api/institutions` - Create institution
- `GET /api/institutions` - Get all institutions
- `GET /api/institutions/:id` - Get single institution
- `PUT /api/institutions/:id` - Update institution
- `DELETE /api/institutions/:id` - Delete institution

### Institutions (Admin)
- `GET /api/institutions/my` - Get assigned institution

---

## 🎯 Roadmap

### ✅ Completed
- [x] User authentication and authorization
- [x] Multi-tenant institution management
- [x] Role-based access control
- [x] SuperAdmin and Institution Admin dashboards

### 🚧 In Progress (Day 4)
- [ ] Student management system
- [ ] Bulk student import
- [ ] Student profiles

### 📋 Planned
- [ ] Course management
- [ ] Teacher/Instructor management
- [ ] Enrollment system
- [ ] Grade management
- [ ] Analytics dashboard
- [ ] Notifications system
- [ ] File upload and management
- [ ] Email integration
- [ ] Report generation

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**SUSHANK001-ops**
- GitHub: [@SUSHANK001-ops](https://github.com/SUSHANK001-ops)

---

## 🙏 Acknowledgments

- React Team for the amazing library
- MongoDB for the flexible database
- Tailwind CSS for the utility-first framework
- All contributors and supporters

---

## 📞 Support

For support, email mail@sushanka.com.np or open an issue in the repository.

---

**Built by sushanka lamichane with ❤️ using the MERN Stack**
