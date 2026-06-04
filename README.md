# Khokahano Agri Systems

> **Connect. Coordinate. Grow. Succeed.**

Khokahano Agri Systems is a poultry coordination and market access platform for Lesotho. It connects small-scale poultry farmers to markets, resources, and buyers — while collecting farming data to improve production standards and livelihoods across the country.

---

## What this platform does

This is not just a marketplace. It is a full ecosystem with two interconnected systems:

### 1. Marketplace
Buyers browse and order poultry products directly from verified local farmers. Products are filtered by the buyer's district automatically using geolocation. The cart, checkout, and order tracking flows are fully functional.

### 2. Farmer Portal
Farmers receive orders, manage their status through a live dashboard, and get escalation alerts if they don't respond within 10 minutes. Khokahano staff are notified automatically for any overdue orders.

---

## Live routes (development)

| URL | Purpose |
|-----|---------|
| `http://localhost:3000/` | Buyer marketplace |
| `http://localhost:3000/farmer` | Farmer order dashboard |
| `http://localhost:3000/farmer/alerts` | Khokahano staff alerts page |

Open the marketplace and farmer dashboard in separate browser tabs to see the full order flow in real time.

---

## Features

### Marketplace (buyer side)
- Product listings with real farm photography
- Location-based filtering — auto-detects buyer's district on first visit (with consent)
- Search, category filter, and sort
- Bilingual — English and Sesotho, toggle in navbar
- Shopping cart persisted in localStorage
- Checkout with delivery method (pickup or delivery) and payment method (M-Pesa, EcoCash, Card)
- My Orders panel — live order status tracking, updates every 3 seconds
- Toast notifications when farmer changes order status

### Farmer dashboard
- Live order feed with 10-minute countdown timer on pending orders
- Order status progression: Pending → Accepted → Preparing → Ready → Completed
- Decline with reason — farmer selects or writes a reason before declining
- Escalation system — orders not responded to within 10 minutes trigger a red alert and notify Khokahano staff
- 5-minute reminder notification before escalation
- Order history with analytics: revenue, top buyers, district breakdown, decline reasons
- All order state persisted in localStorage — survives page refresh

### Khokahano alerts page (staff)
- Shows all escalated orders across all farmers
- Call farmer and call buyer buttons directly on each alert
- Log follow-up notes and mark alerts as resolved
- Open / resolved filter tabs

---

## Tech stack

- **React 18** with Vite
- **React Router v6** for URL-based routing
- **No UI library** — all styling is inline React style objects with CSS class injections for responsive behaviour
- **No state management library** — React hooks only
- **localStorage** for data persistence (replaces backend API until real services are built)

---

## Architecture

The frontend is organised as a **microservice architecture**. Each major feature area is an isolated module:

```
src/
  services/
    marketplace/          ← buyer-facing marketplace
      api/                ← API layer (mock now, real fetch later)
      components/         ← UI components
      constants/          ← theme, translations, mock data
      hooks/              ← useProducts, useCart, useLocation, useBuyerOrders, etc.
      pages/              ← MarketplacePage, AboutPage, SubscribePage
      index.js            ← public boundary — only import from here
    farmer-portal/        ← farmer-facing order management
      components/         ← OrderCard, EscalationBanner, NotificationToast, etc.
      constants/          ← order statuses, mock orders
      hooks/              ← useOrders, useNotifications, useOrderTimer
      pages/              ← FarmerDashboardPage, OrderHistoryPage, KhokahanoAlertsPage
      index.js            ← public boundary
```

**The boundary rule:** other services import only from `index.js`. Never from deep paths inside another service.

**Connecting the real backend:** every API function in `marketplace.api.js` has a commented-out `fetch()` block ready to uncomment. Set `VITE_MARKETPLACE_API_URL` in `.env.local` and swap the mock for the real call — nothing else changes.

---

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

**Add the logo:** place `logo.png` in `public/assets/logo.png`. The navbar has a fallback initial if the file is missing.

**Environment variables:** copy `.env.example` to `.env.local`. Leave values empty to use mock data.

---

## Branding

All colours, fonts, and brand config live in one file:

```
src/services/marketplace/constants/theme.js
```

Change `THEME.colors.green` or `THEME.brand.logoUrl` there and it updates across the entire app.

All English and Sesotho strings live in:

```
src/services/marketplace/constants/translations.js
```

---

## Farmer subscription plans

| Plan | Price | Key features |
|------|-------|-------------|
| Basic | M50/month | Training materials, WhatsApp support, market information |
| Growth | M100/month | Everything in Basic + market access, production planning, performance reports |
| Premium | M150/month | Everything in Growth + priority market access, loan eligibility, business advisory |

---

## Roadmap

- [ ] Connect real backend (marketplace, orders, farmer data services)
- [ ] SMS/WhatsApp push notifications (replace localStorage polling)
- [ ] Farmer registration and authentication
- [ ] Buyer accounts and order history across sessions
- [ ] Farmer data collection and advisory system (survey forms, grouping, recommendations)
- [ ] Admin dashboard with district-level reporting
- [ ] Payment gateway integration (M-Pesa API, EcoCash API)
- [ ] Farmer certification and quality rating system
- [ ] AI-based farming recommendations

---

## Contact

**Khokahano Agri Systems**  
📞 +266 57638217  
✉ bokangmpholo7@gmail.com  
🌐 www.khokahanoagrisystems.ls

---

*Connecting farmers. Transforming poultry. Transforming Lesotho.*