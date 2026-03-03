import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../features/frontpage/components/Navbar";
import Footer from "../features/frontpage/components/Footer";
import HomePage from "../features/frontpage/pages/HomePage";
import ServicesPage from "../features/frontpage/pages/ServicesPage";
import ContactPage from "../features/frontpage/pages/ContactPage";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function AppRoutes() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
