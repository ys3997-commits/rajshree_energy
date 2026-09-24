import { AccessDeniedError } from "@/lib/auth/access";
import { getMemberDocumentFile } from "@/lib/actions/member-documents";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const file = await getMemberDocumentFile(id);
    const download = new URL(request.url).searchParams.get("download") === "1";
    const filename = file.fileName.replace(/["\r\n]/g, "");
    return new Response(Buffer.from(file.fileData), {
      headers: {
        "Content-Type": file.fileMime,
        "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${filename}"`,
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
