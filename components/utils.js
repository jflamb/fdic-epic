export function parseJsonAttribute(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function stripQuestionPrefix(text) {
  return (text || "").replace(/^\s*Q:\s*/i, "").trim();
}

export function externalLinkAttrs(href) {
  return /^https?:\/\//i.test(href || "") ? ' target="_blank" rel="noopener noreferrer"' : "";
}

export function escapeCssSelector(value) {
  if (window.CSS && typeof window.CSS.escape === "function") {
    return window.CSS.escape(value);
  }
  return String(value).replace(/["\\]/g, "\\$&");
}

export async function copyTextToClipboard(value) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Fall through to legacy approach.
  }

  try {
    const tempInput = document.createElement("input");
    tempInput.value = value;
    tempInput.setAttribute("readonly", "");
    tempInput.style.position = "absolute";
    tempInput.style.left = "-9999px";
    document.body.appendChild(tempInput);
    tempInput.select();
    const ok = document.execCommand("copy");
    tempInput.remove();
    return ok;
  } catch (error) {
    console.error("Unable to copy link:", error);
    return false;
  }
}
