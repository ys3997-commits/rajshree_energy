import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAccess } from "@/lib/auth/access";
import { listDocumentOptions } from "@/lib/actions/option-lists";
import {
  listMemberDocumentChoices,
  listMemberDocuments,
} from "@/lib/actions/member-documents";
import {
  DOCUMENT_GROUP_LABELS,
  isDocumentKind,
} from "../../documentEntities";
import { MemberDocumentPanel } from "./MemberDocumentPanel";

export default async function DocumentEntityPage({
  params,
}: {
  params: Promise<{ kind: string; slug: string }>;
}) {
  const { kind, slug } = await params;
  if (!isDocumentKind(kind)) notFound();

  const members = await listDocumentOptions();
  const member = members.find((row) => row.kind === kind && row.slug === slug);
  if (!member || !isDocumentKind(member.kind)) notFound();

  const [documents, rows, access] = await Promise.all([
    listMemberDocumentChoices(member.kind),
    listMemberDocuments(member.id),
    getCurrentAccess(),
  ]);

  return (
    <div>
      <p className="page-eyebrow">
        <Link href="/documents">Documents</Link>
        {" / "}
        {DOCUMENT_GROUP_LABELS[kind]}
      </p>
      <div className="page-header">
        <div>
          <h1 className="page-title">{member.name}</h1>
        </div>
      </div>
      <MemberDocumentPanel
        memberId={member.id}
        documents={documents}
        rows={rows}
        canDelete={access.kind === "owner"}
      />
    </div>
  );
}
