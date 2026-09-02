import { redirect } from "next/navigation";

function allowedWhatsAppWebUrl(raw: string | undefined): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" || url.hostname !== "web.whatsapp.com") {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}

/** Same-origin hop so the named WhatsApp Web popup can be reused across sends. */
export default async function WhatsAppLaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ to?: string }>;
}) {
  const { to } = await searchParams;
  const target = allowedWhatsAppWebUrl(to);
  if (!target) {
    return (
      <main className="p-6">
        <p>Invalid WhatsApp link.</p>
      </main>
    );
  }

  redirect(target);
}
