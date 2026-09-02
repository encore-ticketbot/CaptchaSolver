// MAIN world: hooks the page's own fetch/XHR to catch captcha payloads, and
// renders the status pill. It deliberately holds NO credentials — the page and
// any third-party script it loads share this world and could read them.
// Payloads go to the ISOLATED world over postMessage; the API key and the
// solver call live there, out of the page's reach.
(function () {
  "use strict";

  console.log("[ENCORE] content.js loaded");

  // Match the captcha endpoint by its distinctive path segment rather than a
  // fixed URL, so unknown hosts/API versions/query strings still get hooked.
  // The host check keeps other origins from spending solver credit.
  const CAPTCHA_PATH = /\/capt\/gen(?:[\/?#]|$)/;
  const CAPTCHA_HOST = /(^|\.)ticketbox\.vn$/i;
  const SHOWING_ID_RE =
    /(?:\/events\/\d+\/bookings\/|\/events\/\d+\/resale-bookings\/|\/queue\/|\/presale\/)(\d+)/;

  // Namespaced so page scripts are less likely to collide with these.
  const MSG_CAPTCHA = "__encore_captcha__";
  const MSG_STATUS = "__encore_status__";

  // Indicator colours drawn from the Ticketbox brand palette.
  const BRAND_DARK = "#42b972";
  const BRAND_LIGHT = "#77c470";
  const BRAND_PALE = "#d8f0e2";
  const DANGER = "#c2705a";

  const STATUS = {
    READY: ["Ready", BRAND_DARK],
    PROCESSING: ["Processing...", BRAND_PALE],
    VERIFYING: ["Verifying...", BRAND_PALE],
    SUCCESS: ["Success!", "#ffffff"],
    WARNING: ["Warning", BRAND_PALE],
    ERROR: ["Error", DANGER],
    NO_KEY: ["ERROR: No API Key", DANGER],
    BAD_KEY: ["Invalid Key", DANGER],
    NO_CREDIT: ["No Credit", DANGER],
  };
  // Only these transient states surface the floating panel.
  const VISIBLE_STATUS = new Set(["Processing...", "Verifying...", "Success!"]);

  let hooksInstalled = false;

  // ============================================================
  // REQUEST HOOKS
  // ============================================================

  // Accepts absolute or relative URLs; relative ones resolve against the page.
  function isCaptchaUrl(raw) {
    try {
      const { hostname, pathname } = new URL(String(raw ?? ""), location.href);
      return CAPTCHA_HOST.test(hostname) && CAPTCHA_PATH.test(pathname);
    } catch {
      return false;
    }
  }

  // Not every page carries the id in its path (membership/stars pages do not),
  // so fall back to the captcha request URL and the response payload.
  const ID_PARAMS = ["showingId", "showing_id", "showingID", "id"];

  function idFromUrl(raw) {
    if (!raw) return null;
    try {
      const url = new URL(String(raw), location.href);
      for (const param of ID_PARAMS) {
        const value = url.searchParams.get(param);
        if (value && /^\d+$/.test(value)) return value;
      }
      return url.pathname.match(/\/capt\/gen\/(\d+)/)?.[1] || null;
    } catch {
      return null;
    }
  }

  function idFromPayload(data) {
    for (const source of [data, data?.data]) {
      for (const param of ID_PARAMS) {
        const value = source?.[param];
        if (value != null && /^\d+$/.test(String(value))) return String(value);
      }
    }
    return null;
  }

  function getShowingId(requestUrl, data) {
    return (
      location.pathname.match(SHOWING_ID_RE)?.[1] ||
      idFromUrl(requestUrl) ||
      idFromPayload(data) ||
      null
    );
  }

  // Captcha payloads arrive over either transport; both funnel in here and are
  // forwarded to the ISOLATED world, which owns the key and the solver call.
  function onCaptchaPayload(data, source, requestUrl) {
    console.log("[ENCORE] CAPTCHA response captured via " + source);
    window.postMessage(
      {
        type: MSG_CAPTCHA,
        data,
        showingId: getShowingId(requestUrl, data),
        path: location.pathname,
        requestUrl: requestUrl || null,
      },
      location.origin,
    );
  }

  function installHooks() {
    if (hooksInstalled) return;
    hooksInstalled = true;
    console.log("[ENCORE] Installing request hooks");

    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const input = args[0];
      const url = String(
        typeof input === "string" ? input : input?.url || input || "",
      );
      const response = await originalFetch.apply(this, args);

      if (response.status === 200 && isCaptchaUrl(url)) {
        response
          .clone()
          .json()
          .then((data) => onCaptchaPayload(data, "fetch", url))
          .catch(() => {});
      }

      return response;
    };

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url) {
      this._isCaptchaApi = isCaptchaUrl(url);
      this._captchaUrl = url;
      return originalOpen.apply(this, arguments);
    };

    const originalSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function () {
      // addEventListener leaves the page's own onload handler untouched.
      if (this._isCaptchaApi) {
        this.addEventListener("load", () => {
          if (this.status !== 200) return;
          try {
            onCaptchaPayload(
              JSON.parse(this.responseText),
              "XHR",
              this._captchaUrl,
            );
          } catch {}
        });
      }
      return originalSend.apply(this, arguments);
    };
  }

  // ============================================================
  // FLOATING PANEL UI
  // ============================================================
  let panelEl = null;
  let statusEl = null;
  let indicatorEl = null;
  let pendingStatus = STATUS.NO_KEY;

  function createFloatingPanel() {
    if (panelEl) return;
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", createFloatingPanel, {
        once: true,
      });
      return;
    }

    panelEl = document.createElement("div");
    panelEl.id = "tbCaptchaSolver";
    panelEl.style.cssText = [
      "position:fixed",
      "bottom:10px",
      "left:10px",
      "z-index:999999",
      "display:none",
      "align-items:center",
      "gap:6px",
      "padding:4px 8px",
      "border-radius:4px",
      `background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_LIGHT} 100%)`,
      "box-shadow:0 2px 8px rgba(32,92,58,0.30)",
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
    ].join(";");

    indicatorEl = document.createElement("div");
    indicatorEl.style.cssText = `width:4px;height:4px;border-radius:50%;background:${DANGER};animation:tbSolverPulse 2s infinite`;

    statusEl = document.createElement("div");
    statusEl.style.cssText = "color:#fff;font-weight:500;font-size:10px";

    const style = document.createElement("style");
    style.textContent =
      "@keyframes tbSolverPulse{0%,100%{opacity:1}50%{opacity:.5}}";

    panelEl.append(style, indicatorEl, statusEl);
    document.body.appendChild(panelEl);

    updateStatus(pendingStatus);
  }

  function updateStatus(status) {
    const [text, color] = status;
    if (!panelEl) {
      pendingStatus = status;
      return;
    }
    panelEl.style.display = VISIBLE_STATUS.has(text) ? "flex" : "none";
    statusEl.textContent = text;
    indicatorEl.style.background = color;
  }

  // Status updates are pushed from the ISOLATED world, which runs the solve.
  window.addEventListener("message", (event) => {
    if (event.source !== window || event.origin !== location.origin) return;
    if (event.data?.type !== MSG_STATUS) return;

    const status = STATUS[event.data.status];
    if (status) updateStatus(status);
  });

  // ============================================================
  // INITIALIZE
  // ============================================================
  installHooks();
  createFloatingPanel();
})();
