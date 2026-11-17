import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import About from './components/About';
import ProjectsList from './components/ProjectsList';
import Terminal from './components/Terminal';

function App() {
  const [crtActive, setCrtActive] = useState(() => {
    try {
      return localStorage.getItem("a_shell_crt") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e) => {
      const enabled = Boolean(e.detail?.enabled);
      setCrtActive(enabled);
      if (enabled) {
        document.documentElement.setAttribute("data-crt", "true");
      } else {
        document.documentElement.removeAttribute("data-crt");
      }
    };
    window.addEventListener('crt-toggle', handler);
    if (crtActive) {
      document.documentElement.setAttribute("data-crt", "true");
    }
    return () => window.removeEventListener('crt-toggle', handler);
  }, [crtActive]);

  return (
    <Router>
      <div className="site-container">
        {crtActive && <div className="crt-overlay" aria-hidden="true" />}
        <Header />
        <main className="main-content">
          <div className="about-section">
            <About />
          </div>
          <div className="dynamic-section">
            <Routes>
              <Route path="/" element={<Terminal />} />
              <Route path="/cli" element={<Terminal />} />
              <Route path="/projects" element={<ProjectsList />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;