import nodemailer from "nodemailer";

export const sendEmail = async ({
  to = "",
  subject = "",
  text = "",
  otp = "",
}) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "hitesh.prajapati@equitysoft.in",
      pass: "qqcrbbuynplgffan",
    },
  });

  await transporter.sendMail({
    from: "AI Hyperverse",
    to: to,
    subject: subject,
    text: text,
    html: `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
    <div style="margin:50px auto;width:70%;padding:20px 0">
      <div style="border-bottom:1px solid #eee">
        <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">AI Hyperverse</a>
      </div>
      <p style="font-size:1.1em">Hi,</p>
      <p>Thank you for choosing Hyperverse. Use the following OTP to complete your Sign Up procedures. OTP is valid for 2 minutes</p>
      <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
      <p style="font-size:0.9em;">Regards,<br />AI Hyperverse</p>
      <hr style="border:none;border-top:1px solid #eee" />
      
    </div>
  </div>
    `,
  });
};
