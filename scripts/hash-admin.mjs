import { createInterface } from "node:readline/promises";
import bcrypt from "bcryptjs";
const input = createInterface({ input: process.stdin, output: process.stdout });
try {
  const password = await input.question("Admin password (visible locally): ");
  if (password.length < 12 || Buffer.byteLength(password) > 72) throw new Error("Use 12 or more characters, at most 72 UTF-8 bytes.");
  console.log(await bcrypt.hash(password, 12));
} finally { input.close(); }
