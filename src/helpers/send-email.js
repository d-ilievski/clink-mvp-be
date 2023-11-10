const nodemailer = require("nodemailer");
const config = require("config.json");

module.exports = sendEmail;

async function sendEmail({ to, subject, html, from = config.emailFrom }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.ethereal.email",
    port: 587,
    auth: {
      user: process.env.SMTP_USERNAME || "jake.hilpert@ethereal.email",
      pass: process.env.SMTP_PASSWORD || "PFQwSkRnQpVrtNu53u",
    },
  });
  await transporter.sendMail({ from, to, subject, html });
}
