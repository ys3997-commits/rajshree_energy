import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma";

function loadEnvFile(name: string) {
  try {
    const content = readFileSync(resolve(process.cwd(), name), "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = /^([^#=]+)=(.*)$/.exec(line.trim());
      if (!match) continue;
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional file
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

const prisma = new PrismaClient();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  const currentPassword = process.argv[2];
  const newPassword = process.argv[3];
  const preferredEmail = process.argv[4];
  if (!currentPassword || !newPassword) {
    throw new Error(
      "Usage: npx tsx scripts/change-owner-password.ts <current> <new> [email]",
    );
  }

  const users = preferredEmail
    ? [{ email: preferredEmail }]
    : await prisma.$queryRaw<{ email: string }[]>`
        SELECT email FROM auth.users ORDER BY created_at ASC
      `;
  if (users.length === 0) throw new Error("No Supabase auth user found");

  const supabase = createClient(url, anonKey);
  let signedInEmail: string | null = null;

  for (const user of users) {
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });
    if (!signInError) {
      signedInEmail = user.email;
      break;
    }
  }

  if (!signedInEmail) {
    throw new Error("Current password is incorrect for all owner accounts");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });
  if (updateError) {
    throw new Error(`Password update failed: ${updateError.message}`);
  }

  console.log(`Owner password updated for ${signedInEmail}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
