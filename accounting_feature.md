# Accounting Module — Frontend Integration Guide

This guide explains how to integrate the new accounting module into the frontend. All endpoints are prefixed with `/api/accounting/` and require JWT authentication (`is_accounting_user` must be `true`).

## 1. Authentication & Access Control
- **Access Check**: The frontend should check the `is_accounting_user` field in the user profile (e.g., from `/api/session`) to decide whether to show the "Accounting" menu item.
- **Permissions**: If a user without access tries to call these APIs, they will receive a `403 Forbidden` response.

---

## 2. Fiscal Year Workflow

### A. List Fiscal Years
- **Endpoint**: `GET /api/accounting/fiscal-years/`
- **Response**:
```json
[
  {
    "id": 1,
    "year": 2026,
    "is_locked": false,
    "opened_at": "2026-04-24T12:00:00Z",
    "closed_at": null,
    "notes": "",
    "invoice_count": 0,
    "snapshot_count": 0
  }
]
```

### B. Create Fiscal Year
- **Endpoint**: `POST /api/accounting/fiscal-years/`
- **Request Payload**:
```json
{
  "year": 2026,
  "notes": "Optional notes"
}
```
- **Response**: Returns the created Fiscal Year object (same format as list).

### C. Initialize Stock Manually
- **Endpoint**: `POST /api/accounting/fiscal-years/{id}/initialize/`
- **Request Payload**:
```json
{
  "items": [
    { "product_id": 1, "quantity": 50 },
    { "product_id": 2, "quantity": 100 }
  ]
}
```
- **Response**:
```json
{
  "message": "Successfully initialized 2 products for FY-2026.",
  "count": 2
}
```

### D. Closing the Year
- **Endpoint**: `POST /api/accounting/fiscal-years/{id}/close/`
- **Request Payload**:
```json
{
  "create_next_year": true
}
```
- **Response**:
```json
{
  "message": "FY-2026 has been locked. FY-2027 created with 50 carried-over snapshots.",
  "next_year": {
    "id": 2,
    "year": 2027,
    "is_locked": false,
    "opened_at": "2026-04-24T12:05:00Z",
    "closed_at": null,
    "notes": "",
    "invoice_count": 0,
    "snapshot_count": 50
  }
}
```

---

## 3. Stock Snapshots

### A. List Snapshots
- **Endpoint**: `GET /api/accounting/snapshots/?year=2026`
- **Response**:
```json
[
  {
    "id": 1,
    "fiscal_year": 1,
    "product": 1,
    "product_detail": { /* full product object */ },
    "product_name": "Product Name",
    "product_p_id": "P001",
    "initial_qty": 50,
    "current_qty": 50
  }
]
```

### B. Edit Stock Snapshot
- **Endpoint**: `PATCH /api/accounting/snapshots/{id}/`
- **Request Payload**:
```json
{
  "initial_qty": 75,
  "current_qty": 75
}
```
- **Response**: Returns the updated Stock Snapshot object.

---

## 4. Invoice Management

### A. List Invoices
- **Endpoint**: `GET /api/accounting/invoices/?year=2026&type=ACHAT&status=PAID`
- **Response**:
```json
[
  {
    "id": 1,
    "fiscal_year": 1,
    "invoice_number": "FA-2026-00001",
    "invoice_type": "ACHAT",
    "provider": 5,
    "provider_name": "Supplier X",
    "client": null,
    "client_name": "",
    "total": 3000.0,
    "total_paid": 0.0,
    "balance_due": 3000.0,
    "status": "CONFIRMED",
    "payment_mode": "CHECK",
    "created_at": "2026-04-24T12:10:00Z"
  }
]
```

### B. Create an Invoice
- **Endpoint**: `POST /api/accounting/invoices/`
- **Request Payload**:
```json
{
  "fiscal_year_id": 1,
  "invoice_type": "ACHAT", // or "VENTE"
  "provider_id": 5, // required for ACHAT
  "client_id": null, // required for VENTE
  "payment_mode": "CHECK",
  "notes": "Restock products",
  "items": [
    {
      "product_id": 10,
      "quantity": 20,
      "unit_price": 150.00
    },
    {
      "product_name": "One-off service", // if no product_id
      "quantity": 1,
      "unit_price": 500.00
    }
  ]
}
```
- **Response**:
```json
{
  "id": 1,
  "fiscal_year": 1,
  "fiscal_year_display": 2026,
  "invoice_number": "FA-2026-00001",
  "invoice_type": "ACHAT",
  "provider": 5,
  "provider_detail": { /* full provider object */ },
  "client": null,
  "client_detail": null,
  "total": 3500.0,
  "status": "CONFIRMED",
  "payment_mode": "CHECK",
  "notes": "Restock products",
  "total_paid": 0.0,
  "balance_due": 3500.0,
  "items": [
    {
      "id": 1,
      "invoice": 1,
      "product": 10,
      "product_detail": { /* full product object */ },
      "product_name": "Product Name",
      "quantity": 20,
      "unit_price": 150.00,
      "total": 3000.0
    },
    {
      "id": 2,
      "invoice": 1,
      "product": null,
      "product_detail": null,
      "product_name": "One-off service",
      "quantity": 1,
      "unit_price": 500.00,
      "total": 500.0
    }
  ],
  "payments": [],
  "created_at": "2026-04-24T12:10:00Z",
  "updated_at": "2026-04-24T12:10:00Z"
}
```

### C. Retrieve Single Invoice
- **Endpoint**: `GET /api/accounting/invoices/{id}/`
- **Response**: Returns the full invoice object (same format as the creation response above, including nested `items` and `payments`).

---

## 5. Payments (Debt Tracking)

### A. List Payments for an Invoice
- **Endpoint**: `GET /api/accounting/payments/?invoice_id=1`
- **Response**:
```json
[
  {
    "id": 1,
    "invoice": 1,
    "amount": 250.00,
    "payment_mode": "CASH",
    "reference": "Rec#123",
    "paid_at": "2026-04-24T12:15:00Z",
    "notes": "Partial payment"
  }
]
```

### B. Record a Payment
- **Endpoint**: `POST /api/accounting/payments/`
- **Request Payload**:
```json
{
  "invoice_id": 1,
  "amount": 250.00,
  "payment_mode": "CASH",
  "reference": "Rec#123",
  "notes": "Partial payment"
}
```
- **Response**: Returns the created Payment object (same format as list). *The backend automatically updates the invoice status to `PARTIAL` or `PAID`.*

---

## 6. Statistics & Dashboard

### A. Get Stats for Dashboard
- **Endpoint**: `GET /api/accounting/stats/?year=2026`
- **Response**:
```json
{
  "fiscal_year": 2026,
  "is_locked": false,
  "valeur_marchandise": 15000.0,
  "valeur_vendue": 5000.0,
  "total_achats": 2000.0,
  "profit": 3000.0,
  "debts_providers": [
    {
      "invoice_number": "FA-2026-00001",
      "provider": "Supplier X",
      "provider_id": 5,
      "total": 3000.0,
      "paid": 250.0,
      "balance": 2750.0
    }
  ],
  "debts_providers_total": 2750.0,
  "debts_clients": [],
  "debts_clients_total": 0.0,
  "top_products_sold": [
    {
      "product_name": "Product Y",
      "total_qty": 10,
      "total_revenue": 5000.0
    }
  ],
  "invoice_counts": {
    "achat": 1,
    "vente": 1,
    "total": 2
  }
}
```
