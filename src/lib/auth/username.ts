/** Login id from a person's name: first name + "." + last name, lowercased. */
export function usernameFromName(name: string): string {
  const parts = name
    .trim()
    .toLowerCase()
    .split(/[\s.]+/)
    .map((part) => part.replace(/[^a-z0-9]/g, ""))
    .filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  return `${parts[0]}.${parts[parts.length - 1]}`;
}
