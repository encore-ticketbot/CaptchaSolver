// Popup UI: API key verification + stored captcha token management.

const VERIFY_URL = "https://auth.encorebot.cloud/api/Auth/verify";
const VERIFY_DEBOUNCE_MS = 500;

let verifyTimeout = null;

const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  console.log("[ENCORE] popup loaded");
  loadTokens();
  loadSavedApiKey();

  $("clearBtn").addEventListener("click", clearAllTokens);
  $("apiKey").addEventListener("input", handleApiKeyInput);
});

// ============================================================
// API KEY
// ============================================================
function handleApiKeyInput() {
  const apiKey = $("apiKey").value.trim();
  console.log("[ENCORE] API key input changed", { length: apiKey.length });

  clearTimeout(verifyTimeout);
  $("balanceSection").classList.add("hidden");
  hideError();

  if (apiKey) {
    verifyTimeout = setTimeout(verifyApiKey, VERIFY_DEBOUNCE_MS);
  } else {
    console.log("[ENCORE] API key empty, clearing credentials");
    clearCredentials();
  }
}

async function loadSavedApiKey() {
  const { credentials } = await chrome.storage.local.get(["credentials"]);
  if (!credentials?.apiKey) return;

  console.log("[ENCORE] Loaded saved API key from storage.local");
  $("apiKey").value = credentials.apiKey;
  // Re-verify so the displayed credit reflects the server, not the cache.
  verifyApiKey();
}

function clearCredentials() {
  chrome.storage.local.remove(["credentials"]);
  chrome.runtime.sendMessage({ type: "CLEAR_API_CREDENTIALS" }).catch(() => {});
}

async function verifyApiKey() {
  const apiKey = $("apiKey").value.trim();
  if (!apiKey) return;

  try {
    console.log("[ENCORE] Verifying API key");
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { accept: "text/plain", "Content-Type": "application/json" },
      body: JSON.stringify(apiKey),
    });

    if (response.status === 401) {
      console.log("[ENCORE] API key invalid");
      displayError((await response.text()) || "Invalid API key");
      clearCredentials();
      return;
    }

    if (!response.ok) {
      displayError("Verification failed. Please try again.");
      return;
    }

    console.log("[ENCORE] API key verified");
    const { email, id, credit } = await response.json();

    await chrome.storage.local.set({
      credentials: { apiKey, email, userId: id },
    });

    // Push the new key into any open ticketbox.vn tab right away.
    chrome.runtime
      .sendMessage({
        type: "SET_API_CREDENTIALS",
        apiKey,
        userId: id,
        email,
        credit,
      })
      .catch(() => {});

    displayBalance(credit);
    hideError();
  } catch (error) {
    console.error("Verify error:", error);
    displayError("Network error. Please check your connection.");
  }
}

function displayBalance(credit) {
  $("balanceAmount").textContent = `${new Intl.NumberFormat("en-US").format(
    credit,
  )} VND`;
  $("balanceSection").classList.remove("hidden");
}

function displayError(message) {
  $("balanceSection").classList.add("hidden");
  const errorDiv = $("errorMessage");
  errorDiv.textContent = message;
  errorDiv.classList.remove("hidden");
}

function hideError() {
  $("errorMessage").classList.add("hidden");
}

// ============================================================
// TOKENS
// ============================================================
function decodeJWT(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Injected into the page: collects tkc_* tokens plus their timing metadata.
function collectTokens() {
  const getCookie = (name) => {
    const parts = `; ${document.cookie}`.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(";").shift() : "";
  };

  const userId = getCookie("userId");
  const tokens = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith("tkc_") || key.startsWith("tkc_meta_")) continue;

    const raw = localStorage.getItem(key);
    // Older builds stored a JSON envelope; newer ones store the bare JWT.
    let token = raw;
    try {
      token = JSON.parse(raw).token || raw;
    } catch {}

    const suffix = key.slice("tkc_".length);
    let meta = {};
    try {
      meta = JSON.parse(localStorage.getItem(`tkc_meta_${suffix}`)) || {};
    } catch {}

    tokens.push({
      key,
      showingId:
        userId && suffix.startsWith(userId)
          ? suffix.slice(userId.length)
          : suffix,
      token,
      solveTime: meta.solveTime ?? null,
      verifyTime: meta.verifyTime ?? null,
    });
  }

  return tokens;
}

// Runs func in the active tab, but only when it is a ticketbox.vn page.
async function withTicketBoxTab(func, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.url?.includes("ticketbox.vn")) return null;

  try {
    const [injection] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func,
      args,
    });
    return injection?.result ?? null;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

async function loadTokens() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab?.url?.includes("ticketbox.vn")) {
    displayNotTicketBox();
    return;
  }

  const tokens = (await withTicketBoxTab(collectTokens)) || [];
  displayTokens(tokens);
}

function displayNotTicketBox() {
  $("tokenList").innerHTML =
    '<p class="no-tokens empty-hint">📍 Please visit <strong>ticketbox.vn</strong> to use this extension</p>';
  $("clearBtn").style.display = "none";
}

function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function displayTokens(tokens) {
  const tokenList = $("tokenList");
  $("clearBtn").style.display = tokens.length ? "block" : "none";

  if (!tokens.length) {
    tokenList.innerHTML = '<p class="no-tokens">No tokens stored</p>';
    return;
  }

  // Newest first, by JWT issue time.
  const rows = tokens
    .map((token) => ({ ...token, decoded: decodeJWT(token.token) }))
    .sort((a, b) => (b.decoded?.iat || 0) - (a.decoded?.iat || 0));

  tokenList.innerHTML = rows
    .map(({ key, showingId, decoded, solveTime, verifyTime }) => {
      const issuedTime = decoded?.iat ? formatDateTime(decoded.iat) : "N/A";
      const expireTime = decoded?.exp ? formatDateTime(decoded.exp) : "N/A";
      const isExpired = decoded?.exp ? decoded.exp * 1000 < Date.now() : false;

      return `
    <div class="token-item ${isExpired ? "expired" : ""}">
      <div class="token-info">
        <div class="token-id">ID: ${escapeHtml(showingId)}</div>
        <div class="token-details">
          <div class="token-time">🕐 ${issuedTime}</div>
          <div class="token-time ${isExpired ? "expired-text" : ""}">⌛ ${expireTime}</div>
          ${solveTime ? `<div class="token-time">⚡ ${solveTime}ms</div>` : ""}
          ${verifyTime ? `<div class="token-time">✔️ ${verifyTime}ms</div>` : ""}
        </div>
      </div>
      <button class="btn-delete" data-key="${escapeHtml(key)}">×</button>
    </div>
  `;
    })
    .join("");

  tokenList.querySelectorAll(".btn-delete").forEach((btn) => {
    btn.addEventListener("click", () => deleteToken(btn.dataset.key));
  });
}

function formatDateTime(timestamp) {
  const date = new Date(timestamp * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ` +
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

async function deleteToken(key) {
  await withTicketBoxTab(
    (tokenKey) => {
      localStorage.removeItem(tokenKey);
      localStorage.removeItem(`tkc_meta_${tokenKey.slice("tkc_".length)}`);
    },
    [key],
  );
  loadTokens();
}

async function clearAllTokens() {
  if (!confirm("Xóa hết tất cả tokens?")) return;

  await withTicketBoxTab(() => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("tkc_")) keys.push(key);
    }
    keys.forEach((key) => localStorage.removeItem(key));
  });
  loadTokens();
}
