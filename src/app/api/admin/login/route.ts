import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';
import { sign } from 'jsonwebtoken';

/**
 * @deprecated This endpoint is deprecated. Use NextAuth via /api/auth/[...nextauth] instead.
 * Admin login should use NextAuth with isAdmin: true flag.
 * Keeping this endpoint for backward compatibility only.
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[ADMIN LOGIN] Starting login process');
    const body = await request.json();
    const { email, password } = body;
    console.log('[ADMIN LOGIN] Parsed body, email:', email);

    if (!email || !password) {
      console.log('[ADMIN LOGIN] Missing credentials');
      return NextResponse.json(
        { success: false, error: 'Email and password required' },
        { status: 400 }
      );
    }

    console.log('[ADMIN LOGIN] Connecting to database');
    await connectDB();
    console.log('[ADMIN LOGIN] Database connected');

    // Find admin
    console.log('[ADMIN LOGIN] Searching for admin with email:', email);
    const admin = await Admin.findOne({ email }).select('+password');
    console.log('[ADMIN LOGIN] Admin found:', !!admin, 'isActive:', admin?.isActive);

    if (!admin || !admin.isActive) {
      console.log('[ADMIN LOGIN] Admin not found or inactive');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    console.log('[ADMIN LOGIN] Verifying password');
    const isPasswordValid = await admin.comparePassword(password);
    console.log('[ADMIN LOGIN] Password valid:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('[ADMIN LOGIN] Invalid password');
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    console.log('[ADMIN LOGIN] Updating last login');
    admin.lastLogin = new Date();
    await admin.save();
    console.log('[ADMIN LOGIN] Last login updated');

    // Create session token
    console.log('[ADMIN LOGIN] Creating JWT token');
    const token = sign(
      {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: 'admin',
        userType: 'admin',
      },
      process.env.NEXTAUTH_SECRET || 'fallback-secret',
      { expiresIn: '30d' }
    );
    console.log('[ADMIN LOGIN] Token created successfully');

    return NextResponse.json({
      success: true,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
      token,
    });
  } catch (error: any) {
    console.error('[ADMIN LOGIN ERROR]', error);
    console.error('[ADMIN LOGIN ERROR - Stack]', error?.stack);
    console.error('[ADMIN LOGIN ERROR - Message]', error?.message);
    return NextResponse.json(
      { success: false, error: 'Login failed', details: error?.message },
      { status: 500 }
    );
  }
}
