import { v4 as uuidv4 } from "uuid";
// import { drizzle } from "drizzle-orm/mysql"; // Adjust based on your DB driver
import { eq } from "drizzle-orm";
import { passwordResetToken } from "../db/schema"; // Adjust path to your schema
import { db } from "../db/drizzle"; // Your Drizzle DB instance

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const result = await db
      .select()
      .from(passwordResetToken)
      .where(eq(passwordResetToken.token, token))
      .limit(1);

    return result[0] || null;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const result = await db
      .select()
      .from(passwordResetToken)
      .where(eq(passwordResetToken.identifier, email))
      .limit(1);

    return result[0] || null;
  } catch {
    return null;
  }
};

export const createPasswordResetToken = async (email: string) => {
  const token = uuidv4();
  // Token expires in 1 hour
  const expires = new Date(new Date().getTime() + 3600 * 1000);

  const existingToken = await getPasswordResetTokenByEmail(email);

  if (existingToken) {
    await db
      .delete(passwordResetToken)
      .where(eq(passwordResetToken.id, existingToken.id));
  }

  await db.insert(passwordResetToken).values({
  id: uuidv4(),
  identifier: email,
  token,
  expires,
}).execute();

return {
  identifier: email,
  token,
  expires,
};
};