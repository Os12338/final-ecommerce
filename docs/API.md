# API Documentation

## Overview

This document provides comprehensive documentation for all public APIs in the final-ecommerce application. All APIs follow RESTful conventions and return JSON responses.

## Base URL

```
Production: https://api.final-ecommerce.com/v1
Development: http://localhost:3000/api/v1
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["Email is required", "Password must be at least 8 characters"]
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Authentication APIs

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-15T10:30:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "User registered successfully"
}
```

**Example Usage:**
```javascript
const response = await fetch('/api/v1/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe'
  })
});

const data = await response.json();
```

### POST /auth/login

Authenticate user and receive access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Product APIs

### GET /products

Retrieve paginated list of products with filtering and sorting.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `category` (string): Filter by category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `search` (string): Search term for product name/description
- `sort` (string): Sort by field (price, name, createdAt)
- `order` (string): Sort order (asc, desc)

**Example Request:**
```http
GET /products?page=1&limit=10&category=electronics&minPrice=100&sort=price&order=asc
```

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "prod_123",
        "name": "Wireless Headphones",
        "description": "High-quality wireless headphones with noise cancellation",
        "price": 199.99,
        "category": "electronics",
        "images": [
          "https://cdn.example.com/products/headphones-1.jpg",
          "https://cdn.example.com/products/headphones-2.jpg"
        ],
        "inStock": true,
        "stockQuantity": 50,
        "ratings": {
          "average": 4.5,
          "count": 123
        },
        "createdAt": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

### GET /products/:id

Retrieve detailed information about a specific product.

**Response:**
```json
{
  "success": true,
  "data": {
    "product": {
      "id": "prod_123",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 199.99,
      "category": "electronics",
      "images": [
        "https://cdn.example.com/products/headphones-1.jpg"
      ],
      "specifications": {
        "brand": "TechBrand",
        "model": "WH-1000XM4",
        "color": "Black",
        "weight": "254g"
      },
      "inStock": true,
      "stockQuantity": 50,
      "ratings": {
        "average": 4.5,
        "count": 123
      },
      "reviews": [
        {
          "id": "review_123",
          "userId": "user_456",
          "userName": "John D.",
          "rating": 5,
          "comment": "Excellent sound quality!",
          "createdAt": "2024-01-14T15:30:00Z"
        }
      ]
    }
  }
}
```

### POST /products (Admin Only)

Create a new product.

**Headers:**
```http
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "category": "electronics",
  "images": ["image1.jpg", "image2.jpg"],
  "specifications": {
    "brand": "Brand Name",
    "model": "Model X"
  },
  "stockQuantity": 100
}
```

## Cart APIs

### GET /cart

Retrieve current user's cart.

**Headers:**
```http
Authorization: Bearer <user-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "cart": {
      "id": "cart_123",
      "userId": "user_123",
      "items": [
        {
          "id": "item_123",
          "productId": "prod_123",
          "product": {
            "id": "prod_123",
            "name": "Wireless Headphones",
            "price": 199.99,
            "images": ["headphones.jpg"]
          },
          "quantity": 2,
          "price": 199.99,
          "total": 399.98
        }
      ],
      "subtotal": 399.98,
      "tax": 32.00,
      "shipping": 9.99,
      "total": 441.97,
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### POST /cart/items

Add item to cart.

**Request Body:**
```json
{
  "productId": "prod_123",
  "quantity": 2
}
```

### PUT /cart/items/:itemId

Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

### DELETE /cart/items/:itemId

Remove item from cart.

## Order APIs

### GET /orders

Retrieve user's order history.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by order status

**Response:**
```json
{
  "success": true,
  "data": {
    "orders": [
      {
        "id": "order_123",
        "orderNumber": "ORD-2024-001",
        "status": "delivered",
        "items": [
          {
            "productId": "prod_123",
            "productName": "Wireless Headphones",
            "quantity": 1,
            "price": 199.99
          }
        ],
        "subtotal": 199.99,
        "tax": 16.00,
        "shipping": 9.99,
        "total": 225.98,
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "US"
        },
        "createdAt": "2024-01-15T10:30:00Z",
        "deliveredAt": "2024-01-18T14:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### POST /orders

Create new order from cart.

**Request Body:**
```json
{
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  },
  "paymentMethod": "card",
  "paymentToken": "pm_1234567890"
}
```

### GET /orders/:id

Get detailed order information.

## Payment APIs

### POST /payments/intent

Create payment intent for checkout.

**Request Body:**
```json
{
  "amount": 22598,
  "currency": "usd",
  "orderId": "order_123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdef",
    "paymentIntentId": "pi_1234567890"
  }
}
```

## User Profile APIs

### GET /users/profile

Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "+1234567890",
      "addresses": [
        {
          "id": "addr_123",
          "type": "shipping",
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "US",
          "isDefault": true
        }
      ],
      "preferences": {
        "newsletter": true,
        "notifications": true
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

### PUT /users/profile

Update user profile.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTHENTICATION_ERROR` | Invalid or missing authentication |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `CONFLICT` | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `SERVER_ERROR` | Internal server error |

## Rate Limiting

API endpoints are rate limited:
- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- Search endpoints: 20 requests per minute

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642262400
```

## Webhooks

### Order Status Updates

Webhook endpoint receives order status change notifications:

**Payload:**
```json
{
  "event": "order.status_changed",
  "data": {
    "orderId": "order_123",
    "status": "shipped",
    "trackingNumber": "1Z999AA1234567890",
    "timestamp": "2024-01-16T10:30:00Z"
  }
}
```

### Payment Events

**Payload:**
```json
{
  "event": "payment.completed",
  "data": {
    "paymentId": "pay_123",
    "orderId": "order_123",
    "amount": 22598,
    "currency": "usd",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```