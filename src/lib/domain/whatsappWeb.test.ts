import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  WHATSAPP_WEB_WINDOW_NAME,
  buildWhatsAppLaunchUrl,
  openWhatsAppMessage,
  openWhatsAppWeb,
} from "./whatsappWeb";

const webUrl =
  "https://web.whatsapp.com/send?phone=919876543210&text=hello";
const launchUrl = buildWhatsAppLaunchUrl(webUrl);

describe("buildWhatsAppLaunchUrl", () => {
  it("wraps the WhatsApp Web URL for same-origin redirect", () => {
    expect(launchUrl).toBe(
      `/whatsapp-launch?to=${encodeURIComponent(webUrl)}`,
    );
  });
});

describe("openWhatsAppWeb", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      open: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens a named tab on first click", () => {
    const tab = { closed: false, focus: vi.fn() } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(tab);

    const result = openWhatsAppWeb(webUrl);

    expect(window.open).toHaveBeenCalledWith(launchUrl, WHATSAPP_WEB_WINDOW_NAME);
    expect(result).toBe(tab);
    expect(tab.focus).toHaveBeenCalled();
  });
});

describe("openWhatsAppMessage", () => {
  const links = {
    app: "whatsapp://send?phone=919876543210&text=hello",
    web: webUrl,
  };

  beforeEach(() => {
    vi.stubGlobal("window", {
      open: vi.fn(),
    });
    vi.stubGlobal("sessionStorage", {
      getItem: vi.fn(() => null),
      setItem: vi.fn(),
    });
    vi.stubGlobal("document", {
      body: {
        appendChild: vi.fn(),
        removeChild: vi.fn(),
      },
      createElement: vi.fn(() => ({
        href: "",
        style: { display: "" },
        click: vi.fn(),
        remove: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("opens the launch page immediately on first click", () => {
    const tab = { closed: false, focus: vi.fn() } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(tab);

    const result = openWhatsAppMessage(links);

    expect(result).toBe(true);
    expect(window.open).toHaveBeenCalledWith(launchUrl, WHATSAPP_WEB_WINDOW_NAME);
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("reuses an existing WhatsApp Web tab without trying the app", () => {
    const tab = {
      closed: false,
      focus: vi.fn(),
      close: vi.fn(),
    } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(null);
    (window as Window & { __rajshreeWhatsAppWebTab?: Window }).__rajshreeWhatsAppWebTab =
      tab;

    const nextWeb =
      "https://web.whatsapp.com/send?phone=919876543211&text=hello2";
    const result = openWhatsAppMessage({ ...links, web: nextWeb });

    expect(result).toBe(true);
    expect(window.open).toHaveBeenCalledWith(
      buildWhatsAppLaunchUrl(nextWeb),
      WHATSAPP_WEB_WINDOW_NAME,
    );
    expect(tab.focus).toHaveBeenCalled();
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("closes a duplicate tab when the browser opens a second window", () => {
    const existing = {
      closed: false,
      focus: vi.fn(),
      close: vi.fn(),
    } as unknown as Window;
    const duplicate = {
      closed: false,
      focus: vi.fn(),
      close: vi.fn(),
    } as unknown as Window;
    (window as Window & { __rajshreeWhatsAppWebTab?: Window }).__rajshreeWhatsAppWebTab =
      existing;
    vi.mocked(window.open).mockReturnValue(duplicate);

    openWhatsAppMessage(links);

    expect(existing.close).toHaveBeenCalled();
    expect(duplicate.focus).toHaveBeenCalled();
  });

  it("falls back to the app only when WhatsApp Web cannot open", () => {
    vi.mocked(window.open).mockReturnValue(null);

    const result = openWhatsAppMessage(links);

    expect(result).toBe(false);
    expect(document.createElement).toHaveBeenCalledWith("a");
  });
});
