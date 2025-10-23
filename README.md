# Event Management System

A comprehensive web application for managing events, registrations, attendance tracking, and feedback collection. Built with React + Node.js + Express + MariaDB.

## ✅ Current Status: FULLY FUNCTIONAL

- **Backend API**: Running on port 3000 ✅
- **Frontend**: React with Vite on port 5173 ✅
- **Database**: MariaDB on port 3307 ✅
- **Authentication**: JWT with role-based access control ✅

## 📋 Features

- **User Authentication**: Login with email or username
- **User Management**: Register, authenticate, and manage user profiles
- **Event Management**: Create, update, view, and delete events
- **Registration System**: Allow users to register for events
- **Attendance Tracking**: Track attendance for events
- **Feedback Collection**: Collect and analyze feedback for events
- **Role-Based Access Control**: Admin, Coordinator, and Participant roles
- **Security**: JWT-based authentication with bcrypt password hashing

## 🏗️ Project Structure

```
EventManagement/
├── backend/
│   ├── controllers/           # Request handlers for each feature
│   │   ├── authController.js
│   │   ├── eventController.js
│   │   ├── userController.js
│   │   ├── registrationController.js
│   │   ├── attendanceController.js
│   │   └── feedbackController.js
│   ├── middleware/            # Express middleware
│   │   ├── authMiddleware.js      # JWT verification
│   │   └── roleMiddleware.js      # Role-based access control
│   ├── models/                # Database query abstractions
│   │   ├── db.js                  # MariaDB connection pool
│   │   ├── User.js
│   │   ├── Event.js
│   │   ├── Registration.js
│   │   ├── Attendance.js
│   │   └── Feedback.js
│   ├── routes/                # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── userRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── feedbackRoutes.js
│   ├── db.sql                 # Database schema
│   ├── server.js              # Express server setup
│   ├── .env                   # Environment configuration
│   └── package.json           # Dependencies
│
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── EventList.jsx
│   │   │   ├── CreateEvent.jsx
│   │   │   ├── EventModal.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── Home.jsx
│   │   ├── context/           # React context for state management
│   │   │   └── AuthContext.jsx    # Authentication state
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css          # Tailwind CSS
│   ├── .env                   # Frontend configuration
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Dependencies
│
├── README.md                  # This file
└── .gitignore
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MariaDB (running on port 3307)
- npm or yarn

### Quick Start

#### 1. Clone the repository:
```bash
git clone https://github.com/UmarAlMukhtar/EventManagement.git
cd EventManagement
```

#### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=kulsumar
DB_NAME=event_management
PORT=3000
JWT_SECRET=SvQyz
```

Start the backend:
```bash
npm run dev
```

#### 3. Frontend Setup

```bash
cd frontend
npm install
```

The `.env` file is already configured:
```
VITE_API_URL=http://localhost:3000
```

Start the frontend:
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

#### 4. Database Setup

The database schema is in `backend/db.sql`. Import it to MariaDB:
```bash
mysql -u root -pkulsumar -P 3307 < backend/db.sql
```

### Test Credentials

**Super Admin User:**
- Username: `admin`
- Email: `admin@eventmanagement.com`
- Password: `lbscek`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/login` – Login with email or username
- `POST /api/auth/signup` – Register a new user

### Events

- `GET /api/events` – Get all events ✅
- `GET /api/events/:id` – Get event by ID
- `POST /api/events` – Create event (Requires coordinator/admin role)
- `PUT /api/events/:id` – Update event (Admin/coordinator only)
- `DELETE /api/events/:id` – Delete event (Admin/coordinator only)
- `GET /api/events/coordinator/:coordinatorId` – Get events by coordinator

### Users

- `GET /api/users` – Get all users
- `GET /api/users/:id` – Get user by ID
- `POST /api/users` – Create a new user
- `PUT /api/users/:id` – Update a user
- `DELETE /api/users/:id` – Delete a user

### Registrations

- `POST /api/registrations` – Register for event
- `GET /api/registrations/my-registrations` – Get user's registrations
- `GET /api/registrations/user/:userId` – Get user registrations (Admin only)
- `GET /api/registrations/event/:eventId` – Get event registrations (Admin only)
- `PUT /api/registrations/:regId` – Update registration status
- `DELETE /api/registrations/:regId` – Cancel registration

### Attendance

- `POST /api/attendance` – Mark attendance
- `GET /api/attendance/user/:userId` – Get user attendance

### Feedback

- `POST /api/feedback` – Submit feedback
- `GET /api/feedback/event/:eventId` – Get event feedback

## 🛠️ Technologies Used

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MariaDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Database Driver**: mysql2/promise

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **JWT Decoding**: jwt-decode

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- [UmarAlMukhtar](https://github.com/UmarAlMukhtar)

## 🤝 Support

For issues and questions, please check:

1. **Backend Connection Issues**
   - Ensure MariaDB is running on port 3307
   - Verify `.env` file has correct database credentials
   - Check backend logs for detailed error messages

2. **Frontend Issues**
   - Ensure backend API is running on port 3000
   - Clear browser cache and reload
   - Check browser console for error messages

3. **Authentication Issues**
   - Use either email or username to login
   - Default admin credentials: `admin` / `lbscek`
   - Ensure JWT_SECRET in `.env` matches frontend configuration

## 📦 Database Schema

The `backend/db.sql` file contains the complete database schema with the following tables:

- **users** - User accounts with roles (admin, coordinator, participant)
- **events** - Event information with coordinator reference
- **registrations** - User event registrations with status tracking
- **attendance** - Event attendance records
- **feedback** - Event feedback and ratings

Each table has proper relationships through foreign keys and timestamps for tracking creation and updates.
