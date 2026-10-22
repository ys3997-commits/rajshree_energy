import { BROWSER_SESSION_KEY } from "@/lib/auth/browserSession";

const script = `(function () {
  try {
    var path = location.pathname;
    if (path === "/login" || path.indexOf("/login/") === 0) return;
    if (path === "/api/end-browser-session") return;
    if (sessionStorage.getItem(${JSON.stringify(BROWSER_SESSION_KEY)}) === "1") return;
    location.replace("/api/end-browser-session");
  } catch (e) {}
})();`;

/** Runs before the page is used. A freshly opened tab has no tab session, so it signs out. */
export function EndSessionOnNewVisit() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
