# API Changes Report: Product Pagination

To address performance issues with a large database, the `AddProduct` GET endpoint has been updated to support pagination.

## Endpoint: `/api/product` (GET)

### New Parameters (Query Params)
- `page` (int, optional): The page number to fetch. Defaults to `1`.
- `page_size` (int, optional): Number of items per page. Defaults to `20`.

### Updated Response Structure
The response is now wrapped in a pagination object.

**Before:**
```json
[
  { "fournisseur": {...}, "product": {...}, ... },
  { "fournisseur": {...}, "product": {...}, ... }
]
```

**After:**
```json
{
  "count": 150,
  "num_pages": 8,
  "current_page": 1,
  "results": [
    { "fournisseur": {...}, "product": {...}, ... },
    { "fournisseur": {...}, "product": {...}, ... }
  ]
}
```

## Endpoint: `/api/filterorder` (POST)

### New Parameters (Query Params)
- `page` (int, optional): The page number to fetch. Defaults to `1`.
- `page_size` (int, optional): Number of items per page. Defaults to `20`.

### Updated Response Structure
The response is now wrapped in a pagination object.

**Before:**
```json
[
  { "client": {...}, "order": {...}, "details": [...] },
  ...
]
```

**After:**
```json
{
  "count": 500,
  "num_pages": 25,
  "current_page": 1,
  "results": [
    { "client": {...}, "order": {...}, "details": [...] },
    ...
  ]
}
```

## Note on Silent Views
...
The following views remain **unchanged** and do **not** support pagination yet:
- `/api/silentpd` (`SilentGetProducts`)
- `/api/silentProducts/getinfo` (`SilentGetProductsInfo`)
- `/api/silentdetails` (`SilentGetInfo`)

## Internal Improvements
- **Atomic Transactions**: Orders and Order modifications are now wrapped in atomic transactions to ensure data integrity and improve performance on SQLite.
- **Prefetching**: Data fetching for Products and Orders now uses `select_related` and `prefetch_related` to minimize database hits (resolving N+1 query issues).
- **Database Aggregations**: Analytics views (`GetTop`, `GetStable`, `GetOrderSalesData`) have been refactored to use Django's `Sum`, `F` expressions, and `annotate`. Calculations are now handled by the database engine, eliminating hundreds of redundant queries and nested loops.
