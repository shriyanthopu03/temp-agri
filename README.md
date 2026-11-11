# AgriTrade Platform

Fullstack agricultural trade and supply chain management platform with role-based access control, farm GPS boundary mapping, quality inspection, buyer marketplace, logistics tracking, and enterprise operations.

## Project Structure

```text
temp-agri/
│
├── backend/
│   ├── config/
│   │   └── Database connection and configurations
│   │
│   ├── controllers/
│   │   └── Request handling and business logic
│   │
│   ├── middleware/
│   │   └── Authentication, authorization and error handling
│   │
│   ├── models/
│   │   └── MongoDB/Mongoose schemas
│   │
│   ├── routes/
│   │   └── Backend API routes
│   │
│   ├── utils/
│   │   └── Helper functions and utilities
│   │
│   ├── uploads/
│   │   └── Uploaded files, if local storage is used
│   │
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   │   └── Static assets
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── .env
│
├── .gitignore
├── package.json
└── README.md
```

## Getting Started

### 1. Running Backend Independently
```bash
cd backend
npm install
npm run dev      # Runs with auto-reload
# or
npm run start    # Starts the Express server on port 5000
npm run seed     # Seeds demo users into MongoDB
```

### 2. Running Frontend Independently
```bash
cd frontend
npm install
npm run dev      # Runs Vite dev server on port 3000
npm run build    # Builds frontend production bundle into dist/
```

### 3. Running Both Together from Root
```bash
cd temp-agri
npm run install:all
npm run dev      # Concurrently runs frontend (port 3000) and backend (port 5000)
```

## Shared Workspace Accounts

The seed command creates these shared workspace accounts:

| Workspace | Email | Password | Role |
| --- | --- | --- | --- |
| Quality Inspection | `qi@gmail.com` | `12345678` | `quality_inspector` |
| Buyer | `buyer@gmail.com` | `12345678` | `buyer` |
| Platform Admin | `admin@gmail.com` | `12345678` | `platform_admin` |
| Logistics Coordinator | `l@gmail.com` | `12345678` | `logistics_coordinator` |
| Farmer | `farmer@agritrade.com` | `Farmer123!` | `farmer` |

Run `npm run seed` from the backend or root after configuring `MONGODB_URL` to create or update them. New users registered through the sign-up flow default to the `farmer` role.

## Features

* **Authentication & Role-Based Access Control**
  * Secure authentication with region- and organization-scoped RBAC.
  * Role-based access to farmers, farms, inventory, logistics, orders, and settlements.

* **Land & Farm Mapping**
  * Interactive map-based visualization of registered farms and agricultural land.
  * Mark and store farm locations and land boundaries directly on the map.
  * Record land area, farm coordinates, and location details.
  * View mapped farms geographically for easier farm identification and management.

* **Farm & Farmer Management**
  * CRUD operations for farmers, farms, and produce categories.
  * Maintain farmer profiles, farm details, land information, and associated produce.

* **Produce & Lot Management**
  * CRUD operations for produce lots and related records.
  * Complete produce lot lifecycle: Created -> Received -> Inspected -> Accepted/Rejected -> Stored -> Allocated -> Dispatched -> Delivered.

* **Quality Grading & Inspection**
  * Configurable quality grading criteria.
  * Quality inspection workflow for produce lots.
  * Maintain complete inspection and grading history.

* **Purchase Order Management**
  * Create and manage purchase orders with line items.
  * Allocate produce lots to orders.
  * Support partial fulfillment and cancellation.
  * Track delivery confirmation.

* **Warehouse & Inventory Management**
  * Track inventory by produce lot, quantity, and storage location.
  * Maintain inventory movement history.
  * Monitor produce from receiving through dispatch.

* **Logistics & Shipment Management**
  * Create and manage shipments.
  * Assign vehicles to shipments.
  * Track dispatch, transit updates, and delivery status.
  * Manage vehicles and transportation information.

* **Farmer Settlement Management**
  * Calculate farmer settlements based on accepted quantity, quality grade, agreed price, and deductions.
  * Maintain settlement history and payment-related records.

* **Dispute Management**
  * Create, track, and resolve disputes related to produce, quality, orders, deliveries, and settlements.

* **Dashboards & Analytics**
  * Role-specific dashboards.
  * Overview of farms, produce, inventory, orders, shipments, and settlements.
  * Search, filtering, and reporting capabilities.

* **Reports & Data Export**
  * Generate operational reports and export CSV audit logs.

* **Notifications**
  * Notifications for important workflow events, order updates, inspections, shipments, deliveries, and settlements.

* **Audit History**
  * Track important actions and changes across the system.
