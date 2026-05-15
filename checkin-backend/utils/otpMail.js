const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 10000, // ⏱️ prevent hanging
});

const buildTemplate = (content) => {
  return `
  <div style="background:#f2f4f5;padding:20px 0;font-family:Arial,sans-serif;">
    
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff;">
      
      <tr>
        <td style="background:#0b3c49; padding:0px 30px;">
          <table width="100%">
            <tr>

              <td style="line-height:0;">
                <img src="cid:logo@solo"
                  style="height:110px; width:auto; display:block;" />
              </td>

              <td align="right"
                style="color:#ffffff; font-size:20px; font-weight:600; padding-top:23px;">
                Verification
              </td>

            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="background:#f9fafb; padding:36px; color:#5a6c7d; line-height:1.6; font-size:16px;">
          ${content}
        </td>
      </tr>

      <tr>
        <td style="background:#0b3c49; padding:36px; color:#ccc; font-size:12px;">
          SOLO © 2026 Social Rebels™ Design<br/>
          All rights reserved
        </td>
      </tr>

    </table>

  </div>
  `;
};

const sendOtpMail = async (to, otp, name) => {
  try {
    const content = `
      <p>Hi ${name || "User"},</p>

      <p>Your verification code is:</p>

      <h2 style="
        background:#e6f2f5;
        padding:12px 20px;
        display:inline-block;
        border-radius:8px;
        letter-spacing:3px;
        color:#0b3c49;
      ">
        ${otp}
      </h2>

      <p>This code expires in 5 minutes</p>

      <p>If you did not request this code, ignore this email</p>

      <p><strong>Team SOLO</strong></p>
    `;

    const info = await transporter.sendMail({
      from: `"SOLO" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your SOLO verification code",
      html: buildTemplate(content),

      attachments: [
        {
          filename: "logo.png",
          path: path.join(__dirname, "../public/logo3.png"), // ✅ FIXED PATH
          cid: "logo@solo",
        },
      ],
    });

    console.log("✅ Mail sent:", info.messageId);
    return true;

  } catch (error) {
    console.error("❌ Mail error:", error);
    throw error;
  }
};

module.exports = sendOtpMail;