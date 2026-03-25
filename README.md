<div align="center">

# ✅ Task Master

**A full-stack task management application — organize your work, track your progress.**

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [API Reference](#-api-reference) • [Project Structure](#-project-structure)

</div>

---

## 📖 About

**Task Master** is a full-stack task management application that allows users to create, organize, and track their daily tasks. It features a secure JWT-based authentication system and a clean RESTful API backend.

---

## ✨ Features

- 🔐 **Authentication** — Secure Register & Login with JWT
- ✅ **Task Management** — Full CRUD (Create, Read, Update, Delete)
- 🔒 **Password Security** — Hashing with bcryptjs
- 🛡️ **HTTP Security** — Headers protected via Helmet
- 📦 **Input Validation** — Server-side validation with express-validator
- 📱 **Responsive Frontend** — Built with HTML, CSS & Vanilla JavaScript

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js |
| **Framework** | Express.js |
| **Database** | MongoDB + Mongoose |
| **Authentication** | JSON Web Token (JWT) |
| **Validation** | express-validator |
| **Security** | Helmet, CORS |
| **Logging** | Morgan |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Dev Tools** | Nodemon, ESLint, Jest |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v16+
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas)

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

3. **Configure environment variables**

   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb://127.0.0.1:27017/task_master
   JWT_SECRET=replace-with-a-strong-secret
   JWT_EXPIRES_IN=7d
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open in your browser**
   ```
   http://localhost:5000
   ```

---

## 📜 Available Scripts

```bash
npm run dev     # Start development server with auto-reload (nodemon)
npm start       # Start production server
npm run lint    # Lint backend code with ESLint
npm test        # Run Jest test suite
```

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Protected routes require a Bearer token in the `Authorization` header.

```
Authorization: Bearer <your_token>
```

### 🔑 Authentication

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/auth/register` | Public | Register a new user |
| `POST` | `/auth/login` | Public | Login and receive JWT |

### ✅ Tasks

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/tasks` | User | Get all tasks for current user |
| `POST` | `/tasks` | User | Create a new task |
| `PUT` | `/tasks/:id` | User | Update a task by ID |
| `DELETE` | `/tasks/:id` | User | Delete a task by ID |

### 🔄 Task Flow

```
Create Task
     │
     ▼
 [pending] ──── Update ────► [in_progress]
                                   │
                                   ▼
                             [completed]
```

---

## 📁 Project Structure

```
Task-Master/
├── backend/
│   ├── controllers/       # Route handler logic
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express route definitions
│   ├── middleware/        # Auth & error handling
│   └── app.js             # Server entry point
├── frontend/
│   ├── *.html             # App pages
│   ├── css/               # Stylesheets
│   └── js/                # Client-side scripts
├── .gitignore
├── package.json
└── README.md
```

---

## 🔒 Security

- Passwords are hashed using **bcryptjs**
- Routes are protected via **JWT middleware**
- HTTP headers secured with **Helmet**
- Input sanitized and validated with **express-validator**
- Cross-origin requests handled safely with **CORS**

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Made with ❤️ by [mahmoud-atta1](https://github.com/mahmoud-atta1)

</div>
