# Function Documentation

## Overview

This document provides comprehensive documentation for all public functions in the final-ecommerce application. Functions are organized by module and include detailed parameter descriptions, return values, examples, and usage guidelines.

## Documentation Standards

All functions should follow JSDoc conventions:

```javascript
/**
 * Brief description of what the function does
 * 
 * @param {Type} paramName - Description of parameter
 * @param {Type} [optionalParam] - Description of optional parameter
 * @param {Object} options - Configuration object
 * @param {string} options.property - Description of object property
 * @returns {Type} Description of return value
 * @throws {Error} Description of when errors are thrown
 * @example
 * // Usage example
 * const result = functionName(param1, param2);
 * 
 * @since 1.0.0
 * @author Developer Name
 */
```

## Authentication Functions

### `authenticateUser(credentials)`

Authenticates a user with email and password.

```javascript
/**
 * Authenticates a user with the provided credentials
 * 
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email address
 * @param {string} credentials.password - User's password
 * @param {boolean} [credentials.rememberMe=false] - Whether to persist the session
 * @returns {Promise<AuthResult>} Authentication result with user data and token
 * @throws {AuthenticationError} When credentials are invalid
 * @throws {ValidationError} When email format is invalid
 * 
 * @example
 * try {
 *   const result = await authenticateUser({
 *     email: 'user@example.com',
 *     password: 'securePassword123',
 *     rememberMe: true
 *   });
 *   console.log('Login successful:', result.user);
 *   localStorage.setItem('token', result.token);
 * } catch (error) {
 *   console.error('Login failed:', error.message);
 * }
 * 
 * @since 1.0.0
 */
async function authenticateUser(credentials) {
  validateEmail(credentials.email);
  validatePassword(credentials.password);
  
  const response = await apiClient.post('/auth/login', credentials);
  
  if (!response.success) {
    throw new AuthenticationError(response.error.message);
  }
  
  return {
    user: response.data.user,
    token: response.data.token,
    refreshToken: response.data.refreshToken
  };
}
```

### `generatePasswordHash(password, salt)`

Generates a secure hash for password storage.

```javascript
/**
 * Generates a secure hash for password storage using bcrypt
 * 
 * @param {string} password - Plain text password to hash
 * @param {number} [salt=12] - Salt rounds for bcrypt (default: 12)
 * @returns {Promise<string>} Hashed password string
 * @throws {Error} When password is too weak or hashing fails
 * 
 * @example
 * const hashedPassword = await generatePasswordHash('userPassword123');
 * // Returns: $2b$12$xyz...
 * 
 * @since 1.0.0
 */
async function generatePasswordHash(password, salt = 12) {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  
  return bcrypt.hash(password, salt);
}
```

### `verifyToken(token)`

Verifies and decodes a JWT token.

```javascript
/**
 * Verifies and decodes a JWT token
 * 
 * @param {string} token - JWT token to verify
 * @returns {Object} Decoded token payload
 * @throws {TokenExpiredError} When token has expired
 * @throws {InvalidTokenError} When token is malformed or invalid
 * 
 * @example
 * try {
 *   const payload = verifyToken(req.headers.authorization);
 *   console.log('User ID:', payload.userId);
 * } catch (error) {
 *   return res.status(401).json({ error: 'Invalid token' });
 * }
 * 
 * @since 1.0.0
 */
function verifyToken(token) {
  try {
    return jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new TokenExpiredError('Token has expired');
    }
    throw new InvalidTokenError('Invalid token');
  }
}
```

## Product Functions

### `calculateDiscountedPrice(originalPrice, discount)`

Calculates the discounted price for a product.

```javascript
/**
 * Calculates the discounted price based on original price and discount
 * 
 * @param {number} originalPrice - Original product price
 * @param {Object} discount - Discount configuration
 * @param {string} discount.type - Discount type ('percentage' | 'fixed')
 * @param {number} discount.value - Discount value (percentage or fixed amount)
 * @param {number} [discount.maxDiscount] - Maximum discount amount for percentage discounts
 * @returns {number} Final discounted price rounded to 2 decimal places
 * @throws {Error} When originalPrice is negative or discount is invalid
 * 
 * @example
 * // Percentage discount
 * const discountedPrice = calculateDiscountedPrice(100, {
 *   type: 'percentage',
 *   value: 20,
 *   maxDiscount: 15
 * });
 * console.log(discountedPrice); // 85.00 (capped at $15 discount)
 * 
 * // Fixed amount discount
 * const discountedPrice = calculateDiscountedPrice(100, {
 *   type: 'fixed',
 *   value: 25
 * });
 * console.log(discountedPrice); // 75.00
 * 
 * @since 1.0.0
 */
function calculateDiscountedPrice(originalPrice, discount) {
  if (originalPrice < 0) {
    throw new Error('Original price cannot be negative');
  }
  
  if (!discount || !discount.type || discount.value < 0) {
    throw new Error('Invalid discount configuration');
  }
  
  let discountAmount = 0;
  
  if (discount.type === 'percentage') {
    discountAmount = (originalPrice * discount.value) / 100;
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }
  } else if (discount.type === 'fixed') {
    discountAmount = Math.min(discount.value, originalPrice);
  }
  
  const finalPrice = originalPrice - discountAmount;
  return Math.round(finalPrice * 100) / 100;
}
```

### `filterProducts(products, filters)`

Filters an array of products based on provided criteria.

```javascript
/**
 * Filters products based on multiple criteria
 * 
 * @param {Product[]} products - Array of products to filter
 * @param {Object} filters - Filter criteria
 * @param {string[]} [filters.categories] - Filter by categories
 * @param {Object} [filters.priceRange] - Price range filter
 * @param {number} filters.priceRange.min - Minimum price
 * @param {number} filters.priceRange.max - Maximum price
 * @param {number} [filters.minRating] - Minimum rating filter
 * @param {string} [filters.search] - Search term for name/description
 * @param {boolean} [filters.inStockOnly] - Only show in-stock products
 * @returns {Product[]} Filtered array of products
 * 
 * @example
 * const filteredProducts = filterProducts(allProducts, {
 *   categories: ['electronics', 'accessories'],
 *   priceRange: { min: 50, max: 500 },
 *   minRating: 4.0,
 *   search: 'wireless',
 *   inStockOnly: true
 * });
 * 
 * @since 1.0.0
 */
function filterProducts(products, filters = {}) {
  return products.filter(product => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(product.category)) {
        return false;
      }
    }
    
    // Price range filter
    if (filters.priceRange) {
      const { min, max } = filters.priceRange;
      if (product.price < min || product.price > max) {
        return false;
      }
    }
    
    // Rating filter
    if (filters.minRating && product.rating.average < filters.minRating) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableText = `${product.name} ${product.description}`.toLowerCase();
      if (!searchableText.includes(searchTerm)) {
        return false;
      }
    }
    
    // Stock filter
    if (filters.inStockOnly && !product.inStock) {
      return false;
    }
    
    return true;
  });
}
```

### `sortProducts(products, sortBy, order)`

Sorts an array of products by specified criteria.

```javascript
/**
 * Sorts products by specified field and order
 * 
 * @param {Product[]} products - Array of products to sort
 * @param {string} sortBy - Field to sort by ('name' | 'price' | 'rating' | 'createdAt')
 * @param {string} [order='asc'] - Sort order ('asc' | 'desc')
 * @returns {Product[]} Sorted array of products (new array, original unchanged)
 * @throws {Error} When sortBy field is invalid
 * 
 * @example
 * // Sort by price ascending
 * const sortedProducts = sortProducts(products, 'price', 'asc');
 * 
 * // Sort by rating descending
 * const topRatedProducts = sortProducts(products, 'rating', 'desc');
 * 
 * @since 1.0.0
 */
function sortProducts(products, sortBy, order = 'asc') {
  const validSortFields = ['name', 'price', 'rating', 'createdAt'];
  
  if (!validSortFields.includes(sortBy)) {
    throw new Error(`Invalid sort field: ${sortBy}`);
  }
  
  const sortedProducts = [...products];
  
  sortedProducts.sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'rating':
        aValue = a.rating.average;
        bValue = b.rating.average;
        break;
      case 'createdAt':
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
    }
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
  
  return sortedProducts;
}
```

## Cart Functions

### `addToCart(cart, productId, quantity)`

Adds a product to the shopping cart.

```javascript
/**
 * Adds a product to the shopping cart or updates quantity if already present
 * 
 * @param {Cart} cart - Current cart state
 * @param {string} productId - ID of product to add
 * @param {number} [quantity=1] - Quantity to add
 * @param {Object} [options] - Additional options
 * @param {boolean} [options.replace=false] - Replace quantity instead of adding
 * @returns {Cart} Updated cart object
 * @throws {Error} When product is not found or out of stock
 * 
 * @example
 * const updatedCart = addToCart(currentCart, 'prod_123', 2);
 * 
 * // Replace quantity instead of adding
 * const updatedCart = addToCart(currentCart, 'prod_123', 5, { replace: true });
 * 
 * @since 1.0.0
 */
function addToCart(cart, productId, quantity = 1, options = {}) {
  const product = getProductById(productId);
  
  if (!product) {
    throw new Error(`Product not found: ${productId}`);
  }
  
  if (!product.inStock) {
    throw new Error(`Product is out of stock: ${product.name}`);
  }
  
  const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
  const newCart = { ...cart };
  
  if (existingItemIndex >= 0) {
    const existingItem = newCart.items[existingItemIndex];
    const newQuantity = options.replace ? quantity : existingItem.quantity + quantity;
    
    if (newQuantity > product.stockQuantity) {
      throw new Error(`Insufficient stock. Available: ${product.stockQuantity}`);
    }
    
    newCart.items[existingItemIndex] = {
      ...existingItem,
      quantity: newQuantity,
      total: newQuantity * product.price
    };
  } else {
    if (quantity > product.stockQuantity) {
      throw new Error(`Insufficient stock. Available: ${product.stockQuantity}`);
    }
    
    newCart.items.push({
      id: generateCartItemId(),
      productId,
      product: {
        id: product.id,
        name: product.name,
        price: product.price,
        images: product.images
      },
      quantity,
      price: product.price,
      total: quantity * product.price
    });
  }
  
  return recalculateCartTotals(newCart);
}
```

### `calculateCartTotals(cart)`

Calculates cart subtotal, tax, shipping, and total.

```javascript
/**
 * Calculates all cart totals including subtotal, tax, shipping, and final total
 * 
 * @param {Cart} cart - Cart object to calculate totals for
 * @param {Object} [options] - Calculation options
 * @param {number} [options.taxRate=0.08] - Tax rate (default 8%)
 * @param {Object} [options.shipping] - Shipping configuration
 * @param {number} [options.shipping.freeThreshold=75] - Free shipping threshold
 * @param {number} [options.shipping.rate=9.99] - Shipping rate
 * @param {string} [options.discountCode] - Discount code to apply
 * @returns {CartTotals} Object containing all calculated totals
 * 
 * @example
 * const totals = calculateCartTotals(cart, {
 *   taxRate: 0.0825,
 *   shipping: { freeThreshold: 50, rate: 7.99 },
 *   discountCode: 'SAVE10'
 * });
 * 
 * console.log(`Total: $${totals.total}`);
 * 
 * @since 1.0.0
 */
function calculateCartTotals(cart, options = {}) {
  const { taxRate = 0.08, shipping = {}, discountCode } = options;
  const { freeThreshold = 75, rate: shippingRate = 9.99 } = shipping;
  
  // Calculate subtotal
  const subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
  
  // Apply discount
  let discount = 0;
  if (discountCode) {
    discount = calculateDiscount(subtotal, discountCode);
  }
  
  const discountedSubtotal = subtotal - discount;
  
  // Calculate tax on discounted subtotal
  const tax = discountedSubtotal * taxRate;
  
  // Calculate shipping
  const shippingCost = discountedSubtotal >= freeThreshold ? 0 : shippingRate;
  
  // Calculate final total
  const total = discountedSubtotal + tax + shippingCost;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    shipping: Math.round(shippingCost * 100) / 100,
    total: Math.round(total * 100) / 100,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0)
  };
}
```

## Order Functions

### `createOrder(cart, orderData)`

Creates a new order from cart data.

```javascript
/**
 * Creates a new order from the provided cart and order data
 * 
 * @param {Cart} cart - Cart object containing items
 * @param {Object} orderData - Order information
 * @param {string} orderData.userId - ID of the user placing the order
 * @param {Address} orderData.shippingAddress - Shipping address
 * @param {Address} [orderData.billingAddress] - Billing address (uses shipping if not provided)
 * @param {string} orderData.paymentMethod - Payment method ID
 * @param {string} [orderData.notes] - Special instructions
 * @returns {Promise<Order>} Created order object
 * @throws {Error} When cart is empty or payment processing fails
 * 
 * @example
 * try {
 *   const order = await createOrder(cart, {
 *     userId: 'user_123',
 *     shippingAddress: userAddress,
 *     paymentMethod: 'card_456',
 *     notes: 'Leave at front door'
 *   });
 *   
 *   console.log(`Order created: ${order.orderNumber}`);
 * } catch (error) {
 *   console.error('Order creation failed:', error.message);
 * }
 * 
 * @since 1.0.0
 */
async function createOrder(cart, orderData) {
  if (!cart.items || cart.items.length === 0) {
    throw new Error('Cannot create order from empty cart');
  }
  
  // Validate inventory
  await validateInventory(cart.items);
  
  // Calculate final totals
  const totals = calculateCartTotals(cart);
  
  // Generate order number
  const orderNumber = generateOrderNumber();
  
  // Create order object
  const order = {
    id: generateOrderId(),
    orderNumber,
    userId: orderData.userId,
    status: 'pending',
    items: cart.items.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      price: item.price,
      total: item.total
    })),
    subtotal: totals.subtotal,
    tax: totals.tax,
    shipping: totals.shipping,
    total: totals.total,
    shippingAddress: orderData.shippingAddress,
    billingAddress: orderData.billingAddress || orderData.shippingAddress,
    paymentMethod: orderData.paymentMethod,
    notes: orderData.notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Process payment
  const paymentResult = await processPayment(order, orderData.paymentMethod);
  
  if (!paymentResult.success) {
    throw new Error(`Payment failed: ${paymentResult.error}`);
  }
  
  order.paymentId = paymentResult.paymentId;
  order.status = 'confirmed';
  
  // Save order to database
  const savedOrder = await saveOrder(order);
  
  // Update inventory
  await updateInventory(cart.items);
  
  // Send confirmation email
  await sendOrderConfirmation(savedOrder);
  
  return savedOrder;
}
```

### `updateOrderStatus(orderId, newStatus, trackingInfo)`

Updates an order's status and tracking information.

```javascript
/**
 * Updates an order's status and optional tracking information
 * 
 * @param {string} orderId - ID of the order to update
 * @param {string} newStatus - New order status
 * @param {Object} [trackingInfo] - Optional tracking information
 * @param {string} [trackingInfo.trackingNumber] - Tracking number
 * @param {string} [trackingInfo.carrier] - Shipping carrier
 * @param {string} [trackingInfo.estimatedDelivery] - Estimated delivery date
 * @returns {Promise<Order>} Updated order object
 * @throws {Error} When order is not found or status transition is invalid
 * 
 * @example
 * const updatedOrder = await updateOrderStatus('order_123', 'shipped', {
 *   trackingNumber: '1Z999AA1234567890',
 *   carrier: 'UPS',
 *   estimatedDelivery: '2024-01-20'
 * });
 * 
 * @since 1.0.0
 */
async function updateOrderStatus(orderId, newStatus, trackingInfo = {}) {
  const order = await getOrderById(orderId);
  
  if (!order) {
    throw new Error(`Order not found: ${orderId}`);
  }
  
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: []
  };
  
  if (!validTransitions[order.status].includes(newStatus)) {
    throw new Error(`Invalid status transition: ${order.status} -> ${newStatus}`);
  }
  
  const updatedOrder = {
    ...order,
    status: newStatus,
    updatedAt: new Date().toISOString()
  };
  
  // Add tracking information if provided
  if (trackingInfo.trackingNumber) {
    updatedOrder.trackingNumber = trackingInfo.trackingNumber;
    updatedOrder.carrier = trackingInfo.carrier;
    updatedOrder.estimatedDelivery = trackingInfo.estimatedDelivery;
  }
  
  // Set status-specific timestamps
  if (newStatus === 'shipped') {
    updatedOrder.shippedAt = new Date().toISOString();
  } else if (newStatus === 'delivered') {
    updatedOrder.deliveredAt = new Date().toISOString();
  }
  
  const savedOrder = await saveOrder(updatedOrder);
  
  // Send status update notification
  await sendStatusUpdateNotification(savedOrder);
  
  // Trigger webhook if configured
  if (process.env.ORDER_WEBHOOK_URL) {
    await triggerOrderWebhook(savedOrder, newStatus);
  }
  
  return savedOrder;
}
```

## Utility Functions

### `formatCurrency(amount, currency, locale)`

Formats a number as currency with proper localization.

```javascript
/**
 * Formats a number as currency with proper localization
 * 
 * @param {number} amount - Amount to format
 * @param {string} [currency='USD'] - Currency code (ISO 4217)
 * @param {string} [locale='en-US'] - Locale for formatting
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(1234.56); // "$1,234.56"
 * formatCurrency(1234.56, 'EUR', 'de-DE'); // "1.234,56 €"
 * formatCurrency(1234.56, 'JPY', 'ja-JP'); // "¥1,235"
 * 
 * @since 1.0.0
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency
  }).format(amount);
}
```

### `generateId(prefix, length)`

Generates a unique ID with optional prefix.

```javascript
/**
 * Generates a unique ID with optional prefix
 * 
 * @param {string} [prefix=''] - Prefix for the ID
 * @param {number} [length=8] - Length of the random part
 * @returns {string} Generated unique ID
 * 
 * @example
 * generateId(); // "a1b2c3d4"
 * generateId('user'); // "user_a1b2c3d4"
 * generateId('order', 12); // "order_a1b2c3d4e5f6"
 * 
 * @since 1.0.0
 */
function generateId(prefix = '', length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return prefix ? `${prefix}_${result}` : result;
}
```

### `validateEmail(email)`

Validates an email address format.

```javascript
/**
 * Validates an email address format using RFC 5322 standard
 * 
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid, false otherwise
 * @throws {ValidationError} When email is required but not provided
 * 
 * @example
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid-email'); // false
 * validateEmail(''); // throws ValidationError
 * 
 * @since 1.0.0
 */
function validateEmail(email) {
  if (!email) {
    throw new ValidationError('Email is required');
  }
  
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
}
```

### `debounce(func, delay)`

Creates a debounced version of a function.

```javascript
/**
 * Creates a debounced version of the provided function
 * 
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 * 
 * @example
 * const debouncedSearch = debounce((query) => {
 *   console.log('Searching for:', query);
 * }, 300);
 * 
 * // Only the last call within 300ms will execute
 * debouncedSearch('a');
 * debouncedSearch('ab');
 * debouncedSearch('abc'); // Only this will execute
 * 
 * @since 1.0.0
 */
function debounce(func, delay) {
  let timeoutId;
  
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}
```

## Error Handling Functions

### `createCustomError(name, message, statusCode)`

Creates a custom error with additional properties.

```javascript
/**
 * Creates a custom error class with additional properties
 * 
 * @param {string} name - Error name/type
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Object} [details] - Additional error details
 * @returns {Error} Custom error instance
 * 
 * @example
 * const error = createCustomError('ValidationError', 'Invalid input', 400, {
 *   field: 'email',
 *   code: 'INVALID_FORMAT'
 * });
 * 
 * throw error;
 * 
 * @since 1.0.0
 */
function createCustomError(name, message, statusCode = 500, details = {}) {
  const error = new Error(message);
  error.name = name;
  error.statusCode = statusCode;
  error.details = details;
  error.timestamp = new Date().toISOString();
  
  return error;
}
```

## Testing Functions

### `createMockProduct(overrides)`

Creates a mock product object for testing.

```javascript
/**
 * Creates a mock product object with default values for testing
 * 
 * @param {Object} [overrides={}] - Properties to override in the mock product
 * @returns {Product} Mock product object
 * 
 * @example
 * const product = createMockProduct({
 *   name: 'Test Product',
 *   price: 99.99
 * });
 * 
 * expect(product.id).toBeDefined();
 * expect(product.name).toBe('Test Product');
 * 
 * @since 1.0.0
 */
function createMockProduct(overrides = {}) {
  return {
    id: generateId('prod'),
    name: 'Mock Product',
    description: 'A test product for unit testing',
    price: 29.99,
    originalPrice: null,
    category: 'test',
    images: ['mock-image.jpg'],
    inStock: true,
    stockQuantity: 10,
    rating: {
      average: 4.5,
      count: 100
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}
```

## Performance Functions

### `memoize(func, keyGenerator)`

Creates a memoized version of a function for caching results.

```javascript
/**
 * Creates a memoized version of a function to cache results
 * 
 * @param {Function} func - Function to memoize
 * @param {Function} [keyGenerator] - Custom key generation function
 * @returns {Function} Memoized function with cache
 * 
 * @example
 * const expensiveCalculation = memoize((x, y) => {
 *   console.log('Computing...');
 *   return x * y * Math.random();
 * });
 * 
 * expensiveCalculation(5, 10); // Computes and caches
 * expensiveCalculation(5, 10); // Returns cached result
 * 
 * @since 1.0.0
 */
function memoize(func, keyGenerator) {
  const cache = new Map();
  
  return function (...args) {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };
}
```

## Best Practices

### Function Design Principles

1. **Single Responsibility**: Each function should do one thing well
2. **Pure Functions**: Prefer functions without side effects when possible
3. **Immutability**: Don't mutate input parameters
4. **Error Handling**: Always handle and document potential errors
5. **Type Safety**: Use TypeScript or JSDoc for type information

### Documentation Requirements

1. **JSDoc Comments**: All public functions must have JSDoc
2. **Examples**: Include practical usage examples
3. **Error Cases**: Document all possible errors
4. **Parameters**: Describe all parameters and their types
5. **Return Values**: Clearly describe what the function returns

### Testing Guidelines

1. **Unit Tests**: Every function should have comprehensive unit tests
2. **Edge Cases**: Test boundary conditions and error scenarios
3. **Mock Dependencies**: Use mocks for external dependencies
4. **Code Coverage**: Aim for 90%+ code coverage
5. **Integration Tests**: Test function interactions

### Performance Considerations

1. **Async/Await**: Use modern async patterns
2. **Memory Management**: Avoid memory leaks in long-running functions
3. **Caching**: Implement caching for expensive operations
4. **Optimization**: Profile and optimize critical path functions
5. **Lazy Loading**: Load resources only when needed