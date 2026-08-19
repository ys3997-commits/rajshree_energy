import { AccessDeniedError } from "@/lib/auth/access";
import { getBillFile } from "@/lib/actions/bills";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const file = await getBillFile(id);
    return new Response(Buffer.from(file.fileData), {
      headers: {
        "Content-Type": file.fileMime,
        "Content-Disposition": `inline; filename="${encodeURIComponent(file.fileName)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof AccessDeniedError) {
      return new Response("Not found", { status: 404 });
    }
    return new Response("Not found", { status: 404 });
  }
}
