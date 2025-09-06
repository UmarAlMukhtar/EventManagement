# Event Management System

A comprehensive web application for managing events, registrations, attendance tracking, and feedback collection.

## 📋 Features

- **User Management**: Register, authenticate, and manage user profiles
- **Event Management**: Create, update, view, and delete events
- **Registration System**: Allow users to register for events
- **Attendance Tracking**: Track attendance for events
- **Feedback Collection**: Collect and analyze feedback for events
- **Authentication & Authorization**: Secure JWT-based login, route protection, and role-based access control

## 🏗️ Project Structure

```.
├── backend/
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware (auth, roles)
│   ├── models/             # Database models
│   │   ├── Attendance.js
│   │   ├── db.js
│   │   ├── Event.js
│   │   ├── Feedback.js
│   │   ├── Registration.js
│   │   └── User.js
│   ├── routes/             # Express routes
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── userRoutes.js
│   ├── .env                # Environment variables
│   ├── hashPassword.js     # Script to generate bcrypt hashes
│   ├── package.json        # Dependencies
│   └── server.js           # Express server setup
└── frontend/               # Frontend code (coming soon)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MySQL or MariaDB
- npm or yarn

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/UmarAlMukhtar/EventManagement.git
   cd EventManagement
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the backend directory with the following variables:

   ```DB_HOST=localhost
   DB_USER=yourusername
   DB_PASS=yourpassword
   DB_NAME=eventmanagement
   PORT=3000
   JWT_SECRET=yoursecretkey
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Auth (Planned)

- `POST /api/auth/login` – Login with email and password
- `POST /api/auth/signup` – Register a new user

### Users

- `GET /api/users` – Get all users
- `GET /api/users/:id` – Get user by ID
- `POST /api/users` – Create a new user
- `PUT /api/users/:id` – Update a user
- `DELETE /api/users/:id` – Delete a user

### Events

- `GET /api/events` – Get all events
- `GET /api/events/:id` – Get event by ID
- `POST /api/events` – Create a new event
- `PUT /api/events/:id` – Update an event
- `DELETE /api/events/:id` – Delete an event

### Registrations

- `GET /api/registrations` – Get all registrations
- `POST /api/registrations` – Create a new registration
- `DELETE /api/registrations/:id` – Delete a registration

### Attendance

- `GET /api/attendance` – Get attendance records
- `POST /api/attendance` – Create attendance record
- `PUT /api/attendance/:id` – Update attendance record

### Feedback

- `GET /api/feedback` – Get all feedback
- `POST /api/feedback` – Submit new feedback
- `GET /api/feedback/event/:id` – Get feedback for an event

## 🛠️ Technologies Used

### Backend

- Node.js
- Express.js
- MySQL/MariaDB
- JSON Web Tokens (JWT)
- bcrypt

### Frontend (Planned)

- React.js
- Redux
- Material UI or Bootstrap

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- [UmarAlMukhtar](https://github.com/UmarAlMukhtar)
