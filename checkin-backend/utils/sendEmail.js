const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, code, duration, message) => {
  try {

    // ✅ replace dynamic values
    const finalMessage = message
      .replace(/\[CODE\]/g, code)
      .replace(/\[DURATION\]/g, duration);

   const htmlTemplate = `
   <div style="margin:0; padding:0;">

   <table width="100%" cellpadding="0" cellspacing="0">
     <tr>
       <td align="center">
 
         <!-- MAIN CONTAINER -->
         <table width="600" cellpadding="0" cellspacing="0"
           style="
             max-width:600px;
             width:100%;
             font-family:Arial, sans-serif;
             background:#0e2a34;
             margin:0 auto;
           ">
     <tr>
       <td align="center">
 
         <!-- CONTAINER -->
         <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; font-family:Arial, sans-serif;">
 
           <!-- LOGO (FIX: alignment + size) -->
           <tr>
           <td style="padding:10px 49px 0; line-height:0;">
           <img src="cid:logo" width="170" style="display:block;" />
 </td>
           </tr>
 
           <!-- CARD -->
           <tr>
           <td style="padding:0 25px;">
   <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5; border-radius:28px; overflow:hidden; margin-top:-20px;">
                 <!-- CONTENT -->
                 <tr>
                   <td style="padding:28px;">
 
                     <!-- HEADING -->
                     <h1 style="
                     font-size:48px;
                     margin:0 0 16px;
                     color:#002c3e;
                     line-height:1.15;
                     font-weight:600;
                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                     letter-spacing:1.5px;
                   ">
                     Here’s<br/>
                     Something<br/>
                     Wonderful
                   </h1>
 
                     <!-- SUBHEAD -->
                     <p style="
                     font-size:25px;
                     margin:0 0 18px;
                     margin-top:-10px;
                     color:#002c3e;
                     line-height:1.2;
                     font-weight:500;
                     letter-spacing:0.6px;
                     font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                   ">
                     Free access to SOLO<br/>
                     Because you matter
                   </p>
 
                     <!-- TEXT -->
                     <p style="
   font-size:16px;
   color:#5a6c7d;
   margin:30px 0 14px;
   line-height:1.6;
 
 ">
   We're glad to have you with us
 </p>
 
                     <!-- FIX: run-on line -->
                     <p style="
                     font-size:16px;
                     color:#5A6C7D;
                     margin:0 0 18px;
                     line-height:1.6;
                     color:#5a6c7d;
                   ">
                   Please use this one-time code within 3 days before it expires
                   </p>
 
                     <!-- CODE SECTION -->
                     <p style="
                     margin:0 0 4px;
                     font-size:16px;
                     color:#5a6c7d;
                   ">
                     <span style="font-weight:600;">Code:</span>
                     <span style="color:#002c3e; font-weight:700; font-size:18px;"> ${code}</span>
                   </p>
                   
                   <p style="
                     margin:0 0 18px;
                     font-size:16px;
                     color:#5a6c7d;
                   ">
                     <span style="font-weight:600;">Valid for:</span>
                     <span style="color:#002c3e; font-weight:700; font-size:18px;"> ${duration}</span>
                   </p>
 
                     <!-- FOOT -->
                     <p style="
   font-size:16px;
   margin:0;
   color:#5a6c7d;
   line-height:1.5;
 ">
   Take care,<br/>
   <span style="font-weight:700;">Team SOLO</span>
 </p>
 
                   </td>
                 </tr>
 
                 <!-- REDEEM -->
                 <tr>
   <td style="background:#78bcc4; padding:24px 28px; border-bottom-left-radius:28px; border-bottom-right-radius:28px;">
 
     <!-- HEADING (Inter Medium feel) -->
     <p style="
       margin:0 0 14px;
       font-size:20px;
       color:#002c3e;
       font-weight:700;
       line-height:1.3;
     ">
       How to redeem your code
     </p>
 
     <!-- LIST (PERFECT ALIGN FIX 🔥) -->
     <table cellpadding="0" cellspacing="0" style="margin:0;">
 
   <tr>
     <td style="
       vertical-align:middle;
       font-weight:700;
       color:#002c3e;
       padding-right:8px;
       font-size:15px;
       line-height:1.6;
     ">1.</td>
 
     <td style="
       color:#002c3e;
       font-size:15px;
       line-height:1.6;
     ">
       Open the <b>SOLO app</b>
     </td>
   </tr>
 
   <tr>
     <td style="
       vertical-align:middle;
       font-weight:700;
       color:#002c3e;
       padding-right:8px;
       font-size:15px;
       line-height:1.6;
     ">2.</td>
 
     <td style="
       color:#002c3e;
       font-size:15px;
       line-height:1.6;
     ">
       Go to the <b>subscription plan</b> page
     </td>
   </tr>
 
   <tr>
     <td style="
       vertical-align:middle;
       font-weight:700;
       color:#002c3e;
       padding-right:8px;
       font-size:15px;
       line-height:1.6;
     ">3.</td>
 
     <td style="
       color:#002c3e;
       font-size:15px;
       line-height:1.6;
     ">
       Enter the <b>code</b> above
     </td>
   </tr>
 
   <tr>
     <td style="
       vertical-align:middle;
       font-weight:700;
       color:#002c3e;
       padding-right:8px;
       font-size:15px;
       line-height:1.6;
     ">4.</td>
 
     <td style="
       color:#002c3e;
       font-size:15px;
       line-height:1.6;
     ">
       Tap <b>Redeem</b>
     </td>
   </tr>
 
 </table>
 
 
     <!-- FOOT TEXT -->
     <p style="
       margin:14px 0 0;
       font-size:14px;
       color:#002c3e;
       line-height:1.5;
     ">
       No payment needed. No auto-renewal.
     </p>
 
   </td>
 </tr>
               </table>
             </td>
           </tr>
 
           <!-- FOOTER -->
           <tr>
           <td style="padding:18px 43px 26px;">
         
             <!-- TEXT -->
             <p style="
               color:#ffffff;
               margin:20px 10px 12px;
               font-size:14px;
               line-height:1.4;
             ">
             No app? Download now
             </p>
         
             <!-- APP BUTTONS (PERFECT ALIGN 🔥) -->
             <table cellpadding="0" cellspacing="0">
               <tr>
                 <td style="padding:6px 10px 0px;">
                   <a href="https://apps.apple.com">
                     <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                          width="100"
                          style="display:block;" />
                   </a>
                 </td>
         
                 <td style="padding:6px 0px 0px;">
                   <a href="https://play.google.com">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                          width="110"
                          style="display:block;" />
                   </a>
                 </td>
               </tr>
             </table>
         
             <!-- FOOTER TEXT -->
             <p style="
  color:#8a99a6;
  font-size:10.5px;
  margin:46px 10px 0;
  line-height:1.5;
  -webkit-text-fill-color:#8a99a6;
">
  SOLO © 2026 Social Rebels™ Design<br/>
  All rights reserved
</p>

<p style="
  color:#8a99a6;
  font-size:10.5px;
  margin:2px 10px 0;
  line-height:1.5;
  -webkit-text-fill-color:#8a99a6;
">
  Use of SOLO is subject to our Terms of Use<br/>
  and Privacy Policy, available in the SOLO app
</p>
           </td>
         </tr>
         </table>
 
       </td>
     </tr>
   </table>
 
 </div>
 `;

    await transporter.sendMail({
      from: `"SOLO" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your Promo Code 🎉",
      html: htmlTemplate,
      attachments: [
        {
          filename: "logo.png",
          path: "./public/logo3.png",
          cid: "logo",
        },
      ],
    });

  } catch (err) {
    console.log(err);
  }
};

module.exports = sendEmail;



// const nodemailer = require("nodemailer");

// const USE_ETHEREAL = true;

// const sendEmail = async (to, code, duration, message) => {
//   try {

//     let transporter;

//     // ✅ transporter yaha banao (function ke andar)
//     if (USE_ETHEREAL) {
//       const testAccount = await nodemailer.createTestAccount();

//       transporter = nodemailer.createTransport({
//         host: "smtp.ethereal.email",
//         port: 587,
//         auth: {
//           user: testAccount.user,
//           pass: testAccount.pass,
//         },
//       });

//       console.log("🧪 ETHEREAL MODE ON");

//     } else {
//       transporter = nodemailer.createTransport({
//         service: "gmail",
//         auth: {
//           user: process.env.EMAIL_USER,
//           pass: process.env.EMAIL_PASS,
//         },
//       });

//       console.log("📩 GMAIL MODE ON");
//     }

//     // ✅ dynamic replace
//     const finalMessage = message
//       .replace(/\[CODE\]/g, code)
//       .replace(/\[DURATION\]/g, duration);

//       const htmlTemplate = `
//       <div style="margin:0; padding:0; background:#0e2a34;">
      
//         <table width="100%" cellpadding="0" cellspacing="0" style="background:#0e2a34;">
//           <tr>
//             <td align="center">
      
//               <!-- CONTAINER -->
//               <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; font-family:Arial, sans-serif;">
      
//                 <!-- LOGO (FIX: alignment + size) -->
//                 <tr>
//                   <td style="padding:30px 20px 10px;">
//                     <img src="cid:logo" width="150" style="display:block;" />
//                   </td>
//                 </tr>
      
//                 <!-- CARD -->
//                 <tr>
//                   <td style="padding:0 10px;"> <!-- FIX: side white gap remove -->
                    
//                     <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F5F5; border-radius:28px; overflow:hidden;">
      
//                       <!-- CONTENT -->
//                       <tr>
//                         <td style="padding:28px;">
      
//                           <!-- HEADING -->
//                           <h1 style="font-size:34px; margin:0 0 14px; color:#002c3e; line-height:1.2; font-weight:700;">
//                             Here’s Something Wonderful
//                           </h1>
      
//                           <!-- SUBHEAD -->
//                           <p style="font-size:18px; margin:0 0 16px; color:#002c3e; line-height:1.4; font-weight:600;">
//                             Free access to SOLO<br/>
//                             Because you matter
//                           </p>
      
//                           <!-- TEXT -->
//                           <p style="font-size:15px; color:#5A6C7D; margin:0 0 10px; line-height:1.5;">
//                             We're glad to have you with us.
//                           </p>
      
//                           <!-- FIX: run-on line -->
//                           <p style="font-size:15px; color:#5A6C7D; margin:0 0 14px; line-height:1.5;">
//                             This is a one-time code. Please use it within 3 days. After that, it expires.
//                           </p>
      
//                           <!-- CODE SECTION -->
//                           <p style="margin:0; font-size:15px; color:#5A6C7D;">
//                             Code: <span style="color:#002c3e; font-weight:700;">${code}</span>
//                           </p>
      
//                           <p style="margin:4px 0 14px; font-size:15px; color:#5A6C7D;">
//                             Valid for: <span style="color:#002c3e; font-weight:700;">${duration}</span>
//                           </p>
      
//                           <!-- FOOT -->
//                           <p style="font-size:15px; margin:0; color:#5A6C7D;">
//                             Take care,<br/>
//                             <span style="font-weight:700;">Team SOLO</span>
//                           </p>
      
//                         </td>
//                       </tr>
      
//                       <!-- REDEEM -->
//                       <tr>
//                         <td style="background:#78bcc4; padding:22px 20px; border-bottom-left-radius:28px; border-bottom-right-radius:28px;">
      
//                           <p style="margin:0 0 10px; font-size:17px; color:#002c3e; font-weight:400;">
//                             How to redeem your code
//                           </p>
      
//                           <!-- FIX: alignment + bold numbers -->
//                           <ol style="padding-left:18px; margin:0; color:#002c3e; font-size:15px; line-height:1.6;">
//                             <li><b>Open the SOLO app</b></li>
//                             <li><b>Go to the subscription plan page</b></li>
//                             <li><b>Enter the code above</b></li>
//                             <li><b>Tap Redeem</b></li>
//                           </ol>
      
//                           <p style="margin-top:10px; font-size:14px; color:#002c3e;">
//                             No payment needed. No auto-renewal.
//                           </p>
      
//                         </td>
//                       </tr>
      
//                     </table>
//                   </td>
//                 </tr>
      
//                 <!-- FOOTER -->
//                 <tr>
//                   <td style="padding:20px 20px 30px;">
      
//                     <p style="color:#ffffff; margin:0 0 10px;">
//                       Don't have the app yet? Download it here
//                     </p>
      
//                     <!-- FIX: bigger icons -->
//                     <div>
//                       <a href="https://apps.apple.com">
//                         <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" width="140"/>
//                       </a>
      
//                       <a href="https://play.google.com" style="margin-left:10px;">
//                         <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" width="150"/>
//                       </a>
//                     </div>
      
//                     <!-- FIX: smaller footer text -->
//                     <p style="color:#8a99a6; font-size:11px; margin-top:14px;">
//                       SOLO © 2026 Social Rebels™ Design. All rights reserved
//                     </p>
      
//                     <p style="margin-top:2px; color:#8a99a6; font-size:11px;">
//                       Use of SOLO is subject to our Terms of Use and Privacy Policy
//                     </p>
      
//                   </td>
//                 </tr>
      
//               </table>
      
//             </td>
//           </tr>
//         </table>
      
//       </div>
//       `;

//     const info = await transporter.sendMail({
      
//       from: `"SOLO" <${process.env.EMAIL_USER}>`,
//       to,
//       subject: "Your Promo Code 🎉",
//       html: htmlTemplate,
//       attachments: [
//         {
//           filename: "logo.png",
//           path: "./public/logo3.png",
//           cid: "logo",
//         },
//       ],
//     });

//     const previewUrl = nodemailer.getTestMessageUrl(info);
// console.log("Preview URL:", previewUrl);

// return previewUrl; // ✅ VERY IMPORTANT

//     // ✅ preview link
//     if (USE_ETHEREAL) {
//       console.log("Preview URL:", nodemailer.getTestMessageUrl(info));
//     }

//   } catch (err) {
//     console.log(err);
//   }
// };

// module.exports = sendEmail;

{/* <img src="cid:logo" width="150" style="display:block;" /> */}