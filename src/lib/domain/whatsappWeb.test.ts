import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  WHATSAPP_WEB_WINDOW_NAME,
  openWhatsAppMessage,
  openWhatsAppWeb,
} from "./whatsappWeb";

describe("openWhatsAppWeb", () => {
  const webUrl =
    "https://web.whatsapp.com/send?phone=919876543210&text=hello";

  beforeEach(() => {
    vi.stubGlobal("window", {
      open: vi.fn(),
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it("opens a named tab on first click", () => {
    const tab = { closed: false, focus: vi.fn() } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(tab);

    const result = openWhatsAppWeb(webUrl);

    expect(window.open).toHaveBeenCalledWith(webUrl, WHATSAPP_WEB_WINDOW_NAME);
    expect(result).toBe(tab);
    expect(tab.focus).toHaveBeenCalled();
  });
});

describe("openWhatsAppMessage", () => {
  const links = {
    app: "whatsapp://send?phone=919876543210&text=hello",
    web: "https://web.whatsapp.com/send?phone=919876543210&text=hello",
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal("window", {
      open: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setTimeout: (...args: Parameters<typeof setTimeout>) => setTimeout(...args),
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

  it("reuses an existing WhatsApp Web tab without trying the app", () => {
    const tab = { closed: false, focus: vi.fn() } as unknown as Window;
    vi.mocked(window.open).mockReturnValueOnce(tab).mockReturnValueOnce(tab);
    (window as Window & { __rajshreeWhatsAppWebTab?: Window }).__rajshreeWhatsAppWebTab =
      tab;

    const nextLinks = {
      ...links,
      web: "https://web.whatsapp.com/send?phone=919876543211&text=hello2",
    };
    const result = openWhatsAppMessage(nextLinks);

    expect(result).toBe(true);
    expect(window.open).toHaveBeenCalledTimes(1);
    expect(window.open).toHaveBeenCalledWith(
      nextLinks.web,
      WHATSAPP_WEB_WINDOW_NAME,
    );
    expect(document.createElement).not.toHaveBeenCalled();
  });

  it("tries the app first when no web tab exists", () => {
    vi.mocked(window.open).mockReturnValue(null);

    openWhatsAppMessage(links);

    expect(document.createElement).toHaveBeenCalledWith("a");
    expect(window.open).not.toHaveBeenCalled();
  });

  it("opens WhatsApp Web when the app does not take focus", () => {
    const tab = { closed: false, focus: vi.fn() } as unknown as Window;
    vi.mocked(window.open).mockReturnValue(tab);

    openWhatsAppMessage(links);
    vi.advanceTimersByTime(800);

    expect(window.open).toHaveBeenCalledWith(
      links.web,
      WHATSAPP_WEB_WINDOW_NAME,
    );
  });

  it("does not open WhatsApp Web when the app takes focus", () => {
    vi.mocked(window.addEventListener).mockImplementation((event, handler) => {
      if (event === "blur") {
        (handler as () => void)();
      }
    });

    openWhatsAppMessage(links);
    vi.advanceTimersByTime(800);

    expect(window.open).not.toHaveBeenCalled();
  });
});
