# Quill Backend

Quill's REST API backend built with Node.js, Express, MongoDB/Mongoose, JWT and bcrypt.

## Run locally

```bash
npm install
npm run dev
```

Server: `http://localhost:5000`

The local MongoDB database is configured through `MONGO_URI` in `.env`.

## Development admin

```bash
npm run seed:admin
```

This creates/updates the local development admin account used for testing.

## API areas

### Authentication
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `PATCH /api/v1/auth/change-password` (JWT)

### Users
- `GET /api/v1/users` (admin)
- `GET /api/v1/users/:id`
- `GET /api/v1/users/me` (JWT)
- `PATCH /api/v1/users/me` (JWT)
- `POST /api/v1/users/:id/follow` (JWT)
- `DELETE /api/v1/users/:id/follow` (JWT)
- `GET /api/v1/users/me/bookmarks` (JWT)
- `POST /api/v1/users/bookmarks/:id` (JWT)
- `DELETE /api/v1/users/bookmarks/:id` (JWT)
- `PATCH /api/v1/users/:id/status` (admin)

### Posts
- `GET /api/v1/posts` — published feed with search, category/tag/author filters and pagination
- `GET /api/v1/posts/:id`
- `POST /api/v1/posts` (JWT)
- `PUT /api/v1/posts/:id` (owner/admin)
- `DELETE /api/v1/posts/:id` (owner/admin)
- `POST /api/v1/posts/:id/like` (JWT)
- `DELETE /api/v1/posts/:id/like` (JWT)

### Categories
- `GET /api/v1/categories`
- `POST /api/v1/categories` (admin)
- `PUT /api/v1/categories/:id` (admin)
- `DELETE /api/v1/categories/:id` (admin)

### Tags
- `GET /api/v1/tags`
- `POST /api/v1/tags` (admin)
- `PUT /api/v1/tags/:id` (admin)
- `DELETE /api/v1/tags/:id` (admin)

### Comments
- `GET /api/v1/comments`
- `POST /api/v1/comments` (JWT)
- `PUT /api/v1/comments/:id` (owner/admin)
- `DELETE /api/v1/comments/:id` (owner/admin)

### Admin
- `GET /api/v1/admin/test` (admin)
- `GET /api/v1/admin/dashboard` (admin)

## Post list query examples

```text
GET /api/v1/posts?search=mongo
GET /api/v1/posts?categoryId=<id>
GET /api/v1/posts?tagId=<id>
GET /api/v1/posts?authorId=<id>
GET /api/v1/posts?page=2&limit=10
```

The backend validates referenced categories/tags, restricts post update fields, protects inactive accounts, and cleans related comments/bookmarks/tags when content is deleted.
