import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import Newsletter from '@/models/Newsletter';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';
import { z } from 'zod';

const createCampaignSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  recipientType: z.enum(['all', 'subscribers', 'customers', 'custom']),
  recipientEmails: z.array(z.string().email()).optional(),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(['draft', 'scheduled']).optional(),
});

// GET /api/admin/campaigns - Get all campaigns
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
    const status = searchParams.get('status') || '';

    await connectDB();

    const query: any = {};
    if (status) {
      query.status = status;
    }

    const [campaigns, totalCount] = await Promise.all([
      Campaign.find(query)
        .populate('createdBy', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .lean(),
      Campaign.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        success: true,
        campaigns,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch campaigns',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/campaigns - Create campaign
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
    const validation = createCampaignSchema.safeParse(body);

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

    const adminId = (session.user as any).id;
    const campaignData = {
      ...validation.data,
      createdBy: adminId,
      status: validation.data.status || 'draft',
    };

    // Calculate total recipients
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

    const campaign = await Campaign.create({
      ...campaignData,
      totalRecipients,
    });

    // If status is scheduled and scheduledAt is in the past or not set, send immediately
    if (
      campaign.status === 'scheduled' &&
      (!campaign.scheduledAt || new Date(campaign.scheduledAt) <= new Date())
    ) {
      // Send campaign immediately
      await sendCampaignEmails(campaign._id.toString());
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign created successfully',
        campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// Helper function to send campaign emails
async function sendCampaignEmails(campaignId: string) {
  try {
    await connectDB();

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    let recipients: string[] = [];

    // Get recipients based on type
    if (campaign.recipientType === 'all') {
      const [subscribers, customers] = await Promise.all([
        Newsletter.find({ isSubscribed: true }).select('email').lean(),
        User.find({ role: 'customer' }).select('email').lean(),
      ]);
      recipients = [
        ...subscribers.map((s: any) => s.email),
        ...customers.map((c: any) => c.email),
      ];
    } else if (campaign.recipientType === 'subscribers') {
      const subscribers = await Newsletter.find({ isSubscribed: true })
        .select('email')
        .lean();
      recipients = subscribers.map((s: any) => s.email);
    } else if (campaign.recipientType === 'customers') {
      const customers = await User.find({ role: 'customer' }).select('email').lean();
      recipients = customers.map((c: any) => c.email);
    } else if (campaign.recipientType === 'custom') {
      recipients = campaign.recipientEmails || [];
    }

    // Remove duplicates
    recipients = [...new Set(recipients)];

    let successCount = 0;
    let failureCount = 0;

    // Send emails in batches
    const batchSize = 50;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (email) => {
          try {
            await sendEmail({
              to: email,
              subject: campaign.subject,
              html: campaign.content,
            });
            successCount++;
          } catch (error) {
            console.error(`Failed to send email to ${email}:`, error);
            failureCount++;
          }
        })
      );
    }

    // Update campaign status
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.successCount = successCount;
    campaign.failureCount = failureCount;
    campaign.totalRecipients = recipients.length;
    await campaign.save();

    return { success: true, successCount, failureCount };
  } catch (error) {
    console.error('Send campaign emails error:', error);
    throw error;
  }
}
