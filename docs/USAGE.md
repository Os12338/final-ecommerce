# Usage Guide & Integration Examples

## Overview

This guide provides comprehensive examples and best practices for integrating with the final-ecommerce platform. Whether you're building a frontend application, integrating with third-party services, or extending the platform, this guide will help you get started quickly.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Frontend Integration](#frontend-integration)
3. [API Integration Examples](#api-integration-examples)
4. [Component Usage Patterns](#component-usage-patterns)
5. [Authentication & Security](#authentication--security)
6. [E-commerce Workflows](#e-commerce-workflows)
7. [Testing Strategies](#testing-strategies)
8. [Deployment & Production](#deployment--production)

## Quick Start

### Setting Up Your Development Environment

1. **Clone the Repository**
```bash
git clone https://github.com/your-org/final-ecommerce.git
cd final-ecommerce
```

2. **Install Dependencies**
```bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
```

3. **Environment Configuration**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# Authentication
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"

# Payment Processing
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email Service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Storage
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_S3_BUCKET="your-bucket-name"
AWS_REGION="us-east-1"
```

4. **Start Development Server**
```bash
npm run dev
```

## Frontend Integration

### React Application Setup

Create a new React application that integrates with the e-commerce API:

```jsx
// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gray-50">
              <Header />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/product/:id" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                </Routes>
              </main>
            </div>
          </ToastProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
```

### API Client Setup

Create a centralized API client for consistent communication:

```javascript
// src/services/apiClient.js
class APIClient {
  constructor(baseURL = process.env.REACT_APP_API_URL) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.data.token);
    return response;
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Product methods
  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/products?${queryString}`);
  }

  async getProduct(id) {
    return this.request(`/products/${id}`);
  }

  // Cart methods
  async getCart() {
    return this.request('/cart');
  }

  async addToCart(productId, quantity) {
    return this.request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  }

  async updateCartItem(itemId, quantity) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeCartItem(itemId) {
    return this.request(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  // Order methods
  async createOrder(orderData) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/orders?${queryString}`);
  }
}

export const apiClient = new APIClient();
```

### Context Providers

Set up React contexts for state management:

```jsx
// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token and get user data
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async () => {
    try {
      const response = await apiClient.request('/auth/verify');
      setUser(response.data.user);
    } catch (error) {
      localStorage.removeItem('authToken');
      apiClient.clearToken();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const response = await apiClient.login(credentials);
    setUser(response.data.user);
    return response;
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

```jsx
// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCart();
      setCart(response.data.cart);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      const response = await apiClient.addToCart(productId, quantity);
      setCart(response.data.cart);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      const response = await apiClient.updateCartItem(itemId, quantity);
      setCart(response.data.cart);
    } catch (error) {
      throw error;
    }
  };

  const removeItem = async (itemId) => {
    try {
      await apiClient.removeCartItem(itemId);
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.id !== itemId)
      }));
    } catch (error) {
      throw error;
    }
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
```

## API Integration Examples

### Complete Product Listing with Filters

```jsx
// src/components/ProductListing.jsx
import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import ProductCard from './ProductCard';
import ProductFilter from './ProductFilter';
import Pagination from './Pagination';

const ProductListing = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [pagination, setPagination] = useState({});
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchProducts();
  }, [filters, sortBy, sortOrder]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        sort: sortBy,
        order: sortOrder,
        ...filters,
      };

      const response = await apiClient.getProducts(params);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handlePageChange = (page) => {
    fetchProducts(page);
  };

  if (loading) {
    return <ProductListingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <ProductFilter
            filters={filterConfig}
            activeFilters={filters}
            onFilterChange={handleFilterChange}
          />
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Sort Controls */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing {products.length} of {pagination.total} products
            </p>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                handleSortChange(field, order);
              }}
              className="border rounded-lg px-3 py-2"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="price-asc">Price (Low to High)</option>
              <option value="price-desc">Price (High to Low)</option>
              <option value="rating-desc">Highest Rated</option>
            </select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          )}
        </main>
      </div>
    </div>
  );
};

const filterConfig = [
  {
    id: 'category',
    name: 'Category',
    type: 'checkbox',
    options: [
      { value: 'electronics', label: 'Electronics' },
      { value: 'clothing', label: 'Clothing' },
      { value: 'books', label: 'Books' },
      { value: 'home', label: 'Home & Garden' },
    ]
  },
  {
    id: 'price',
    name: 'Price Range',
    type: 'range',
    min: 0,
    max: 1000
  },
  {
    id: 'rating',
    name: 'Customer Rating',
    type: 'checkbox',
    options: [
      { value: '4', label: '4 Stars & Up' },
      { value: '3', label: '3 Stars & Up' },
      { value: '2', label: '2 Stars & Up' },
    ]
  }
];

export default ProductListing;
```

### Complete Checkout Flow

```jsx
// src/components/CheckoutFlow.jsx
import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import AddressForm from './AddressForm';
import PaymentForm from './PaymentForm';
import OrderSummary from './OrderSummary';

const CheckoutFlow = () => {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState(null);

  const steps = [
    { id: 1, name: 'Shipping', component: ShippingStep },
    { id: 2, name: 'Payment', component: PaymentStep },
    { id: 3, name: 'Review', component: ReviewStep },
    { id: 4, name: 'Confirmation', component: ConfirmationStep },
  ];

  const handleShippingSubmit = (address) => {
    setShippingAddress(address);
    setCurrentStep(2);
  };

  const handlePaymentSubmit = (payment) => {
    setPaymentMethod(payment);
    setCurrentStep(3);
  };

  const handleOrderSubmit = async () => {
    try {
      setLoading(true);
      const orderData = {
        shippingAddress,
        paymentMethod: paymentMethod.id,
        items: cart.items,
      };

      const response = await apiClient.createOrder(orderData);
      setOrder(response.data.order);
      clearCart();
      setCurrentStep(4);
    } catch (error) {
      console.error('Order creation failed:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${
                index < steps.length - 1 ? 'flex-1' : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                  step.id <= currentStep
                    ? 'bg-blue-600'
                    : 'bg-gray-300'
                }`}
              >
                {step.id}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-900">
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-4 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <CurrentStepComponent
        cart={cart}
        shippingAddress={shippingAddress}
        paymentMethod={paymentMethod}
        order={order}
        loading={loading}
        onShippingSubmit={handleShippingSubmit}
        onPaymentSubmit={handlePaymentSubmit}
        onOrderSubmit={handleOrderSubmit}
        onBack={() => setCurrentStep(currentStep - 1)}
      />
    </div>
  );
};

const ShippingStep = ({ onShippingSubmit }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <h2 className="text-2xl font-bold mb-6">Shipping Address</h2>
      <AddressForm onSubmit={onShippingSubmit} />
    </div>
    <div>
      <OrderSummary />
    </div>
  </div>
);

const PaymentStep = ({ onPaymentSubmit, onBack }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Method</h2>
      <PaymentForm onSubmit={onPaymentSubmit} />
      <button
        onClick={onBack}
        className="mt-4 text-blue-600 hover:text-blue-800"
      >
        ← Back to Shipping
      </button>
    </div>
    <div>
      <OrderSummary />
    </div>
  </div>
);

const ReviewStep = ({
  cart,
  shippingAddress,
  paymentMethod,
  loading,
  onOrderSubmit,
  onBack,
}) => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>
    
    <div className="space-y-6">
      {/* Order Items */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Order Items</h3>
        {cart.items.map(item => (
          <div key={item.id} className="flex justify-between py-2">
            <span>{item.product.name} × {item.quantity}</span>
            <span>${item.total.toFixed(2)}</span>
          </div>
        ))}
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
        <p>{shippingAddress.firstName} {shippingAddress.lastName}</p>
        <p>{shippingAddress.street}</p>
        <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
      </div>

      {/* Payment Method */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Payment Method</h3>
        <p>**** **** **** {paymentMethod.last4}</p>
      </div>

      {/* Order Total */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between text-xl font-bold">
          <span>Total</span>
          <span>${cart.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Back to Payment
        </button>
        <button
          onClick={onOrderSubmit}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Place Order'}
        </button>
      </div>
    </div>
  </div>
);

const ConfirmationStep = ({ order }) => (
  <div className="text-center">
    <div className="mb-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Order Confirmed!</h2>
      <p className="text-gray-600">Your order #{order.orderNumber} has been placed successfully.</p>
    </div>

    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Order Details</h3>
      <div className="text-left space-y-2">
        <div className="flex justify-between">
          <span>Order Number:</span>
          <span className="font-medium">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Total:</span>
          <span className="font-medium">${order.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated Delivery:</span>
          <span className="font-medium">3-5 business days</span>
        </div>
      </div>
    </div>

    <div className="space-x-4">
      <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Track Your Order
      </button>
      <button className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
        Continue Shopping
      </button>
    </div>
  </div>
);

export default CheckoutFlow;
```

## Component Usage Patterns

### Custom Hooks for Common Operations

```javascript
// src/hooks/useProducts.js
import { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';

export const useProducts = (initialFilters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { page, limit: 12, ...filters };
      const response = await apiClient.getProducts(params);
      
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return {
    products,
    loading,
    error,
    filters,
    pagination,
    updateFilters,
    clearFilters,
    refetch: fetchProducts,
  };
};

// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// src/hooks/useLocalStorage.js
import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
```

### Error Handling Patterns

```jsx
// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Something went wrong
                </h3>
              </div>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Refresh Page
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer text-gray-600">
                  Error Details (Development Only)
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-red-600 overflow-auto">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## Authentication & Security

### JWT Token Management

```javascript
// src/utils/tokenManager.js
class TokenManager {
  constructor() {
    this.TOKEN_KEY = 'authToken';
    this.REFRESH_TOKEN_KEY = 'refreshToken';
  }

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token) {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  setRefreshToken(refreshToken) {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/v1/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      this.setToken(data.data.token);
      return data.data.token;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }
}

export const tokenManager = new TokenManager();
```

### Protected Routes

```jsx
// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
```

## E-commerce Workflows

### Complete Search Implementation

```jsx
// src/components/SearchBar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { apiClient } from '../services/apiClient';

const SearchBar = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef();

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery) => {
    try {
      setLoading(true);
      const response = await apiClient.getProducts({
        search: searchQuery,
        limit: 8
      });
      setResults(response.data.products);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResultClick = (product) => {
    setQuery('');
    setShowResults(false);
    onResultSelect?.(product);
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-lg">
      <div className="relative">
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin h-4 w-4 border-2 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {results.map(product => (
            <div
              key={product.id}
              onClick={() => handleResultClick(product)}
              className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-12 h-12 object-cover rounded"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{product.name}</p>
                <p className="text-sm text-gray-500">${product.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
```

## Testing Strategies

### Unit Testing Examples

```javascript
// src/utils/__tests__/formatCurrency.test.js
import { formatCurrency } from '../formatCurrency';

describe('formatCurrency', () => {
  it('formats USD currency correctly', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
    expect(formatCurrency(0)).toBe('$0.00');
    expect(formatCurrency(999.99)).toBe('$999.99');
  });

  it('formats different currencies', () => {
    expect(formatCurrency(1234.56, 'EUR', 'de-DE')).toBe('1.234,56 €');
    expect(formatCurrency(1234.56, 'JPY', 'ja-JP')).toBe('¥1,235');
  });

  it('handles edge cases', () => {
    expect(formatCurrency(0.01)).toBe('$0.01');
    expect(formatCurrency(1000000)).toBe('$1,000,000.00');
  });
});

// src/components/__tests__/ProductCard.test.jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../ProductCard';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  originalPrice: 129.99,
  images: ['test-image.jpg'],
  rating: { average: 4.5, count: 100 },
  inStock: true,
};

describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
    expect(screen.getByText('$129.99')).toBeInTheDocument();
  });

  it('calls onAddToCart when button is clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    
    fireEvent.click(screen.getByText('Add to Cart'));
    
    expect(mockAddToCart).toHaveBeenCalledWith('1', 1);
  });

  it('shows out of stock state', () => {
    const outOfStockProduct = { ...mockProduct, inStock: false };
    render(<ProductCard product={outOfStockProduct} />);
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Integration Testing

```javascript
// src/__tests__/checkoutFlow.integration.test.jsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CheckoutFlow from '../components/CheckoutFlow';
import { AuthProvider } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';

// Mock API client
jest.mock('../services/apiClient', () => ({
  apiClient: {
    createOrder: jest.fn(),
    getCart: jest.fn(),
  },
}));

const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AuthProvider>
  </BrowserRouter>
);

describe('Checkout Flow Integration', () => {
  it('completes full checkout process', async () => {
    const mockOrder = {
      id: 'order_123',
      orderNumber: 'ORD-2024-001',
      total: 99.99,
    };

    require('../services/apiClient').apiClient.createOrder.mockResolvedValue({
      data: { order: mockOrder },
    });

    render(
      <TestWrapper>
        <CheckoutFlow />
      </TestWrapper>
    );

    // Fill shipping address
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John' },
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'Doe' },
    });
    // ... fill other fields

    fireEvent.click(screen.getByText('Continue to Payment'));

    // Fill payment information
    await waitFor(() => {
      expect(screen.getByText('Payment Method')).toBeInTheDocument();
    });

    // ... continue with payment and order confirmation
    
    await waitFor(() => {
      expect(screen.getByText('Order Confirmed!')).toBeInTheDocument();
      expect(screen.getByText('ORD-2024-001')).toBeInTheDocument();
    });
  });
});
```

## Deployment & Production

### Environment Configuration

```bash
# .env.production
NODE_ENV=production
REACT_APP_API_URL=https://api.yourdomain.com/v1
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
REACT_APP_GOOGLE_ANALYTICS_ID=GA_MEASUREMENT_ID
```

### Docker Configuration

```dockerfile
# Dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        # Enable gzip compression
        gzip on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    }
}
```

### Performance Optimization

```javascript
// src/utils/performanceMonitoring.js
export const measurePerformance = (name, fn) => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`${name} failed after ${end - start} milliseconds:`, error);
      throw error;
    }
  };
};

// Usage
const optimizedFetchProducts = measurePerformance('fetchProducts', fetchProducts);
```

This comprehensive usage guide provides practical examples and patterns for building a complete e-commerce application. Each section includes working code examples that can be adapted to your specific needs.