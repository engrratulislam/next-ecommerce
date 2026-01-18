import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import { z } from 'zod';

const updatePageSchema = z.object({
  slug: z.string().min(1).max(200).optional(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/admin/pages/[id] - Get single page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectDB();

    const page = await PageContent.findById(id).lean();

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get page error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch page',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/pages/[id] - Update page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const validation = updatePageSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const page = await PageContent.findById(id);

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    // Check if slug is being changed and if it already exists
    if (validation.data.slug && validation.data.slug !== page.slug) {
      const existingPage = await PageContent.findOne({
        slug: validation.data.slug,
        _id: { $ne: id },
      });
      if (existingPage) {
        return NextResponse.json(
          { success: false, error: 'A page with this slug already exists' },
          { status: 400 }
        );
      }
    }

    // Update fields
    Object.assign(page, validation.data);
    await page.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Page updated successfully',
        page,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update page error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update page',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/pages/[id] - Delete page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = params;

    await connectDB();

    const page = await PageContent.findById(id);

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Page not found' },
        { status: 404 }
      );
    }

    await page.deleteOne();

    return NextResponse.json(
      {
        success: true,
        message: 'Page deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete page error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete page',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
