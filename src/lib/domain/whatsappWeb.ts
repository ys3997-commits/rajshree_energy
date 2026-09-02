/** One named tab shared by Collection Engine and Sales Engine. */
export const WHATSAPP_WEB_WINDOW_NAME = "rajshree_whatsapp_web";

const TAB_GLOBAL_KEY = "__rajshreeWhatsAppWebTab";
const APP_HANDOFF_MS = 800;

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

function openWhatsAppWebTab(webUrl: string): Window | null {
  const tab = window.open(webUrl, WHATSAPP_WEB_WINDOW_NAME);
  if (tab) {
    setStoredTab(tab);
    tab.focus();
    return tab;
  }

  const existing = getStoredTab();
  if (existing) {
    existing.focus();
    return existing;
  }

  return null;
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
 * Send a WhatsApp message via an existing Web tab or the desktop/mobile app.
 * Opens WhatsApp Web only once; later clicks reuse the same tab.
 */
export function openWhatsAppMessage(links: {
  app: string;
  web: string;
}): boolean {
  if (typeof window === "undefined") return false;

  const existingWeb = getStoredTab();
  if (existingWeb) {
    return openWhatsAppWebTab(links.web) != null;
  }

  let handedOffToApp = false;
  const onBlur = () => {
    handedOffToApp = true;
  };
  window.addEventListener("blur", onBlur);
  tryWhatsAppApp(links.app);

  window.setTimeout(() => {
    window.removeEventListener("blur", onBlur);
    if (!handedOffToApp) {
      openWhatsAppWebTab(links.web);
    }
  }, APP_HANDOFF_MS);

  return true;
}

/** @deprecated Use openWhatsAppMessage — kept for tests and simple web-only callers. */
export function openWhatsAppWeb(webUrl: string): Window | null {
  return openWhatsAppWebTab(webUrl);
}
