# ShopEase — Full-Stack E-Commerce

A full-featured e-commerce platform built with **React + Redux Toolkit** on the frontend and **Node.js / Express / MongoDB** on the backend.

---

## Features

| Area | Details |
|---|---|
| **Auth** | JWT login/register, role-based access (user / admin) |
| **Products** | Browse, filter by category, search, paginate, reviews |
| **Cart** | Add/remove/update quantities, persistent per user |
| **Wishlist** | Toggle items, dedicated wishlist page |
| **Checkout** | 4-step flow — Address → Payment → Review → Confirmation |
| **Payments** | Stripe (card) + Razorpay + Cash on Delivery; webhook handlers |
| **Orders** | Order history, tracking timeline, cancel, return request |
| **Admin** | Dashboard, full product CRUD, order management + status updates |
| **Images** | Pexels CDN (real photos), fallback category tiles |

---

## Tech Stack

**Frontend** — React 18, Vite, Redux Toolkit, React Router 6, Tailwind CSS, Axios, react-hot-toast

**Backend** — Node.js, Express 4, Mongoose 8, JWT, Stripe SDK, Razorpay SDK, Multer, Cloudinary, Morgan

---

## Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 1. Clone & install

```bash
git clone https://github.com/akshattiwary51-akt/Ecommerce-web
cd Ecommerce-web

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment variables

Create `backend/.env` and set `MONGO_URI` and `JWT_SECRET` at minimum. Set payment and Cloudinary credentials if using those integrations.

Create `frontend/.env` and set:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates **82 products** across 8 categories with real Pexels images, plus two users:

| Email | Password | Role |
|---|---|---|
| admin@shopease.com | admin123 | admin |
| jane@example.com | user1234 | user |

### 4. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev      # http://localhost:5000

# Terminal 2 — frontend
cd frontend && npm run dev     # http://localhost:5173 (or next free port)
```

---

## CORS

In **development** (`NODE_ENV !== 'production'`) the backend accepts all `localhost:*` origins automatically — no config needed even if Vite picks port 5174 or 5175.

In **production** set `CLIENT_URL` in `backend/.env` to a comma-separated list of allowed origins:

```
CLIENT_URL=https://shopease.example.com
```

---

## Payments (optional)

Payments degrade gracefully when keys are missing — the error message is clear and the rest of the site works normally.

**Stripe (test)**
1. Create a free account at [stripe.com](https://stripe.com)
2. Copy your test keys into `backend/.env` and `frontend/.env`
3. For webhooks: `stripe listen --forward-to localhost:5000/api/webhooks/stripe`

**Razorpay (test)**
1. Create a free account at [razorpay.com](https://razorpay.com)
2. Copy your test Key ID and Secret into `backend/.env` and `frontend/.env`

---

## Admin Dashboard

Log in as `admin@shopease.com` and click the ⚙️ icon in the navbar.

- **Dashboard** — revenue, order count, product count, recent orders
- **Products** — add / edit / delete products with image URLs
- **Orders** — view all orders, filter by status, update status per order

---

## Project Structure

```
├── backend/
│   ├── config/          # DB connection
│   ├── controllers/     # auth, cart, order, payment, product, webhook, wishlist
│   ├── middleware/       # auth (protect + isAdmin), error, validate
│   ├── models/          # User, Product, Cart, Order, Wishlist
│   ├── routes/          # one file per resource
│   ├── utils/           # jwt helper, seed script
│   └── server.js        # Express app entry point
└── frontend/
    └── src/
        ├── components/  # layout (Navbar, Footer), common (PrivateRoute, AdminRoute)
        ├── pages/       # Auth, Home, Products, Cart, Checkout, Orders, Wishlist, Admin
        ├── services/    # axios wrappers per resource
        ├── store/       # Redux slices (auth, cart, order, product, wishlist)
        └── utils/       # formatCurrency, hooks
```

---

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register |
| POST | `/api/auth/login` | — | Login |
| GET | `/api/auth/me` | ✓ | Current user |
| GET | `/api/products` | — | List (filter, sort, paginate) |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | admin | Create product |
| PUT | `/api/products/:id` | admin | Update product |
| DELETE | `/api/products/:id` | admin | Delete product |
| POST | `/api/products/:id/reviews` | ✓ | Add review (once per user) |
| GET | `/api/cart` | ✓ | Get cart |
| POST | `/api/cart` | ✓ | Add to cart |
| PUT | `/api/cart/:itemId` | ✓ | Update quantity |
| DELETE | `/api/cart/:itemId` | ✓ | Remove item |
| POST | `/api/orders` | ✓ | Place order |
| GET | `/api/orders` | ✓ | User's orders |
| GET | `/api/orders/admin/all` | admin | All orders |
| PUT | `/api/orders/:id/status` | admin | Update status |
| PUT | `/api/orders/:id/cancel` | ✓ | Cancel order |
| POST | `/api/payments/stripe/create-intent` | ✓ | Stripe PaymentIntent |
| POST | `/api/payments/stripe/confirm` | ✓ | Confirm Stripe payment |
| POST | `/api/payments/razorpay/create` | ✓ | Razorpay order |
| POST | `/api/payments/razorpay/verify` | ✓ | Verify HMAC signature |
| GET | `/api/wishlist` | ✓ | Get wishlist |
| POST | `/api/wishlist/:productId` | ✓ | Toggle wishlist |
| GET | `/api/health` | — | Health check |
