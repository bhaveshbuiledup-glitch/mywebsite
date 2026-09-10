const SESSION_KEY = "bizgrow-session";
const PROFILE_KEY = "bizgrow-demo-user";

export function clearDemoSession() { localStorage.removeItem(SESSION_KEY); }
export function isDemoLoggedIn() { return Boolean(localStorage.getItem(SESSION_KEY)); }
export function getDemoProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch { return {}; } }
export function saveDemoProfile(profile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
