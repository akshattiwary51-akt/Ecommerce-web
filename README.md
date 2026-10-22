# ShopEase — Full-Stack E-Commerce

A complete e-commerce application built with React, Redux Toolkit, Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Redux Toolkit, React Router 6 |
| Backend    | Node.js, Express 4                      |
| Database   | MongoDB with Mongoose                   |
| Auth       | JWT (stored in localStorage)            |
| Payments   | Stripe + Razorpay                       |
| Images     | Cloudinary + Multer                     |
| Deployment | Vercel (frontend) + Railway (backend)   |

---

## Project Structure

```
shopease/
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── store/
│       ├── services/
│       ├── hooks/
│       └── utils/
└── backend/           # Node.js + Express API
    ├── config/
    ├── controllers/
    ├── middleware/
    ├── models/
    ├── routes/
    └── utils/
```

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd shopease
npm install         # installs concurrently at root
cd frontend && npm install
cd ../backend && npm install
```

### 2. Configure environment variables

**Backend** — copy `.env.example` to `.env`:

```bash
cd backend
cp .env.example .env
```

Fill in your values:
```
MONGO_URI=mongodb://localhost:27017/shopease
JWT_SECRET=change_this_to_a_long_random_string
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

**Frontend** — copy `.env.example` to `.env`:

```bash
cd frontend
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates:
- Admin: `admin@shopease.com` / `admin123`
- User:  `jane@example.com` / `user1234`
- 8 sample products across 5 categories

### 4. Run in development

From the root directory:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api


---

## API Reference

### Auth
| Method | Endpoint               | Auth | Description        |
|--------|------------------------|------|--------------------|
| POST   | /api/auth/register     | —    | Register new user  |
| POST   | /api/auth/login        | —    | Login              |
| GET    | /api/auth/me           | ✓    | Get current user   |
| PUT    | /api/auth/profile      | ✓    | Update profile     |
| POST   | /api/auth/addresses    | ✓    | Add address        |
| DELETE | /api/auth/addresses/:id| ✓    | Delete address     |

### Products
| Method | Endpoint                    | Auth  | Description              |
|--------|-----------------------------|-------|--------------------------|
| GET    | /api/products               | —     | List with filters & pag. |
| GET    | /api/products/:id           | —     | Single product + reviews |
| GET    | /api/products/categories    | —     | All distinct categories  |
| POST   | /api/products/:id/reviews   | ✓     | Add review               |
| POST   | /api/products               | Admin | Create product           |
| PUT    | /api/products/:id           | Admin | Update product           |
| DELETE | /api/products/:id           | Admin | Delete product           |

### Cart
| Method | Endpoint               | Auth | Description     |
|--------|------------------------|------|-----------------|
| GET    | /api/cart              | ✓    | Get user cart   |
| POST   | /api/cart/items        | ✓    | Add item        |
| PUT    | /api/cart/items/:id    | ✓    | Update quantity |
| DELETE | /api/cart/items/:id    | ✓    | Remove item     |
| DELETE | /api/cart              | ✓    | Clear cart      |

### Orders
| Method | Endpoint               | Auth  | Description          |
|--------|------------------------|-------|----------------------|
| POST   | /api/orders            | ✓     | Place order          |
| GET    | /api/orders            | ✓     | User's order history |
| GET    | /api/orders/:id        | ✓     | Order detail         |
| PUT    | /api/orders/:id/cancel | ✓     | Cancel order         |
| POST   | /api/orders/return     | ✓     | Request return       |
| PUT    | /api/orders/:id/status | Admin | Update order status  |

### Payments
| Method | Endpoint                       | Auth | Description             |
|--------|--------------------------------|------|-------------------------|
| POST   | /api/payments/stripe/create-intent | ✓ | Create Stripe intent |
| POST   | /api/payments/stripe/confirm   | ✓    | Confirm Stripe payment  |
| POST   | /api/payments/razorpay/create  | ✓    | Create Razorpay order   |
| POST   | /api/payments/razorpay/verify  | ✓    | Verify Razorpay payment |

### Wishlist
| Method | Endpoint                  | Auth | Description          |
|--------|---------------------------|------|----------------------|
| GET    | /api/wishlist             | ✓    | Get wishlist         |
| POST   | /api/wishlist/:productId  | ✓    | Toggle product       |

---

## Features Implemented

- [x] User registration & login with JWT
- [x] Product listing with search, category, price & rating filters
- [x] Pagination
- [x] Product detail with image gallery
- [x] Customer reviews & ratings
- [x] Shopping cart (add, update, remove, clear)
- [x] Wishlist toggle
- [x] 3-step checkout (address → payment → review)
- [x] Order placement with stock deduction
- [x] Order history & detail pages
- [x] Order status tracking with progress steps
- [x] Order cancellation
- [x] Return requests
- [x] Stripe payment integration
- [x] Razorpay signature verification
- [x] Admin product CRUD + image upload (Cloudinary)
- [x] Rate limiting on API
- [x] Input validation (express-validator)
- [x] Global error handler

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Push to GitHub → import in Vercel → set env vars
```

### Backend → Railway / Render
1. Push `backend/` to GitHub
2. Create new service, connect repo
3. Set env vars in dashboard
4. Set start command: `node server.js`

---

## Security Notes

- JWT is stored in `localStorage`. For production, migrate to `HttpOnly` cookies to prevent XSS.
- Always set `NODE_ENV=production` in production — this suppresses stack traces in error responses.
- Rate limiting is enabled (100 req / 15 min per IP) on all `/api` routes.
- Passwords are hashed with `bcryptjs` (cost factor 12).
- Razorpay payments are verified via HMAC-SHA256 signature.
