const nodemailer = require("nodemailer");
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.MAILER_HOST,
  port: process.env.MAILER_PORT,
  secure: process.env.MAILER_SECRET, // true for port 465, false for other ports
  auth: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
});

async function sendMail(email, subject, html) {
  try{
    await transporter.sendMail({
      from: process.env.MAILER_USER,
      to: email,
      subject,
      html,
    });
  } catch (error) {
    console.log('dad', error);
  }
}

module.exports = { sendMail }