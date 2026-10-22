export function isAdminRole(role: string | null | undefined): boolean {
  return role?.trim().toLowerCase() === "admin";
}

/** Owner login, or a staff member whose role is Admin. */
export function hasFullPower(access: {
  kind: string;
  role?: string | null;
}): boolean {
  return (
    access.kind === "owner" ||
    (access.kind === "staff" && isAdminRole(access.role))
  );
}
