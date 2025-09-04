# Event Management System

A comprehensive web application for managing events, registrations, attendance tracking, and feedback collection.

## 📋 Features

- **User Management**: Register, authenticate, and manage user profiles
- **Event Management**: Create, update, view, and delete events
- **Registration System**: Allow users to register for events
- **Attendance Tracking**: Track attendance for events
- **Feedback Collection**: Collect and analyze feedback for events

## 🏗️ Project Structure

```
.
├── backend/
│   ├── controllers/        # Request handlers
│   ├── middleware/         # Express middleware
│   ├── models/             # Database models
│   │   ├── Attendance.js   # Attendance model
│   │   ├── db.js           # Database connection
│   │   ├── Event.js        # Event model
│   │   ├── Feedback.js     # Feedback model
│   │   ├── Registration.js # Registration model
│   │   └── User.js         # User model
│   ├── routes/             # Express routes
│   │   ├── attendanceRoutes.js
│   │   ├── eventRoutes.js
│   │   ├── feedbackRoutes.js
│   │   ├── registrationRoutes.js
│   │   └── userRoutes.js
│   ├── .env                # Environment variables
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
   ```
   DB_HOST=localhost
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

### API Endpoints (Planned)

#### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create a new user
- `PUT /users/:id` - Update a user
- `DELETE /users/:id` - Delete a user

#### Events
- `GET /events` - Get all events
- `GET /events/:id` - Get event by ID
- `POST /events` - Create a new event
- `PUT /events/:id` - Update an event
- `DELETE /events/:id` - Delete an event

#### Registrations
- `GET /registrations` - Get all registrations
- `POST /registrations` - Create a new registration
- `DELETE /registrations/:id` - Delete a registration

#### Attendance
- `GET /attendance` - Get attendance records
- `POST /attendance` - Create attendance record
- `PUT /attendance/:id` - Update attendance record

#### Feedback
- `GET /feedback` - Get all feedback
- `POST /feedback` - Submit new feedback
- `GET /feedback/event/:id` - Get feedback for an event

## 🛠️ Technologies Used

### Backend
- Node.js
- Express.js
- MySQL/MariaDB
- JSON Web Tokens (JWT)

### Frontend (Planned)
- React.js
- Redux
- Material UI or Bootstrap

## 📝 License

This project is licensed under the MIT License.

## 👥 Contributors

- [UmarAlMukhtar](https://github.com/UmarAlMukhtar)
