import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Admin from '@/models/Admin';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const admin = await Admin.findOne({ email: 'admin@example.com' }).select('+password');
    
    if (!admin) {
      return NextResponse.json({
        success: false,
        message: 'Admin not found'
      });
    }
    
    const testPassword = 'admin123';
    const isValid = await admin.comparePassword(testPassword);
    
    return NextResponse.json({
      success: true,
      admin: {
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive,
        hasPassword: !!admin.password,
        passwordLength: admin.password?.length
      },
      passwordTest: {
        testPassword,
        isValid
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
