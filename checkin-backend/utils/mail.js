const nodemailer = require("nodemailer");
const path = require("path");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// 🔥 TEMPLATE WRAPPER
const buildTemplate = (content) => {
  return `
  <div style="background:#f2f4f5;padding:20px 0;font-family:Arial,sans-serif;">
    
    <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#ffffff;">
      
      <!-- 🔹 TOP BAR -->
      <tr>
      <td style="background:#0b3c49; padding:0px 30px;">
      <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
    
        <!-- LOGO -->
        <td style="line-height:0;">
          <img src="cid:logo@solo"
            style="height:110px; display:block;" />
        </td>
    
        <!-- SPACER (IMPORTANT) -->
        <td width="100%"></td>
    
        <!-- SUPPORT -->
        <td align="right"
          style="
            color:#ffffff;
            font-size:20px;
            font-weight:700;
            white-space:nowrap;
            padding-top: 20px;
          ">
          Support
        </td>
    
      </tr>
    </table>
      </td>
    </tr>


      <!-- 🔹 CONTENT -->
      <tr>
      <td style="background:#f9fafb; padding:36px; color:#5a6c7d;  line-height:1.6; font-size:16px;">
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

exports.sendMail = async ({ to, subject, html, replyTo, file }) => {
  await transporter.sendMail({
    from: `"Support Team" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: buildTemplate(html),
    replyTo,

   

    attachments: [
      {
        filename: "logo.png",
        path: "./public/logo3.png",
        cid: "logo@solo"
      },
    
      ...(file ? [{
        filename: file.originalname,
        path: path.join(__dirname, "..", file.path)
      }] : [])
    ]
  });
};