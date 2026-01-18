import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import PageContent from '@/models/PageContent';
import { z } from 'zod';

const createPageSchema = z.object({
  slug: z.string().min(1).max(200),
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  isPublished: z.boolean().optional(),
});

// GET /api/admin/pages - Get all pages
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    await connectDB();

    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    if (status === 'published') {
      query.isPublished = true;
    } else if (status === 'draft') {
      query.isPublished = false;
    }

    const [pages, totalCount] = await Promise.all([
      PageContent.find(query)
        .sort('-updatedAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      PageContent.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        pages,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get pages error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch pages',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/pages - Create page
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = createPageSchema.safeParse(body);

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

    // Check if slug already exists
    const existingPage = await PageContent.findOne({ slug: validation.data.slug });
    if (existingPage) {
      return NextResponse.json(
        { success: false, error: 'A page with this slug already exists' },
        { status: 400 }
      );
    }

    const page = await PageContent.create(validation.data);

    return NextResponse.json(
      {
        success: true,
        message: 'Page created successfully',
        page,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create page error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create page',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
