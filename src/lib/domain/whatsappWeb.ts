/** One named tab shared by Collection Engine and Sales Engine. */
export const WHATSAPP_WEB_WINDOW_NAME = "rajshree_whatsapp_web";

const TAB_GLOBAL_KEY = "__rajshreeWhatsAppWebTab";
const WEB_OPENED_KEY = "rajshree_whatsapp_web_opened";
/** Wait briefly to see if the WhatsApp app takes focus before opening Web. */
const APP_HANDOFF_MS = 350;

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

function tryAppThenWeb(links: { app: string; web: string }): boolean {
  let appHandedOff = false;
  const onBlur = () => {
    appHandedOff = true;
  };
  window.addEventListener("blur", onBlur);
  tryWhatsAppApp(links.app);

  window.setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    if (!appHandedOff) {
      openWhatsAppWebTab(links.web);
    }
  }, APP_HANDOFF_MS);

  return true;
}

/**
 * Send a WhatsApp message: try the desktop/mobile app first, then WhatsApp Web.
 * Reuses the same Web tab when the app is not installed or does not take focus.
 */
export function openWhatsAppMessage(links: {
  app: string;
  web: string;
}): boolean {
  if (typeof window === "undefined") return false;
  return tryAppThenWeb(links);
}

/** @deprecated Use openWhatsAppMessage — kept for tests and simple web-only callers. */
export function openWhatsAppWeb(webUrl: string): Window | null {
  if (!openWhatsAppWebTab(webUrl)) return null;
  return getStoredTab();
}
