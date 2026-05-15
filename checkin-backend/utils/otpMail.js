const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🔥 SAME TEMPLATE (BUT VERIFICATION TITLE)
const buildTemplate = (content) => {
  return `
  <div style="background:#f2f4f5;padding:20px 0;font-family:Arial,sans-serif;">
    
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff;">
      
      <!-- 🔹 TOP BAR -->
      <tr>
        <td style="background:#0b3c49; padding:0px 30px;">
          <table width="100%">
            <tr>

              <!-- LOGO -->
              <td style="line-height:0;">
                <img src="cid:logo@solo"
                  style="height:110px; width:auto; display:block;" />
              </td>

              <!-- 🔥 VERIFICATION TEXT -->
              <td align="right"
                style="color:#ffffff; font-size:20px; font-weight:600; padding-top:23px;">
                Verification
              </td>

            </tr>
          </table>
        </td>
      </tr>

      <!-- 🔹 CONTENT -->
      <tr>
        <td style="background:#f9fafb; padding:36px; color:#5a6c7d; line-height:1.6; font-size:16px;">
          ${content}
        </td>
      </tr>

      <!-- 🔹 BOTTOM BAR -->
      <tr>
        <td style="background:#0b3c49; padding:36px; color:#ccc; font-size:12px;">
          SOLO © 2026 Social Rebels™ Design<br/>
          All rights reserved<br/>
          Use of SOLO is subject to our Terms of Use <br/>
          and Privacy Policy, available in the SOLO app
        </td>
      </tr>

    </table>

  </div>
  `;
};

// 🔥 OTP MAIL FUNCTION
const sendOtpMail = async (to, otp, name) => {
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

    <p>This code expires in 10 minutes</p>

    <p>If you did not request this code, please ignore this message</p>

    <p><strong>Team SOLO</strong></p>
  `;

  await transporter.sendMail({
    from: `"SOLO" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your SOLO verification code",
    html: buildTemplate(content),

    attachments: [
      {
        filename: "logo.png",
        path: "./public/logo3.png",
        cid: "logo@solo"
      }
    ]
  });
};

module.exports = sendOtpMail;