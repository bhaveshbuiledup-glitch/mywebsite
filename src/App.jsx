import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Assessment from "./components/Assessment";
import Report from "./components/Report";
import AuthModal from "./components/AuthModal";
import { isDemoLoggedIn } from "./components/authUtils";
import { About, Contact, Dashboard, HowItWorks, Pricing, Services } from "./components/BusinessPages";
import { Profile, ReportContact, Reports } from "./components/AccountPages";
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const isAuthRoute = window.location.pathname === "/login" || window.location.pathname === "/signup";
      if (!isAuthRoute && !isDemoLoggedIn() && localStorage.getItem("bizgrow-auth-popup-dismissed") !== "true") setAuthOpen(true);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, []);
  const openAuth = (mode) => { setAuthMode(mode); setAuthOpen(true); };

  return (
    <BrowserRouter>
      <Navbar onLogin={() => openAuth("login")} />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/report-contact" element={<ReportContact />} />
        <Route path="/results" element={<Report />} />
        <Route path="/report" element={<Report />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AuthModal open={authOpen} initialMode={authMode} onClose={() => setAuthOpen(false)} onAuthenticated={() => window.dispatchEvent(new Event("bizgrow-auth-changed"))} />
    </BrowserRouter>
  );
}

function AuthPage({ mode }) { return <main className="auth-page"><AuthModal open initialMode={mode} onClose={() => window.history.back()} /></main>; }

export default App;
