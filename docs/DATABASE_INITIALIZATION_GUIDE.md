# Database Initialization Guide

## Overview

This guide will help you initialize all MongoDB collections for the Next.js E-Commerce platform with sample data.

---

## ✅ Database Schema Verification

**Total Collections: 11**

The database schema is **PERFECT** for a single-vendor e-commerce platform with:

✅ **Users** - Customer & admin accounts  
✅ **Products** - Product catalog with variants & inventory  
✅ **Categories** - Hierarchical product categorization  
✅ **Orders** - Order management with tracking  
✅ **Carts** - Shopping carts (guest + authenticated)  
✅ **Wishlists** - User saved products  
✅ **Reviews** - Product reviews & ratings  
✅ **Coupons** - Discount codes with validation  
✅ **Newsletters** - Email subscriptions  
✅ **PageContents** - CMS for static pages  
✅ **Settings** - Global configuration  

---

## 🚀 Quick Start

### Prerequisites

1. **MongoDB** installed and running
2. **Node.js** 18+ installed
3. **.env.local** file configured

### Step 1: Check Database Connection

```bash
npm run test:db
```

Expected output:
```
✅ Connected to MongoDB
Database: Next-Ecommerce
Host: localhost
Port: 27017
```

### Step 2: Initialize All Collections

```bash
npm run init:db
```

This will:
- Clear existing data
- Create admin user
- Create sample customers
- Insert 5 categories
- Insert 10 products
- Create store settings
- Create 4 CMS pages (About, Privacy, Terms, Shipping)
- Create 3 sample coupons

---

## 📋 What Gets Created

### 1. Users (3 total)

#### Admin Account
- **Email:** `admin@example.com`
- **Password:** `admin123456`
- **Role:** Admin
- **Access:** Full platform management

#### Sample Customers (2)
- **John Doe:** `john@example.com` / `customer123`
- **Jane Smith:** `jane@example.com` / `customer123`

### 2. Categories (5 total)

1. Electronics
2. Clothing
3. Home & Garden
4. Books
5. Sports & Outdoors

### 3. Products (10 total)

Distributed across categories:
- **Electronics:** Wireless Headphones, Smart Watch
- **Clothing:** T-Shirt (with size variants), Denim Jeans
- **Home & Garden:** Table Lamp, Plant Pot Set
- **Books:** Programming Guide, Mystery Novel
- **Sports:** Yoga Mat, Camping Backpack

All products include:
- Images (placeholder URLs)
- SKU codes
- Stock levels
- Pricing (regular & compare-at)
- Tags for search
- SEO metadata

### 4. Store Settings (1 document)

Global configuration including:
- Store name & contact info
- Currency: USD ($)
- Payment gateways (COD enabled by default)
- Shipping rates (Free over $100)
- Tax configuration (8.5%)
- Email settings
- Social media links

### 5. CMS Pages (4 total)

- **About Us** - `/about`
- **Privacy Policy** - `/privacy-policy`
- **Terms & Conditions** - `/terms-conditions`
- **Shipping & Returns** - `/shipping-returns`

### 6. Coupons (3 active)

| Code | Type | Discount | Min Order | Description |
|------|------|----------|-----------|-------------|
| `WELCOME10` | Percentage | 10% | $50 | New customer welcome |
| `SAVE20` | Fixed | $20 | $200 | Order discount |
| `FREESHIP` | Fixed | $10 | $0 | Free shipping |

---

## 🔧 Alternative: Seed Basic Data Only

If you only want categories and products:

```bash
npm run seed
```

This creates:
- 5 categories
- 10 products

**Note:** This does NOT create users, settings, pages, or coupons.

---

## 🗄️ Collections Created On-Demand

The following collections are created automatically when used:

- **carts** - Created when users add items to cart
- **orders** - Created when orders are placed
- **reviews** - Created when products are reviewed
- **wishlists** - Created when users save products
- **newsletters** - Created when users subscribe

---

## 📊 Verify Database

After initialization, check your collections:

```bash
# MongoDB Shell
mongosh

# Switch to database
use Next-Ecommerce

# List all collections
show collections

# Count documents
db.users.countDocuments()
db.categories.countDocuments()
db.products.countDocuments()
db.settings.countDocuments()
db.pagecontents.countDocuments()
db.coupons.countDocuments()
```

Expected counts:
- users: 3
- categories: 5
- products: 10
- settings: 1
- pagecontents: 4
- coupons: 3

---

## 🔐 Default Login Credentials

### Admin Access
```
Email: admin@example.com
Password: admin123456
```

### Customer Access
```
Email: john@example.com
Password: customer123
```

**⚠️ IMPORTANT:** Change these passwords in production!

---

## 🎨 Customization

### Add Your Own Data

Edit the file: `/scripts/init-all-collections.ts`

You can customize:
- Admin credentials
- Sample customers
- Categories
- Products
- Store settings
- Page content
- Coupons

Then run:
```bash
npm run init:db
```

---

## 🔄 Re-initialization

To start fresh:

```bash
npm run init:db
```

This will:
1. Delete all existing data
2. Re-create all collections
3. Insert fresh sample data

**⚠️ WARNING:** This deletes all data including orders, reviews, and customer data!

---

## 🐛 Troubleshooting

### Error: "DATABASE_URL is not defined"

**Solution:** Create `.env.local` file:
```env
DATABASE_URL=mongodb://localhost:27017/Next-Ecommerce
```

### Error: "Cannot connect to MongoDB"

**Solution:** Ensure MongoDB is running:
```bash
# Check MongoDB status
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod
```

### Error: "Duplicate key error"

**Solution:** Collection already has data. Clear it first:
```bash
mongosh
use Next-Ecommerce
db.dropDatabase()
exit
```

Then re-run:
```bash
npm run init:db
```

---

## 📚 Related Documentation

- [DATABASE_SCHEMA_DOCUMENTATION.md](./DATABASE_SCHEMA_DOCUMENTATION.md) - Complete schema reference
- [PROGRESS_CHECKLIST.md](./PROGRESS_CHECKLIST.md) - Development status
- [BACKEND_DEVELOPMENT_GUIDE.md](./main/BACKEND_DEVELOPMENT_GUIDE.md) - API documentation

---

## 🎯 Next Steps

After database initialization:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Access the admin panel:**
   - Navigate to: `http://localhost:3000/admin`
   - Login with admin credentials

3. **Test the storefront:**
   - Navigate to: `http://localhost:3000`
   - Browse products, add to cart, checkout

4. **Verify API endpoints:**
   - Test product listing: `http://localhost:3000/api/products`
   - Test categories: `http://localhost:3000/api/categories`

---

## ✅ Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Remove or disable sample customer accounts
- [ ] Update store settings (name, contact, etc.)
- [ ] Configure real payment gateways
- [ ] Set up SMTP for email notifications
- [ ] Update CMS pages with real content
- [ ] Create production-ready product data
- [ ] Configure backup strategy
- [ ] Set up monitoring and logging
- [ ] Enable database authentication
- [ ] Configure SSL/TLS for database connection

---

**Last Updated:** January 17, 2026  
**Version:** 1.0
