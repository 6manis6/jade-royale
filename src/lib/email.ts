import nodemailer from "nodemailer";

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    throw new Error(
      "Missing SMTP config. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM in .env.local.",
    );
  }

  return {
    host,
    port: parseInt(port, 10),
    user,
    pass,
    from,
  };
}

export async function sendSignupOtpEmail(
  email: string,
  otp: string,
  name: string,
) {
  const smtp = getSmtpConfig();

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  await transporter.sendMail({
    from: smtp.from,
    to: email,
    subject: "Your Jade Royale signup OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 20px; color: #1a0e14;">
        <h2 style="margin: 0 0 12px; color: #e91e8c;">Jade Royale Verification</h2>
        <p style="margin: 0 0 12px;">Hi ${name || "there"},</p>
        <p style="margin: 0 0 16px;">Use this one-time password to complete your signup:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; background: #fff3f7; border: 1px solid #f0dde6; border-radius: 10px; padding: 14px 18px; text-align: center; color: #e91e8c;">
          ${otp}
        </div>
        <p style="margin: 16px 0 0; font-size: 13px; color: #6b5d65;">This OTP expires in 10 minutes.</p>
      </div>
    `,
  });
}

type OrderEmailItem = {
  name: string;
  qty: number;
  price: number;
};

type OrderEmailPayload = {
  orderId: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  address: string;
  city: string;
  totalAmount: number;
  items: OrderEmailItem[];
};

const formatCurrency = (value: number) => `Rs ${value.toFixed(2)}`;

const buildOrderItemsHtml = (items: OrderEmailItem[]) => {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding: 8px 0;">${item.name}</td>
          <td style="padding: 8px 0; text-align: center;">${item.qty}</td>
          <td style="padding: 8px 0; text-align: right;">${formatCurrency(item.price)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
      <thead>
        <tr>
          <th style="text-align: left; padding-bottom: 8px; border-bottom: 1px solid #f0dde6;">Item</th>
          <th style="text-align: center; padding-bottom: 8px; border-bottom: 1px solid #f0dde6;">Qty</th>
          <th style="text-align: right; padding-bottom: 8px; border-bottom: 1px solid #f0dde6;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;
};

export async function sendOrderEmails(payload: OrderEmailPayload) {
  const smtp = getSmtpConfig();
  const adminEmail = process.env.ADMIN_ORDER_EMAIL;

  if (!adminEmail) {
    throw new Error("Missing ADMIN_ORDER_EMAIL in environment variables.");
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.port === 465,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  const orderItemsHtml = buildOrderItemsHtml(payload.items);

  const userHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #1a0e14;">
      <h2 style="margin: 0 0 12px; color: #e91e8c;">Your order is confirmed</h2>
      <p style="margin: 0 0 12px;">Hi ${payload.customerName || "there"},</p>
      <p style="margin: 0 0 16px;">Thanks for shopping with Jade Royale. Your order has been received.</p>
      <p style="margin: 0 0 8px; font-weight: 600;">Order ID: ${payload.orderId}</p>
      ${orderItemsHtml}
      <p style="margin: 16px 0 0; font-weight: 600; text-align: right;">Total: ${formatCurrency(payload.totalAmount)}</p>
      <p style="margin: 16px 0 0; font-size: 13px; color: #6b5d65;">
        Shipping to: ${payload.address}, ${payload.city}. Phone: ${payload.phone}
      </p>
    </div>
  `;

  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 20px; color: #1a0e14;">
      <h2 style="margin: 0 0 12px; color: #111827;">New order received</h2>
      <p style="margin: 0 0 12px;">Order ID: ${payload.orderId}</p>
      <p style="margin: 0 0 12px;">Customer: ${payload.customerName} (${payload.customerEmail})</p>
      <p style="margin: 0 0 12px;">Phone: ${payload.phone}</p>
      <p style="margin: 0 0 16px;">Address: ${payload.address}, ${payload.city}</p>
      ${orderItemsHtml}
      <p style="margin: 16px 0 0; font-weight: 600; text-align: right;">Total: ${formatCurrency(payload.totalAmount)}</p>
    </div>
  `;

  await Promise.all([
    transporter.sendMail({
      from: smtp.from,
      to: payload.customerEmail,
      subject: "Your Jade Royale order confirmation",
      html: userHtml,
    }),
    transporter.sendMail({
      from: smtp.from,
      to: adminEmail,
      subject: `New order received (${payload.orderId})`,
      html: adminHtml,
    }),
  ]);
}
