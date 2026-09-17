# Quill Frontend

React + Vite frontend for the Quill blogging platform.

## Run

```bash
npm install
npm run dev
```

Create `.env` from `.env.example` if the backend is not using the default URL.

Default API:
`http://localhost:5000/api/v1`

## Current vertical slice

- Landing/feed
- Login
- Register
- Theme toggle
- Published post feed
- Search
- Article detail
- Like/unlike for authenticated users
- Logout/session persistence
- Responsive mobile navigation

The backend remains a separate project and is not modified by this frontend.
