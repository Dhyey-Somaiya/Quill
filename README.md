# Quill ✒️

A modern, full-stack blogging and publishing platform built with **React**, **Vite**, **Node.js**, **Express**, and **MongoDB**. 

Quill provides a rich publishing experience for writers and readers, featuring draft management, article categorization, social interactions (likes, bookmarks, comments, follow/unfollow), light/dark mode, and a comprehensive admin management dashboard.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **JWT-Based Authentication**: Secure login and registration with token persistence in `localStorage`.
- **Role-Based Access Control**: Separate privileges for standard readers/writers and platform administrators.
- **Account Protection**: Password encryption using `bcrypt` and status checks for inactive/suspended accounts.

### 📝 Content & Publishing
- **Rich Article Editor**: Create, edit, draft, and publish articles with cover images, categories, and tags.
- **Draft System**: Save work-in-progress posts privately in drafts before publishing.
- **Category & Tag Organization**: Structured content discovery with filtered browsing by category, tag, or author.
- **Full-Text Search & Pagination**: Search articles by keywords with server-side pagination support.

### 💬 Social & Engagement
- **Likes & Bookmarks**: Toggle likes on articles and save posts to personal bookmarks.
- **Commenting System**: Nested comments on published articles with moderation capabilities.
- **User Profiles & Following**: Public profile pages with follower/following mechanics.

### 🛡️ Admin Dashboard
- **Platform Analytics**: Dashboard metrics for users, articles, categories, and comments.
- **User Management**: View user accounts and toggle active/inactive account status.
- **Taxonomy Control**: Create, update, and delete categories and tags.

### 🎨 UI & Design
- **Theme Toggle**: Seamless switching between Dark Mode and Light Mode.
- **Responsive Layout**: Mobile-friendly navigation drawer and responsive grid layouts.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM, Axios, Context API, CSS3 (Custom Properties & Themes) |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ORM, JSON Web Tokens (JWT), Bcrypt.js |
| **Database** | MongoDB (Local or MongoDB Atlas) |

---

## 📁 Repository Structure

```text
Quill/
├── backend/                  # Node.js + Express REST API
│   ├── config/               # Database connection setup
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # Auth JWT & Role verification middleware
│   ├── models/               # Mongoose database schemas (User, Post, Comment, Category, Tag)
│   ├── routes/               # API endpoint definitions
│   ├── scripts/              # Database seed scripts (e.g., admin creation)
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Backend environment variables blueprint
│   └── package.json
│
├── frontend/                 # React + Vite Single Page Application
│   ├── src/
│   │   ├── components/       # Reusable UI components (Navbar, PostCard, ProtectedRoute)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # View pages (Home, Write, PostDetail, Admin, Bookmarks, Profile)
│   │   ├── services/         # Axios API client setup (api.js)
│   │   ├── App.jsx           # App layout & routing definitions
│   │   ├── main.jsx          # React DOM entry point
│   │   └── styles.css        # Core stylesheet & design tokens
│   ├── index.html            # Vite HTML template
│   ├── .env.example          # Frontend environment variables blueprint
│   └── package.json
│
└── README.md                 # Project documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally or a MongoDB Atlas connection string.

---

### 1. Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in `backend/`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/QuilDB
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Seed Development Admin Account** *(Optional)*:
   ```bash
   npm run seed:admin
   ```

5. **Start the backend development server**:
   ```bash
   npm run dev
   ```
   The backend API will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables** *(Optional if using default API port)*:
   Create a `.env` file in `frontend/`:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api/v1
   ```

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## 📡 API Reference Overview

| Module | Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/register` | `POST` | Public | Register a new user account |
| **Auth** | `/api/v1/auth/login` | `POST` | Public | Login and receive JWT token |
| **Posts** | `/api/v1/posts` | `GET` | Public | Fetch published post feed with search & filters |
| **Posts** | `/api/v1/posts/:id` | `GET` | Public | Get post details by ID |
| **Posts** | `/api/v1/posts` | `POST` | Authenticated | Create a new post / draft |
| **Posts** | `/api/v1/posts/:id` | `PUT` | Author/Admin | Update an existing post |
| **Posts** | `/api/v1/posts/:id` | `DELETE` | Author/Admin | Delete a post |
| **Posts** | `/api/v1/posts/:id/like` | `POST` / `DELETE` | Authenticated | Like or unlike a post |
| **Users** | `/api/v1/users/me` | `GET` / `PATCH` | Authenticated | Fetch / update profile details |
| **Users** | `/api/v1/users/me/bookmarks` | `GET` | Authenticated | Fetch bookmarked posts |
| **Comments**| `/api/v1/comments` | `POST` | Authenticated | Add a comment to a post |
| **Admin** | `/api/v1/admin/dashboard` | `GET` | Admin | Fetch admin metrics & system stats |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
