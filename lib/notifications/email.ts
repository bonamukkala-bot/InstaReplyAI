import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

export async function sendStaffAlert(to: string[], leadStatus: string, leadInfo: {
  name?: string | null;
  phone?: string | null;
  serviceInterest?: string | null;
}) {
  if (to.length === 0) {
    console.log("No notifyEmails configured - skipping email, would have sent:", leadStatus, leadInfo);
    return;
  }

  const subject = `${leadStatus === "HOT" ? "HOT LEAD" : "ESCALATED"}: ${leadInfo.name ?? "Unknown"}`;
  const html = `
    <h2>${subject}</h2>
    <p><strong>Name:</strong> ${leadInfo.name ?? "(not provided)"}</p>
    <p><strong>Phone:</strong> ${leadInfo.phone ?? "(not provided)"}</p>
    <p><strong>Service:</strong> ${leadInfo.serviceInterest ?? "(not provided)"}</p>
  `;

  await transporter.sendMail({
    from: `"InstaReply AI" <${process.env.SMTP_USER}>`,
    to: to.join(","),
    subject,
    html,
  });
  console.log("Email sent to:", to.join(", "));
}
