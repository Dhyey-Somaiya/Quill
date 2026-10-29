# Quill ✒️ — Modern Blogging & Publishing Platform

**Quill** is a full-stack blogging and publishing platform built with the MERN stack. It provides a modern space for writers to create, manage, publish, and discover content, with authentication, social engagement, personalized reading features, and administrative controls.

The application is deployed using **Vercel**, **Render**, and **MongoDB Atlas**, with a React frontend, an Express REST API, and a MongoDB database.

## 🌐 Live Application

| Component | Deployment |
|---|---|
| **Live Website** | [Quill — Production](https://quill-ten-sable.vercel.app/) |
| **Backend API** | [Quill Backend on Render](https://quill-backend-r3uq.onrender.com/) |
| **Source Code** | [GitHub Repository](https://github.com/Dhyey-Somaiya/Quill) |
| **Database** | MongoDB Atlas |

The production frontend communicates with the backend through REST API endpoints. MongoDB Atlas provides persistent database storage for application data.

## ✨ Key Features

### Authentication & Account Security
- Email and password registration and login.
- Email verification using Resend transactional emails.
- Forgot-password and password-reset workflows.
- Google OAuth 2.0 integration using Google Identity Services.
- JWT-based authentication and protected routes.
- Password hashing using bcryptjs.
- Single-use, time-limited email verification and password-reset tokens.
- Rate limiting for sensitive authentication and API operations.
- Account linking for compatible email/password and Google authentication flows.

### Content Creation & Publishing
- Create, edit, save, and publish blog posts.
- Save unpublished content as drafts.
- Organize articles using categories and tags.
- Browse articles with pagination and search.
- View individual articles and author profiles.

### Social & Community Features
- Like and unlike articles.
- Bookmark articles for later reading.
- Comment on articles and participate in discussions.
- Follow and unfollow other users.
- View public user profiles.

### Administration
- Dedicated administrative dashboard.
- Platform statistics and content overview.
- User management and account-status controls.
- Category and tag management.
- Comment moderation.

### User Experience
- Responsive layouts for desktop and mobile.
- Light and dark themes.
- Search and content-discovery interfaces.
- Loading skeletons and asynchronous data handling.
- Protected pages and role-based access controls.

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite 7, React Router DOM 7 |
| API communication | Axios, REST APIs |
| Backend | Node.js, Express 5 |
| Database | MongoDB, Mongoose 9, MongoDB Atlas |
| Authentication | JWT, bcryptjs, Google Identity Services, google-auth-library |
| Email delivery | Resend |
| Security | express-rate-limit, sanitize-html, DOMPurify |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| Version control | Git, GitHub |

## 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │        User           │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │    React Frontend     │
                         │        Vercel         │
                         └───────────┬───────────┘
                                     │
                              HTTPS / REST API
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   Express Backend     │
                         │        Render         │
                         └───────────┬───────────┘
                                     │
                       ┌─────────────┴─────────────┐
                       │                           │
                       ▼                           ▼
            ┌────────────────────┐     ┌────────────────────┐
            │   MongoDB Atlas    │     │   Resend Email API  │
            │ Persistent Storage │     │ Transactional Email │
            └────────────────────┘     └────────────────────┘

                       Google Identity Services
                          supports sign-in
```

### Application Flow

1. Users access the React application through the Vercel deployment.
2. The frontend sends HTTP requests to the Express backend hosted on Render.
3. The backend validates requests, enforces authorization, and executes application logic.
4. Mongoose communicates with MongoDB Atlas to store and retrieve application data.
5. Resend handles transactional emails, including verification and password-reset messages.
6. Google Identity Services provides Google sign-in, with credential verification performed by the backend.

## 🚀 Production Deployment

### Frontend — Vercel

The React application is hosted on Vercel.

**Production URL:** https://quill-ten-sable.vercel.app/

The frontend uses Vite environment variables to configure its API endpoint and Google authentication client ID.

### Backend — Render

The Express API is hosted as a Render web service.

**Production URL:** https://quill-backend-r3uq.onrender.com/

The backend provides versioned REST endpoints under `/api/v1` and connects to MongoDB Atlas using the `MONGO_URI` environment variable.

### Database — MongoDB Atlas

MongoDB Atlas provides the production database.

Application collections include:

- `users`
- `posts`
- `categories`
- `comments`
- `tags`
- `emailverificationtokens`
- `passwordresettokens`

The database stores application records, including users, content, and related interactions. Production database access is configured separately from the local development database.

### Production Configuration

Configure the following environment variables through the appropriate hosting dashboards. Never commit production secrets to GitHub.

**Backend — Render**

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret used for JWT signing |
| `FRONTEND_URL` | Deployed frontend origin used for CORS and email links |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID used by the backend |
| `RESEND_API_KEY` | Resend API credential |
| `EMAIL_FROM` | Transactional email sender |
| `NODE_ENV` | Production environment configuration |

**Frontend — Vercel**

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend API base URL |
| `VITE_GOOGLE_CLIENT_ID` | Google Identity Services client ID |

For the production deployment, the frontend API URL should point to:

`https://quill-backend-r3uq.onrender.com/api/v1`

The frontend and backend Google client IDs must match. The production frontend origin must also be registered in the relevant Google Cloud OAuth client configuration.

## 💻 Local Development

### Prerequisites

- Node.js and npm.
- A local MongoDB instance or MongoDB Atlas database.
- A Google Cloud project for Google authentication.
- A Resend account for transactional email testing.

### 1. Clone the repository

```bash
git clone https://github.com/Dhyey-Somaiya/Quill.git
cd Quill
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference.

Configure the required variables, including:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/QuillDB
JWT_SECRET=replace_with_a_secure_random_secret
FRONTEND_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=onboarding@resend.dev
```

Use your own credentials. Never commit the `.env` file.

Start the backend in development mode:

```bash
npm run dev
```

The backend will normally be available at `http://localhost:5000`.

### 3. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create a `.env` file based on `frontend/.env.example`.

Configure:

```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

Start the frontend:

```bash
npm run dev
```

Open the local application at `http://localhost:5173`.

### 4. Configure external services

For Google authentication, configure the appropriate authorized JavaScript origins in Google Cloud Console and use the same OAuth client ID in the frontend and backend.

For email functionality, configure a valid Resend API key and sender address. The available recipient restrictions depend on your Resend account and sender-domain verification status.

For database connectivity, ensure the selected MongoDB database is accessible and that the connection string references the intended database.

## 📡 API Overview

All versioned API routes use the `/api/v1` prefix.

| Module | Base endpoint | Purpose |
|---|---|---|
| Authentication | `/api/v1/auth` | Registration, login, Google sign-in, email verification, password reset |
| Posts | `/api/v1/posts` | Article retrieval, creation, editing, deletion, likes |
| Users | `/api/v1/users` | Profiles, bookmarks, following, account management |
| Categories | `/api/v1/categories` | Category retrieval and administration |
| Tags | `/api/v1/tags` | Tag retrieval and management |
| Comments | `/api/v1/comments` | Article comments and replies |
| Administration | `/api/v1/admin` | Administrative dashboard and platform operations |
| Health | `/api/v1/health` | Backend health endpoint |

Individual endpoints have different authentication and authorization requirements. Refer to the backend route and middleware implementations for the exact access rules.

## 🔐 Security Practices

- Keep API keys, database credentials, and JWT secrets in environment variables.
- Use HTTPS for production traffic.
- Hash passwords before storing them.
- Verify Google credentials on the backend.
- Enforce authentication and authorization on protected operations.
- Use rate limiting for sensitive endpoints.
- Validate and sanitize user-controlled content.
- Use expiring, single-use tokens for verification and password-reset workflows.
- Restrict database access according to the deployment's security requirements.
- Rotate credentials immediately if they are accidentally exposed.
- Avoid publishing real user data, passwords, tokens, or production configuration files.

## 🧪 Testing & Verification

Before considering a release production-ready, verify the following workflows against the deployed application:

- Homepage, posts, and categories load successfully.
- Individual article pages and search work.
- Registration and email verification work.
- Email/password login and protected routes work.
- Google sign-in succeeds using the production domain.
- Password-reset emails and reset links work.
- Post creation, editing, drafts, comments, likes, and bookmarks work.
- User-following features work.
- Administrative functions enforce the correct permissions.
- Production API requests succeed without CORS or server errors.

## 📂 Repository Structure

```text
Quill/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── utils/
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── index.html
│   └── package.json
└── README.md
```

## 📄 License

Quill is distributed under the MIT License, as specified in the repository's license file.
