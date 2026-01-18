import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import connectDB from '@/lib/db';
import Campaign from '@/models/Campaign';
import Newsletter from '@/models/Newsletter';
import User from '@/models/User';
import { sendEmail } from '@/lib/email';

// POST /api/admin/campaigns/[id]/send - Send campaign now
export async function POST(
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

    if (campaign.status === 'sent') {
      return NextResponse.json(
        { success: false, error: 'Campaign already sent' },
        { status: 400 }
      );
    }

    if (campaign.status === 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Cannot send cancelled campaign' },
        { status: 400 }
      );
    }

    // Get recipients
    let recipients: string[] = [];

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

    if (recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recipients found' },
        { status: 400 }
      );
    }

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

    // Update campaign
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.successCount = successCount;
    campaign.failureCount = failureCount;
    campaign.totalRecipients = recipients.length;
    await campaign.save();

    return NextResponse.json(
      {
        success: true,
        message: 'Campaign sent successfully',
        stats: {
          totalRecipients: recipients.length,
          successCount,
          failureCount,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send campaign error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send campaign',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
