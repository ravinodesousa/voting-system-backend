// Import the Nodemailer library
const nodemailer = require("nodemailer");

// Create a transporter object
const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.MAILTRAP_USERNAME,
    pass: process.env.MAILTRAP_PASSWORD,
  },
});

const sendEmail = (to, subject, text) => {
  // Configure the mailoptions object
  const mailOptions = {
    from: process.env.MAIL_FROM_EMAIL,
    to,
    subject,
    text,
  };

  console.log("mailOptions", mailOptions);
  console.log("process.env.MAILTRAP_USERNAME", process.env.MAILTRAP_USERNAME);
  console.log("process.env.MAILTRAP_PASSWORD", process.env.MAILTRAP_PASSWORD);
  console.log("process.env.MAIL_FROM_EMAIL", process.env.MAIL_FROM_EMAIL);
  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Email Error:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};

module.exports = { sendEmail };
