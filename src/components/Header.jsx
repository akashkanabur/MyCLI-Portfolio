import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../App.css';
import Logo from '../assets/logogg.svg';
import { isSoundEnabled, setSoundEnabled, playKeySound } from '../utils/audio';

function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [crtOn, setCrtOn] = useState(() => {
    try {
      return localStorage.getItem("a_shell_crt") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handleSoundChange = (e) => {
      setSoundOn(Boolean(e.detail?.enabled));
    };
    const handleCrtChange = (e) => {
      setCrtOn(Boolean(e.detail?.enabled));
    };
    window.addEventListener('sound-change', handleSoundChange);
    window.addEventListener('crt-toggle', handleCrtChange);
    return () => {
      window.removeEventListener('sound-change', handleSoundChange);
      window.removeEventListener('crt-toggle', handleCrtChange);
    };
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    if (next) playKeySound();
  };

  const toggleCrt = () => {
    const next = !crtOn;
    setCrtOn(next);
    try {
      localStorage.setItem("a_shell_crt", String(next));
    } catch {}
    window.dispatchEvent(new CustomEvent('crt-toggle', { detail: { enabled: next } }));
    if (soundOn) playKeySound();
  };

  const handleNavClick = () => {
    if (soundOn) playKeySound();
  };

  return (
    <header className="header">
      <nav className="navbar">
        <Link
          to="/"
          className={`logo-link${isHome ? ' logo-flashy' : ''}`}
          onClick={() => {
            if (soundOn) playKeySound();
            window.dispatchEvent(new CustomEvent('matrix'));
          }}
          title="Zarathustra (Click to rain matrix)"
        >
          <span className="logo-img">
            <img src={Logo} alt="logo" style={{ height: '28px', width: '28px', verticalAlign: 'middle' }} />
          </span>
        </Link>

        <div className="nav-links">
          <Link to="/" onClick={handleNavClick}>CLI</Link>
          <Link to="/projects" onClick={handleNavClick}>Projects</Link>
        </div>

        <div className="header-controls">
          <button
            type="button"
            className={`header-btn ${soundOn ? 'active' : ''}`}
            onClick={toggleSound}
            title={soundOn ? "Sound: ON (click to mute)" : "Sound: MUTED (click to enable)"}
            aria-label="Toggle mechanical sound"
          >
            {soundOn ? '🔊' : '🔇'}
          </button>
          <button
            type="button"
            className={`header-btn ${crtOn ? 'active' : ''}`}
            onClick={toggleCrt}
            title="Toggle CRT scanlines & glow"
            aria-label="Toggle CRT effects"
          >
            CRT
          </button>
          <span className="online-pill" title="System: Online">
            <span className="online-dot" />
          </span>
        </div>
      </nav>
    </header>
  );
}

export default Header;