# Product Price Evolution API

## Endpoint: `/price-evolution`

**Method**: `POST`

**Description**: 
Retrieves the historical price evolution of a specific product sold to a specific client. This allows tracking how the selling price for a customer has changed over time.

### Request Body

```json
{
  "client_id": 123,
  "product_id": 456
}
```

- `client_id`: (Integer, Required) The ID of the client.
- `product_id`: (Integer, Required) The ID of the product.

### Response

Returns a JSON array of objects, each representing a transaction (sale) of that product to the client, ordered by date.

```json
[
    {
        "order_id": "ORD-29384",
        "date": "2024-10-15T14:30:00Z",
        "quantity": 10,
        "price_sold": 150.0,
        "price_bought": 120.0
    },
    {
        "order_id": "ORD-33421",
        "date": "2024-11-20T09:15:00Z",
        "quantity": 5,
        "price_sold": 155.0,
        "price_bought": 125.0
    }
]
```

### Error Responses

- **400 Bad Request**:
    - If `client_id` or `product_id` is missing.
    - If IDs are not valid integers.
- **401 Unauthorized**:
    - If the user is not authenticated.


# Modify Order API Specification

## Endpoint: `/modorder`

**Method**: `POST`

**Description**: 
Modifies an existing order. This includes updating product quantities, prices, removing items, changing payment details, and **reassigning the order to a different client**.

### Usage Scenarios
1.  **Correction**: User selected the wrong product or quantity.
2.  **Client Change**: User accidentally assigned the order to "Client A" instead of "Client B".

### Request Body

```json
{
  "details": {
    "o_id": "ORD-12345678",        // (String, Required) The ID of the order to modify
    "client_id": 12,               // (Integer, Optional) ID of the NEW client. If omitted, client remains unchanged.
    "paid": 100.0,                 // (Float) The TOTAL amount paid so far (New Value)
    "ret": 0.0,                    // (Float) Amount returned (if applicable, usually 0)
    "mode": 1,                     // (Integer) Payment mode ID
    "transport": "Domicile",       // (String) Transport method
    "details": [                   // List of products to UPDATE
      {
        "id": 55,                  // (Integer) The ID of the OrderDetails line item
        "quantity": 5,             // (Integer) New Quantity
        "prix": 20.0               // (Float) New Unit Price (Selling Price)
      }
    ]
  },
  "deleted": [                     // List of products to REMOVE from order
    {
      "id": 56,                    // (Integer) OrderDetails ID to delete
      "quantity": 2                // (Integer) Quantity to return to stock
    }
  ]
}
```

### Server-Side Logic Highlights
- **Stock**: 
    - Decreasing quantity in order -> Increases Product Stock.
    - Increasing quantity in order -> Decreases Product Stock (validation checks applied).
- **Client Credit (Debt)**:
    - If `client_id` changes: The previous debt is removed from the old client, and the calculated new debt is added to the new client.
    - If `client_id` is same: The difference in debt is applied.

### Response

```json
{
  "error": false,
  "msg": "Success"  // Optional
}
```

### Error Responses
- **500 Internal Server Error**:
    - If stock becomes negative.
    - If One of the IDs is invalid.
    - `{ "error": true, "msg": "Produit Introuvable" }`
