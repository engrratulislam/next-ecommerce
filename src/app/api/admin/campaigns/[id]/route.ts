import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import Newsletter from '@/models/Newsletter';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  subject: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  recipientType: z.enum(['all', 'subscribers', 'customers', 'custom']).optional(),
  recipientEmails: z.array(z.string().email()).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled', 'cancelled']).optional(),
});

// GET /api/admin/campaigns/[id] - Get single campaign
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

    const campaign = await Campaign.findById(id)
      .populate('createdBy', 'name email')
      .lean();

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get campaign error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/campaigns/[id] - Update campaign
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
    const validation = updateCampaignSchema.safeParse(body);

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

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Can't update sent campaigns
    if (campaign.status === 'sent') {
      return NextResponse.json(
        { success: false, error: 'Cannot update sent campaigns' },
        { status: 400 }
      );
    }

    // Update fields
    Object.assign(campaign, validation.data);

    // Recalculate total recipients if recipient type changed
    if (validation.data.recipientType) {
      let totalRecipients = 0;
      if (validation.data.recipientType === 'all') {
        const [subscribersCount, customersCount] = await Promise.all([
          Newsletter.countDocuments({ isSubscribed: true }),
          User.countDocuments({ role: 'customer' }),
        ]);
        totalRecipients = subscribersCount + customersCount;
      } else if (validation.data.recipientType === 'subscribers') {
        totalRecipients = await Newsletter.countDocuments({ isSubscribed: true });
      } else if (validation.data.recipientType === 'customers') {
        totalRecipients = await User.countDocuments({ role: 'customer' });
      } else if (validation.data.recipientType === 'custom') {
        totalRecipients = validation.data.recipientEmails?.length || 0;
      }
      campaign.totalRecipients = totalRecipients;
    }

    await campaign.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign updated successfully',
        campaign,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update campaign error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/campaigns/[id] - Delete campaign
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

    const campaign = await Campaign.findById(id);

    if (!campaign) {
      return NextResponse.json(
        { success: false, error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Can only delete draft or cancelled campaigns
    if (campaign.status === 'sent' || campaign.status === 'scheduled') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete sent or scheduled campaigns. Cancel them first.',
        },
        { status: 400 }
      );
    }

    await campaign.deleteOne();

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
