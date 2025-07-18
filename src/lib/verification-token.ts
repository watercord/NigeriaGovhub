import { v4 as uuidv4 } from "uuid";
import { drizzle } from "drizzle-orm/mysql2"; // Adjust based on your DB driver
import { eq } from "drizzle-orm";
import { verificationToken } from "../db/schema"; // Adjust path to your schema
import { db } from "../db/drizzle"; // Your Drizzle DB instance

export const getVerificationTokenByToken = async (token: string) => {
  try {
    const result = await db
      .select()
      .from(verificationToken)
      .where(eq(verificationToken.token, token))
      .limit(1);

    return result[0] || null;
  } catch {
    return null;
  }
};

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const result = await db
      .select()
      .from(verificationToken)
      .where(eq(verificationToken.identifier, email))
      .limit(1);

    return result[0] || null;
  } catch {
    return null;
  }
};

export const createVerificationToken = async (email: string) => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour from now

  const existingToken = await getVerificationTokenByEmail(email);

  if (existingToken) {
    await db
      .delete(verificationToken)
      .where(eq(verificationToken.token, existingToken.token));
  }

  await db.insert(verificationToken).values({
  identifier: email,
  token,
  expires,
}).execute();

return { identifier: email, token, expires };

};