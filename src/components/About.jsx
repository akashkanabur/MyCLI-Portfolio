import '../App.css';
import { useRef, useEffect, useState } from 'react';

const boldWords = [
  'computer', 'science', 'mathematics', 'math', 'systems', 'solve', 'logic', 'clean', 'build', 'code'
];

function wrapWords(text) {
  return text.split(/(\s+)/).map((word, i) => {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (boldWords.includes(cleanWord)) {
      return word.trim() ? <span className="word" key={i}><strong>{word}</strong></span> : word;
    }
    return word.trim() ? <span className="word" key={i}>{word}</span> : word;
  });
}

function About() {
  const canvasRef = useRef(null);
  const headingText = 'Akash D Kanabur';
  const letters = headingText.split('');
  const total = letters.length;
  const [step, setStep] = useState(0);

  // --- State and Effect for Animated Heading ---
  useEffect(() => {
    const intervalMs = 300;
    const id = setInterval(() => {
      setStep((prev) => (prev + 1) % (total * 2));
    }, intervalMs);
    return () => clearInterval(id);
  }, [total]);

  const renderAnimatedHeading = () => (
    <span className="heading-letters">
      {letters.map((ch, i) => {
        const visible = step < total ? i <= step : i > (step - total);
        return (
          <span className={`letter${visible ? ' on' : ''}`} key={i}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        );
      })}
    </span>
  );

  // --- State and Effects for Canvas Animation ---
  const [dimensions, setDimensions] = useState({ 
    width: 250, 
    height: 500 
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const w = Math.floor(width);
        const h = Math.floor(height);
        if (w > 0 && h > 0) {
          setDimensions((prev) => {
            if (Math.abs(prev.width - w) < 2 && Math.abs(prev.height - h) < 2) return prev;
            return { width: w, height: h };
          });
        }
      }
    });

    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Main animation effect
  useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');

      const dpr = window.devicePixelRatio || 1;
      const W = dimensions.width;
      const H = dimensions.height;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      if (ctx.resetTransform) {
        ctx.resetTransform();
      } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      }
      ctx.scale(dpr, dpr);

      // --- Configuration ---
      const nodeSize = 2.5;
      const baseSpeed = 8; // px/sec
      const jitter = 0.12; // random acceleration
      const linkDist = 110; // max distance to draw a link
      const linkAlpha = 0.4;

      const num = Math.max(50, Math.floor((W * H) / 7500));

      const nodes = Array.from({ length: num }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() * 2 - 1) * baseSpeed,
        vy: (Math.random() * 2 - 1) * baseSpeed
      }));

      let rafId;
      let lastMs = 0;

      // --- Pulse Effect ---
      let pulseMode = 1; // 1: attract, -1: repel
      let pulseX = W * 0.5;
      let pulseY = H * 0.5;
      let pulseStart = 0;
      const pulseDuration = 1600; // ms
      const pulseStrength = 180;
      let lastClickMs = 0;
      let nextAutoPulseMs = performance.now() + 5000;
      const autoPulseEvery = 7000;

      function triggerPulse(now, x, y, toggle = true) {
        pulseX = x;
        pulseY = y;
        pulseStart = now;
        if (toggle) pulseMode *= -1;
      }

      function onClick(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const now = performance.now();
        triggerPulse(now, x, y, true);
        lastClickMs = now;
      }

      // --- Mouse & Typing Reactivity ---
      let mousePos = null;

      function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        mousePos = {
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        };
      }

      function onMouseLeave() {
        mousePos = null;
      }

      function onTerminalType() {
        // Trigger a gentle micro-spark on the right border
        const now = performance.now();
        triggerPulse(now, W * 0.9, Math.random() * H, false);
      }

      canvas.addEventListener('click', onClick);
      canvas.addEventListener('mousemove', onMouseMove);
      canvas.addEventListener('mouseleave', onMouseLeave);
      window.addEventListener('terminal-type', onTerminalType);

      function stepNodes(dt, nowMs) {
        const pulseProgress = pulseStart ? Math.min(1, (nowMs - pulseStart) / pulseDuration) : 1;
        const pf = pulseStart ? (1 - pulseProgress) * (1 - Math.pow(pulseProgress, 3)) : 0;

        for (const n of nodes) {
          n.vx += (Math.random() * 2 - 1) * jitter;
          n.vy += (Math.random() * 2 - 1) * jitter;

          // Mouse gravitation
          if (mousePos) {
            const mdx = mousePos.x - n.x;
            const mdy = mousePos.y - n.y;
            const md = Math.hypot(mdx, mdy);
            if (md > 5 && md < 90) {
              const pull = (1 - md / 90) * 45;
              n.vx += (mdx / md) * pull * dt;
              n.vy += (mdy / md) * pull * dt;
            }
          }

          if (pf > 0) {
            const dx = pulseX - n.x;
            const dy = pulseY - n.y;
            const d2 = dx * dx + dy * dy + 1e-3;
            const invD = 1 / Math.sqrt(d2);
            const force = pf * pulseStrength * invD / d2;
            n.vx += pulseMode * force * dx * dt;
            n.vy += pulseMode * force * dy * dt;
          }

          const speed = Math.hypot(n.vx, n.vy);
          const maxSpeed = 40;
          if (speed > maxSpeed) {
            n.vx = (n.vx / speed) * maxSpeed;
            n.vy = (n.vy / speed) * maxSpeed;
          }

          n.x += n.vx * dt;
          n.y += n.vy * dt;

          const pad = 6;
          if (n.x < pad) {
            n.x = pad;
            n.vx = Math.abs(n.vx);
          } else if (n.x > W - pad) {
            n.x = W - pad;
            n.vx = -Math.abs(n.vx);
          }
          if (n.y < pad) {
            n.y = pad;
            n.vy = Math.abs(n.vy);
          } else if (n.y > H - pad) {
            n.y = H - pad;
            n.vy = -Math.abs(n.vy);
          }
        }
      }
      
      function render(nowMs) {
        if (!lastMs) lastMs = nowMs;
        const dt = Math.min(0.05, (nowMs - lastMs) / 1000);

        if (nowMs >= nextAutoPulseMs && (nowMs - lastClickMs) > 3000 && (nowMs - pulseStart) > (pulseDuration + 250)) {
          triggerPulse(nowMs, W * 0.5 + (Math.random() - 0.5) * W * 0.5, H * 0.5 + (Math.random() - 0.5) * H * 0.5, true);
          nextAutoPulseMs = nowMs + autoPulseEvery;
        }

        stepNodes(dt, nowMs);

        ctx.fillStyle = 'rgb(0, 0, 0)';
        ctx.fillRect(0, 0, W, H);

        ctx.lineWidth = 1;
        for (let i = 0; i < num; i++) {
          const a = nodes[i];
          for (let j = i + 1; j < num; j++) {
            const b = nodes[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < linkDist) {
              const alpha = linkAlpha * (1 - d / linkDist);
              ctx.beginPath();
              ctx.strokeStyle = `rgba(59, 230, 122, ${alpha.toFixed(3)})`;
              ctx.moveTo(a.x, a.y);
              ctx.lineTo(b.x, b.y);
              ctx.stroke();
            }
          }
        }

        ctx.fillStyle = '#90ee90';
        for (const n of nodes) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, nodeSize / 2, 0, Math.PI * 2);
          ctx.fill();
        }

        lastMs = nowMs;
        rafId = requestAnimationFrame(render);
      }

      rafId = requestAnimationFrame(render);

      return () => {
        canvas.removeEventListener('click', onClick);
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mouseleave', onMouseLeave);
        window.removeEventListener('terminal-type', onTerminalType);
        if (rafId) cancelAnimationFrame(rafId);
      };
  }, [dimensions]); // Rerun effect if dimensions change

  return (
    <>
      <section className="about">
        <p className="about-desc">{wrapWords('Hi, I am')}</p>
        <h2>{renderAnimatedHeading()}</h2>
        <p className="about-desc">
          {wrapWords('I think in systems,')}
          <br />
          {wrapWords('solve with logic,')}
          <br />  
          {wrapWords('build with code.')}
        </p>
      </section>

      <canvas
        ref={canvasRef}
        className="about-canvas"
        title="Click to attract/repel constellations"
      />
    </>
  );
}

export default About;