import nodemailer from "nodemailer";

/**
 * Email Utility for Development and Production
 * 
 * Development: Uses Mailpit SMTP (localhost:1025)
 * - Web UI: http://localhost:8025
 * - All emails are caught locally
 * 
 * Production: Uses Resend API
 * - Configure RESEND_API_KEY in production environment
 */

// Create transporter based on environment
const createTransporter = () => {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    // Mailpit SMTP configuration for development
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || "localhost",
      port: parseInt(process.env.SMTP_PORT || "1025"),
      secure: process.env.SMTP_SECURE === "true", // false for Mailpit
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            }
          : undefined,
      tls: {
        rejectUnauthorized: false, // Allow self-signed certificates in dev
      },
    });
  } else {
    // Production: Use Resend SMTP
    return nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      secure: true,
      auth: {
        user: "resend",
        pass: process.env.RESEND_API_KEY,
      },
    });
  }
};

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

/**
 * Send email using Nodemailer
 * Automatically uses Mailpit in development, Resend in production
 */
export async function sendEmail(options: EmailOptions) {
  try {
    const transporter = createTransporter();

    const defaultFrom =
      process.env.NODE_ENV === "development"
        ? process.env.SMTP_FROM || "noreply@localhost"
        : process.env.EMAIL_FROM || "noreply@yourdomain.com";

    const mailOptions = {
      from: options.from || defaultFrom,
      to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", {
      messageId: info.messageId,
      to: mailOptions.to,
      subject: mailOptions.subject,
      environment: process.env.NODE_ENV,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

/**
 * Verify email configuration
 * Useful for testing SMTP connection
 */
export async function verifyEmailConfig() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration verified successfully");
    return true;
  } catch (error) {
    console.error("Email configuration verification failed:", error);
    return false;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(to: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #4F46E5; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Verify Your Email</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      Thank you for registering! Please verify your email address by clicking the button below.
                    </p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.5; color: #333333;">
                      This verification link will expire in 24 hours.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${verificationUrl}" 
                             style="display: inline-block; padding: 16px 40px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                            Verify Email Address
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.5; color: #666666;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 10px 0 0; font-size: 14px; word-break: break-all; color: #4F46E5;">
                      ${verificationUrl}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f8f8f8; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      If you didn't create an account, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
    Verify Your Email
    
    Thank you for registering! Please verify your email address by clicking the link below:
    
    ${verificationUrl}
    
    This verification link will expire in 24 hours.
    
    If you didn't create an account, you can safely ignore this email.
  `;

  return sendEmail({
    to,
    subject: "Verify Your Email Address",
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #DC2626; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Reset Your Password</h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      We received a request to reset your password. Click the button below to create a new password.
                    </p>
                    
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.5; color: #333333;">
                      This reset link will expire in 1 hour for security reasons.
                    </p>
                    
                    <!-- Button -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${resetUrl}" 
                             style="display: inline-block; padding: 16px 40px; background-color: #DC2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    
                    <p style="margin: 30px 0 0; font-size: 14px; line-height: 1.5; color: #666666;">
                      If the button doesn't work, copy and paste this link into your browser:
                    </p>
                    <p style="margin: 10px 0 0; font-size: 14px; word-break: break-all; color: #DC2626;">
                      ${resetUrl}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f8f8f8; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      If you didn't request a password reset, please ignore this email or contact support if you have concerns.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
    Reset Your Password
    
    We received a request to reset your password. Click the link below to create a new password:
    
    ${resetUrl}
    
    This reset link will expire in 1 hour for security reasons.
    
    If you didn't request a password reset, please ignore this email.
  `;

  return sendEmail({
    to,
    subject: "Reset Your Password",
    html,
    text,
  });
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmationEmail(
  to: string,
  orderDetails: {
    orderNumber: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    shippingAddress: any;
  }
) {
  const itemsHtml = orderDetails.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; color: #333333;">
          ${item.name} × ${item.quantity}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eeeeee; text-align: right; color: #333333;">
          $${(item.price * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #10B981; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">Order Confirmed!</h1>
                    <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">
                      Order #${orderDetails.orderNumber}
                    </p>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 30px; font-size: 16px; line-height: 1.5; color: #333333;">
                      Thank you for your order! We've received your order and will process it shortly.
                    </p>
                    
                    <!-- Order Items -->
                    <h2 style="margin: 0 0 20px; font-size: 20px; color: #333333;">Order Details</h2>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                      ${itemsHtml}
                      <tr>
                        <td style="padding: 10px; color: #666666;">Subtotal</td>
                        <td style="padding: 10px; text-align: right; color: #666666;">$${orderDetails.subtotal.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; color: #666666;">Shipping</td>
                        <td style="padding: 10px; text-align: right; color: #666666;">$${orderDetails.shipping.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 10px; color: #666666;">Tax</td>
                        <td style="padding: 10px; text-align: right; color: #666666;">$${orderDetails.tax.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td style="padding: 15px 10px; font-weight: bold; font-size: 18px; color: #333333; border-top: 2px solid #333333;">
                          Total
                        </td>
                        <td style="padding: 15px 10px; text-align: right; font-weight: bold; font-size: 18px; color: #333333; border-top: 2px solid #333333;">
                          $${orderDetails.total.toFixed(2)}
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Shipping Address -->
                    <h2 style="margin: 0 0 15px; font-size: 20px; color: #333333;">Shipping Address</h2>
                    <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #666666;">
                      ${orderDetails.shippingAddress.fullName}<br>
                      ${orderDetails.shippingAddress.address}<br>
                      ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}<br>
                      ${orderDetails.shippingAddress.country}
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="padding: 30px; background-color: #f8f8f8; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      You will receive a shipping confirmation email once your order ships.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const text = `
    Order Confirmed!
    Order #${orderDetails.orderNumber}
    
    Thank you for your order! We've received your order and will process it shortly.
    
    Order Details:
    ${orderDetails.items.map((item) => `${item.name} × ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`).join("\n")}
    
    Subtotal: $${orderDetails.subtotal.toFixed(2)}
    Shipping: $${orderDetails.shipping.toFixed(2)}
    Tax: $${orderDetails.tax.toFixed(2)}
    Total: $${orderDetails.total.toFixed(2)}
    
    Shipping Address:
    ${orderDetails.shippingAddress.fullName}
    ${orderDetails.shippingAddress.address}
    ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.postalCode}
    ${orderDetails.shippingAddress.country}
    
    You will receive a shipping confirmation email once your order ships.
  `;

  return sendEmail({
    to,
    subject: `Order Confirmation - ${orderDetails.orderNumber}`,
    html,
    text,
  });
}

/**
 * Send order status update email
 */
export async function sendOrderStatusEmail(
  to: string,
  orderNumber: string,
  status: string,
  trackingInfo?: { trackingNumber: string; carrier: string; trackingUrl?: string }
) {
  const statusMessages: Record<string, { title: string; message: string; color: string }> = {
    processing: {
      title: "Order is Being Processed",
      message: "We're currently processing your order and will ship it soon.",
      color: "#3B82F6",
    },
    shipped: {
      title: "Order Shipped!",
      message: "Your order has been shipped and is on its way to you.",
      color: "#10B981",
    },
    delivered: {
      title: "Order Delivered",
      message: "Your order has been delivered successfully. Thank you for shopping with us!",
      color: "#10B981",
    },
    cancelled: {
      title: "Order Cancelled",
      message: "Your order has been cancelled as requested.",
      color: "#DC2626",
    },
  };

  const statusInfo = statusMessages[status] || {
    title: "Order Status Update",
    message: `Your order status has been updated to: ${status}`,
    color: "#6B7280",
  };

  const trackingHtml = trackingInfo
    ? `
    <div style="margin-top: 30px; padding: 20px; background-color: #f8f8f8; border-radius: 6px;">
      <h3 style="margin: 0 0 10px; font-size: 16px; color: #333333;">Tracking Information</h3>
      <p style="margin: 0 0 5px; font-size: 14px; color: #666666;">
        <strong>Carrier:</strong> ${trackingInfo.carrier}
      </p>
      <p style="margin: 0 0 5px; font-size: 14px; color: #666666;">
        <strong>Tracking Number:</strong> ${trackingInfo.trackingNumber}
      </p>
      ${
        trackingInfo.trackingUrl
          ? `
        <p style="margin: 15px 0 0;">
          <a href="${trackingInfo.trackingUrl}" 
             style="display: inline-block; padding: 12px 30px; background-color: #4F46E5; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 14px;">
            Track Your Package
          </a>
        </p>
      `
          : ""
      }
    </div>
  `
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Status Update</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="background-color: ${statusInfo.color}; padding: 40px 30px; text-align: center;">
                    <h1 style="margin: 0; color: #ffffff; font-size: 28px;">${statusInfo.title}</h1>
                    <p style="margin: 10px 0 0; color: #ffffff; font-size: 16px;">
                      Order #${orderNumber}
                    </p>
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 40px 30px;">
                    <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.5; color: #333333;">
                      ${statusInfo.message}
                    </p>
                    
                    ${trackingHtml}
                  </td>
                </tr>
                
                <tr>
                  <td style="padding: 30px; background-color: #f8f8f8; text-align: center; border-top: 1px solid #eeeeee;">
                    <p style="margin: 0; font-size: 14px; color: #666666;">
                      Thank you for shopping with us!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  return sendEmail({
    to,
    subject: `${statusInfo.title} - Order #${orderNumber}`,
    html,
  });
}
