import "./Navbar.css";
import { ArrowRight, CircleUserRound, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { clearDemoSession, getDemoProfile, isDemoLoggedIn } from "./authUtils";

function Navbar({ onLogin }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(isDemoLoggedIn());
  const [profileOpen, setProfileOpen] = useState(false);
  const [profile, setProfile] = useState(getDemoProfile());
  useEffect(() => { const sync = () => { setLoggedIn(isDemoLoggedIn()); setProfile(getDemoProfile()); }; window.addEventListener("bizgrow-auth-changed", sync); return () => window.removeEventListener("bizgrow-auth-changed", sync); }, []);
  const closeMenu = () => setOpen(false);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link className="logo" to="/" onClick={closeMenu}><span className="logo-mark">B</span>BizGrow</Link>

      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <ul className={`nav-links ${open ? "is-open" : ""}`}>
        <li><Link className={location.pathname === "/" ? "active" : ""} to="/" onClick={closeMenu}>Home</Link></li>
        <li><Link className={location.pathname === "/how-it-works" ? "active" : ""} to="/how-it-works" onClick={closeMenu}>How It Works</Link></li>
        <li><Link className={location.pathname === "/services" ? "active" : ""} to="/services" onClick={closeMenu}>Services</Link></li>
        <li><Link className={location.pathname === "/pricing" ? "active" : ""} to="/pricing" onClick={closeMenu}>Pricing</Link></li>
        <li><Link className={location.pathname === "/about" ? "active" : ""} to="/about" onClick={closeMenu}>About</Link></li>
        <li><Link className={location.pathname === "/contact" ? "active" : ""} to="/contact" onClick={closeMenu}>Contact</Link></li>
      </ul>

      <div className="nav-actions">{loggedIn ? <div className="profile-menu"><button className="profile-trigger" onClick={() => setProfileOpen((current) => !current)} aria-expanded={profileOpen}><CircleUserRound size={20} /><span>{profile.name || "My account"}</span><ChevronDownIcon /></button>{profileOpen && <div className="profile-dropdown"><Link to="/profile" onClick={() => { closeMenu(); setProfileOpen(false); }}>My Profile</Link><Link to="/reports" onClick={() => { closeMenu(); setProfileOpen(false); }}>My Reports</Link><button onClick={() => { clearDemoSession(); setLoggedIn(false); setProfile(getDemoProfile()); setProfileOpen(false); window.dispatchEvent(new Event("bizgrow-auth-changed")); }}>Logout</button></div>}</div> : <button className="login-link" onClick={() => { closeMenu(); onLogin?.(); }}>Login</button>}<Link className="nav-btn" to="/assessment" onClick={closeMenu}>Start Free Assessment <ArrowRight size={15} /></Link></div>
    </nav>
  );
}

function ChevronDownIcon() { return <span className="profile-chevron">⌄</span>; }

export default Navbar;
