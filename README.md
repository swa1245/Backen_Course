# Course Management System

A robust backend API for managing online courses, users, and administrators.

## Features

- User authentication and authorization
- Course management (CRUD operations)
- Admin dashboard
- Course purchase system
- Secure password handling
- Input validation
- MongoDB integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Copy `.example.env` to `.env` and update the environment variables:
```bash
cp .example.env .env
```

## Environment Variables

- `MONGO_URL`: MongoDB connection string
- `PORT`: Server port (default: 3000)
- `JWT_SECRET`: Secret key for JWT token generation

## API Endpoints

### User Routes
- POST `/api/v1/user/signup`: Register new user
- POST `/api/v1/user/login`: User login
- GET `/api/v1/user/courses`: Get purchased courses

### Admin Routes
- POST `/api/v1/admin/signup`: Register new admin
- POST `/api/v1/admin/login`: Admin login
- POST `/api/v1/admin/courses`: Create new course

### Course Routes
- GET `/api/v1/course/all`: Get all courses
- POST `/api/v1/course/purchase`: Purchase a course

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Input validation and sanitization
- MongoDB injection prevention

## Running the Application

```bash
npm start
```

The server will start on the configured port (default: 3000).