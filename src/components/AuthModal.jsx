import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, X } from "lucide-react";
import { useState } from "react";
import { saveDemoProfile } from "./authUtils";

const SESSION_KEY = "bizgrow-session";

function AuthModal({ open, onClose, initialMode = "login", onAuthenticated }) {
  const [mode, setMode] = useState(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [values, setValues] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", remember: false });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;
  const isSignup = mode === "signup";
  const update = (key, value) => { if (key === "phone") value = value.replace(/\D/g, "").slice(0, 10); setValues((current) => ({ ...current, [key]: value })); setError(""); };
  const close = () => { if (dontShowAgain) localStorage.setItem("bizgrow-auth-popup-dismissed", "true"); onClose(); };
  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!values.email || !/^\S+@\S+\.\S+$/.test(values.email)) return setError(isSignup ? "Enter a valid email address." : "Invalid email/ID or password. Please check your credentials and try again.");
    if (!/^\d{10}$/.test(values.phone)) return setError("Enter a valid phone number with exactly 10 digits.");
    if (isSignup && values.password.length < 8) return setError("Password must be at least 8 characters.");
    if (isSignup && !values.name.trim()) return setError("Enter your full name.");
    if (isSignup && values.password !== values.confirmPassword) return setError("Passwords do not match.");
    const normalizedEmail = values.email.trim().toLowerCase();
    setIsSubmitting(true);

    try {
      const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(isSignup ? { name: values.name.trim(), email: normalizedEmail, phone: values.phone, password: values.password } : { email: normalizedEmail, phone: values.phone, password: values.password }) });
      const payload = await response.json();
      if (!response.ok) return setError(payload.error || (isSignup ? "Unable to create account." : "Invalid email or password. Please check your credentials and try again."));
      saveDemoProfile(payload.user);
    } catch (err) {
      setError(err.message === "Failed to fetch" ? "Unable to connect to the authentication server. Please try again." : "Unable to complete authentication. Please try again.");
    } finally {
      setIsSubmitting(false);
    }

    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: normalizedEmail, signedInAt: Date.now(), remember: values.remember }));
    localStorage.setItem("bizgrow-auth-popup-dismissed", "true");
    close();
    onAuthenticated?.();
    window.location.assign("/");
  };

  return <div className="auth-overlay" role="dialog" aria-modal="true" aria-label={isSignup ? "Sign up" : "Login"}>
    <div className="auth-modal"><button className="auth-close" onClick={close} aria-label="Close authentication dialog"><X size={19} /></button>
      <div className="auth-visual"><span className="auth-badge"><LockKeyhole size={14} /> Secure demo access</span><h2>{isSignup ? "Start your smarter growth journey." : "Welcome back to clearer growth."}</h2><p>Save your assessment, revisit your strategy, and keep your next best action in view.</p><ul><li><Check size={14} /> Personalized recommendations</li><li><Check size={14} /> Progress saved across devices</li></ul></div>
      <form className="auth-form" onSubmit={submit}><span className="question-kicker">BizGrow account</span><h1>{isSignup ? "Create your account" : "Log in to BizGrow"}</h1><p className="auth-note">{isSignup ? "Build a private space for your marketing plan." : "Continue where your growth plan left off."}</p>
        {isSignup && <label>Full Name<input value={values.name} onChange={(event) => update("name", event.target.value)} placeholder="Alex Morgan" autoComplete="name" /></label>}
        <label>Email<input value={values.email} onChange={(event) => update("email", event.target.value)} placeholder="alex@business.com" type="email" autoComplete="email" /></label>
        <label>Phone Number<input value={values.phone} onChange={(event) => update("phone", event.target.value)} placeholder="5551234567" type="tel" inputMode="numeric" maxLength="10" pattern="[0-9]{10}" autoComplete="tel" /><small>Enter exactly 10 digits.</small></label>
        <label>Password<div className="password-input"><input value={values.password} onChange={(event) => update("password", event.target.value)} placeholder="At least 8 characters" type={showPassword ? "text" : "password"} autoComplete={isSignup ? "new-password" : "current-password"} /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>
        {isSignup && <label>Confirm Password<input value={values.confirmPassword} onChange={(event) => update("confirmPassword", event.target.value)} placeholder="Repeat your password" type="password" autoComplete="new-password" /></label>}
        {!isSignup && <div className="auth-options"><label className="checkbox-label"><input type="checkbox" checked={values.remember} onChange={(event) => update("remember", event.target.checked)} /> Remember me</label><button type="button" className="forgot-button" onClick={() => setError("Password reset is available when a backend is connected.")}>Forgot Password?</button></div>}
        <label className="checkbox-label popup-dismiss"><input type="checkbox" checked={dontShowAgain} onChange={(event) => setDontShowAgain(event.target.checked)} /> Don't show again</label>
        {error && <p className="form-error" role="alert">{error}</p>}<button className="continue-button auth-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Please wait..." : isSignup ? "Create Account" : "Login"}<ArrowRight size={16} /></button>
        <p className="auth-switch">{isSignup ? "Already have an account?" : "Don't have an account?"} <button type="button" onClick={() => { setMode(isSignup ? "login" : "signup"); setError(""); }}>{isSignup ? "Login" : "Sign Up"}</button></p>
        <small className="auth-disclaimer">Your password is securely handled by the BizGrow backend and is never stored in your browser.</small>
      </form>
    </div>
  </div>;
}

export default AuthModal;
