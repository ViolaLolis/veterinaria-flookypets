export const checkCookieConsent = () => {
  const cookieDecision = localStorage.getItem('cookieDecision');
  if (!cookieDecision) return null;
  
  return JSON.parse(cookieDecision);
};

export const setCookie = (name, value, days, cookieConsent) => {
  if (!cookieConsent || !cookieConsent.necessary) return false;
  
  // Verificar si el tipo de cookie está permitido
  const cookieType = getCookieType(name);
  if (cookieType && !cookieConsent[cookieType]) return false;

  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Lax";
  return true;
};

export const getCookie = (name) => {
  const cookieName = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for(let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return "";
};

export const deleteCookie = (name) => {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

const getCookieType = (cookieName) => {
  // Definir qué cookies pertenecen a cada categoría
  const cookieTypes = {
    // Cookies necesarias (siempre activas)
    'session_id': 'necessary',
    'csrf_token': 'necessary',
    'user_auth': 'necessary',
    
    // Cookies de preferencias
    'language': 'preferences',
    'theme': 'preferences',
    'region': 'preferences',
    
    // Cookies estadísticas
    '_ga': 'statistics',
    '_gid': 'statistics',
    '_gat': 'statistics',
    
    // Cookies de marketing
    '_fbp': 'marketing',
    'fr': 'marketing',
    'tr': 'marketing'
  };
  
  return cookieTypes[cookieName] || null;
};