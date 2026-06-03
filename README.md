# Student Portal

A full-stack student management web application built with Node.js, MySQL, and JWT-based authentication.

---

## Features

- **JWT Authentication** — secure login with token-based session management
- **Student Records** — create, read, update, and delete student data
- **REST API** — clean API routes served from a Node.js/Express backend
- **Unit Tests** — test suite using Jest and Supertest
- **HTML/CSS Frontend** — lightweight browser UI served from the `public` folder

---

## Tech Stack

| Layer      | Technology               |
|------------|--------------------------|
| Backend    | Node.js, Express         |
| Database   | MySQL                    |
| Auth       | JSON Web Tokens (JWT)    |
| Testing    | Jest, Supertest          |
| Frontend   | HTML, CSS, JavaScript    |

---

## Project Structure

```
Student_Portal/
├── __tests__/       # Jest + Supertest test files
├── public/          # Static frontend (HTML/CSS/JS)
├── server.js        # Express app — routes, auth, DB connection
├── package.json
└── package-lock.json
```

---

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL running locally

### Setup

```bash
# Clone the repo
git clone https://github.com/Arfangalib/Student_Portal.git
cd Student_Portal

# Install dependencies
npm install

# Set up your MySQL database and update connection config in server.js

# Start the server
node server.js
```

### Run Tests

```bash
npm test
```

---

## Author

**Arfan Ali Galib** — CSIS Co-op Student @ Douglas College  
[LinkedIn](https://www.linkedin.com/in/arfan-ali-galib-82153a261/) · [GitHub](https://github.com/Arfangalib)
