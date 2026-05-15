const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// 🔥 SAME TEMPLATE (NO CHANGE)
const buildTemplate = (content) => {
  return `
  <div style="background:#f2f4f5;padding:20px 0;font-family:Arial,sans-serif;">
    
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff;">
      
      <!-- TOP BAR -->
      <tr>
        <td style="background:#0b3c49; padding:0px 30px;">
          <table width="100%">
            <tr>

              <!-- 🔥 LOGO (UPDATED) -->
              <td style="line-height:0;">
              <img src="https://your-backend-url.onrender.com/public/logo3.png"
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

      <!-- CONTENT -->
      <tr>
        <td style="background:#f9fafb; padding:36px; color:#5a6c7d; line-height:1.6; font-size:16px;">
          ${content}
        </td>
      </tr>

      <!-- FOOTER -->
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

// 🔥 OTP MAIL FUNCTION
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

    const response = await resend.emails.send({
      from: "SOLO <onboarding@resend.dev>", // default working sender
      to,
      subject: "Your SOLO verification code",
      html: buildTemplate(content),
    });

    console.log("✅ Mail sent:", response);
    return true;

  } catch (error) {
    console.error("❌ Mail error:", error);
    throw error;
  }
};

module.exports = sendOtpMail;