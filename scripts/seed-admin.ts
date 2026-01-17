import { config } from 'dotenv';
import { resolve } from 'path';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../src/models/Admin'; // Import the actual Admin model

// Load environment variables FIRST
config({ path: resolve(process.cwd(), '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL is not defined in .env.local');
  process.exit(1);
}

async function seedAdmin() {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(DATABASE_URL!);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@example.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin already exists');
      console.log('📧 Email: admin@example.com');
      console.log('🔐 Password: admin123');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create default admin with plain password
    // The pre-save hook in Admin model will hash it automatically
    const admin = new Admin({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123', // Plain password - will be hashed by pre-save hook
      role: 'admin',
      isActive: true,
    });

    // Save - pre-save middleware will hash the password
    await admin.save();

    console.log('✅ Admin account created successfully!');
    console.log('================================');
    console.log('📧 Email: admin@example.com');
    console.log('🔐 Password: admin123');
    console.log('================================');
    console.log('⚠️  IMPORTANT: Please change the password after first login!');
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedAdmin();
