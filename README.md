# 📚 Study Planner — Full-Stack Web Application

A complete full-stack Study Planner built with **Node.js**, **Express.js**, **Supabase** (PostgreSQL), and **EJS** templates. Features JWT authentication, full task CRUD, priority management, deadline tracking, and a beautiful responsive dashboard.

---

## 🗂️ Project Structure

```
study-planner/
├── config/
│   └── supabase.js          # Supabase client setup
├── controllers/
│   ├── authController.js    # Sign up, sign in, logout logic
│   └── taskController.js    # Task CRUD logic
├── middleware/
│   ├── auth.js              # JWT authentication middleware
│   └── errorHandler.js      # Global error handling
├── public/
│   ├── css/
│   │   └── style.css        # All styles
│   └── js/
│       └── dashboard.js     # Frontend JavaScript
├── routes/
│   ├── auth.js              # /auth/* routes
│   └── tasks.js             # /tasks/* + /dashboard routes
├── views/
│   ├── index.ejs            # Home page
│   ├── signup.ejs           # Sign up page
│   ├── signin.ejs           # Sign in page
│   ├── dashboard.ejs        # Main planner dashboard
│   └── error.ejs            # Error page
├── .env.example             # Environment variable template
├── .gitignore
├── package.json
├── postman-collection.json  # Postman API tests
├── server.js                # App entry point
└── supabase-setup.sql       # Database schema
```

---

## 🚀 Quick Start

### Step 1: Clone and Install

```bash
# Navigate to project folder
cd study-planner

# Install all dependencies
npm install
```

### Step 2: Set Up Supabase

#### 2a. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and click **"Start your project"**
2. Sign in with GitHub or create an account
3. Click **"New Project"**
4. Fill in:
   - **Project name**: `study-planner`
   - **Database password**: (create a strong password, save it!)
   - **Region**: Choose the closest to you
5. Click **"Create new project"** and wait ~2 minutes

#### 2b. Get Your API Keys

1. In your Supabase project, go to **Settings** (gear icon, bottom left)
2. Click **"API"** in the left menu
3. You'll find:
   - **Project URL** → this is your `SUPABASE_URL`
   - **anon / public** key → this is your `SUPABASE_ANON_KEY`
   - **service_role** key → this is your `SUPABASE_SERVICE_KEY`
   
   ⚠️ **Keep your service_role key secret!** Never expose it in frontend code.

#### 2c. Create the Database Tables

1. In Supabase, click **"SQL Editor"** in the left menu
2. Click **"New query"**
3. Copy and paste the contents of `supabase-setup.sql`
4. Click **"Run"** (or press Ctrl/Cmd + Enter)
5. You should see: `users` and `tasks` tables confirmed

### Step 3: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-very-long-random-secret-string-here
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
```

**Generate a secure JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Run the Server

```bash
# Production mode
npm start

# Development mode (auto-restarts on file changes)
npm run dev
```

Open your browser to: **http://localhost:3000**

---

## 🌐 Application Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | `http://localhost:3000/` | Landing page |
| Sign Up | `http://localhost:3000/auth/signup` | Create account |
| Sign In | `http://localhost:3000/auth/signin` | Login |
| Dashboard | `http://localhost:3000/dashboard` | Main planner (requires login) |

---

## 📡 API Reference

### Authentication Routes

#### POST /auth/signup
Create a new user account.

**Request:**
```http
POST /auth/signup
Content-Type: application/json

{
  "name": "Alex Johnson",
  "email": "alex@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully!",
  "user": { "id": "uuid", "name": "Alex Johnson", "email": "alex@example.com" },
  "token": "eyJhbGci..."
}
```

---

#### POST /auth/signin
Login with email and password.

**Request:**
```http
POST /auth/signin
Content-Type: application/json

{
  "email": "alex@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Signed in successfully!",
  "user": { "id": "uuid", "name": "Alex Johnson", "email": "alex@example.com" },
  "token": "eyJhbGci..."
}
```

---

#### POST /auth/logout
Clear authentication cookie.

**Response (200):**
```json
{ "success": true, "message": "Logged out successfully" }
```

---

### Task Routes (All require JWT auth)

**Include the token in every request:**
```http
Authorization: Bearer eyJhbGci...
```

---

#### GET /tasks
Get all tasks for the logged-in user.

**Query Parameters (all optional):**
- `subject=Math` — filter by subject (partial match)
- `completed=true/false` — filter by status
- `sortBy=deadline/priority/created_at` — sort field
- `order=asc/desc` — sort direction

**Response (200):**
```json
{
  "success": true,
  "count": 3,
  "stats": {
    "total": 3, "completed": 1, "pending": 2, "highPriority": 1, "overdue": 0
  },
  "tasks": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "title": "Read Chapter 5",
      "subject": "Biology",
      "deadline": "2025-12-20",
      "priority": "High",
      "notes": "Focus on mitosis",
      "completed": false,
      "created_at": "2025-12-01T10:00:00Z"
    }
  ]
}
```

---

#### POST /tasks
Create a new task.

**Request:**
```http
POST /tasks
Content-Type: application/json
Authorization: Bearer eyJhbGci...

{
  "title": "Read Chapter 5 — Cell Biology",
  "subject": "Biology",
  "deadline": "2025-12-20",
  "priority": "High",
  "notes": "Focus on mitosis and meiosis"
}
```

**Response (201):**
```json
{ "success": true, "message": "Task created successfully!", "task": { ...task object } }
```

---

#### PUT /tasks/:id
Update a task.

**Request:**
```http
PUT /tasks/your-task-uuid
Content-Type: application/json
Authorization: Bearer eyJhbGci...

{
  "title": "Updated Task Title",
  "priority": "Medium",
  "deadline": "2025-12-25"
}
```

---

#### PATCH /tasks/:id/complete
Toggle task completion status.

```http
PATCH /tasks/your-task-uuid/complete
Authorization: Bearer eyJhbGci...
```

---

#### DELETE /tasks/:id
Delete a task permanently.

```http
DELETE /tasks/your-task-uuid
Authorization: Bearer eyJhbGci...
```

---

## 🧪 Postman Testing

1. Open Postman
2. Click **Import** → **File**
3. Select `postman-collection.json`
4. Set the collection variables:
   - `BASE_URL`: `http://localhost:3000`
   - `TOKEN`: (get this after Sign Up or Sign In)
   - `TASK_ID`: (get this after Create Task)
5. Run requests in order: Sign Up → Create Task → Get Tasks → etc.

---

## 🔐 Security Features

- **Passwords** are hashed with bcrypt (cost factor 12) — never stored in plain text
- **JWT tokens** are stored in HTTP-only cookies — inaccessible to JavaScript (prevents XSS)
- **SameSite=strict** cookie attribute — prevents CSRF attacks
- **User isolation** — every task query filters by `user_id` so users can only see their own data
- **Input validation** on all endpoints
- **Generic error messages** for auth failures (don't reveal if email exists)

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web framework |
| `@supabase/supabase-js` | Supabase database client |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT creation and verification |
| `cookie-parser` | Parse cookies from requests |
| `ejs` | HTML templating engine |
| `dotenv` | Load environment variables |
| `nodemon` (dev) | Auto-restart on file changes |

---

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
→ Make sure your `.env` file exists and has `SUPABASE_URL` and `SUPABASE_ANON_KEY`

**"Failed to create account" on sign up**
→ Check that the `users` table was created in Supabase (run `supabase-setup.sql`)

**Tasks not loading after login**
→ Ensure the `tasks` table exists and the JWT_SECRET in `.env` is set

**Port 3000 already in use**
→ Change `PORT=3001` in your `.env` file

---

## 🛠️ Tech Stack

- **Backend**: Node.js v18+ + Express.js v4
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens) + bcrypt
- **Frontend**: EJS templates + Vanilla JavaScript
- **Styling**: Custom CSS (no frameworks)
- **Fonts**: Fraunces + DM Sans (Google Fonts)
