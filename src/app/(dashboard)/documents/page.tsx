import {
  listDocumentEntries,
  listDocumentOptions,
} from "@/lib/actions/option-lists";
import { isDocumentKind } from "./documentEntities";
import { DocumentsMaster } from "./DocumentsMaster";

export default async function DocumentsPage() {
  const [members, entries] = await Promise.all([
    listDocumentOptions(),
    listDocumentEntries(),
  ]);

  return (
    <DocumentsMaster
      members={members.flatMap((row) =>
        isDocumentKind(row.kind)
          ? [{ id: row.id, name: row.name, kind: row.kind }]
          : [],
      )}
      entries={entries}
    />
  );
}
