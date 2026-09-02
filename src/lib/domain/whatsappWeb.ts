/** One named tab shared by Collection Engine and Sales Engine. */
export const WHATSAPP_WEB_WINDOW_NAME = "rajshree_whatsapp_web";

const TAB_GLOBAL_KEY = "__rajshreeWhatsAppWebTab";
const WEB_OPENED_KEY = "rajshree_whatsapp_web_opened";

type WindowWithWhatsAppTab = Window & {
  [TAB_GLOBAL_KEY]?: Window | null;
};

function getStoredTab(): Window | null {
  if (typeof window === "undefined") return null;
  const tab = (window as WindowWithWhatsAppTab)[TAB_GLOBAL_KEY];
  if (tab && !tab.closed) return tab;
  return null;
}

function setStoredTab(tab: Window | null): void {
  if (typeof window === "undefined") return;
  (window as WindowWithWhatsAppTab)[TAB_GLOBAL_KEY] = tab;
}

function markWebOpened(): void {
  try {
    sessionStorage.setItem(WEB_OPENED_KEY, "1");
  } catch {
    // Ignore private-mode / storage errors.
  }
}

function hasOpenedWebBefore(): boolean {
  try {
    return sessionStorage.getItem(WEB_OPENED_KEY) === "1";
  } catch {
    return false;
  }
}

/** Same-origin URL that redirects into WhatsApp Web (keeps the named tab reusable). */
export function buildWhatsAppLaunchUrl(webUrl: string): string {
  return `/whatsapp-launch?to=${encodeURIComponent(webUrl)}`;
}

function tryWhatsAppApp(appUrl: string): void {
  const link = document.createElement("a");
  link.href = appUrl;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
}

/**
 * Open or reuse one WhatsApp Web tab via our redirect page so the browser keeps
 * the same named window across sends (direct web.whatsapp.com links break reuse).
 */
function openWhatsAppWebTab(webUrl: string): boolean {
  const launchUrl = buildWhatsAppLaunchUrl(webUrl);
  const existing = getStoredTab();

  const tab = window.open(launchUrl, WHATSAPP_WEB_WINDOW_NAME);
  if (tab) {
    if (existing && !existing.closed && existing !== tab) {
      existing.close();
    }
    setStoredTab(tab);
    markWebOpened();
    tab.focus();
    return true;
  }

  if (existing && !existing.closed) {
    existing.focus();
    return true;
  }

  if (hasOpenedWebBefore()) {
    return true;
  }

  return false;
}

/**
 * Send a WhatsApp message through WhatsApp Web (preferred) or the desktop app.
 * Reuses the same Web tab on every click — no new tab when Web is already open.
 */
export function openWhatsAppMessage(links: {
  app: string;
  web: string;
}): boolean {
  if (typeof window === "undefined") return false;

  if (openWhatsAppWebTab(links.web)) {
    return true;
  }

  tryWhatsAppApp(links.app);
  return false;
}

/** @deprecated Use openWhatsAppMessage — kept for tests and simple web-only callers. */
export function openWhatsAppWeb(webUrl: string): Window | null {
  if (!openWhatsAppWebTab(webUrl)) return null;
  return getStoredTab();
}
