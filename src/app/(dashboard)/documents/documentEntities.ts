export type DocumentKind = "companies" | "individuals";

export type DocumentEntity = {
  slug: string;
  label: string;
  kind: DocumentKind;
};

export type DocumentGroup = {
  kind: DocumentKind;
  label: string;
  entities: DocumentEntity[];
};

export const DOCUMENT_KINDS: DocumentKind[] = ["companies", "individuals"];

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  companies: "Company",
  individuals: "Individual",
};

export const DOCUMENT_GROUP_LABELS: Record<DocumentKind, string> = {
  companies: "Companies",
  individuals: "Individuals",
};

export function isDocumentKind(value: string): value is DocumentKind {
  return value === "companies" || value === "individuals";
}

export function slugFromDocumentName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "document";
}

function entity(kind: DocumentKind, slug: string, label: string): DocumentEntity {
  return { kind, slug, label };
}

export const DEFAULT_DOCUMENT_ENTITIES: DocumentEntity[] = [
  entity("companies", "rajshree-energy", "Rajshree Energy"),
  entity("companies", "rajshree-energy-llp", "Rajshree Energy LLP"),
  entity("individuals", "prakash-surana", "Prakash Surana"),
  entity("individuals", "prakash-surana-huf", "Prakash Surana HUF"),
  entity("individuals", "praveen-surana", "Praveen Surana"),
  entity("individuals", "praveen-surana-huf", "Praveen Surana HUF"),
  entity("individuals", "ritu-surana", "Ritu Surana"),
  entity("individuals", "seema-surana", "Seema Surana"),
  entity("individuals", "yugam-surana", "Yugam Surana"),
  entity("individuals", "kritika-surana", "Kritika Surana"),
  entity("individuals", "hunar-surana", "Hunar Surana"),
];

export function documentHref(item: DocumentEntity): string {
  return `/documents/${item.kind}/${item.slug}`;
}

export function documentGroupsFromEntities(
  entities: DocumentEntity[],
): DocumentGroup[] {
  return DOCUMENT_KINDS.map((kind) => ({
    kind,
    label: DOCUMENT_GROUP_LABELS[kind],
    entities: entities.filter((item) => item.kind === kind),
  }));
}

export function findDocumentEntity(
  groups: DocumentGroup[],
  kind: string,
  slug: string,
): DocumentEntity | null {
  const group = groups.find((item) => item.kind === kind);
  return group?.entities.find((item) => item.slug === slug) ?? null;
}

export function findDocumentGroup(
  groups: DocumentGroup[],
  kind: string,
): DocumentGroup | null {
  return groups.find((item) => item.kind === kind) ?? null;
}
