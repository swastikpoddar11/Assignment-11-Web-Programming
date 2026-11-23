# Secure User Validation Web Application
> **Course / Lab:** Agile Software Engineering (Lab 11)  
> **Topic:** User Validation, Server-side Authentication, and Database Credential Verification

---

## 📌 Executive Summary

This application implements a production-grade, secure **User Validation Web Application**. The user submits login credentials (`username` and `password`) to the server via an authenticated POST request. The server securely queries an embedded **SQLite Database** using parameterized prepared statements, verifies the password against a **salted Bcrypt cryptographic hash**, and:
1. **On Success**: Issues a secure session and returns a **Successful Login Page** displaying the authenticated profile, assigned roles, and session metadata.
2. **On Failure**: Returns a formatted **Failure Alert** explaining that credential validation failed, while preventing user enumeration and timing attack vectors.

---

## 🏗️ System Architecture & Technology Stack

| Layer | Technology | Key Responsibility |
|---|---|---|
| **Runtime** | Node.js (v20+) | Asynchronous runtime environment |
| **Server Framework** | Express.js | Route handling, static file delivery, HTTP pipeline |
| **Database** | SQLite3 | Embedded ACID-compliant relational storage |
| **Cryptography** | `bcryptjs` | Salt generation (10 rounds) & constant-time hash comparison |
| **Session Store** | `express-session` | Cryptographically signed HttpOnly session cookies |
| **UI Presentation** | Semantic HTML5 / CSS3 | Modern dark glassmorphic responsive interface |
| **Testing** | Node.js Test Runner (`node:test`) | Automated unit, integration, and security assertion tests |

---

## 🔒 Security Best Practices Implemented

- **SQL Injection Prevention:** All SQL queries strictly use parameterized placeholders (`?`). Direct string concatenation is completely avoided.
- **Salted Password Hashing:** Passwords are never stored in plaintext. They are hashed using `bcrypt` with automatic salt generation across 10 rounds.
- **Protection Against Account Enumeration:** Both non-existent usernames and incorrect passwords return the exact same generic error message: `"Invalid username or password. Please verify your credentials and try again."`
- **Timing Attack Mitigation:** If a user does not exist in the database, the server computes a dummy bcrypt verification to equalize processing response times.
- **HttpOnly Cookies:** Session identifiers are stored in cookies protected with the `HttpOnly` flag to prevent client-side JavaScript theft (XSS mitigation).

---

## 🚀 Quick Start Guide

### 1. Installation
All dependencies are already installed in `package.json`. If setting up on a fresh machine:
```bash
npm install
```

### 2. Run Automated Verification Tests
Run the test suite covering credential validation, invalid passwords, injection attempts, and user registration:
```bash
npm test
```

### 3. Start the Web Application
```bash
npm start
```
Open your web browser and navigate to:
**[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Pre-Seeded Database Test Credentials

The database initializes automatically (`database.sqlite`) and seeds two test accounts:

| Username | Password | Role | Expected Result |
|---|---|---|---|
| `swastik_admin` | `Password@123` | Administrator | ✅ **Successful Login Page** |
| `john_doe` | `SecurePass#2026` | Senior Software Engineer | ✅ **Successful Login Page** |
| `any_user` | `WrongPass!` | *N/A* | ❌ **Failure Message Displayed** |

*(Interactive quick-fill pills are also built directly into the login screen for 1-click testing!)*

---

## 📂 Project Directory Structure

```
Swastik-Lab-11/
├── server.js               # Application entry point and server bootstrap
├── package.json            # Project manifest, scripts, and dependencies
├── database.sqlite         # SQLite database file (auto-generated)
├── src/
│   ├── config/             # Environment and security configuration
│   ├── db/                 # SQLite connection, schema definition & seeding
│   ├── services/           # Authentication logic & bcrypt verification
│   ├── controllers/        # Request handling, session state & rendering
│   └── routes/             # Express HTTP routes definition
├── views/
│   ├── login.html          # Login form with dynamic error alert container
│   ├── success.html        # Successful login dashboard & profile view
│   └── register.html       # Optional new account registration form
├── public/
│   ├── css/style.css       # Polished modern glassmorphism dark theme
│   └── js/main.js          # Interactive UX (password reveal & quick-fill)
└── tests/
    └── auth.test.js        # Automated security and validation test suite
```
