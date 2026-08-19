export type Access =
  | { kind: "owner"; name: string; pageKeys: "all" }
  | { kind: "staff"; id: string; name: string; pageKeys: string[] }
  | { kind: "none" };
