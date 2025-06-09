// src/Pages/Inicio/CookieUtils.js

export function setCookieConsent(consent) {
  document.cookie = `cookieConsent=${encodeURIComponent(JSON.stringify(consent))}; path=/; max-age=${60*60*24*365}`;
}

export function checkCookieConsent() {
  const match = document.cookie.match(new RegExp('(^| )cookieConsent=([^;]+)'));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      return null;
    }
  }
  return null;
}
