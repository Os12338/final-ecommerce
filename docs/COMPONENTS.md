# Component Documentation

## Overview

This document provides comprehensive documentation for all public components in the final-ecommerce application. Components are built with React and follow modern best practices including TypeScript support, accessibility, and responsive design.

## Component Architecture

All components follow these conventions:
- TypeScript interfaces for props
- Default props where applicable
- Accessibility attributes (ARIA)
- Responsive design
- Error boundaries
- Unit tests

## Authentication Components

### LoginForm

A complete login form component with validation and error handling.

**Props:**
```typescript
interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
  error?: string;
  redirectTo?: string;
  showSignupLink?: boolean;
  className?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}
```

**Usage:**
```jsx
import { LoginForm } from '@/components/auth/LoginForm';

function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (credentials) => {
    setLoading(true);
    setError('');
    
    try {
      await authService.login(credentials);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginForm
      onSubmit={handleLogin}
      loading={loading}
      error={error}
      showSignupLink={true}
      redirectTo="/dashboard"
    />
  );
}
```

**Features:**
- Email validation
- Password strength indicator
- Remember me functionality
- Social login integration
- Responsive design
- Accessibility compliant

### RegisterForm

User registration form with comprehensive validation.

**Props:**
```typescript
interface RegisterFormProps {
  onSubmit: (userData: RegisterData) => Promise<void>;
  loading?: boolean;
  error?: string;
  requirePhoneNumber?: boolean;
  showLoginLink?: boolean;
  className?: string;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  acceptTerms: boolean;
}
```

**Usage:**
```jsx
import { RegisterForm } from '@/components/auth/RegisterForm';

function RegisterPage() {
  const handleRegister = async (userData) => {
    await authService.register(userData);
  };

  return (
    <RegisterForm
      onSubmit={handleRegister}
      requirePhoneNumber={true}
      showLoginLink={true}
    />
  );
}
```

## Product Components

### ProductCard

Displays product information in a card layout.

**Props:**
```typescript
interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string, quantity: number) => void;
  onQuickView?: (productId: string) => void;
  showQuickActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  rating: {
    average: number;
    count: number;
  };
  inStock: boolean;
  stockQuantity?: number;
  badges?: ProductBadge[];
}

interface ProductBadge {
  type: 'sale' | 'new' | 'bestseller' | 'limited';
  text: string;
  color?: string;
}
```

**Usage:**
```jsx
import { ProductCard } from '@/components/product/ProductCard';

function ProductGrid({ products }) {
  const handleAddToCart = (productId, quantity) => {
    cartService.addItem(productId, quantity);
  };

  const handleQuickView = (productId) => {
    setQuickViewProduct(productId);
    setQuickViewOpen(true);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={handleAddToCart}
          onQuickView={handleQuickView}
          showQuickActions={true}
          variant="default"
        />
      ))}
    </div>
  );
}
```

### ProductGallery

Image gallery component for product detail pages.

**Props:**
```typescript
interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  showThumbnails?: boolean;
  showZoom?: boolean;
  autoPlay?: boolean;
  className?: string;
}

interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isDefault?: boolean;
}
```

**Usage:**
```jsx
import { ProductGallery } from '@/components/product/ProductGallery';

function ProductDetail({ product }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <ProductGallery
        images={product.images}
        productName={product.name}
        showThumbnails={true}
        showZoom={true}
      />
      <ProductInfo product={product} />
    </div>
  );
}
```

### ProductFilter

Advanced filtering component for product listings.

**Props:**
```typescript
interface ProductFilterProps {
  filters: FilterConfig[];
  activeFilters: ActiveFilter[];
  onFilterChange: (filters: ActiveFilter[]) => void;
  onClearFilters: () => void;
  loading?: boolean;
  className?: string;
}

interface FilterConfig {
  id: string;
  name: string;
  type: 'checkbox' | 'range' | 'select' | 'color';
  options?: FilterOption[];
  min?: number;
  max?: number;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
}

interface ActiveFilter {
  filterId: string;
  value: string | number | [number, number];
}
```

**Usage:**
```jsx
import { ProductFilter } from '@/components/product/ProductFilter';

function ProductListing() {
  const [activeFilters, setActiveFilters] = useState([]);
  
  const filterConfig = [
    {
      id: 'category',
      name: 'Category',
      type: 'checkbox',
      options: [
        { value: 'electronics', label: 'Electronics', count: 150 },
        { value: 'clothing', label: 'Clothing', count: 89 }
      ]
    },
    {
      id: 'price',
      name: 'Price Range',
      type: 'range',
      min: 0,
      max: 1000
    }
  ];

  return (
    <div className="flex gap-8">
      <aside className="w-64">
        <ProductFilter
          filters={filterConfig}
          activeFilters={activeFilters}
          onFilterChange={setActiveFilters}
          onClearFilters={() => setActiveFilters([])}
        />
      </aside>
      <main className="flex-1">
        <ProductGrid filters={activeFilters} />
      </main>
    </div>
  );
}
```

## Shopping Cart Components

### CartItem

Individual cart item component with quantity controls.

**Props:**
```typescript
interface CartItemProps {
  item: CartItem;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  loading?: boolean;
  editable?: boolean;
  showImage?: boolean;
  className?: string;
}

interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    inStock: boolean;
  };
  quantity: number;
  price: number;
  total: number;
}
```

**Usage:**
```jsx
import { CartItem } from '@/components/cart/CartItem';

function CartSidebar({ items }) {
  const handleUpdateQuantity = async (itemId, quantity) => {
    await cartService.updateQuantity(itemId, quantity);
  };

  const handleRemove = async (itemId) => {
    await cartService.removeItem(itemId);
  };

  return (
    <div className="space-y-4">
      {items.map(item => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={handleUpdateQuantity}
          onRemove={handleRemove}
          editable={true}
          showImage={true}
        />
      ))}
    </div>
  );
}
```

### CartSummary

Cart totals and checkout summary component.

**Props:**
```typescript
interface CartSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  discount?: number;
  total: number;
  currency?: string;
  showCheckoutButton?: boolean;
  onCheckout?: () => void;
  loading?: boolean;
  className?: string;
}
```

**Usage:**
```jsx
import { CartSummary } from '@/components/cart/CartSummary';

function CheckoutPage({ cart }) {
  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <CartItems items={cart.items} />
      </div>
      <div>
        <CartSummary
          subtotal={cart.subtotal}
          tax={cart.tax}
          shipping={cart.shipping}
          discount={cart.discount}
          total={cart.total}
          showCheckoutButton={true}
          onCheckout={handleCheckout}
        />
      </div>
    </div>
  );
}
```

## Form Components

### AddressForm

Reusable address input form with validation.

**Props:**
```typescript
interface AddressFormProps {
  address?: Address;
  onSubmit: (address: Address) => void;
  onCancel?: () => void;
  loading?: boolean;
  showBillingFields?: boolean;
  countries?: Country[];
  className?: string;
}

interface Address {
  id?: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}
```

**Usage:**
```jsx
import { AddressForm } from '@/components/forms/AddressForm';

function AddressModal({ address, onSave, onClose }) {
  const handleSubmit = async (addressData) => {
    await addressService.save(addressData);
    onSave(addressData);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <AddressForm
        address={address}
        onSubmit={handleSubmit}
        onCancel={onClose}
        showBillingFields={true}
      />
    </Modal>
  );
}
```

### PaymentForm

Credit card and payment method form component.

**Props:**
```typescript
interface PaymentFormProps {
  onSubmit: (paymentData: PaymentData) => Promise<void>;
  loading?: boolean;
  error?: string;
  acceptedMethods?: PaymentMethod[];
  showSaveCard?: boolean;
  className?: string;
}

interface PaymentData {
  method: 'card' | 'paypal' | 'apple_pay' | 'google_pay';
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  nameOnCard?: string;
  saveCard?: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
}
```

## Layout Components

### Header

Main application header with navigation and user controls.

**Props:**
```typescript
interface HeaderProps {
  user?: User;
  cartItemCount?: number;
  onSearch?: (query: string) => void;
  onCartClick?: () => void;
  onProfileClick?: () => void;
  showSearch?: boolean;
  showCart?: boolean;
  className?: string;
}
```

**Usage:**
```jsx
import { Header } from '@/components/layout/Header';

function Layout({ children }) {
  const { user } = useAuth();
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen">
      <Header
        user={user}
        cartItemCount={itemCount}
        onSearch={handleSearch}
        onCartClick={() => setCartOpen(true)}
        showSearch={true}
        showCart={true}
      />
      <main>{children}</main>
    </div>
  );
}
```

### Breadcrumb

Navigation breadcrumb component.

**Props:**
```typescript
interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
}

interface BreadcrumbItem {
  label: string;
  href?: string;
  active?: boolean;
}
```

**Usage:**
```jsx
import { Breadcrumb } from '@/components/layout/Breadcrumb';

function ProductPage({ product, category }) {
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: category.name, href: `/category/${category.slug}` },
    { label: product.name, active: true }
  ];

  return (
    <div>
      <Breadcrumb items={breadcrumbItems} />
      <ProductDetail product={product} />
    </div>
  );
}
```

## UI Components

### Button

Customizable button component with multiple variants.

**Props:**
```typescript
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**
```jsx
import { Button } from '@/components/ui/Button';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

function AddToCartButton({ onAddToCart, loading }) {
  return (
    <Button
      variant="primary"
      size="lg"
      loading={loading}
      leftIcon={<ShoppingCartIcon />}
      onClick={onAddToCart}
      fullWidth
    >
      Add to Cart
    </Button>
  );
}
```

### Modal

Accessible modal dialog component.

**Props:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

**Usage:**
```jsx
import { Modal } from '@/components/ui/Modal';

function QuickViewModal({ product, isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product?.name}
      size="lg"
      showCloseButton={true}
    >
      <ProductQuickView product={product} />
    </Modal>
  );
}
```

### Toast

Toast notification component for user feedback.

**Props:**
```typescript
interface ToastProps {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  showCloseButton?: boolean;
  onClose?: () => void;
  className?: string;
}
```

**Usage:**
```jsx
import { useToast } from '@/hooks/useToast';

function ProductActions() {
  const { showToast } = useToast();

  const handleAddToCart = async () => {
    try {
      await cartService.addItem(productId, quantity);
      showToast({
        type: 'success',
        title: 'Added to Cart',
        message: 'Product has been added to your cart',
        duration: 3000
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to add product to cart',
        duration: 5000
      });
    }
  };

  return (
    <Button onClick={handleAddToCart}>
      Add to Cart
    </Button>
  );
}
```

## Component Testing

### Testing Guidelines

All components should include comprehensive tests covering:

1. **Rendering Tests**
```jsx
import { render, screen } from '@testing-library/react';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  const mockProduct = {
    id: '1',
    name: 'Test Product',
    price: 99.99,
    // ... other props
  };

  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    
    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });
});
```

2. **Interaction Tests**
```jsx
import { fireEvent, waitFor } from '@testing-library/react';

it('calls onAddToCart when add to cart button is clicked', async () => {
  const mockAddToCart = jest.fn();
  render(
    <ProductCard 
      product={mockProduct} 
      onAddToCart={mockAddToCart} 
    />
  );
  
  fireEvent.click(screen.getByText('Add to Cart'));
  
  await waitFor(() => {
    expect(mockAddToCart).toHaveBeenCalledWith('1', 1);
  });
});
```

3. **Accessibility Tests**
```jsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<ProductCard product={mockProduct} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Storybook Integration

Components should include Storybook stories for documentation and testing:

```jsx
// ProductCard.stories.js
import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';

const meta: Meta<typeof ProductCard> = {
  title: 'Components/Product/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    product: {
      id: '1',
      name: 'Wireless Headphones',
      price: 199.99,
      // ... other props
    },
  },
};

export const OnSale: Story = {
  args: {
    product: {
      ...Default.args.product,
      originalPrice: 249.99,
      badges: [{ type: 'sale', text: '20% OFF' }],
    },
  },
};
```