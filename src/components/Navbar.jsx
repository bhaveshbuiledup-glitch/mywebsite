import "./Navbar.css";
import { ArrowRight, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const closeMenu = () => setOpen(false);

  return (
    <nav className="navbar" aria-label="Main navigation">
      <Link className="logo" to="/" onClick={closeMenu}><span className="logo-mark">B</span>BizGrow</Link>

      <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>
      <ul className={`nav-links ${open ? "is-open" : ""}`}>
        <li><a className={location.pathname === "/" ? "active" : ""} href="/#home" onClick={closeMenu}>Home</a></li>
        <li><a href="/#how-it-works" onClick={closeMenu}>How It Works</a></li>
        <li><a href="/#services" onClick={closeMenu}>Services</a></li>
        <li><a href="/#pricing" onClick={closeMenu}>Pricing</a></li>
        <li><a href="/#about" onClick={closeMenu}>About</a></li>
        <li><a href="/#contact" onClick={closeMenu}>Contact</a></li>
      </ul>

      <Link className="nav-btn" to="/assessment" onClick={closeMenu}>Start Free Assessment <ArrowRight size={15} /></Link>
    </nav>
  );
}

export default Navbar;
