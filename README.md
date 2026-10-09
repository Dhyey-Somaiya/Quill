# Quill ✒️

A modern, production-ready, full-stack blogging and publishing platform built with **React 19**, **Vite**, **Node.js**, **Express 5**, and **MongoDB**.

Quill provides a rich, elegant publishing experience for writers and readers, featuring draft management, markdown/rich content editing, article categorization, social interactions (likes, bookmarks, comments, follow/unfollow), light/dark mode, transactional emails via Resend, robust authentication (Email/Password with email verification and Google OAuth 2.0), and a comprehensive admin management dashboard.

---

## 🌟 Key Features

### 🔐 Authentication & Security
- **Dual Authentication Methods**:
  - **Email & Password**: Secure registration with mandatory email verification via Resend.
  - **Google OAuth 2.0**: One-tap and popup Google Sign-In powered by Google Identity Services (GIS) on the frontend and cryptographically verified on the backend with `google-auth-library`.
- **Intelligent Account Linking**: If a user previously registered with email/password and signs in using Google with the same email, the account is automatically linked and verified.
- **Google-Only Account Safety**: Google-only users have no password hashes stored, preventing unauthorized password logins or invalid password reset emails.
- **Unified JWT Session Management**: Both authentication providers issue the exact same Quill JWT token payload, ensuring consistent authorization across the platform.
- **Secure Password Hashing**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Transactional Verification & Password Resets**:
  - Verification links expire in 24 hours.
  - Password reset links expire in 15 minutes.
  - Reset tokens and verification tokens are stored as SHA-256 hashes in MongoDB and invalidated immediately upon use (single-use tokens).
- **Brute-Force & Abuse Protection**: Rate limiting with `express-rate-limit` on sensitive authentication and mutation endpoints.

### 📝 Content & Publishing
- **Rich Article Editor**: Create, edit, draft, and publish articles with cover images, categories, and tags.
- **Draft Management**: Save drafts privately and publish when ready.
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
- **Comment Moderation**: Approve or delete user comments.

### 🎨 UI & Design
- **Theme Toggle**: Seamless switching between Dark Mode and Light Mode.
- **Responsive Layout**: Mobile-friendly navigation drawer and responsive grid layouts.
- **Skeleton Loaders**: Polished skeleton loading states during async fetches.

---

## 🛠️ Tech Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19, Vite 7, React Router DOM 7, Axios, Lucide React, DOMPurify, Google Identity Services |
| **Backend** | Node.js, Express 5, MongoDB, Mongoose 9, `google-auth-library`, `resend`, `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, `sanitize-html` |
| **Email Delivery** | [Resend](https://resend.com) Transactional Email API |
| **Database** | MongoDB (Local or MongoDB Atlas) |

---

## 📁 Repository Structure

```text
Quill/
├── backend/
│   ├── config/               # Database connection setup (db.js)
│   ├── controllers/          # Business logic handlers (auth, post, user, comment, etc.)
│   ├── middleware/           # Auth JWT, Role verification, and Rate limiting middleware
│   ├── models/               # Mongoose database schemas:
│   │   ├── Category.js
│   │   ├── Comment.js
│   │   ├── EmailVerificationToken.js
│   │   ├── PasswordResetToken.js
│   │   ├── Post.js
│   │   ├── Tag.js
│   │   └── User.js
│   ├── routes/               # Express API routes (auth, posts, users, comments, admin, etc.)
│   ├── scripts/              # Seed & test scripts:
│   │   ├── seedAdmin.js      # Seeds default administrator account
│   │   ├── testAuthFlows.js  # Automated authentication integration test
│   │   └── testResend.js     # Standalone Resend email test script
│   ├── services/             # Email delivery service via Resend (emailService.js)
│   ├── utils/                # Error handling and environment validation (validateEnv.js)
│   ├── server.js             # Express app entry point
│   ├── .env.example          # Backend environment variables blueprint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # UI components (Navbar, PostCard, RichEditor, SkeletonLoader, ProtectedRoute)
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── pages/            # View pages:
│   │   │   ├── Admin.jsx
│   │   │   ├── Bookmarks.jsx
│   │   │   ├── Drafts.jsx
│   │   │   ├── ForgotPassword.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── PostDetail.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── PublicProfile.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── ResendVerification.jsx
│   │   │   ├── ResetPassword.jsx
│   │   │   ├── VerifyEmail.jsx
│   │   │   └── Write.jsx
│   │   ├── services/         # Axios API client setup (api.js)
│   │   ├── App.jsx           # App layout & routing definitions
│   │   ├── main.jsx          # React DOM entry point
│   │   └── styles.css        # Core stylesheet & design tokens
│   ├── index.html            # Vite HTML template
│   ├── .env.example          # Frontend environment variables blueprint
│   └── package.json
│
└── README.md
```

---

## 🚀 How to Run the Project

### Prerequisites
Make sure you have installed on your machine:
- **Node.js**: v18.0.0 or higher recommended ([Download Node.js](https://nodejs.org/))
- **MongoDB**: A running local MongoDB instance (`mongodb://localhost:27017`) or a free [MongoDB Atlas](https://www.mongodb.com/atlas) connection string
- **Resend Account**: Free account at [resend.com](https://resend.com) for sending emails
- **Google Cloud Console Account**: For configuring Google OAuth 2.0 (see guide below)

---

### Step 1: Backend Setup

1. **Navigate to the `backend` folder**:
   ```bash
   cd backend
   ```

2. **Install backend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt / PowerShell, use `copy .env.example .env`)*

   Fill in your configuration values in `backend/.env`:
   ```env
   # Database & Server
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/QuilDB

   # Authentication Secret (min 32 characters)
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long

   # Google OAuth (Must match frontend Client ID)
   GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

   # Resend Transactional Email
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
   EMAIL_FROM=onboarding@resend.dev

   # Frontend URL (Used for generating email verification & password reset links)
   FRONTEND_URL=http://localhost:5173
   ```

   > **Note on `EMAIL_FROM`**: During development, keep `EMAIL_FROM=onboarding@resend.dev`. Resend allows testing without configuring a custom domain by delivering emails to the email address registered with your Resend account.

4. **Seed the Admin Account** *(Optional)*:
   Create a pre-configured administrator account to test admin features:
   ```bash
   npm run seed:admin
   ```
   - **Email**: `admin-test@quill.com`
   - **Password**: `Admin@123`
   - **Role**: `ADMIN`

5. **Start the Backend Server**:
   ```bash
   # Development mode (with nodemon auto-reload)
   npm run dev

   # Production mode
   npm start
   ```
   The backend API will start on `http://localhost:5000`.

---

### Step 2: Frontend Setup

1. **Open a new terminal and navigate to the `frontend` folder**:
   ```bash
   cd frontend
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to create your `.env` file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt / PowerShell, use `copy .env.example .env`)*

   Fill in your configuration values in `frontend/.env`:
   ```env
   # Backend API Endpoint
   VITE_API_URL=http://localhost:5000/api/v1

   # Google OAuth Client ID (Must match backend GOOGLE_CLIENT_ID)
   VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser and visit:
   ```
   http://localhost:5173
   ```

---

## 🔑 Google OAuth 2.0 Integration & Setup Guide

Quill supports one-click **Google Sign-In** seamlessly integrated alongside standard email/password authentication.

### How Google Authentication Works in Quill
1. **Frontend Initiation**:
   - The frontend loads Google's official client library (`https://accounts.google.com/gsi/client`).
   - The user clicks the **"Continue with Google"** button rendered by Google Identity Services (`window.google.accounts.id.renderButton`).
   - Google validates the user's login and returns a cryptographically signed **ID Token** (JWT credential).
2. **Server-Side Verification**:
   - The frontend sends the credential to `POST /api/v1/auth/google`.
   - The backend validates the token using `google-auth-library`'s `OAuth2Client.verifyIdToken()` against Google's public keys and verifies that the audience matches `GOOGLE_CLIENT_ID`.
   - The backend directly extracts verified claims from Google's payload (`sub`, `email`, `name`, `email_verified`). The backend **never trusts raw, arbitrary email input** from the client.
3. **User Linking & Creation**:
   - **Existing User**: If an account with the Google ID or matching email already exists, the accounts are linked and the email is marked verified.
   - **New User**: A new user profile is created with `emailVerified: true` and `passwordHash: null`.
4. **Unified Session Token**:
   - The backend issues a standard Quill JWT token (`{ id, role }`). Both Google users and email/password users share the exact same authorization middleware and session lifecycles.

---

### Step-by-Step Google Cloud Console Setup

Follow these steps to obtain your Google OAuth Client ID:

1. **Go to Google Cloud Console**:
   - Visit [https://console.cloud.google.com/](https://console.cloud.google.com/) and log in.

2. **Create a Project**:
   - Click the project dropdown at the top of the page.
   - Click **New Project**.
   - Name your project (e.g., `Quill-Blog`) and click **Create**.

3. **Configure the OAuth Consent Screen**:
   - In the left sidebar, navigate to **APIs & Services** > **OAuth consent screen**.
   - Select **External** and click **Create**.
   - Fill in the required fields:
     - **App name**: `Quill`
     - **User support email**: Select your email.
     - **Developer contact information**: Enter your email.
   - Click **Save and Continue**.
   - **Scopes**: Standard default scopes (`openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`) are automatically included. Click **Save and Continue**.
   - **Test Users**: While in "Testing" mode, add your personal Google email address as a test user so you can log in during development.
   - Click **Save and Continue** and return to dashboard.

4. **Create OAuth 2.0 Client ID Credentials**:
   - In the left sidebar, click **Credentials**.
   - Click **+ Create Credentials** at the top and select **OAuth client ID**.
   - Set **Application type** to **Web application**.
   - Set **Name** to `Quill Web Client`.
   - Under **Authorized JavaScript origins**, click **+ Add URI** and add:
     - `http://localhost:5173` *(Vite dev server)*
     - `http://localhost:5000` *(Express backend server)*
     - *(Add your production domain if deploying, e.g., `https://quill.yourdomain.com`)*
   - *(Note: Authorized redirect URIs are not required because Google Identity Services uses the popup/one-tap ID token flow).*
   - Click **Create**.

5. **Copy Your Client ID**:
   - A dialog will show your **Client ID** (format: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`).
   - Copy this Client ID. *(The Client Secret is not required for Google Identity Services frontend ID token verification).*

6. **Add the Client ID to Your Environment Files**:
   - In `backend/.env`:
     ```env
     GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
     ```
   - In `frontend/.env`:
     ```env
     VITE_GOOGLE_CLIENT_ID=xxxxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
     ```
   - Restart both backend and frontend servers. The "Continue with Google" button on `/login` is now active!

---

## ✉️ Transactional Email Verification & Password Reset (Resend)

Quill uses [Resend](https://resend.com) for reliable, transactional email delivery.

### Development Testing Mode
- Resend provides a sandbox sender: `onboarding@resend.dev`.
- In test mode, Resend permits sending emails **only to the email address you signed up with** on Resend.
- For local testing:
  1. Set `RESEND_API_KEY` in `backend/.env`.
  2. Keep `EMAIL_FROM=onboarding@resend.dev`.
  3. Register with your Resend account email address to receive real verification emails.
  4. Test sending an email directly with the included script:
     ```bash
     cd backend
     node scripts/testResend.js your-email@example.com
     ```

### Automated Flow Verification
Run the integrated end-to-end authentication test suite:
```bash
cd backend
node scripts/testAuthFlows.js
```
This tests:
- Email/password user registration
- Email verification token consumption
- Password reset token generation & rotation
- Prevention of resets on Google-only accounts

---

## 📡 API Reference Overview

| Module | Endpoint | Method | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/v1/auth/register` | `POST` | Public | Register with email/password (triggers verification email) |
| **Auth** | `/api/v1/auth/verify-email?token=` | `GET` | Public | Verify email address using secure token |
| **Auth** | `/api/v1/auth/resend-verification` | `POST` | Public | Resend email verification link |
| **Auth** | `/api/v1/auth/login` | `POST` | Public | Authenticate with email/password; returns JWT |
| **Auth** | `/api/v1/auth/google` | `POST` | Public | Authenticate using Google credential; returns JWT |
| **Auth** | `/api/v1/auth/forgot-password` | `POST` | Public | Request password reset email |
| **Auth** | `/api/v1/auth/reset-password` | `POST` | Public | Reset password using single-use token |
| **Auth** | `/api/v1/auth/change-password` | `PATCH` | Authenticated | Change current password |
| **Posts** | `/api/v1/posts` | `GET` | Public / Optional Auth | List published posts with pagination, category, tag, & search filters |
| **Posts** | `/api/v1/posts/:id` | `GET` | Public / Optional Auth | Fetch single post details |
| **Posts** | `/api/v1/posts` | `POST` | Authenticated | Create a new post or draft |
| **Posts** | `/api/v1/posts/:id` | `PUT` | Author / Admin | Update post details or publish status |
| **Posts** | `/api/v1/posts/:id` | `DELETE` | Author / Admin | Delete a post |
| **Posts** | `/api/v1/posts/:id/like` | `POST` / `DELETE` | Authenticated | Like or unlike a post |
| **Users** | `/api/v1/users/me` | `GET` / `PATCH` | Authenticated | Fetch / update authenticated user profile |
| **Users** | `/api/v1/users/me/bookmarks` | `GET` | Authenticated | Fetch current user's bookmarked posts |
| **Users** | `/api/v1/users/:id` | `GET` | Public | Fetch user public profile |
| **Users** | `/api/v1/users/:id/follow` | `POST` / `DELETE` | Authenticated | Follow or unfollow a user |
| **Users** | `/api/v1/users/bookmarks/:id` | `POST` / `DELETE` | Authenticated | Add or remove post bookmark |
| **Users** | `/api/v1/users` | `GET` | Admin | List all registered users |
| **Users** | `/api/v1/users/:id/status` | `PATCH` | Admin | Toggle user active/inactive account status |
| **Categories** | `/api/v1/categories` | `GET` | Public | List all categories |
| **Categories** | `/api/v1/categories` | `POST` / `PUT` / `DELETE` | Admin | Create, update, or delete categories |
| **Tags** | `/api/v1/tags` | `GET` | Public | List all tags |
| **Tags** | `/api/v1/tags/with-counts` | `GET` | Public | List tags with post usage counts |
| **Tags** | `/api/v1/tags` | `POST` | Authenticated | Create a new tag |
| **Comments** | `/api/v1/comments?postId=` | `GET` | Public | Get approved comments for a post |
| **Comments** | `/api/v1/comments` | `POST` | Authenticated | Post a comment or reply |
| **Admin** | `/api/v1/admin/dashboard` | `GET` | Admin | Platform overview counts (users, posts, drafts, comments) |

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
