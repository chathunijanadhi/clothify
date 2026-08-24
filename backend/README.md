# Online Clothing Store — Backend

This folder contains the Node.js + Express + TypeScript backend for the Online Clothing Store project.

Quick start (after setting up environment variables):

1. Install dependencies: npm install
2. Start in development: npm run dev
3. Build: npm run build
4. Start production: npm start

API base URL: http://localhost:5000/api

Health-check endpoint: GET /api/health

Authentication (implemented):
- POST /api/auth/register  -> register a new user (body: { fullName?, email, password })
- POST /api/auth/login     -> login (body: { email, password })
- GET  /api/auth/me        -> get current user profile (requires Bearer <token>)

Products (implemented):
- GET    /api/products
- GET    /api/products/categories
- GET    /api/products/:id
- POST   /api/products
- PUT    /api/products/:id
- DELETE /api/products/:id

Do NOT commit the .env file with real credentials.
