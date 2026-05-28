const nodemailer = require("nodemailer");

const createTransport = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !port || !user || !pass) return null;
  return nodemailer.createTransport({ host, port: Number(port), auth: { user, pass }, secure: false });
};

async function sendCredentials(to, subject, html) {
  const transport = createTransport();
  if (!transport) return false;
  try {
    await transport.sendMail({ from: process.env.FROM_EMAIL || process.env.SMTP_USER, to, subject, html });
    return true;
  } catch (e) {
    console.error("Failed to send email:", e.message || e);
    return false;
  }
}

module.exports = { sendCredentials };
