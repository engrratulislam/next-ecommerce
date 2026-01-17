# MongoDB Database Schema Documentation
## Next.js E-Commerce Platform

**Document Version:** 1.0  
**Last Updated:** January 17, 2026  
**Database Type:** MongoDB (NoSQL)  
**Total Collections:** 11

---

## Table of Contents
1. [Database Overview](#database-overview)
2. [Collections Summary](#collections-summary)
3. [Detailed Schema Definitions](#detailed-schema-definitions)
4. [Relationships & References](#relationships--references)
5. [Indexes & Performance](#indexes--performance)
6. [Database Connection Configuration](#database-connection-configuration)

---

## Database Overview

This e-commerce platform uses **MongoDB** as its primary database, leveraging Mongoose ODM for schema definition and data validation. The database architecture follows best practices for e-commerce applications with proper indexing, relationships, and data integrity.

### Key Features:
- **Connection Pooling**: Max 10 concurrent connections
- **Auto-generated Timestamps**: `createdAt` and `updatedAt` on most collections
- **Data Validation**: Schema-level validation with custom error messages
- **Indexing Strategy**: Optimized for query performance
- **Referential Integrity**: Proper ObjectId references between collections

---

## Collections Summary

| # | Collection Name | Purpose | Primary Key | Record Count Estimate |
|---|----------------|---------|-------------|---------------------|
| 1 | **users** | Customer & admin accounts | `_id` (ObjectId) | Dynamic |
| 2 | **products** | Product catalog | `_id` (ObjectId) | High Volume |
| 3 | **categories** | Product categorization | `_id` (ObjectId) | Low-Medium |
| 4 | **orders** | Order management | `_id` (ObjectId) | High Volume |
| 5 | **carts** | Shopping carts (guest & user) | `_id` (ObjectId) | Dynamic |
| 6 | **wishlists** | User wishlist items | `_id` (ObjectId) | Dynamic |
| 7 | **reviews** | Product reviews & ratings | `_id` (ObjectId) | Medium-High |
| 8 | **coupons** | Discount codes | `_id` (ObjectId) | Low |
| 9 | **newsletters** | Email subscriptions | `_id` (ObjectId) | Medium |
| 10 | **pagecontents** | CMS pages (About, Contact, etc.) | `_id` (ObjectId) | Low |
| 11 | **settings** | System configuration | `_id` (ObjectId) | 1 Document |

---

## Detailed Schema Definitions

### 1. Users Collection (`users`)

**Purpose:** Stores customer and administrator account information with authentication details.

**Model Location:** `/src/models/User.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  name: String,                     // Required, trimmed
  email: String,                    // Required, unique, indexed, lowercase
  password: String,                 // Required, hashed (bcrypt), min 8 chars
  role: String,                     // Enum: ['customer', 'admin'], default: 'customer'
  avatar: String,                   // Profile image URL (optional)
  phone: String,                    // Indexed (optional)
  addresses: [{                     // Array of address objects
    type: String,                   // Enum: ['shipping', 'billing', 'both']
    street: String,                 // Required
    city: String,                   // Required
    state: String,                  // Required
    zipCode: String,                // Required
    country: String,                // Required
    isDefault: Boolean              // Default: false
  }],
  isVerified: Boolean,              // Email verification status, default: false
  isActive: Boolean,                // Account status, default: true
  loyaltyPoints: Number,            // Loyalty program points, default: 0
  totalSpent: Number,               // Total purchase amount, default: 0
  orderCount: Number,               // Total orders placed, default: 0
  lastLoginAt: Date,                // Last login timestamp (optional)
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

#### Indexes:
- `email` (unique)
- `role`
- `phone`

#### Methods:
- `comparePassword(password: string): Promise<boolean>` - Password comparison
- `generateAuthToken(): string` - JWT token generation

#### Pre-save Hooks:
- Password hashing with bcrypt (salt rounds: 10)

---

### 2. Products Collection (`products`)

**Purpose:** Complete product catalog with inventory management, variants, and SEO.

**Model Location:** `/src/models/Product.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  name: String,                     // Required, max 200 chars
  slug: String,                     // Unique, indexed, lowercase, auto-generated
  description: String,              // Required, full HTML content
  shortDescription: String,         // Optional, max 500 chars
  price: Number,                    // Required, min: 0
  comparePrice: Number,             // Original price (for discounts), min: 0
  cost: Number,                     // Cost price (for profit calculation), min: 0
  category: ObjectId,               // Required, ref: 'Category', indexed
  subcategory: String,              // Optional category string
  images: [String],                 // Array of image URLs
  thumbnail: String,                // Required, main product image
  sku: String,                      // Required, unique, indexed, uppercase
  barcode: String,                  // Optional barcode/UPC
  stock: Number,                    // Required, default: 0, min: 0
  lowStockThreshold: Number,        // Default: 10
  tags: [String],                   // Indexed for search
  productType: String,              // Enum: ['digital', 'physical', 'bundle']
  
  // Digital Product Fields
  downloadUrl: String,              // For digital products
  fileSize: String,                 // File size string
  version: String,                  // Version number
  
  // Physical Product Fields
  weight: Number,                   // In grams/kg, min: 0
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  
  // Product Variants
  variants: [{
    name: String,                   // Variant name (e.g., "Color", "Size")
    options: [{
      value: String,                // Option value (e.g., "Red", "Large")
      price: Number,                // Variant-specific price
      stock: Number,                // Variant-specific stock
      sku: String                   // Variant-specific SKU
    }]
  }],
  
  // Status Flags
  isFeatured: Boolean,              // Featured on homepage, indexed
  isActive: Boolean,                // Product visibility, indexed
  isTaxable: Boolean,               // Tax application flag
  
  // SEO Fields
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  },
  
  // Analytics & Statistics
  rating: Number,                   // Average rating (0-5), default: 0
  reviewCount: Number,              // Total reviews, default: 0
  salesCount: Number,               // Total units sold, default: 0
  viewCount: Number,                // Product page views, default: 0
  
  relatedProducts: [ObjectId],      // Array of related product IDs
  
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

#### Indexes:
- `slug` (unique)
- `category`
- `sku` (unique)
- `tags`
- `isFeatured`
- `isActive`
- Text index on: `name`, `description`, `tags`
- Compound: `{ category: 1, isActive: 1 }`
- Single: `{ price: 1 }`
- Single: `{ createdAt: -1 }`

#### Methods:
- `updateStock(quantity, operation)` - Add/subtract inventory
- `incrementViews()` - Increment view count
- `updateRating()` - Recalculate average rating from reviews
- `checkLowStock()` - Check if stock is below threshold

#### Pre-save Hooks:
- Auto-generate slug from product name using slugify

---

### 3. Categories Collection (`categories`)

**Purpose:** Hierarchical product categorization with parent-child relationships.

**Model Location:** `/src/models/Category.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  name: String,                     // Required, max 100 chars
  slug: String,                     // Unique, indexed, lowercase, auto-generated
  description: String,              // Optional, max 1000 chars
  image: String,                    // Category image URL
  parent: ObjectId,                 // Ref: 'Category', self-reference, indexed
  isActive: Boolean,                // Visibility flag, indexed, default: true
  order: Number,                    // Display order, default: 0
  seo: {
    metaTitle: String,              // Max 60 chars
    metaDescription: String         // Max 160 chars
  },
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

#### Indexes:
- `slug` (unique)
- `parent`
- `isActive`
- Compound: `{ parent: 1, isActive: 1 }`
- Text: `name`

#### Methods:
- `getSubcategories()` - Retrieve all child categories
- `getProductCount()` - Count products in category

#### Pre-save Hooks:
- Auto-generate slug from category name

---

### 4. Orders Collection (`orders`)

**Purpose:** Complete order management with payment, shipping, and tracking.

**Model Location:** `/src/models/Order.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  orderNumber: String,              // Required, unique, indexed, auto-generated (ORD-YYYY-XXXXX)
  customer: ObjectId,               // Required, ref: 'User', indexed
  
  // Order Items
  items: [{
    product: ObjectId,              // Ref: 'Product'
    name: String,                   // Product name snapshot
    image: String,                  // Product image snapshot
    sku: String,                    // Product SKU snapshot
    quantity: Number,               // Min: 1
    price: Number,                  // Price at order time
    variant: {
      name: String,
      value: String
    }
  }],
  
  // Pricing
  subtotal: Number,                 // Required, min: 0
  tax: Number,                      // Default: 0, min: 0
  shipping: Number,                 // Default: 0, min: 0
  discount: Number,                 // Default: 0, min: 0
  couponCode: String,               // Uppercase
  total: Number,                    // Required, min: 0
  
  // Addresses
  shippingAddress: {
    name: String,                   // Required
    phone: String,                  // Required
    street: String,                 // Required
    city: String,                   // Required
    state: String,                  // Required
    zipCode: String,                // Required
    country: String                 // Required
  },
  billingAddress: {
    name: String,                   // Required
    phone: String,                  // Required
    street: String,                 // Required
    city: String,                   // Required
    state: String,                  // Required
    zipCode: String,                // Required
    country: String                 // Required
  },
  
  // Payment Information
  paymentMethod: String,            // Required, Enum: ['stripe', 'paypal', 'sslcommerz', 'razorpay', 'cod']
  paymentStatus: String,            // Indexed, Enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded']
  paymentId: String,                // Payment gateway transaction ID
  
  // Order Status & Tracking
  orderStatus: String,              // Indexed, Enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
  trackingNumber: String,           // Shipping tracking number
  trackingUrl: String,              // Tracking URL
  courierName: String,              // Shipping courier name
  estimatedDelivery: Date,          // Estimated delivery date
  deliveredAt: Date,                // Actual delivery timestamp
  
  // Notes & Additional Info
  notes: String,                    // Customer notes
  adminNotes: String,               // Internal admin notes
  
  // Refund Information
  refundAmount: Number,             // Min: 0
  refundReason: String,             // Refund reason text
  refundedAt: Date,                 // Refund timestamp
  
  customerIP: String,               // Customer IP address
  
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

#### Indexes:
- `orderNumber` (unique)
- `customer`
- `paymentStatus`
- `orderStatus`
- Compound: `{ customer: 1, createdAt: -1 }`
- Compound: `{ paymentStatus: 1, orderStatus: 1 }`
- Single: `{ createdAt: -1 }`

#### Methods:
- `calculateTotal()` - Calculate order total
- `updateStatus(status)` - Update order status
- `processRefund(amount, reason)` - Process refund
- `addTracking(trackingNumber, courier, trackingUrl)` - Add shipping tracking

#### Pre-save Hooks:
- Auto-generate order number (ORD-YYYY-XXXXX format)

---

### 5. Carts Collection (`carts`)

**Purpose:** Shopping cart management for both authenticated users and guest sessions.

**Model Location:** `/src/models/Cart.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  user: ObjectId,                   // Ref: 'User', indexed (optional for guests)
  sessionId: String,                // Session ID for guest carts, indexed
  items: [{
    product: ObjectId,              // Required, ref: 'Product'
    quantity: Number,               // Required, min: 1
    price: Number,                  // Required, min: 0
    variant: {
      name: String,
      value: String
    }
  }],
  updatedAt: Date                   // Auto-generated (used for abandoned cart detection)
}
```

#### Indexes:
- `user`
- `sessionId`
- `updatedAt`

#### Validation:
- Pre-save hook ensures either `user` OR `sessionId` is present

---

### 6. Wishlists Collection (`wishlists`)

**Purpose:** User wishlist for saved products (requires authentication).

**Model Location:** `/src/models/Wishlist.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  user: ObjectId,                   // Required, unique, indexed, ref: 'User'
  products: [ObjectId],             // Array of product IDs, ref: 'Product'
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

#### Indexes:
- `user` (unique) - One wishlist per user

#### Constraints:
- Each user can have only one wishlist

---

### 7. Reviews Collection (`reviews`)

**Purpose:** Product reviews and ratings with admin moderation.

**Model Location:** `/src/models/Review.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  product: ObjectId,                // Required, indexed, ref: 'Product'
  user: ObjectId,                   // Required, indexed, ref: 'User'
  rating: Number,                   // Required, min: 1, max: 5
  title: String,                    // Optional, max 100 chars
  comment: String,                  // Required, max 1000 chars
  images: [String],                 // Photo review images
  isVerified: Boolean,              // Verified purchase flag, default: false
  isApproved: Boolean,              // Admin approval flag, indexed, default: false
  helpfulCount: Number,             // Helpful votes count, default: 0
  adminReply: {
    message: String,                // Admin response text
    repliedAt: Date                 // Reply timestamp
  },
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

#### Indexes:
- `product`
- `user`
- `isApproved`
- Compound (unique): `{ product: 1, user: 1 }` - One review per user per product
- Compound: `{ product: 1, isApproved: 1, createdAt: -1 }`

#### Constraints:
- Users can only review each product once

---

### 8. Coupons Collection (`coupons`)

**Purpose:** Discount coupon management with usage tracking and validation.

**Model Location:** `/src/models/Coupon.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  code: String,                     // Required, unique, indexed, uppercase
  description: String,              // Optional, max 200 chars
  discountType: String,             // Required, Enum: ['percentage', 'fixed']
  discountValue: Number,            // Required, min: 0
  minOrderValue: Number,            // Minimum order requirement, min: 0
  maxDiscountAmount: Number,        // Max discount cap (for percentage), min: 0
  usageLimit: Number,               // Total usage limit, min: 1
  usageCount: Number,               // Current usage count, default: 0
  usagePerCustomer: Number,         // Per-customer usage limit, min: 1
  validFrom: Date,                  // Required, coupon start date
  validUntil: Date,                 // Required, coupon end date
  isActive: Boolean,                // Indexed, default: true
  applicableCategories: [ObjectId], // Ref: 'Category'
  applicableProducts: [ObjectId],   // Ref: 'Product'
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

#### Indexes:
- `code` (unique)
- `isActive`
- Compound: `{ code: 1, isActive: 1 }`
- Single: `{ validUntil: 1 }`

#### Methods:
- `isValid()` - Check if coupon is currently valid
- `canBeUsedBy(userId, usageCount)` - Check user eligibility
- `calculateDiscount(orderTotal)` - Calculate discount amount
- `incrementUsage()` - Increment usage counter

#### Pre-save Hooks:
- Validate that `validFrom < validUntil`

---

### 9. Newsletters Collection (`newsletters`)

**Purpose:** Email newsletter subscription management.

**Model Location:** `/src/models/Newsletter.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  email: String,                    // Required, unique, indexed, lowercase
  isSubscribed: Boolean,            // Indexed, default: true
  subscribedAt: Date,               // Default: Date.now
  unsubscribedAt: Date              // Set when unsubscribed
}
```

#### Indexes:
- `email` (unique)
- `isSubscribed`

#### Pre-save Hooks:
- Auto-set `unsubscribedAt` when `isSubscribed` changes to false

---

### 10. PageContents Collection (`pagecontents`)

**Purpose:** CMS for static pages (About, Terms, Privacy Policy, etc.).

**Model Location:** `/src/models/PageContent.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  slug: String,                     // Required, unique, indexed, lowercase
  title: String,                    // Required, max 200 chars
  content: String,                  // Required, full HTML content
  metaTitle: String,                // Optional, max 60 chars
  metaDescription: String,          // Optional, max 160 chars
  isPublished: Boolean,             // Indexed, default: false
  createdAt: Date,                  // Auto-generated
  updatedAt: Date                   // Auto-generated
}
```

#### Indexes:
- `slug` (unique)
- `isPublished`

#### Pre-save Hooks:
- Auto-generate slug from title if not provided

---

### 11. Settings Collection (`settings`)

**Purpose:** Single document for global system configuration.

**Model Location:** `/src/models/Settings.ts`

#### Schema Structure:

```typescript
{
  _id: ObjectId,                    // Auto-generated primary key
  
  // Store Information
  storeName: String,                // Required
  storeDescription: String,         // Max 500 chars
  logo: String,                     // Logo image URL
  favicon: String,                  // Favicon URL
  contactEmail: String,             // Required, lowercase
  contactPhone: String,
  address: String,
  currency: String,                 // Default: 'USD', uppercase
  currencySymbol: String,           // Default: '$'
  timezone: String,                 // Default: 'UTC'
  
  // Payment Gateway Configuration
  paymentGateways: {
    stripe: {
      enabled: Boolean,             // Default: false
      publicKey: String,
      secretKey: String
    },
    paypal: {
      enabled: Boolean,             // Default: false
      clientId: String,
      clientSecret: String
    },
    sslcommerz: {
      enabled: Boolean,             // Default: false
      storeId: String,
      storePassword: String
    },
    cod: {
      enabled: Boolean              // Default: true
    }
  },
  
  // Shipping Configuration
  shipping: {
    freeShippingThreshold: Number,
    flatRate: Number,
    zones: [{
      name: String,
      countries: [String],
      rate: Number
    }]
  },
  
  // Tax Configuration
  tax: {
    enabled: Boolean,               // Default: false
    rate: Number,                   // Default: 0
    includeInPrice: Boolean         // Default: false
  },
  
  // Email Configuration
  email: {
    fromName: String,               // Required
    fromEmail: String,              // Required
    smtpHost: String,
    smtpPort: Number,
    smtpUser: String,
    smtpPassword: String
  },
  
  // SEO & Analytics
  seo: {
    metaTitle: String,
    metaDescription: String,
    googleAnalyticsId: String,
    facebookPixelId: String
  },
  
  // Social Media Links
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String
  },
  
  updatedAt: Date                   // Auto-generated (no createdAt)
}
```

#### Notes:
- This collection typically contains only **ONE document**
- Used for global configuration across the application
- No `createdAt` timestamp (only `updatedAt`)

---

## Relationships & References

### Entity Relationship Diagram (Textual):

```
users (1) ←→ (N) orders
users (1) ←→ (1) wishlists
users (1) ←→ (N) carts
users (1) ←→ (N) reviews

categories (1) ←→ (N) products
categories (1) ←→ (N) categories (parent-child)

products (1) ←→ (N) order.items
products (1) ←→ (N) cart.items
products (1) ←→ (N) wishlist.products
products (1) ←→ (N) reviews
products (N) ←→ (N) coupons.applicableProducts
products (N) ←→ (N) products.relatedProducts

categories (N) ←→ (N) coupons.applicableCategories

orders (N) ←→ (1) coupons (via couponCode)
```

### Key Relationships:

1. **User → Orders**: One-to-Many (A user can have multiple orders)
2. **User → Wishlist**: One-to-One (Each user has one wishlist)
3. **User → Carts**: One-to-Many (User + session-based carts)
4. **User → Reviews**: One-to-Many (User can review multiple products)
5. **Category → Products**: One-to-Many (Category contains products)
6. **Category → Category**: Self-referencing (Parent-child hierarchy)
7. **Product → Reviews**: One-to-Many (Product can have many reviews)
8. **Product → Related Products**: Many-to-Many (Products can reference each other)
9. **Order → Products**: Many-to-Many (via order items)
10. **Coupon → Products/Categories**: Many-to-Many (Coupon applicability)

---

## Indexes & Performance

### Index Strategy:

#### Primary Indexes (Unique):
- `users.email`
- `products.slug`
- `products.sku`
- `categories.slug`
- `orders.orderNumber`
- `wishlists.user`
- `coupons.code`
- `newsletters.email`
- `pagecontents.slug`

#### Secondary Indexes (Non-unique):
- `users.role`, `users.phone`
- `products.category`, `products.tags`, `products.isFeatured`, `products.isActive`
- `categories.parent`, `categories.isActive`
- `orders.customer`, `orders.paymentStatus`, `orders.orderStatus`
- `carts.user`, `carts.sessionId`, `carts.updatedAt`
- `reviews.product`, `reviews.user`, `reviews.isApproved`
- `coupons.isActive`
- `newsletters.isSubscribed`
- `pagecontents.isPublished`

#### Compound Indexes:
- `products`: `{ category: 1, isActive: 1 }`
- `categories`: `{ parent: 1, isActive: 1 }`
- `orders`: `{ customer: 1, createdAt: -1 }`
- `orders`: `{ paymentStatus: 1, orderStatus: 1 }`
- `reviews`: `{ product: 1, user: 1 }` (unique)
- `reviews`: `{ product: 1, isApproved: 1, createdAt: -1 }`
- `coupons`: `{ code: 1, isActive: 1 }`

#### Text Indexes:
- `products`: Text index on `name`, `description`, `tags`
- `categories`: Text index on `name`

### Performance Considerations:

1. **Read-heavy Collections**: Products, Categories (heavy indexing)
2. **Write-heavy Collections**: Carts, Orders (balanced indexing)
3. **Large Collections**: Products, Orders, Reviews (pagination required)
4. **Small Collections**: Settings, PageContents, Coupons (full scan acceptable)

---

## Database Connection Configuration

### Connection Details:

**Connection String Format:**
```
mongodb://[username:password@]host[:port]/database[?options]
```

**Configuration File:** `/src/lib/db.ts`

### Connection Pool Settings:

```typescript
{
  bufferCommands: false,           // Disable mongoose buffering
  maxPoolSize: 10,                 // Max 10 concurrent connections
  serverSelectionTimeoutMS: 5000,  // 5 second timeout
  socketTimeoutMS: 45000,          // 45 second socket timeout
  family: 4                        // Use IPv4
}
```

### Connection States:

| State | Value | Description |
|-------|-------|-------------|
| disconnected | 0 | Not connected |
| connected | 1 | Successfully connected |
| connecting | 2 | Connection in progress |
| disconnecting | 3 | Disconnection in progress |
| uninitialized | 99 | Not initialized |

### Environment Variable:

```env
DATABASE_URL=mongodb://username:password@host:port/database
```

---

## Summary Statistics

| Metric | Value |
|--------|-------|
| **Total Collections** | 11 |
| **Collections with Timestamps** | 10 |
| **Collections with Unique Indexes** | 11 |
| **Collections with Compound Indexes** | 6 |
| **Collections with Text Search** | 2 |
| **Total Reference Relationships** | 15+ |
| **Collections with Pre-save Hooks** | 7 |
| **Collections with Custom Methods** | 6 |

---

## Notes & Best Practices

### Data Integrity:
- All ObjectId references use Mongoose `ref` for population
- Unique constraints prevent duplicate critical data
- Pre-save hooks ensure data consistency
- Validation at schema level with custom error messages

### Performance:
- Proper indexing on frequently queried fields
- Compound indexes for common query patterns
- Text indexes for search functionality
- Connection pooling for concurrent requests

### Security:
- Password hashing with bcrypt (10 rounds)
- Sensitive fields (password) excluded from queries by default
- IP tracking on orders for fraud prevention
- Admin-only fields separated with proper access control

### Scalability:
- Horizontal scaling ready with MongoDB sharding
- Proper indexing for large dataset handling
- Session-based cart for guest users
- Abandoned cart detection via timestamps

---

**Document End**
