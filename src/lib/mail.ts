
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL || "nigeriagovhub.com";

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${domain}/new-verification?token=${token}`;

  // Log to console for development without a real email provider
  // console.log("--- DEVELOPMENT: VERIFICATION EMAIL ---");
  // console.log(`Recipient: ${email}`);
  // console.log(`Link: ${verificationLink}`);
  // console.log("---------------------------------------");

  // When you have a Resend API key and a verified domain, uncomment this block

  try {
    await resend.emails.send({
      from: "support@nigeriagovhub.com", // Replace with your verified domain, e.g., "noreply@yourdomain.com"
      to: email,
      subject: "Action Required: Verify Your Email Address with NigeriaGovHub",
      html: `<p>Welcome to NigeriaGovHub! <br> To complete your registration and start using our services, 
      please verify your email address by clicking the link below:</p><br>
      <p><a href="${verificationLink}">Verify Email</a> <br> If you did not request this,
       please feel free to ignore this email.</p><br>
      <p>Thank you for choosing NigeriaGovHub! We look forward to serving you.</p><br>
      <p>Best regards,<br>The NigeriaGovHub Team</p>`,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // You might want to handle this error more gracefully
  }

};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/new-password?token=${token}`;

  // Log to console for development without a real email provider
  // console.log("--- DEVELOPMENT: PASSWORD RESET EMAIL ---");
  // console.log(`Recipient: ${email}`);
  // console.log(`Link: ${resetLink}`);
  // console.log("-----------------------------------------");

  // When you have a Resend API key and a verified domain, uncomment this block

  try {
    await resend.emails.send({
      from: "support@nigeriagovhub.com", // Replace with your verified domain, e.g., "noreply@yourdomain.com"
      to: email,
      subject: "Reset Your Password for NigeriaGovHub",
      html: `<p>We received a request to reset your password for your NigeriaGovHub account. 
      To proceed, please click the link below:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you did not request a password reset,
       please disregard this email.Thank you,The NigeriaGovHub Team</p>`,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
}

