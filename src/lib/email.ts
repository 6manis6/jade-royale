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
