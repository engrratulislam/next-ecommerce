# Backend Development Guide
## Modern Single-Business E-Commerce Platform

---

## 📋 Document Overview

**Purpose:** Complete backend development workflow and implementation guide  
**Technology Stack:** Next.js API Routes, MongoDB, Mongoose, NextAuth.js  
**Development Approach:** API-first, modular, scalable architecture  
**Estimated Timeline:** 8-10 weeks

---

## 🎯 Backend Architecture Overview

### Core Components

1. **Database Layer** - MongoDB with Mongoose ODM
2. **API Layer** - Next.js API Routes (RESTful)
3. **Authentication Layer** - NextAuth.js with JWT
4. **Business Logic Layer** - Services and utilities
5. **Integration Layer** - Payment gateways, email, file storage
6. **Security Layer** - Validation, authorization, rate limiting

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js | Server-side JavaScript |
| **Framework** | Next.js 14+ | API Routes & Server Components |
| **Database** | MongoDB 6+ | NoSQL database |
| **ODM** | Mongoose 8+ | Data modeling |
| **Authentication** | NextAuth.js 5+ | Auth management |
| **Validation** | Zod | Schema validation |
| **File Storage** | Cloudinary/S3 | Image & file uploads |
| **Email** | Resend/SendGrid | Transactional emails |
| **Payments** | Stripe, PayPal, SSLCommerz | Payment processing |

---

## 📦 Required Backend Packages

```bash
# Core Backend Dependencies
npm install mongoose mongodb

# Authentication & Security
npm install next-auth bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken

# Validation
npm install zod

# Payment Gateways
npm install stripe @stripe/stripe-js
npm install sslcommerz-lts
npm install @paypal/checkout-server-sdk

# File Upload
npm install cloudinary multer
npm install -D @types/multer

# Email
npm install resend react-email @react-email/components

# Utilities
npm install date-fns lodash uuid slugify sharp
npm install -D @types/lodash

# PDF Generation
npm install jspdf html2canvas

# Data Export
npm install papaparse
```

---


## 🗄 Database Design & Models

### Database Schema Architecture

**Collections:**
1. Users - Customer and admin accounts
2. Products - Product catalog
3. Categories - Product categorization
4. Orders - Order management
5. Reviews - Product reviews
6. Carts - Shopping carts
7. Wishlists - Customer wishlists
8. Coupons - Discount codes
9. Newsletters - Email subscriptions
10. PageContents - CMS pages
11. Settings - System configuration

### Model Definitions

#### 1. User Model (`models/User.ts`)

**Fields:**
- `_id`: ObjectId (auto-generated)
- `name`: String (required)
- `email`: String (unique, indexed, required)
- `password`: String (hashed, required)
- `role`: Enum ['customer', 'admin'] (default: 'customer')
- `avatar`: String (URL)
- `phone`: String
- `addresses`: Array of address objects
- `isVerified`: Boolean (default: false)
- `isActive`: Boolean (default: true)
- `loyaltyPoints`: Number (default: 0)
- `totalSpent`: Number (default: 0)
- `orderCount`: Number (default: 0)
- `lastLoginAt`: Date
- `createdAt`: Date (auto)
- `updatedAt`: Date (auto)

**Indexes:** email, role, phone

**Methods:**
- `comparePassword(password)` - Compare hashed password
- `generateAuthToken()` - Generate JWT token
- `addAddress(address)` - Add new address
- `updateLoyaltyPoints(points)` - Update points

---

#### 2. Product Model (`models/Product.ts`)

**Fields:**
- `_id`: ObjectId
- `name`: String (required)
- `slug`: String (unique, indexed, required)
- `description`: String (required)
- `shortDescription`: String
- `price`: Number (required, min: 0)
- `comparePrice`: Number (original price)
- `cost`: Number (for profit calculation)
- `category`: ObjectId (ref: Category, required)
- `subcategory`: String
- `images`: Array of Strings (URLs)
- `thumbnail`: String (URL, required)
- `sku`: String (unique, indexed, required)
- `barcode`: String
- `stock`: Number (default: 0, min: 0)
- `lowStockThreshold`: Number (default: 10)
- `tags`: Array of Strings
- `productType`: Enum ['digital', 'physical', 'bundle']
- `downloadUrl`: String (for digital products)
- `fileSize`: String
- `version`: String
- `weight`: Number (grams)
- `dimensions`: Object {length, width, height}
- `variants`: Array of variant objects
- `isFeatured`: Boolean (default: false)
- `isActive`: Boolean (default: true)
- `isTaxable`: Boolean (default: true)
- `seo`: Object {metaTitle, metaDescription, keywords}
- `rating`: Number (default: 0, min: 0, max: 5)
- `reviewCount`: Number (default: 0)
- `salesCount`: Number (default: 0)
- `viewCount`: Number (default: 0)
- `relatedProducts`: Array of ObjectIds
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:** slug, category, tags, isActive, sku, isFeatured

**Methods:**
- `updateStock(quantity, operation)` - Update stock level
- `incrementViews()` - Increment view count
- `updateRating()` - Recalculate average rating
- `checkLowStock()` - Check if stock is low

---

#### 3. Category Model (`models/Category.ts`)

**Fields:**
- `_id`: ObjectId
- `name`: String (required)
- `slug`: String (unique, indexed, required)
- `description`: String
- `image`: String (URL)
- `parent`: ObjectId (ref: Category, for subcategories)
- `isActive`: Boolean (default: true)
- `order`: Number (for sorting, default: 0)
- `seo`: Object {metaTitle, metaDescription}
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:** slug, parent, isActive

**Methods:**
- `getSubcategories()` - Get all child categories
- `getProductCount()` - Count products in category

---

#### 4. Order Model (`models/Order.ts`)

**Fields:**
- `_id`: ObjectId
- `orderNumber`: String (unique, indexed, auto-generated)
- `customer`: ObjectId (ref: User, required)
- `items`: Array of order items
  - `product`: ObjectId (ref: Product)
  - `name`: String
  - `image`: String
  - `sku`: String
  - `quantity`: Number
  - `price`: Number
  - `variant`: Object {name, value}
- `subtotal`: Number (required)
- `tax`: Number (default: 0)
- `shipping`: Number (default: 0)
- `discount`: Number (default: 0)
- `couponCode`: String
- `total`: Number (required)
- `shippingAddress`: Object (required)
- `billingAddress`: Object (required)
- `paymentMethod`: Enum ['stripe', 'paypal', 'sslcommerz', 'razorpay', 'cod']
- `paymentStatus`: Enum ['pending', 'paid', 'failed', 'refunded', 'partially_refunded']
- `paymentId`: String (gateway transaction ID)
- `orderStatus`: Enum ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned']
- `trackingNumber`: String
- `trackingUrl`: String
- `courierName`: String
- `estimatedDelivery`: Date
- `deliveredAt`: Date
- `notes`: String (customer notes)
- `adminNotes`: String (internal notes)
- `refundAmount`: Number
- `refundReason`: String
- `refundedAt`: Date
- `customerIP`: String
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:** orderNumber, customer, orderStatus, paymentStatus, createdAt

**Methods:**
- `calculateTotal()` - Calculate order total
- `updateStatus(status)` - Update order status
- `processRefund(amount, reason)` - Process refund
- `addTracking(trackingNumber, courier)` - Add tracking info

---


#### 5. Review Model (`models/Review.ts`)

**Fields:**
- `_id`: ObjectId
- `product`: ObjectId (ref: Product, required)
- `user`: ObjectId (ref: User, required)
- `rating`: Number (required, min: 1, max: 5)
- `title`: String
- `comment`: String (required)
- `images`: Array of Strings (URLs)
- `isVerified`: Boolean (purchased customer, default: false)
- `isApproved`: Boolean (default: false)
- `helpfulCount`: Number (default: 0)
- `adminReply`: Object {message, repliedAt}
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:** product, user, isApproved

**Compound Index:** product + user (unique - one review per user per product)

---

#### 6. Cart Model (`models/Cart.ts`)

**Fields:**
- `_id`: ObjectId
- `user`: ObjectId (ref: User, optional for guest carts)
- `sessionId`: String (for guest carts)
- `items`: Array of cart items
  - `product`: ObjectId (ref: Product)
  - `quantity`: Number (min: 1)
  - `price`: Number
  - `variant`: Object {name, value}
- `updatedAt`: Date

**Indexes:** user, sessionId

---

#### 7. Wishlist Model (`models/Wishlist.ts`)

**Fields:**
- `_id`: ObjectId
- `user`: ObjectId (ref: User, required, unique)
- `products`: Array of ObjectIds (ref: Product)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:** user

---

#### 8. Coupon Model (`models/Coupon.ts`)

**Fields:**
- `_id`: ObjectId
- `code`: String (unique, indexed, uppercase, required)
- `description`: String
- `discountType`: Enum ['percentage', 'fixed'] (required)
- `discountValue`: Number (required, min: 0)
- `minOrderValue`: Number (min: 0)
- `maxDiscountAmount`: Number (for percentage discounts)
- `usageLimit`: Number (total usage limit)
- `usageCount`: Number (default: 0)
- `usagePerCustomer`: Number (limit per customer)
- `validFrom`: Date (required)
- `validUntil`: Date (required)
- `isActive`: Boolean (default: true)
- `applicableCategories`: Array of ObjectIds (ref: Category)
- `applicableProducts`: Array of ObjectIds (ref: Product)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:** code, isActive, validUntil

**Methods:**
- `isValid()` - Check if coupon is valid
- `canBeUsedBy(userId)` - Check usage limit per customer
- `calculateDiscount(orderTotal)` - Calculate discount amount
- `incrementUsage()` - Increment usage count

---

#### 9. Newsletter Model (`models/Newsletter.ts`)

**Fields:**
- `_id`: ObjectId
- `email`: String (unique, indexed, required)
- `isSubscribed`: Boolean (default: true)
- `subscribedAt`: Date
- `unsubscribedAt`: Date

**Indexes:** email, isSubscribed

---

#### 10. PageContent Model (`models/PageContent.ts`)

**Fields:**
- `_id`: ObjectId
- `slug`: String (unique, indexed, required)
- `title`: String (required)
- `content`: String (HTML content, required)
- `metaTitle`: String
- `metaDescription`: String
- `isPublished`: Boolean (default: false)
- `createdAt`: Date
- `updatedAt`: Date

**Indexes:** slug, isPublished

---

#### 11. Settings Model (`models/Settings.ts`)

**Fields:**
- `_id`: ObjectId (single document)
- `storeName`: String (required)
- `storeDescription`: String
- `logo`: String (URL)
- `favicon`: String (URL)
- `contactEmail`: String (required)
- `contactPhone`: String
- `address`: String
- `currency`: String (default: 'USD')
- `currencySymbol`: String (default: '$')
- `timezone`: String (default: 'UTC')
- `paymentGateways`: Object
  - `stripe`: {enabled, publicKey, secretKey}
  - `paypal`: {enabled, clientId, clientSecret}
  - `sslcommerz`: {enabled, storeId, storePassword}
  - `cod`: {enabled}
- `shipping`: Object
  - `freeShippingThreshold`: Number
  - `flatRate`: Number
  - `zones`: Array of zone objects
- `tax`: Object
  - `enabled`: Boolean
  - `rate`: Number
  - `includeInPrice`: Boolean
- `email`: Object
  - `fromName`: String
  - `fromEmail`: String
  - `smtpHost`: String
  - `smtpPort`: Number
  - `smtpUser`: String
  - `smtpPassword`: String
- `seo`: Object
  - `metaTitle`: String
  - `metaDescription`: String
  - `googleAnalyticsId`: String
  - `facebookPixelId`: String
- `socialMedia`: Object
  - `facebook`: String
  - `twitter`: String
  - `instagram`: String
  - `linkedin`: String
- `updatedAt`: Date

---

## 🔐 Authentication System

### NextAuth.js Configuration

**File:** `app/api/auth/[...nextauth]/route.ts`

**Features:**
- Email/password authentication
- JWT session strategy
- Role-based access control
- Secure password hashing (bcrypt)
- Session management
- Custom callbacks for user data

**Authentication Flow:**

1. **Registration:**
   - User submits registration form
   - Validate input data (email, password, name)
   - Check if email already exists
   - Hash password with bcrypt (10 salt rounds)
   - Create user in database
   - Send verification email
   - Return success response

2. **Login:**
   - User submits credentials
   - Find user by email
   - Compare password with hashed password
   - Generate JWT token
   - Create session
   - Return user data and token

3. **Email Verification:**
   - Generate verification token
   - Send email with verification link
   - User clicks link
   - Verify token
   - Update user `isVerified` status

4. **Password Reset:**
   - User requests password reset
   - Generate reset token (expires in 1 hour)
   - Send reset email
   - User clicks link and enters new password
   - Verify token
   - Hash new password
   - Update user password
   - Invalidate reset token

**Session Management:**
- JWT tokens stored in HTTP-only cookies
- Token expiration: 30 days
- Automatic token refresh
- Secure token storage

**Authorization Middleware:**
- Protect API routes
- Check user authentication
- Verify user role (customer/admin)
- Return 401 for unauthorized
- Return 403 for forbidden

---


## 🔌 API Routes Structure

### Complete API Endpoints

#### Authentication APIs

**1. Register User**
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:** `{name, email, password}`
- **Response:** `{success, message, user}`
- **Logic:**
  - Validate input (Zod schema)
  - Check if email exists
  - Hash password (bcrypt)
  - Create user
  - Send verification email
  - Return user data (without password)

**2. Login User**
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:** `{email, password}`
- **Response:** `{success, token, user}`
- **Logic:**
  - Validate credentials
  - Find user by email
  - Compare passwords
  - Check if account is active
  - Generate JWT token
  - Update lastLoginAt
  - Return token and user data

**3. Verify Email**
- **Endpoint:** `GET /api/auth/verify-email?token={token}`
- **Access:** Public
- **Response:** `{success, message}`
- **Logic:**
  - Verify token validity
  - Check token expiration
  - Update user isVerified status
  - Return success message

**4. Forgot Password**
- **Endpoint:** `POST /api/auth/forgot-password`
- **Access:** Public
- **Request Body:** `{email}`
- **Response:** `{success, message}`
- **Logic:**
  - Find user by email
  - Generate reset token
  - Save token with expiration
  - Send reset email
  - Return success message

**5. Reset Password**
- **Endpoint:** `POST /api/auth/reset-password`
- **Access:** Public
- **Request Body:** `{token, newPassword}`
- **Response:** `{success, message}`
- **Logic:**
  - Verify reset token
  - Check token expiration
  - Hash new password
  - Update user password
  - Invalidate token
  - Send confirmation email

---

#### Product APIs

**1. Get All Products**
- **Endpoint:** `GET /api/products`
- **Access:** Public
- **Query Params:** `page, limit, category, minPrice, maxPrice, search, sort, tags, inStock`
- **Response:** `{products, pagination, filters}`
- **Logic:**
  - Build query from filters
  - Apply pagination
  - Apply sorting
  - Populate category data
  - Return products with metadata

**2. Get Single Product**
- **Endpoint:** `GET /api/products/[id]`
- **Access:** Public
- **Response:** `{product}`
- **Logic:**
  - Find product by ID or slug
  - Populate category and related products
  - Increment view count
  - Return product details

**3. Create Product**
- **Endpoint:** `POST /api/products`
- **Access:** Admin only
- **Request Body:** `{product data}`
- **Response:** `{success, product}`
- **Logic:**
  - Validate admin role
  - Validate product data
  - Generate unique slug
  - Upload images to Cloudinary
  - Create product in database
  - Return created product

**4. Update Product**
- **Endpoint:** `PUT /api/products/[id]`
- **Access:** Admin only
- **Request Body:** `{product data}`
- **Response:** `{success, product}`
- **Logic:**
  - Validate admin role
  - Find product by ID
  - Validate update data
  - Update images if changed
  - Update product in database
  - Return updated product

**5. Delete Product**
- **Endpoint:** `DELETE /api/products/[id]`
- **Access:** Admin only
- **Response:** `{success, message}`
- **Logic:**
  - Validate admin role
  - Find product by ID
  - Delete product images from storage
  - Delete product from database
  - Remove from carts and wishlists
  - Return success message

**6. Get Featured Products**
- **Endpoint:** `GET /api/products/featured`
- **Access:** Public
- **Response:** `{products}`
- **Logic:**
  - Query products where isFeatured = true
  - Limit to 10 products
  - Sort by salesCount or createdAt
  - Return featured products

**7. Search Products**
- **Endpoint:** `GET /api/products/search?q={query}`
- **Access:** Public
- **Response:** `{products, suggestions}`
- **Logic:**
  - Perform text search on name, description, tags
  - Apply fuzzy matching
  - Return matching products
  - Return search suggestions

**8. Bulk Import Products**
- **Endpoint:** `POST /api/products/bulk-import`
- **Access:** Admin only
- **Request Body:** `{products: []}`
- **Response:** `{success, imported, failed}`
- **Logic:**
  - Validate admin role
  - Validate CSV/JSON data
  - Process each product
  - Handle errors gracefully
  - Return import summary

---

#### Category APIs

**1. Get All Categories**
- **Endpoint:** `GET /api/categories`
- **Access:** Public
- **Response:** `{categories}`
- **Logic:**
  - Query all active categories
  - Build category tree (parent-child)
  - Include product count
  - Return categories

**2. Get Category by Slug**
- **Endpoint:** `GET /api/categories/[slug]`
- **Access:** Public
- **Response:** `{category, products}`
- **Logic:**
  - Find category by slug
  - Get subcategories
  - Get products in category
  - Return category with products

**3. Create Category**
- **Endpoint:** `POST /api/categories`
- **Access:** Admin only
- **Request Body:** `{name, description, parent, image}`
- **Response:** `{success, category}`
- **Logic:**
  - Validate admin role
  - Generate unique slug
  - Upload category image
  - Create category
  - Return created category

**4. Update Category**
- **Endpoint:** `PUT /api/categories/[id]`
- **Access:** Admin only
- **Request Body:** `{category data}`
- **Response:** `{success, category}`
- **Logic:**
  - Validate admin role
  - Find category by ID
  - Update category data
  - Update image if changed
  - Return updated category

**5. Delete Category**
- **Endpoint:** `DELETE /api/categories/[id]`
- **Access:** Admin only
- **Response:** `{success, message}`
- **Logic:**
  - Validate admin role
  - Check if category has products
  - Check if category has subcategories
  - Delete category image
  - Delete category
  - Return success message

---

#### Cart APIs

**1. Get Cart**
- **Endpoint:** `GET /api/cart`
- **Access:** Public (session-based)
- **Response:** `{cart, total}`
- **Logic:**
  - Get user ID or session ID
  - Find cart by user/session
  - Populate product details
  - Calculate cart total
  - Return cart data

**2. Add to Cart**
- **Endpoint:** `POST /api/cart/add`
- **Access:** Public
- **Request Body:** `{productId, quantity, variant}`
- **Response:** `{success, cart}`
- **Logic:**
  - Get user ID or session ID
  - Find or create cart
  - Check product availability
  - Check stock quantity
  - Add item or update quantity
  - Save cart
  - Return updated cart

**3. Update Cart Item**
- **Endpoint:** `PUT /api/cart/update`
- **Access:** Public
- **Request Body:** `{itemId, quantity}`
- **Response:** `{success, cart}`
- **Logic:**
  - Find cart
  - Find cart item
  - Validate new quantity
  - Check stock availability
  - Update item quantity
  - Return updated cart

**4. Remove from Cart**
- **Endpoint:** `DELETE /api/cart/remove/[itemId]`
- **Access:** Public
- **Response:** `{success, cart}`
- **Logic:**
  - Find cart
  - Remove item from cart
  - Save cart
  - Return updated cart

**5. Clear Cart**
- **Endpoint:** `DELETE /api/cart/clear`
- **Access:** Public
- **Response:** `{success, message}`
- **Logic:**
  - Find cart
  - Clear all items
  - Save empty cart
  - Return success message

**6. Get Abandoned Carts**
- **Endpoint:** `GET /api/cart/abandoned`
- **Access:** Admin only
- **Query Params:** `hours=24`
- **Response:** `{carts}`
- **Logic:**
  - Validate admin role
  - Query carts not updated in X hours
  - Filter carts with items
  - Populate user and product data
  - Return abandoned carts

---


#### Order APIs

**1. Get User Orders**
- **Endpoint:** `GET /api/orders`
- **Access:** Authenticated
- **Query Params:** `page, limit, status`
- **Response:** `{orders, pagination}`
- **Logic:**
  - Get authenticated user ID
  - Query orders by customer ID
  - Apply filters and pagination
  - Populate product details
  - Return orders

**2. Get Order Details**
- **Endpoint:** `GET /api/orders/[id]`
- **Access:** Authenticated (own orders) or Admin
- **Response:** `{order}`
- **Logic:**
  - Find order by ID
  - Verify user owns order or is admin
  - Populate all related data
  - Return order details

**3. Create Order**
- **Endpoint:** `POST /api/orders`
- **Access:** Authenticated
- **Request Body:** `{items, shippingAddress, billingAddress, paymentMethod}`
- **Response:** `{success, order, paymentIntent}`
- **Logic:**
  - Validate user authentication
  - Validate order data
  - Check product availability and stock
  - Calculate totals (subtotal, tax, shipping, discount)
  - Apply coupon if provided
  - Generate unique order number
  - Create order in database
  - Deduct stock from products
  - Clear user cart
  - Create payment intent (if online payment)
  - Send order confirmation email
  - Return order and payment data

**4. Update Order Status**
- **Endpoint:** `PUT /api/orders/[id]`
- **Access:** Admin only
- **Request Body:** `{status, trackingNumber, notes}`
- **Response:** `{success, order}`
- **Logic:**
  - Validate admin role
  - Find order by ID
  - Update order status
  - Add tracking information if provided
  - Send status update email to customer
  - Log status change
  - Return updated order

**5. Cancel Order**
- **Endpoint:** `POST /api/orders/[id]/cancel`
- **Access:** Authenticated (own orders) or Admin
- **Request Body:** `{reason}`
- **Response:** `{success, message}`
- **Logic:**
  - Find order by ID
  - Verify user owns order or is admin
  - Check if order can be cancelled
  - Update order status to cancelled
  - Restore product stock
  - Process refund if payment was made
  - Send cancellation email
  - Return success message

**6. Process Refund**
- **Endpoint:** `POST /api/orders/[id]/refund`
- **Access:** Admin only
- **Request Body:** `{amount, reason}`
- **Response:** `{success, refund}`
- **Logic:**
  - Validate admin role
  - Find order by ID
  - Validate refund amount
  - Process refund through payment gateway
  - Update order payment status
  - Record refund details
  - Send refund confirmation email
  - Return refund data

---

#### Payment APIs

**1. Create Stripe Payment Intent**
- **Endpoint:** `POST /api/payment/stripe/create-intent`
- **Access:** Authenticated
- **Request Body:** `{orderId, amount}`
- **Response:** `{clientSecret, paymentIntentId}`
- **Logic:**
  - Validate user authentication
  - Find order by ID
  - Verify order belongs to user
  - Create Stripe payment intent
  - Store payment intent ID in order
  - Return client secret for frontend

**2. Stripe Webhook**
- **Endpoint:** `POST /api/payment/stripe/webhook`
- **Access:** Public (verified by signature)
- **Request Body:** Stripe event data
- **Response:** `{received: true}`
- **Logic:**
  - Verify webhook signature
  - Parse event data
  - Handle event types:
    - `payment_intent.succeeded` - Update order to paid
    - `payment_intent.payment_failed` - Update order to failed
    - `charge.refunded` - Update order refund status
  - Send confirmation email
  - Return acknowledgment

**3. Initialize SSLCommerz Payment**
- **Endpoint:** `POST /api/payment/sslcommerz/init`
- **Access:** Authenticated
- **Request Body:** `{orderId}`
- **Response:** `{GatewayPageURL}`
- **Logic:**
  - Validate user authentication
  - Find order by ID
  - Prepare payment data
  - Initialize SSLCommerz session
  - Return gateway URL for redirect

**4. SSLCommerz IPN Handler**
- **Endpoint:** `POST /api/payment/sslcommerz/webhook`
- **Access:** Public (verified by hash)
- **Request Body:** SSLCommerz IPN data
- **Response:** `{status: 'success'}`
- **Logic:**
  - Verify IPN hash
  - Validate transaction
  - Update order payment status
  - Send confirmation email
  - Return acknowledgment

**5. Create PayPal Order**
- **Endpoint:** `POST /api/payment/paypal/create-order`
- **Access:** Authenticated
- **Request Body:** `{orderId}`
- **Response:** `{paypalOrderId}`
- **Logic:**
  - Validate user authentication
  - Find order by ID
  - Create PayPal order
  - Return PayPal order ID

**6. Capture PayPal Payment**
- **Endpoint:** `POST /api/payment/paypal/capture`
- **Access:** Authenticated
- **Request Body:** `{paypalOrderId, orderId}`
- **Response:** `{success, order}`
- **Logic:**
  - Capture PayPal payment
  - Update order payment status
  - Send confirmation email
  - Return order data

---

#### Review APIs

**1. Get Product Reviews**
- **Endpoint:** `GET /api/reviews/product/[productId]`
- **Access:** Public
- **Query Params:** `page, limit, sort`
- **Response:** `{reviews, pagination, stats}`
- **Logic:**
  - Query approved reviews for product
  - Apply pagination and sorting
  - Populate user data
  - Calculate rating statistics
  - Return reviews and stats

**2. Create Review**
- **Endpoint:** `POST /api/reviews`
- **Access:** Authenticated
- **Request Body:** `{productId, rating, title, comment, images}`
- **Response:** `{success, review}`
- **Logic:**
  - Validate user authentication
  - Check if user purchased product
  - Check if user already reviewed
  - Validate review data
  - Upload review images
  - Create review (pending approval)
  - Update product rating
  - Send admin notification
  - Return created review

**3. Update Review**
- **Endpoint:** `PUT /api/reviews/[id]`
- **Access:** Authenticated (own reviews)
- **Request Body:** `{rating, title, comment}`
- **Response:** `{success, review}`
- **Logic:**
  - Find review by ID
  - Verify user owns review
  - Update review data
  - Reset approval status
  - Update product rating
  - Return updated review

**4. Delete Review**
- **Endpoint:** `DELETE /api/reviews/[id]`
- **Access:** Authenticated (own reviews) or Admin
- **Response:** `{success, message}`
- **Logic:**
  - Find review by ID
  - Verify user owns review or is admin
  - Delete review images
  - Delete review
  - Update product rating
  - Return success message

**5. Mark Review Helpful**
- **Endpoint:** `POST /api/reviews/[id]/helpful`
- **Access:** Public
- **Response:** `{success, helpfulCount}`
- **Logic:**
  - Find review by ID
  - Increment helpful count
  - Return updated count

**6. Admin Approve/Reject Review**
- **Endpoint:** `PUT /api/reviews/[id]/moderate`
- **Access:** Admin only
- **Request Body:** `{isApproved, adminReply}`
- **Response:** `{success, review}`
- **Logic:**
 

---

tae dasagReturn u- atistics
  ulate st
  - Calcnpong cous usiry orderID
  - Queupon by  Find corole
  -admin te - Validaic:**
  **Logs}`
- er`{stats, ordnse:** - **Respo
in only** Admess:
- **Accd]/usage`pons/[iT /api/couGEt:** `ndpoin
- **Ee Stats**Usagpon et Cou
**4. Gresult
validation urn  Rett
  -nt amoun discoutelacu - Calons
 rictit restory/producCheck categ - ue
 valr  ordeum Check minim  -imits
k usage lecdity
  - Chck date vali
  - Cheis activecoupon heck if ode
  - Coupon by c
  - Find c **Logic:**}`
-sage, messcount`{valid, diponse:** 
- **Ress}`otal, itemtTd, carrI `{code, usedy:**est Bo*Requic
- *:** Publ*Accesste`
- *ons/validacoupapi/ /:** `POSTntdpoi**
- **EnCoupon Validate 
**3.coupon
urn created 
  - Ret couponreate- Cqueness
  ck code unihe data
  - Cate couponlidle
  - Vaadmin rodate  - Vali*
 **Logic:*
- on}` coup `{success,**esponse:ta}`
- **Rcoupon dady:** `{**Request Bomin only
-  Ads:**- **Accesoupons`
POST /api/c:** `nt
- **Endpoioupon**eate C Crpons

**2.turn coucs
  - Re statistiusagee Includ
  - pons all cou - Querymin role
 adlidate Va:**
  - Logic}`
- **`{coupons:** esponsenly
- **R:** Admin ocess**Acpons`
- ouGET /api/cdpoint:** `*En
- *oupons** All C1. Gets

**Coupon API

#### eview

---n updated rtur  - Rer
reviewecation to nd notifiSe
  - ded if provilyin rep
  - Add admtatusl sovaapprate  - Upd ID
 nd review by
  - Fimin roleate adlidVa - 

#### Inventory APIs

**1. Get Stock Levels**
- **Endpoint:** `GET /api/inventory`
- **Access:** Admin only
- **Response:** `{products, lowStock, outOfStock}`
- **Logic:**
  - Validate admin role
  - Query all products with stock info
  - Identify low stock products
  - Identify out of stock products
  - Return inventory data

**2. Update Stock**
- **Endpoint:** `PUT /api/inventory/[productId]`
- **Access:** Admin only
- **Request Body:** `{stock, reason}`
- **Response:** `{success, product}`
- **Logic:**
  - Validate admin role
  - Find product by ID
  - Update stock quantity
  - Log stock adjustment
  - Check low stock threshold
  - Send alert if low stock
  - Return updated product

**3. Get Low Stock Products**
- **Endpoint:** `GET /api/inventory/low-stock`
- **Access:** Admin only
- **Response:** `{products}`
- **Logic:**
  - Validate admin role
  - Query products where stock <= lowStockThreshold
  - Sort by stock level
  - Return low stock products

---

#### Customer APIs

**1. Get All Customers**
- **Endpoint:** `GET /api/customers`
- **Access:** Admin only
- **Query Params:** `page, limit, search, sort`
- **Response:** `{customers, pagination}`
- **Logic:**
  - Validate admin role
  - Query users with role 'customer'
  - Apply search and filters
  - Include order statistics
  - Return customers

**2. Get Customer Details**
- **Endpoint:** `GET /api/customers/[id]`
- **Access:** Admin only
- **Response:** `{customer, orders, stats}`
- **Logic:**
  - Validate admin role
  - Find customer by ID
  - Get customer orders
  - Calculate statistics
  - Return customer data

**3. Update Customer**
- **Endpoint:** `PUT /api/customers/[id]`
- **Access:** Admin only
- **Request Body:** `{customer data}`
- **Response:** `{success, customer}`
- **Logic:**
  - Validate admin role
  - Find customer by ID
  - Update customer data
  - Return updated customer

---

#### Report APIs

**1. Sales Report**
- **Endpoint:** `GET /api/reports/sales`
- **Access:** Admin only
- **Query Params:** `startDate, endDate, groupBy`
- **Response:** `{report, charts}`
- **Logic:**
  - Validate admin role
  - Query orders in date range
  - Calculate metrics (revenue, orders, AOV)
  - Group by day/week/month
  - Return report data

**2. Customer Report**
- **Endpoint:** `GET /api/reports/customers`
- **Access:** Admin only
- **Query Params:** `startDate, endDate`
- **Response:** `{report}`
- **Logic:**
  - Validate admin role
  - Calculate customer metrics
  - New vs returning customers
  - Customer lifetime value
  - Return report data

**3. Inventory Report**
- **Endpoint:** `GET /api/reports/inventory`
- **Access:** Admin only
- **Response:** `{report}`
- **Logic:**
  - Validate admin role
  - Calculate inventory metrics
  - Stock valuation
  - Stock movement
  - Return report data

**4. Export Report**
- **Endpoint:** `POST /api/reports/export`
- **Access:** Admin only
- **Request Body:** `{reportType, format, filters}`
- **Response:** File download (CSV/PDF)
- **Logic:**
  - Validate admin role
  - Generate report data
  - Format as CSV or PDF
  - Return file for download

---

#### Newsletter APIs

**1. Subscribe**
- **Endpoint:** `POST /api/newsletter/subscribe`
- **Access:** Public
- **Request Body:** `{email}`
- **Response:** `{success, message}`
- **Logic:**
  - Validate email format
  - Check if already subscribed
  - Create or update subscription
  - Send welcome email
  - Return success message

**2. Unsubscribe**
- **Endpoint:** `POST /api/newsletter/unsubscribe`
- **Access:** Public
- **Request Body:** `{email}` or `{token}`
- **Response:** `{success, message}`
- **Logic:**
  - Find subscription
  - Update isSubscribed to false
  - Record unsubscribe date
  - Return success message

**3. Send Campaign**
- **Endpoint:** `POST /api/newsletter/send`
- **Access:** Admin only
- **Request Body:** `{subject, content, segment}`
- **Response:** `{success, sent, failed}`
- **Logic:**
  - Validate admin role
  - Get subscriber list
  - Apply segmentation
  - Send emails in batches
  - Track delivery status
  - Return campaign results

---

#### Upload APIs

**1. Upload Image**
- **Endpoint:** `POST /api/upload/image`
- **Access:** Authenticated
- **Request Body:** FormData with image file
- **Response:** `{success, url, publicId}`
- **Logic:**
  - Validate user authentication
  - Validate file type (jpg, png, webp)
  - Validate file size (max 5MB)
  - Upload to Cloudinary/S3
  - Optimize image
  - Return image URL

**2. Upload File**
- **Endpoint:** `POST /api/upload/file`
- **Access:** Admin only
- **Request Body:** FormData with file
- **Response:** `{success, url, fileInfo}`
- **Logic:**
  - Validate admin role
  - Validate file type
  - Validate file size
  - Upload to storage
  - Return file URL and metadata

**3. Delete File**
- **Endpoint:** `DELETE /api/upload/[id]`
- **Access:** Admin only
- **Response:** `{success, message}`
- **Logic:**
  - Validate admin role
  - Delete file from storage
  - Return success message

---


## 💳 Payment Gateway Integration

### 1. Stripe Integration

**Setup Steps:**
1. Create Stripe account
2. Get API keys (publishable and secret)
3. Install Stripe SDK
4. Configure webhook endpoint
5. Test with test cards

**Implementation Flow:**
1. Customer initiates checkout
2. Backend creates payment intent
3. Frontend collects card details
4. Stripe processes payment
5. Webhook confirms payment
6. Order status updated
7. Confirmation email sent

**Key Functions:**
- `createPaymentIntent(amount, orderId)` - Create payment intent
- `confirmPayment(paymentIntentId)` - Confirm payment
- `processRefund(paymentIntentId, amount)` - Process refund
- `handleWebhook(event)` - Handle webhook events

---

### 2. PayPal Integration

**Setup Steps:**
1. Create PayPal Business account
2. Get Client ID and Secret
3. Install PayPal SDK
4. Configure return URLs
5. Test with sandbox

**Implementation Flow:**
1. Customer selects PayPal
2. Backend creates PayPal order
3. Customer redirected to PayPal
4. Customer approves payment
5. Backend captures payment
6. Order status updated
7. Confirmation email sent

**Key Functions:**
- `createPayPalOrder(orderData)` - Create PayPal order
- `capturePayPalPayment(orderId)` - Capture payment
- `processPayPalRefund(captureId, amount)` - Process refund

---

### 3. SSLCommerz Integration (Bangladesh)

**Setup Steps:**
1. Create SSLCommerz merchant account
2. Get Store ID and Password
3. Install SSLCommerz package
4. Configure IPN URL
5. Test with sandbox

**Implementation Flow:**
1. Customer initiates checkout
2. Backend initializes SSLCommerz session
3. Customer redirected to payment gateway
4. Customer completes payment
5. IPN notification received
6. Payment validated
7. Order status updated
8. Confirmation email sent

**Key Functions:**
- `initSSLCommerzPayment(orderData)` - Initialize payment
- `validateSSLCommerzPayment(valId)` - Validate payment
- `handleSSLCommerzIPN(data)` - Handle IPN notification
- `processSSLCommerzRefund(bankTranId, amount)` - Process refund

---

### 4. Cash on Delivery (COD)

**Implementation:**
- No payment gateway required
- Order created with payment status 'pending'
- Admin manually confirms payment on delivery
- Optional: Phone verification for COD orders
- Optional: COD fee added to order total

---

## 📧 Email System

### Email Service Setup

**Recommended:** Resend (modern, developer-friendly)

**Configuration:**
1. Create Resend account
2. Get API key
3. Verify domain
4. Configure DNS records
5. Test email delivery

### Email Templates (React Email)

**Template Structure:**
- HTML email with inline CSS
- Responsive design
- Brand colors and logo
- Clear call-to-action
- Unsubscribe link

**Email Types:**

1. **Transactional Emails:**
   - Welcome email
   - Email verification
   - Password reset
   - Order confirmation
   - Order shipped
   - Order delivered
   - Payment successful
   - Payment failed
   - Refund processed

2. **Marketing Emails:**
   - Newsletter
   - Abandoned cart (1hr, 24hr, 3 days)
   - Product recommendations
   - Special offers
   - Back in stock

3. **Admin Notifications:**
   - New order
   - Low stock alert
   - New review
   - New customer registration

**Email Sending Function:**
```typescript
async function sendEmail({
  to,
  subject,
  template,
  data
}) {
  // Render React email template
  const html = render(template(data))
  
  // Send via Resend
  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  })
}
```

---

## 🔒 Security Implementation

### Input Validation

**Using Zod:**
- Define schemas for all inputs
- Validate on server-side
- Return clear error messages
- Sanitize user inputs

**Example:**
```typescript
const productSchema = z.object({
  name: z.string().min(3).max(200),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  category: z.string(),
  // ... more fields
})
```

### Authentication Security

**Password Hashing:**
- Use bcrypt with 10+ salt rounds
- Never store plain text passwords
- Validate password strength

**JWT Tokens:**
- Sign with strong secret
- Set expiration (30 days)
- Store in HTTP-only cookies
- Implement token refresh

**Rate Limiting:**
- Limit login attempts (5 per 15 min)
- Limit API requests (100 per 15 min)
- Use Redis for distributed rate limiting

### API Security

**Middleware Stack:**
1. CORS configuration
2. Rate limiting
3. Authentication check
4. Role authorization
5. Input validation
6. Error handling

**Security Headers:**
- Strict-Transport-Security
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy

### Database Security

**Best Practices:**
- Use environment variables for credentials
- Enable MongoDB authentication
- Use connection pooling
- Implement query timeouts
- Regular backups
- Encrypt sensitive data

### File Upload Security

**Validation:**
- Whitelist file types
- Limit file size (5MB for images)
- Scan for malware
- Generate unique filenames
- Store outside web root

---

## ⚡ Performance Optimization

### Database Optimization

**Indexing Strategy:**
- Index frequently queried fields
- Compound indexes for complex queries
- Text indexes for search
- Monitor index usage

**Query Optimization:**
- Use projection to limit fields
- Implement pagination
- Use aggregation pipelines
- Cache frequent queries
- Avoid N+1 queries

**Connection Pooling:**
- Configure max pool size
- Set connection timeout
- Monitor connection usage

### API Optimization

**Caching:**
- Cache static data (categories, settings)
- Use Redis for session storage
- Implement response caching
- Set appropriate cache headers

**Response Optimization:**
- Compress responses (gzip/brotli)
- Minimize response payload
- Use pagination
- Implement field selection

### Background Jobs

**Use Cases:**
- Send emails asynchronously
- Process bulk operations
- Generate reports
- Clean up old data
- Send abandoned cart emails

**Implementation:**
- Use job queue (Bull, BullMQ)
- Process jobs in background
- Implement retry logic
- Monitor job status

---


## 📊 Development Workflow

### Phase 1: Project Setup & Database (Week 1)

**Tasks:**
1. Initialize Next.js project with TypeScript
2. Install backend dependencies
3. Set up MongoDB Atlas cluster
4. Configure environment variables
5. Create database connection utility
6. Set up project structure

**Deliverables:**
- Working Next.js project
- MongoDB connection established
- Environment configuration complete

---

### Phase 2: Database Models (Week 1-2)

**Tasks:**
1. Define Mongoose schemas
2. Create User model with methods
3. Create Product model with methods
4. Create Category model
5. Create Order model
6. Create Review model
7. Create Cart model
8. Create Wishlist model
9. Create Coupon model
10. Create Newsletter model
11. Create PageContent model
12. Create Settings model
13. Add indexes to all models
14. Test model creation and queries

**Deliverables:**
- All database models defined
- Indexes created
- Model methods implemented
- Basic CRUD operations tested

---

### Phase 3: Authentication System (Week 2)

**Tasks:**
1. Install and configure NextAuth.js
2. Create authentication API routes
3. Implement user registration
4. Implement user login
5. Implement password hashing
6. Create email verification system
7. Implement password reset flow
8. Create authentication middleware
9. Implement role-based authorization
10. Test authentication flow

**Deliverables:**
- Complete authentication system
- Email verification working
- Password reset functional
- Middleware protecting routes

---

### Phase 4: Product APIs (Week 3)

**Tasks:**
1. Create product CRUD APIs
2. Implement product listing with filters
3. Implement product search
4. Implement pagination
5. Create featured products endpoint
6. Implement product image upload
7. Create bulk import endpoint
8. Add product validation
9. Test all product endpoints

**Deliverables:**
- Complete product API
- Search and filters working
- Image upload functional
- Bulk import tested

---

### Phase 5: Category APIs (Week 3)

**Tasks:**
1. Create category CRUD APIs
2. Implement category tree structure
3. Add category image upload
4. Create category products endpoint
5. Test category operations

**Deliverables:**
- Complete category API
- Category hierarchy working
- Category-product relationship functional

---

### Phase 6: Cart & Wishlist APIs (Week 4)

**Tasks:**
1. Create cart APIs
2. Implement add to cart logic
3. Implement cart update/remove
4. Create cart total calculation
5. Implement guest cart support
6. Create wishlist APIs
7. Test cart operations
8. Test wishlist operations

**Deliverables:**
- Complete cart system
- Guest cart support
- Wishlist functional
- Cart calculations accurate

---

### Phase 7: Order APIs (Week 4-5)

**Tasks:**
1. Create order creation API
2. Implement order calculation logic
3. Create order status update API
4. Implement order cancellation
5. Create order tracking endpoint
6. Implement stock deduction
7. Create order history endpoint
8. Test order flow end-to-end

**Deliverables:**
- Complete order system
- Order calculations accurate
- Stock management working
- Order history functional

---

### Phase 8: Payment Integration (Week 5)

**Tasks:**
1. Set up Stripe integration
2. Create payment intent API
3. Implement Stripe webhook
4. Set up PayPal integration
5. Create PayPal order API
6. Set up SSLCommerz integration
7. Create SSLCommerz IPN handler
8. Implement COD support
9. Test all payment methods
10. Test webhook handling

**Deliverables:**
- All payment gateways integrated
- Webhooks handling payments
- Payment confirmation working
- Refund system functional

---

### Phase 9: Review APIs (Week 6)

**Tasks:**
1. Create review CRUD APIs
2. Implement review validation
3. Add review image upload
4. Create review moderation API
5. Implement rating calculation
6. Test review system

**Deliverables:**
- Complete review system
- Rating calculations accurate
- Moderation working
- Review images functional

---

### Phase 10: Coupon System (Week 6)

**Tasks:**
1. Create coupon CRUD APIs
2. Implement coupon validation logic
3. Create discount calculation
4. Implement usage tracking
5. Test coupon application

**Deliverables:**
- Complete coupon system
- Validation logic working
- Usage limits enforced
- Discount calculations accurate

---

### Phase 11: Inventory Management (Week 7)

**Tasks:**
1. Create inventory APIs
2. Implement stock update logic
3. Create low stock alerts
4. Implement stock history logging
5. Test inventory operations

**Deliverables:**
- Complete inventory system
- Stock tracking accurate
- Low stock alerts working
- Stock history maintained

---

### Phase 12: Customer Management (Week 7)

**Tasks:**
1. Create customer listing API
2. Implement customer details endpoint
3. Create customer update API
4. Add customer statistics
5. Test customer operations

**Deliverables:**
- Complete customer management
- Customer statistics accurate
- Customer data accessible

---

### Phase 13: Email System (Week 8)

**Tasks:**
1. Set up email service (Resend)
2. Create email templates
3. Implement transactional emails
4. Create email sending utility
5. Implement abandoned cart emails
6. Create newsletter system
7. Test all email types

**Deliverables:**
- Email service configured
- All email templates created
- Transactional emails working
- Newsletter system functional

---

### Phase 14: Reports & Analytics (Week 8)

**Tasks:**
1. Create sales report API
2. Implement customer report API
3. Create inventory report API
4. Implement data export (CSV/PDF)
5. Test report generation

**Deliverables:**
- All report APIs functional
- Data export working
- Reports accurate

---

### Phase 15: File Upload System (Week 9)

**Tasks:**
1. Set up Cloudinary/S3
2. Create image upload API
3. Implement file validation
4. Create file delete API
5. Test file operations

**Deliverables:**
- File upload working
- Image optimization functional
- File deletion working

---

### Phase 16: Settings & CMS (Week 9)

**Tasks:**
1. Create settings API
2. Implement settings update
3. Create CMS page APIs
4. Test settings management

**Deliverables:**
- Settings management functional
- CMS pages working

---

### Phase 17: Security Hardening (Week 10)

**Tasks:**
1. Implement rate limiting
2. Add input validation to all endpoints
3. Configure security headers
4. Implement CORS properly
5. Add error handling
6. Test security measures

**Deliverables:**
- Rate limiting active
- All inputs validated
- Security headers configured
- Error handling robust

---

### Phase 18: Testing & Bug Fixes (Week 10)

**Tasks:**
1. Write unit tests for utilities
2. Write integration tests for APIs
3. Test all endpoints manually
4. Fix discovered bugs
5. Test error scenarios
6. Optimize slow queries

**Deliverables:**
- Test coverage > 70%
- All bugs fixed
- Performance optimized

---

## 🧪 Testing Strategy

### Unit Testing

**Test Coverage:**
- Utility functions
- Model methods
- Validation schemas
- Calculation functions

**Tools:** Jest

**Example:**
```typescript
describe('Product Model', () => {
  test('should update stock correctly', async () => {
    const product = await Product.create({...})
    await product.updateStock(10, 'add')
    expect(product.stock).toBe(10)
  })
})
```

---

### Integration Testing

**Test Coverage:**
- API endpoints
- Database operations
- Authentication flow
- Payment processing

**Tools:** Jest + Supertest

**Example:**
```typescript
describe('POST /api/products', () => {
  test('should create product as admin', async () => {
    const response = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(productData)
    
    expect(response.status).toBe(201)
    expect(response.body.product).toBeDefined()
  })
})
```

---

### API Testing

**Manual Testing:**
- Use Postman or Insomnia
- Test all endpoints
- Test error scenarios
- Test edge cases
- Verify response formats

**Automated Testing:**
- Create test collections
- Run automated tests
- Monitor API performance

---

## 🚀 Deployment

### Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database indexes created
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] Security headers set
- [ ] CORS configured
- [ ] Payment gateways tested
- [ ] Email service tested
- [ ] File upload tested
- [ ] All APIs tested
- [ ] Performance optimized

### MongoDB Atlas Setup

1. Create cluster (M0 free tier for testing)
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Create database
6. Create indexes
7. Configure backup

### Vercel Deployment

1. Push code to GitHub
2. Import project to Vercel
3. Configure environment variables
4. Deploy to production
5. Test production APIs
6. Monitor logs

### Environment Variables

```bash
# Database
DATABASE_URL=mongodb+srv://...

# Authentication
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# SSLCommerz
SSLCOMMERZ_STORE_ID=...
SSLCOMMERZ_STORE_PASSWORD=...

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 📚 Best Practices

### Code Organization

- Keep API routes thin, move logic to services
- Use TypeScript for type safety
- Create reusable utilities
- Follow consistent naming conventions
- Document complex logic

### Error Handling

- Use try-catch blocks
- Return consistent error responses
- Log errors for debugging
- Don't expose sensitive info in errors
- Handle edge cases

### Database Queries

- Use indexes for frequent queries
- Implement pagination
- Use projection to limit fields
- Avoid N+1 queries
- Monitor query performance

### API Design

- Follow RESTful conventions
- Use appropriate HTTP methods
- Return consistent response formats
- Include pagination metadata
- Version your APIs if needed

### Security

- Validate all inputs
- Sanitize user data
- Use parameterized queries
- Implement rate limiting
- Keep dependencies updated
- Regular security audits

---

## 🎯 Success Metrics

### Performance Targets

- API response time < 200ms
- Database query time < 50ms
- File upload time < 2s
- Email delivery time < 5s

### Reliability Targets

- API uptime > 99.9%
- Error rate < 0.1%
- Successful payment rate > 99%

---

## 📖 Additional Resources

- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Zod Documentation](https://zod.dev)

---

**Document Version:** 1.0  
**Last Updated:** January 12, 2026  
**Estimated Development Time:** 8-10 weeks

---

**This backend guide provides a complete roadmap for building a production-ready e-commerce API. Follow the phases systematically for best results.**

