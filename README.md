# 🌾 Agro-Connect Kenya v2.0

A full-stack MERN agri-marketplace with 10 features connecting Kenyan farmers, buyers, hotels, and admins.

---

## 🚀 Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# 3. Seed the database (240 products + demo users)
npm run seed

# 4. Start development
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
```

---

## 🔑 Demo Credentials (after seeding)

| Role    | Phone            | Password   | Dashboard |
|---------|------------------|------------|-----------|
| Farmer  | +254712345001-005| farmer123  | /farmer   |
| Buyer   | +254712000001    | buyer123   | /buyer    |
| Hotel   | +254712000002    | hotel123   | /hotel    |
| Admin   | +254700000001    | admin123   | /admin    |

---

## 📦 Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | M-Pesa Callback | STK Push → Daraja callback → order auto-confirmed |
| 2 | Orders Display | Buyer & farmer dashboards with filters + sorting |
| 3 | How It Works | Step-by-step guide with FAQ for farmers & buyers |
| 4 | Profile Settings | Name, email, location, password (bcrypt), photo |
| 5 | PDF Receipts | Styled A4 PDF via pdfkit — download after payment |
| 6 | Receipt Modal | In-app payment confirmation with download button |
| 7 | Dark Mode | Tailwind class strategy, persisted in localStorage |
| 8 | Scroll-to-Top | Floating button visible after 400px scroll |
| 9 | Cart System | Multi-item cart, qty controls, bulk checkout |
| 10 | Hotels Feature | Hotel role, bulk ordering, 5% auto-discount |

---

## 🏗️ Architecture

```
Frontend (React 18 + Vite + Tailwind CSS)
        ↓ /api proxy
Backend (Node.js + Express, ES6 Modules)
        ↓
Database (MongoDB Atlas + Mongoose)
        ↓
External: Safaricom Daraja API (M-Pesa STK Push)
```

---

## 📁 Project Structure

```
agro-connect-full/
├── backend/
│   ├── config/         db.js, logger.js
│   ├── controllers/    auth, profile, product, order,
│   │                   payment (+ PDF), cart, admin, hotel
│   ├── middleware/     auth.js (JWT+RBAC), errorHandler.js
│   ├── models/         User, Product, Order, Payment, Cart
│   ├── routes/         auth, profile, products, orders,
│   │                   payments, cart, admin, hotel
│   ├── scripts/        seedProducts.js (240 products)
│   ├── services/       mpesa.js (all number formats)
│   └── server.js
└── frontend/
    └── src/
        ├── components/common/
        │   Navbar, Spinner, ThemeToggle, ScrollToTop,
        │   ProtectedRoute, ReceiptModal
        ├── context/    Auth, Cart, Theme
        ├── pages/
        │   Landing, AuthPages, Marketplace, ProductDetail,
        │   HowItWorks, Cart, Profile,
        │   FarmerDashboard, BuyerDashboard,
        │   AdminDashboard, HotelDashboard
        └── utils/      api.js (axios + JWT interceptors)
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint           | Access  |
|--------|--------------------|---------|
| POST   | /api/auth/register | Public  |
| POST   | /api/auth/login    | Public  |
| GET    | /api/auth/me       | Private |

### Profile
| Method | Endpoint              | Access  |
|--------|-----------------------|---------|
| GET    | /api/profile          | Private |
| PUT    | /api/profile          | Private |
| PUT    | /api/profile/password | Private |
| PUT    | /api/profile/picture  | Private |

### Products
| Method | Endpoint                   | Access  |
|--------|----------------------------|---------|
| GET    | /api/products              | Public  |
| GET    | /api/products/my-listings  | Farmer  |
| GET    | /api/products/:id          | Public  |
| POST   | /api/products              | Farmer  |
| PUT    | /api/products/:id          | Farmer  |
| DELETE | /api/products/:id          | Farmer  |

### Orders
| Method | Endpoint                    | Access  |
|--------|-----------------------------|---------|
| POST   | /api/orders                 | Buyer   |
| POST   | /api/orders/cart            | Buyer/Hotel |
| GET    | /api/orders/my-orders       | Private |
| GET    | /api/orders/farmer-orders   | Farmer  |
| GET    | /api/orders/:id             | Private |
| PUT    | /api/orders/:id/status      | Farmer  |
| GET    | /api/orders                 | Admin   |

### Payments
| Method | Endpoint                             | Access  |
|--------|--------------------------------------|---------|
| POST   | /api/payments/stk-push               | Buyer   |
| POST   | /api/payments/callback               | Public (Safaricom) |
| GET    | /api/payments/status/:checkoutId     | Private |
| GET    | /api/payments/history                | Private |
| GET    | /api/payments/receipt-data/:orderId  | Private |
| GET    | /api/payments/receipt/:orderId       | Private (PDF) |

### Cart
| Method | Endpoint              | Access      |
|--------|-----------------------|-------------|
| GET    | /api/cart             | Buyer/Hotel |
| POST   | /api/cart             | Buyer/Hotel |
| POST   | /api/cart/bulk        | Buyer/Hotel |
| DELETE | /api/cart/:productId  | Buyer/Hotel |
| DELETE | /api/cart             | Buyer/Hotel |

### Hotel
| Method | Endpoint              | Access |
|--------|-----------------------|--------|
| PUT    | /api/hotel/profile    | Hotel  |
| POST   | /api/hotel/bulk-order | Hotel  |
| GET    | /api/hotel/orders     | Hotel  |
| GET    | /api/hotel/all        | Admin  |

### Admin
| Method | Endpoint                         | Access |
|--------|----------------------------------|--------|
| GET    | /api/admin/analytics             | Admin  |
| GET    | /api/admin/users                 | Admin  |
| PUT    | /api/admin/users/:id/toggle      | Admin  |
| PUT    | /api/admin/products/:id/feature  | Admin  |

---

## 💳 M-Pesa Integration

Accepts all number formats:
- `0712345678` → normalized to `254712345678`
- `+254712345678` → normalized to `254712345678`
- `712345678` → normalized to `254712345678`
- `254712345678` → used as-is

**Callback URL** must be a public HTTPS URL. Use [ngrok](https://ngrok.com) for local testing:
```bash
ngrok http 5000
# Set MPESA_CALLBACK_URL=https://xxxx.ngrok.io/api/payments/callback
```

---

## 🌙 Dark Mode

Toggle via the moon/sun icon in the navbar. Preference is persisted in `localStorage` and survives page reloads.

---

## 🏨 Hotel Bulk Ordering

- Register with role `hotel`
- 5% discount applied automatically on all bulk orders
- Orders grouped by farmer automatically
- Choose delivery frequency: one-time, weekly, monthly
- Download PDF receipts after payment

---

## 🔐 Security

- **JWT** Bearer tokens (7-day expiry)
- **RBAC** — `farmer`, `buyer`, `hotel`, `admin`
- **bcryptjs** — 12 rounds password hashing
- **Rate limiting** — 200 req / 15 min per IP
- **Input validation** — Mongoose schema validators
- All secrets in `.env` — never committed

---

## 🚀 Deployment

### Frontend → Vercel
```bash
cd frontend && npm run build
# Deploy dist/ to Vercel
# Set VITE_API_URL=https://your-backend.render.com/api
```

### Backend → Render
```
Build: npm install
Start: npm start
Add all .env variables in Render dashboard
```

### Database → MongoDB Atlas
- Free M0 cluster
- Whitelist 0.0.0.0/0 for Render's IPs

---

Built with ❤️ for Kenyan farmers 🇰🇪
