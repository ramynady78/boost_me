const nodemailer = require('nodemailer');

// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

module.exports = async (email, otpCode) => {
    await transporter.sendMail({
      from: `"BoostMe" <${process.env.EMAIL}>`,
      to: email,
      subject: "Verification Email",
      html: `
        <p>This is your verification code. It's valid for 5 minutes from now:</p>
        <h3>${otpCode}</h3>
      `
    });
    return true;
  
};