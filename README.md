# ✅ Task Master

A full-stack task management web application built with **Node.js**, **Express**, **MongoDB**, and vanilla **HTML/CSS/JavaScript**.

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [License](#license)

---

## About

Task Master is a clean and simple task management app that allows users to create, organize, and track their tasks. It features a secure authentication system and a RESTful API backend.

---

## Features

- 🔐 User authentication (Register & Login) with JWT
- ✅ Create, read, update, and delete tasks
- 🔒 Password hashing with bcryptjs
- 🛡️ Security headers with Helmet
- 📦 Input validation with express-validator
- 📱 Responsive frontend built with HTML, CSS & JavaScript

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Server & REST API |
| MongoDB + Mongoose | Database |
| JSON Web Token (JWT) | Authentication |
| bcryptjs | Password hashing |
| Helmet | Security headers |
| CORS | Cross-origin requests |
| express-validator | Input validation |
| Morgan | HTTP request logging |
| dotenv | Environment variables |

### Frontend
| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Styling |
| JavaScript (Vanilla) | Interactivity |

---

## Project Structure

```
Task-Master/
├── backend/
│   └── app.js          # Main server entry point
├── frontend/           # Static frontend files (HTML, CSS, JS)
├── .gitignore
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mahmoud-atta1/Task-Master.git
   cd Task-Master
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory (see [Environment Variables](#environment-variables) below).

4. **Run the app**

   Development mode (with auto-reload):
   ```bash
   npm run dev
   ```

   Production mode:
   ```bash
   npm start
   ```

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

---

## API Endpoints

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and receive a JWT token |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all tasks for the logged-in user |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task by ID |
| DELETE | `/api/tasks/:id` | Delete a task by ID |

> All task endpoints require a valid JWT token in the `Authorization` header:
> ```
> Authorization: Bearer <your_token>
> ```

---

## Scripts

```bash
npm start        # Start the server
npm run dev      # Start with nodemon (auto-reload)
npm test         # Run tests with Jest
npm run lint     # Lint backend code with ESLint
```


---

> Made with ❤️ by [mahmoud-atta1](https://github.com/mahmoud-atta1)

