// ISOLATED world: owns the API key and runs the solve/verify flow.
// The page cannot read this world, so the key never becomes reachable from
// ticketbox.vn's own scripts. content.js (MAIN world) only forwards captcha
// payloads here and renders whatever status we send back.
(function () {
  "use strict";
  console.log("[ENCORE] inject-credentials.js loaded");

  const SOLVER_URL = "https://solver.encorebot.cloud/solve-captcha";
  const VERIFY_URL = "https://api-v2.ticketbox.vn/sapporo/api/v2/capt/check";

  const MSG_CAPTCHA = "__encore_captcha__";
  const MSG_STATUS = "__encore_status__";

  let credentials = null;
  let solving = false;

  // ============================================================
  // CREDENTIALS
  // ============================================================
  async function loadCredentials() {
    const stored = await chrome.storage.local.get(["credentials"]);
    credentials = stored.credentials || null;
    console.log("[ENCORE] Credentials state", {
      hasApiKey: !!credentials?.apiKey,
    });
    setStatus(credentials?.apiKey ? "READY" : "NO_KEY");
  }

  loadCredentials();

  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "local" && changes.credentials) {
      console.log("[ENCORE] Credentials changed in storage.local");
      loadCredentials();
    }
  });

  // The bridge may still be loading when a captcha fires; wait briefly.
  async function waitForApiKey(maxWaitMs = 400, intervalMs = 80) {
    const deadline = Date.now() + maxWaitMs;
    while (Date.now() < deadline) {
      const apiKey = credentials?.apiKey?.trim();
      if (apiKey) return apiKey;
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
    return null;
  }

  // ============================================================
  // HELPERS
  // ============================================================
  function setStatus(status) {
    window.postMessage({ type: MSG_STATUS, status }, location.origin);
  }

  function getCookie(name) {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)"),
    );
    return match ? decodeURIComponent(match[2]) : null;
  }

  function isTokenExpired(token) {
    try {
      const { exp } = JSON.parse(atob(token.split(".")[1]));
      return !exp || exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  // ============================================================
  // SOLVE FLOW
  // ============================================================
  async function processCaptcha({ data, showingId, path, requestUrl }) {
    if (solving) return;
    solving = true;

    try {
      console.log("[ENCORE] processCaptcha start");

      const userId = getCookie("userId");
      console.log("[ENCORE] Context IDs", { showingId, userId });

      if (!showingId || !userId) {
        // Surface everything needed to add a new id source for this page type.
        console.log("[ENCORE] Stop: missing showingId or userId", {
          path,
          requestUrl,
          payloadKeys: Object.keys(data?.data || {}),
        });
        return setStatus("ERROR");
      }

      if (data?.code !== 1 || !data.data) {
        console.log("[ENCORE] Stop: invalid captcha payload", {
          code: data?.code,
          hasData: !!data?.data,
        });
        return setStatus("ERROR");
      }

      const tokenKey = `tkc_${userId}${showingId}`;
      const existingToken = localStorage.getItem(tokenKey);
      if (existingToken && !isTokenExpired(existingToken)) {
        console.log("[ENCORE] Stop: valid token already exists", { tokenKey });
        return setStatus("READY");
      }

      let apiKey = credentials?.apiKey;
      if (!apiKey) {
        setStatus("NO_KEY");
        apiKey = await waitForApiKey();
      }
      console.log("[ENCORE] API key check", { hasApiKey: !!apiKey });
      if (!apiKey) {
        console.log("[ENCORE] Missing API key");
        return setStatus("NO_KEY");
      }

      // --- Solve ---
      // Key travels in a header, not the query string: query strings land in
      // server/proxy access logs, browser history and Referer headers.
      setStatus("PROCESSING");
      const solveStart = Date.now();
      const solveRes = await fetch(SOLVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify(data),
      });
      const solveTime = Date.now() - solveStart;
      console.log("[ENCORE] Solve API response status:", solveRes.status);

      if (!solveRes.ok) {
        if (solveRes.status === 401) return setStatus("BAD_KEY");
        if (solveRes.status === 402) return setStatus("NO_CREDIT");
        throw new Error(`Solver API returned ${solveRes.status}`);
      }

      const { key, value, credit_remaining } = await solveRes.json();
      if (!key || !value) {
        console.log("[ENCORE] Invalid solver response");
        return setStatus("ERROR");
      }
      console.log("[ENCORE] Solve API success", { solveTime });

      // --- Verify with TicketBox ---
      const accessToken = getCookie("TBoxJWT");
      const deviceId = getCookie("deviceId");
      if (!accessToken || !deviceId) {
        console.log("[ENCORE] Missing TicketBox authentication cookies");
        return setStatus("ERROR");
      }

      setStatus("VERIFYING");
      const verifyStart = Date.now();
      const verifyRes = await fetch(`${VERIFY_URL}/${showingId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
          "x-tb-access-token": accessToken,
          "x-device-info": `platform=web;device-id=${deviceId}`,
        },
        credentials: "include",
        body: JSON.stringify({ key, value }),
      });
      const verifyTime = Date.now() - verifyStart;

      const verifiedToken = (await verifyRes.json())?.data?.token;
      if (!verifiedToken) {
        console.log("[ENCORE] Verification succeeded but no token returned");
        return setStatus("WARNING");
      }

      console.log("[ENCORE] CAPTCHA verified, saving token", {
        solveTime,
        verifyTime,
        credit_remaining,
      });
      localStorage.setItem(tokenKey, verifiedToken);
      localStorage.setItem(
        `tkc_meta_${userId}${showingId}`,
        JSON.stringify({ solveTime, verifyTime, timestamp: Date.now() }),
      );

      setStatus("SUCCESS");
      location.reload();
    } catch (error) {
      console.log("[ENCORE] processCaptcha error:", error?.message);
      setStatus("ERROR");
    } finally {
      solving = false;
    }
  }

  // ============================================================
  // BRIDGE FROM MAIN WORLD
  // ============================================================
  window.addEventListener("message", (event) => {
    // Same-window, same-origin only; the payload itself stays untrusted input.
    if (event.source !== window || event.origin !== location.origin) return;
    if (event.data?.type !== MSG_CAPTCHA) return;

    processCaptcha(event.data);
  });

  // A page-driven navigation replaces the captcha context; allow a new solve.
  window.addEventListener("popstate", () => {
    solving = false;
  });
})();
