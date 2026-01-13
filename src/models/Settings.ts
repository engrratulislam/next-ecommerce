import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  storeName: string;
  storeDescription?: string;
  logo?: string;
  favicon?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  paymentGateways: {
    stripe: {
      enabled: boolean;
      publicKey?: string;
      secretKey?: string;
    };
    paypal: {
      enabled: boolean;
      clientId?: string;
      clientSecret?: string;
    };
    sslcommerz: {
      enabled: boolean;
      storeId?: string;
      storePassword?: string;
    };
    cod: {
      enabled: boolean;
    };
  };
  shipping: {
    freeShippingThreshold?: number;
    flatRate?: number;
    zones?: Array<{
      name: string;
      countries: string[];
      rate: number;
    }>;
  };
  tax: {
    enabled: boolean;
    rate: number;
    includeInPrice: boolean;
  };
  email: {
    fromName: string;
    fromEmail: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPassword?: string;
  };
  seo: {
    metaTitle?: string;
    metaDescription?: string;
    googleAnalyticsId?: string;
    facebookPixelId?: string;
  };
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },
    storeDescription: {
      type: String,
      maxlength: [500, "Store description cannot exceed 500 characters"],
    },
    logo: {
      type: String,
    },
    favicon: {
      type: String,
    },
    contactEmail: {
      type: String,
      required: [true, "Contact email is required"],
      lowercase: true,
      trim: true,
    },
    contactPhone: {
      type: String,
    },
    address: {
      type: String,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    currencySymbol: {
      type: String,
      default: "$",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
    paymentGateways: {
      stripe: {
        enabled: { type: Boolean, default: false },
        publicKey: String,
        secretKey: String,
      },
      paypal: {
        enabled: { type: Boolean, default: false },
        clientId: String,
        clientSecret: String,
      },
      sslcommerz: {
        enabled: { type: Boolean, default: false },
        storeId: String,
        storePassword: String,
      },
      cod: {
        enabled: { type: Boolean, default: true },
      },
    },
    shipping: {
      freeShippingThreshold: Number,
      flatRate: Number,
      zones: [
        {
          name: String,
          countries: [String],
          rate: Number,
        },
      ],
    },
    tax: {
      enabled: { type: Boolean, default: false },
      rate: { type: Number, default: 0 },
      includeInPrice: { type: Boolean, default: false },
    },
    email: {
      fromName: { type: String, required: true },
      fromEmail: { type: String, required: true },
      smtpHost: String,
      smtpPort: Number,
      smtpUser: String,
      smtpPassword: String,
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      googleAnalyticsId: String,
      facebookPixelId: String,
    },
    socialMedia: {
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", settingsSchema);

export default Settings;
