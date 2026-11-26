# webdev3--Lab-4 
A Node.js + Express + MongoDB + Socket.IO backend featuring JWT authentication, role-based access control (RBAC), user-owned Notes CRUD API, Node.js EventEmitter domain logging, and authenticated real-time chat.

Tech Stack
Runtime: Node.js
Framework: Express
Database: MongoDB (official mongodb driver)
Auth: bcrypt + jsonwebtoken
Real-Time: socket.io
Events: Node built-in events (EventEmitter)
Config: dotenv
Project Structure
├── config/
│   ├── db.js            # MongoDB connection & unique email index
│   └── seedAdmin.js     # Seeds admin user from .env
├── controllers/
│   ├── authController.js
│   └── noteController.js
├── events/
│   ├── emitter.js       # Shared EventEmitter instance
│   └── listeners.js     # Console listeners for user & note events
├── middleware/
│   └── authMiddleware.js # authenticate (JWT) & authorize (RBAC)
├── models/
│   ├── userModel.js
│   └── noteModel.js
├── public/
│   └── index.html       # Plain HTML + Socket.IO chat demo
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   └── noteRoutes.js
├── sockets/
│   └── chatSocket.js    # JWT-authenticated Socket.IO chat
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── test.http
Install dependencies

npm install
Configure environment variables Copy .env.example to .env and update values as needed:

cp .env.example .env
Ensure MongoDB is running and MONGO_URI points to your instance.

Start the server

npm start
The server starts on http://localhost:5000 (or PORT from .env). Open http://localhost:5000 in two browser tabs to test the real-time chat demo.

API Endpoints
POST /api/auth/signup — Register a new user (username or name, email, password) → 201 { message: "User registered", id, username, email }
POST /api/auth/login — Login and receive a signed JWT → 200 { message: "Login successful", token, user }
GET /api/profile — Get current user profile (Bearer token or token cookie)
GET /api/admin/users — List all users without password hashes (admin only)
POST /api/notes — Create a note (owner set from JWT, returns created note)
GET /api/notes — List own notes (returns plain array)
GET /api/notes/:id — Get own note by ID
PUT /api/notes/:id — Update own note
DELETE /api/notes/:id — Delete own note
Screenshots
Signup (POST /api/auth/signup → 201) 


Screenshots
Signup (POST /api/auth/signup → 201)
![Uploading Postman Signup Request with Terminal Logs.png…]()

