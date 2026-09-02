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
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      open: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout: (...args: Parameters<typeof setTimeout>) => setTimeout(...args),
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
    vi.useRealTimers();
  });

  it("tries the WhatsApp app first on every click", () => {
    const tab = { closed: false, focus: vi.fn() } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(tab);

    openWhatsAppMessage(links);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(window.open).not.toHaveBeenCalled();
  });

  it("opens WhatsApp Web when the app does not take focus", () => {
    const tab = { closed: false, focus: vi.fn() } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(tab);

    const result = openWhatsAppMessage(links);
    expect(result).toBe(true);

    vi.advanceTimersByTime(350);

    expect(window.open).toHaveBeenCalledWith(launchUrl, WHATSAPP_WEB_WINDOW_NAME);
    expect(tab.focus).toHaveBeenCalled();
  });

  it("does not open WhatsApp Web when the app takes focus", () => {
    vi.mocked(window.addEventListener).mockImplementation((event, handler) => {
      if (event === "blur") {
        (handler as () => void)();
      }
    });

    openWhatsAppMessage(links);
    vi.advanceTimersByTime(350);

    expect(window.open).not.toHaveBeenCalled();
  });

  it("reuses an existing WhatsApp Web tab after the app does not hand off", () => {
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
    openWhatsAppMessage({ ...links, web: nextWeb });
    vi.advanceTimersByTime(350);

    expect(window.open).toHaveBeenCalledWith(
      buildWhatsAppLaunchUrl(nextWeb),
      WHATSAPP_WEB_WINDOW_NAME,
    );
    expect(tab.focus).toHaveBeenCalled();
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
    vi.advanceTimersByTime(350);

    expect(existing.close).toHaveBeenCalled();
    expect(duplicate.focus).toHaveBeenCalled();
  });
});
