import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICampaign extends Document {
  name: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent' | 'cancelled';
  recipientType: 'all' | 'subscribers' | 'customers' | 'custom';
  recipientEmails?: string[];
  scheduledAt?: Date;
  sentAt?: Date;
  totalRecipients: number;
  successCount: number;
  failureCount: number;
  openCount: number;
  clickCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
      maxlength: [100, 'Campaign name cannot exceed 100 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Email subject is required'],
      trim: true,
      maxlength: [200, 'Subject cannot exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Email content is required'],
    },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'sent', 'cancelled'],
      default: 'draft',
      index: true,
    },
    recipientType: {
      type: String,
      enum: ['all', 'subscribers', 'customers', 'custom'],
      required: [true, 'Recipient type is required'],
    },
    recipientEmails: {
      type: [String],
      default: [],
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    totalRecipients: {
      type: Number,
      default: 0,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    openCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
campaignSchema.index({ status: 1, createdAt: -1 });
campaignSchema.index({ createdBy: 1 });

const Campaign: Model<ICampaign> =
  mongoose.models.Campaign || mongoose.model<ICampaign>('Campaign', campaignSchema);

export default Campaign;
