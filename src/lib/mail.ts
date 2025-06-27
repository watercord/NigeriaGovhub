
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const domain = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:9002";

export const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${domain}/new-verification?token=${token}`;

  // Log to console for development without a real email provider
  console.log("--- DEVELOPMENT: VERIFICATION EMAIL ---");
  console.log(`Recipient: ${email}`);
  console.log(`Link: ${verificationLink}`);
  console.log("---------------------------------------");

  // When you have a Resend API key and a verified domain, uncomment this block

  try {
    await resend.emails.send({
      from: "nigeriagovhub.com", // Replace with your verified domain, e.g., "noreply@yourdomain.com"
      to: email,
      subject: "NigeriaGovHub: Verify your email address",
      html: `<p>Welcome to NigeriaGovHub! Click the link below to verify your email address and complete your registration:</p><p><a href="${verificationLink}">Verify Email</a></p>`,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
    // You might want to handle this error more gracefully
  }

};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `${domain}/new-password?token=${token}`;

  // Log to console for development without a real email provider
  console.log("--- DEVELOPMENT: PASSWORD RESET EMAIL ---");
  console.log(`Recipient: ${email}`);
  console.log(`Link: ${resetLink}`);
  console.log("-----------------------------------------");

  // When you have a Resend API key and a verified domain, uncomment this block

  try {
    await resend.emails.send({
      from: "onboarding@resend.dev", // Replace with your verified domain
      to: email,
      subject: "NigeriaGovHub: Reset your password",
      html: `<p>Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }

};
