import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendEmail({
  to,
  subject,
  text,
  html,
}) {
  const info = await transporter.sendMail({
    from: `"BAPD Website" <${process.env.EMAIL_USER}>`,
    to: to || process.env.EMAIL_TO,
    subject,
    text,
    html,
  });

  console.log("Email sent:", info.messageId);

  return info;
}

export async function verifyEmailConnection() {
  await transporter.verify();

  console.log(
    "Email service connected successfully"
  );
}

export default transporter;