import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Assessment from "./components/Assessment";
import Report from "./components/Report";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Hero />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/report" element={<Report />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
