
import { v4 as uuidv4 } from "uuid";
import prisma from "./prisma";

export const getPasswordResetTokenByToken = async (token: string) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });
    return passwordResetToken;
  } catch {
    return null;
  }
};

export const getPasswordResetTokenByEmail = async (email: string) => {
  try {
    const passwordResetToken = await prisma.passwordResetToken.findFirst({
      where: { identifier: email },
    });
    return passwordResetToken;
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
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id },
        });
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return passwordResetToken;
};
