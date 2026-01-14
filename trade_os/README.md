# TradeOS - Unified Contractor Operations Platform

**Built with LDS (Lefebvre Design Solutions) Streaming Architecture**

TradeOS is a complete contractor operations platform featuring role-based access control, a validation kernel, and modules for CRM, marketing, service agreements, team management, inventory, and remodeler project management.

---

## Quick Start

### Option 1: Open the Single-File App (Recommended)

1. Open `TRADEOS_FINAL.html` in any modern web browser (Chrome, Firefox, Edge, Safari)
2. No server required - everything runs client-side
3. Use the demo login buttons to instantly access any role

### Option 2: Deploy to Web Server

1. Copy `TRADEOS_FINAL.html` to your web server
2. Access via your domain URL
3. Works with any static file server (nginx, Apache, S3, Netlify, Vercel, etc.)

---

## Demo Accounts

| Email | Role | Access Level |
|-------|------|--------------|
| `admin@tradeos.demo` | Administrator | Full system access |
| `office@tradeos.demo` | Office Staff | Scheduling, dispatch, invoicing |
| `tech@tradeos.demo` | Field Technician | Job execution, time tracking |
| `customer@tradeos.demo` | Customer | Self-service portal |

**Password:** Any password works in demo mode. Use the quick login buttons for instant access.

---

## User Instructions

### Navigating the Application

1. **Login Page**: Select a demo role or enter credentials
2. **Sidebar Navigation**: Click menu items to switch modules
3. **Top Bar**: Switch roles via user menu (demo mode), view notifications
4. **Kernel Status**: Green shield badge indicates L1 Kernel is active

### Role-Based Features

#### Administrator
- Full access to all modules
- User management
- System settings
- Approve high-value transactions
- View audit logs

#### Office Staff
- Dashboard and scheduling
- Customer management
- Quote and invoice creation
- Dispatch technicians
- CRM pipeline management
- Process payments

#### Field Technician
- View daily schedule
- Update job status
- Add notes and photos
- Access inventory/parts

#### Customer
- View appointments
- See quotes and invoices
- Track service agreements
- Message company

---

## Modules Overview

### Dashboard
- KPI cards with real-time metrics
- Today's schedule
- Quick stats overview

### CRM (Customer Relationship Management)
- **Pipeline View**: Kanban board with stages (Lead → Qualified → Quote Sent → Won/Lost)
- **Opportunity Tracking**: Value, probability, source attribution
- **Customer Analytics**: Win rates, lead sources

### Marketing
- **Campaigns**: Email, direct mail, digital ads, SMS
- **Reviews**: Multi-platform aggregation (Google, Yelp, Facebook)
- **Referrals**: Track referrer rewards
- **Promotions**: Seasonal offers and discount codes

### Service Agreements
- **Plans**: Bronze ($12.99), Silver ($19.99), Gold ($29.99)
- **Enrollment**: Sign customers up for memberships
- **Equipment Registry**: Track customer HVAC, plumbing, electrical equipment
- **Renewals**: 90-day expiration alerts

### Team
- **Directory**: Employee profiles with contact info
- **Certifications**: Track licenses, expiration dates
- **Training**: Required and completed courses
- **Time Off**: PTO requests and approvals
- **Payroll**: Hours and pay summaries

### Inventory
- **Parts Catalog**: SKUs with cost/sell prices
- **Stock Levels**: In stock, low stock, out of stock
- **Truck Stock**: Per-technician inventory
- **Purchase Orders**: Create, approve, receive POs
- **Suppliers**: Vendor management

### Remodeler
- **Project Phases**: 8-phase workflow tracking
- **Change Orders**: CO approval workflow
- **Photo Timeline**: Document project progress
- **Selections**: Customer finishes and fixtures
- **Draw Schedule**: Payment milestones
- **Punch List**: Final defect tracking

### Settings (Admin only)
- Company configuration
- System preferences

---

## .LDS.JSON File Format Specification

TradeOS uses the **LDS (Lefebvre Design Solutions)** file format for entity definitions. Each `.lds.json` file is a self-contained module with metadata, business logic, and UI components.

### File Structure

```json
{
  "_lds": {
    "uuid": "unique-identifier-2026-001",
    "type": "kernel_definition|ui_component|boundary_definitions|application_manifest",
    "version": "1.0.0",
    "created": "2026-01-14T00:00:00Z",
    "parent": "parent-entity-uuid",
    "phase": 1,
    "sequence": 1,
    "status": "COMPLETE"
  },
  "core": {
    "name": "Entity Name",
    "description": "What this entity does",
    "principle": "Key design principle"
  },
  "features": {
    "feature_1": "Description",
    "feature_2": "Description"
  },
  "react_component": {
    "filename": "ComponentName.tsx",
    "code": "// Full React component code as string"
  },
  "boundaries": {},
  "schema": {}
}
```

### File Types

| File | Purpose |
|------|---------|
| `TRADEOS_KERNEL.lds.json` | Validation engine core |
| `TRADEOS_BOUNDARIES.lds.json` | Role permission definitions |
| `TRADEOS_SHELL.lds.json` | App shell and navigation |
| `TRADEOS_AUTH.lds.json` | Authentication/session management |
| `TRADEOS_CRM.lds.json` | CRM module |
| `TRADEOS_MARKETING.lds.json` | Marketing module |
| `TRADEOS_SERVICE_AGREEMENTS.lds.json` | Agreements module |
| `TRADEOS_TEAM.lds.json` | Team management module |
| `TRADEOS_INVENTORY.lds.json` | Inventory module |
| `TRADEOS_REMODELER.lds.json` | Remodeler module |
| `TRADEOS_ASSEMBLER.lds.json` | Master assembly manifest |
| `config.lds.json` | Global configuration |

### The _lds Metadata Block

```json
"_lds": {
  "uuid": "tradeos-crm-2026-001",    // Unique identifier
  "type": "ui_component",             // Entity type
  "version": "1.0.0",                 // Semantic version
  "created": "2026-01-14T00:00:00Z", // ISO timestamp
  "parent": "tradeos-master-2026-001", // Parent reference
  "phase": 5,                         // Build phase (1-6)
  "sequence": 1,                      // Order within phase
  "status": "COMPLETE"               // Build status
}
```

---

## Architecture

### L0 → L1 → L2 Governance Model

```
┌─────────────────────────────────────────┐
│  L0: HUMAN AUTHORITY                    │
│  (Final decisions, escalations)         │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  L1: LDS KERNEL                         │
│  CHECK-THEN-ACT Validation              │
│  • Every action validated               │
│  • Audit log maintained                 │
│  • Sub-millisecond latency              │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│  L2: UI LAYER (Untrusted Proposer)      │
│  • Proposes actions to Kernel           │
│  • Cannot bypass validation             │
│  • Displays allowed/denied feedback     │
└─────────────────────────────────────────┘
```

### Kernel Invariants

1. **IV01_DETERMINISM**: Same input = same output
2. **IV02_FAIL_CLOSED**: Unknown actions DENIED by default
3. **IV03_SEPARATION_OF_POWERS**: Roles cannot self-escalate
4. **IV04_NO_IMPLICIT_AUTHORITY**: Every action requires explicit permission

### Validation Flow

```javascript
const result = kernel.validate('action:name', {
  authenticated: true,
  mfa_verified: true
});

// Returns: ALLOWED | DENIED | ESCALATE | MISSING_REQUIREMENT
```

---

## Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 18 |
| Styling | Tailwind CSS 3.4 |
| Icons | Lucide React |
| State | React Context + useState |
| Build | Single HTML (CDN-based) |

### CDN Dependencies

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://unpkg.com/react@18.2.0/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
<script src="https://unpkg.com/lucide@latest"></script>
```

---

## Build Phases

The application was built in 6 phases:

| Phase | Name | Entities |
|-------|------|----------|
| 1 | Foundation | Kernel, Boundaries, Shell, Auth |
| 2 | Core Operations | Dashboard, Scheduling, Dispatch, Jobs |
| 3 | Customer Experience | Portal, Communications, Quoting |
| 4 | Financial | Invoicing, QuickBooks, Reporting |
| 5 | Growth | CRM, Marketing, Service Agreements |
| 6 | Operations | Team, Inventory, Remodeler |

**Current Implementation**: Phases 1, 5, and 6 are complete. Phases 2-4 are defined but not yet implemented in the HTML output.

---

## File Manifest

```
trade_os/
├── TRADEOS_FINAL.html           # Complete deployable application
├── TRADEOS_ASSEMBLER.lds.json   # Assembly manifest
├── TRADEOS_KERNEL.lds.json      # Kernel definition
├── TRADEOS_BOUNDARIES.lds.json  # Role boundaries
├── TRADEOS_SHELL.lds.json       # App shell component
├── TRADEOS_AUTH.lds.json        # Auth component
├── TRADEOS_CRM.lds.json         # CRM module
├── TRADEOS_MARKETING.lds.json   # Marketing module
├── TRADEOS_SERVICE_AGREEMENTS.lds.json
├── TRADEOS_TEAM.lds.json        # Team module
├── TRADEOS_INVENTORY.lds.json   # Inventory module
├── TRADEOS_REMODELER.lds.json   # Remodeler module
├── config.lds.json              # Configuration
├── app.jsx                      # Legacy app entry
└── README.md                    # This file
```

---

## Security Model

### Boundaries by Role

**Admin** can:
- View, create, update, delete all records
- Manage users and settings
- Approve high-value transactions
- CANNOT: Modify kernel, delete audit logs, change boundaries

**Office** can:
- Manage scheduling, jobs, customers
- Create invoices and quotes
- Process payments
- CANNOT: Delete customers, refund payments, modify settings

**Field Tech** can:
- View assigned schedule
- Update job status and notes
- Access inventory
- CANNOT: View financials, create invoices, reassign jobs

**Customer** can:
- View own data only
- Request service
- Approve quotes, make payments
- CANNOT: Access other customer data, modify records

### Escalation Thresholds

- Refunds > $10,000 → L0 Human
- Invoices > $50,000 → Admin
- Discounts > 20% → Admin
- Customer deletion → L0 Human

---

## Customization

### Adding New Modules

1. Create a new `.lds.json` file following the format
2. Add the component to `TRADEOS_ASSEMBLER.lds.json`
3. Update routing in the assembler
4. Rebuild `TRADEOS_FINAL.html`

### Modifying Boundaries

Edit `TRADEOS_BOUNDARIES.lds.json`:

```json
{
  "role_name": {
    "allowed": ["action:list"],
    "denied": [{ "action": "action:name", "reason": "Why denied" }],
    "escalation": [{ "condition": "...", "escalateTo": "..." }],
    "requires": ["authenticated"]
  }
}
```

### Theming

Modify the Tailwind config in `TRADEOS_FINAL.html`:

```javascript
tailwind.config = {
  theme: {
    extend: {
      colors: {
        tradeos: {
          primary: '#f97316',    // Orange
          secondary: '#ea580c',  // Darker orange
        }
      }
    }
  }
}
```

---

## Support

- **Documentation**: This README
- **Architecture**: LDS Streaming Architecture
- **Author**: Lefebvre Design Solutions, 2026

---

## License

Proprietary - Lefebvre Design Solutions

---

*TradeOS: Authority flows DOWN only. L2 cannot escalate to L1 permissions.*
