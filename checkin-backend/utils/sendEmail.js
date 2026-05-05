const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, message) => {
  try {

    // ✅ correct code extraction
    const codeMatch = message.match(/access:\s*([A-Z0-9]+)/i);
    const code = codeMatch ? codeMatch[1] : "XXXX";

    const durationMatch = message.match(/Valid for (.*)/);
    const duration = durationMatch ? durationMatch[1] : "";

    const htmlTemplate = `
    <div style="background:#f4f6f8; padding:20px; font-family:Arial;">
      
      <div style="max-width:520px; margin:auto; background:#fff; border-radius:16px; padding:24px;">
        
        <h2 style="text-align:center; color:#002c3e;">
          🎉 Your Promo Code
        </h2>

        <p style="text-align:center;">Thanks for being part of <b>SOLO</b></p>

        <!-- ✅ CORRECT CODE BOX -->
        <div style="
          background:#eaf1f5;
          padding:20px;
          border-radius:10px;
          text-align:center;
          margin:20px 0;
        ">
          <span style="
            font-size:28px;
            font-weight:bold;
            letter-spacing:5px;
            color:#002c3e;
          ">
            ${code}
          </span>
        </div>

        <p style="text-align:center; font-weight:600;">
          Valid for ${duration}
        </p>

        <!-- BUTTON -->
        <div style="text-align:center; margin:20px 0;">
          <a href="https://yourapp.com/redeem?code=${code}" style="
            background:#002c3e;
            color:#fff;
            padding:12px 25px;
            border-radius:30px;
            text-decoration:none;
            font-weight:600;
          ">
            Redeem Now
          </a>
        </div>

        <!-- NOTE -->
        <p style="text-align:center; font-size:12px; color:#888;">
          Copy the code manually or click the button to redeem
        </p>

        <!-- ORIGINAL MESSAGE -->
        <div style="
          background:#fafafa;
          padding:15px;
          border-radius:10px;
          font-size:14px;
        ">
          ${message.replace(/\n/g, "<br/>")}
        </div>

      </div>
    </div>
    `;

    await transporter.sendMail({
      from: `"SOLO" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Promo Code 🎉",
      html: htmlTemplate,
    });

  } catch (err) {
    console.log(err);
  }
};
module.exports = sendEmail;