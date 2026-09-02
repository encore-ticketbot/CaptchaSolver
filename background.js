// Service Worker for ENCORE Captcha Solver Extension
// Handles background tasks and extension lifecycle

// Every ticketbox.vn host, including subdomains such as stars.ticketbox.vn.
const TICKETBOX_TABS = {
  url: ["https://*.ticketbox.vn/*", "https://ticketbox.vn/*"],
};

chrome.runtime.onInstalled.addListener(() => {
  console.log("[ENCORE] Extension installed");
});

// Runs in the page's MAIN world to publish credentials to content.js.
function setPageCredentials(payload) {
  window.__ENCORE_CREDENTIALS = payload && {
    apiKey: payload.apiKey || "",
    userId: String(payload.userId || ""),
    email: payload.email || "",
    credit: Number(payload.credit || 0),
  };
  window.dispatchEvent(new CustomEvent("encoreCredentialsUpdated"));
}

// Runs setPageCredentials in the MAIN world of every open ticketbox.vn tab.
async function broadcastCredentials(payload) {
  const tabs = await chrome.tabs.query(TICKETBOX_TABS);
  await Promise.all(
    tabs.map((tab) =>
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          world: "MAIN",
          func: setPageCredentials,
          args: [payload],
        })
        .catch((error) => {
          // Tab may have navigated away or be otherwise unscriptable.
          console.log("[ENCORE] Broadcast skipped for tab:", error?.message);
        }),
    ),
  );
}

// Each handler returns a promise resolving to the response payload.
const handlers = {
  getStatus: async () => {
    const items = await chrome.storage.local.get(null);
    return { status: "active", tokens: Object.keys(items).length };
  },

  clearTokens: async () => {
    await chrome.storage.local.clear();
    return { status: "cleared" };
  },

  // Popup saved a new key: push it into every open ticketbox.vn tab.
  SET_API_CREDENTIALS: async (request) => {
    console.log("[ENCORE] SET_API_CREDENTIALS received");
    await broadcastCredentials({
      apiKey: request.apiKey,
      userId: request.userId,
      email: request.email,
      credit: request.credit,
    });
    return { success: true };
  },

  // inject-credentials.js bridging storage into its own tab.
  APPLY_API_CREDENTIALS_TO_TAB: async (request, sender) => {
    const tabId = sender.tab?.id;
    if (!tabId) {
      console.log("[ENCORE] APPLY_API_CREDENTIALS_TO_TAB missing sender tab");
      return { success: false, error: "No sender tab" };
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId },
        world: "MAIN",
        func: setPageCredentials,
        args: [request.credentials || {}],
      });
      console.log("[ENCORE] Credentials applied in MAIN world");
      return { success: true };
    } catch (error) {
      console.log("[ENCORE] Failed apply credentials:", error?.message);
      return { success: false, error: error?.message };
    }
  },

  CLEAR_API_CREDENTIALS: async () => {
    console.log("[ENCORE] CLEAR_API_CREDENTIALS received");
    await broadcastCredentials(null);
    return { success: true };
  },
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const name = request.type || request.action;
  console.log("[ENCORE] Background message:", name);

  const handler = handlers[name];
  if (!handler) return false;

  handler(request, sender)
    .then(sendResponse)
    .catch((error) => {
      console.log("[ENCORE] Handler error:", error?.message);
      sendResponse({ success: false, error: error?.message });
    });

  return true; // Response is delivered asynchronously.
});
