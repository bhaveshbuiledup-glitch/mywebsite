const SESSION_KEY = "bizgrow-session";
const PROFILE_KEY = "bizgrow-demo-user";
const CREDENTIALS_KEY = "bizgrow-demo-credentials";
const USERS_KEY = "bizgrow-demo-users";

export function clearDemoSession() { localStorage.removeItem(SESSION_KEY); }
export function isDemoLoggedIn() { return Boolean(localStorage.getItem(SESSION_KEY)); }
export function getDemoProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}"); } catch { return {}; } }
export function saveDemoProfile(profile) { localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); }
export async function hashDemoPassword(password) {
	const data = new TextEncoder().encode(password);
	const digest = await crypto.subtle.digest("SHA-256", data);
	return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
export function getDemoCredentials() { try { return JSON.parse(localStorage.getItem(CREDENTIALS_KEY) || "{}"); } catch { return {}; } }
export function saveDemoCredentials(credentials) { localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials)); }
export function getDemoUsers() { try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch { return {}; } }
export function saveDemoUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }
