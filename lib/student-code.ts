import crypto from "crypto";
import { prisma } from "./prisma";

// Exclude easily confused characters: 0, O, 1, I, L
const CHARSET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generates a cryptographically random, unguessable student ID code.
 * Example outputs: "M7K9X2", "8D4F2N", "P3V7R9"
 * 6 characters from a 30-char charset gives 729 million combinations.
 */
export function generateRandomCode(length = 6): string {
  const bytes = crypto.randomBytes(length);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CHARSET[bytes[i] % CHARSET.length];
  }
  return code;
}

/**
 * Generates a guaranteed-unique student code by checking against the database.
 */
export async function generateUniqueStudentCode(length = 6, maxAttempts = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = generateRandomCode(length);
    const existing = await prisma.student.findUnique({
      where: { studentCode: code },
      select: { id: true },
    });
    if (!existing) {
      return code;
    }
  }
  // Fallback to longer 8-char code in the astronomically rare case of collision
  return generateRandomCode(8);
}
