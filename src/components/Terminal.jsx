import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import SnakeGame from "./SnakeGame";
import LightsaberDuel from "./LightsaberDuel";
import { isSoundEnabled, setSoundEnabled, playKeySound } from "../utils/audio";
import "../App.css";

const ALL_COMMANDS = [
  "help",
  "whoami",
  "skills",
  "projects",
  "connect",
  "resume",
  "sysinfo",
  "stats",
  "weather",
  "ping",
  "history",
  "ls",
  "cat",
  "cd",
  "pwd",
  "snake",
  "crt",
  "scanlines",
  "sound",
  "theme",
  "quote",
  "ponder",
  "zarathustra",
  "date",
  "echo",
  "matrix",
  "sudo",
  "clear"
];

const FILES = ["about.txt", "projects/", "resume.pdf"];
const QUOTES = [
  "\"I have failed over and over and over again in my life. And that is why I succeed.\" — Michael Jordan",
  "\"You have to believe in the long-term plan you have, but you need short-term goals to motivate and inspire you.\" — Roger Federer",
  "\"I've always believed that if you put in the work, the results will come.\" — Michael Phelps",
  "\"The harder you work, the luckier you get.\" — Gary Player",
  "\"The most important thing is to try and inspire people so that they can be great in whatever they want to do.\" — Kobe Bryant",
  "\"It always seems impossible until it's done.\" — Nelson Mandela",
  "\"You have to fight to reach your dream. You have to sacrifice and work hard for it.\" — Lionel Messi",
  "\"If you don't believe you can do it, you have no chance at all.\" — Arsène Wenger",
  "\"Someone is sitting in the shade today because someone planted a tree a long time ago.\" — Warren Buffett",
  "\"The secret of getting ahead is getting started.\" — Mark Twain",
  "\"I don't have to prove anything to anyone. I only have to prove it to myself.\" — Cristiano Ronaldo",
  "\"You miss 100% of the shots you don't take.\" — Wayne Gretzky"
];

const Terminal = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([
    "> Type 'help' to begin, or try, 'crt', 'skills'. (Sound: ON)"
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isSnakeMode, setIsSnakeMode] = useState(false);
  const [crtOn, setCrtOn] = useState(() => {
    try {
      return localStorage.getItem("a_shell_crt") === "true";
    } catch {
      return false;
    }
  });

  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    const handleCrt = (e) => {
      setCrtOn(Boolean(e.detail?.enabled));
    };
    window.addEventListener("crt-toggle", handleCrt);
    return () => window.removeEventListener("crt-toggle", handleCrt);
  }, []);

  const responses = {
    whoami: [
      " ~ Akash D Kanabur",
      " ~ I build things with logic, math, and code."
    ],
skills: [
  " ~ Technical Proficiencies:",
  "  > <span style='color: #67e8f9;'>Languages:</span>   Java, Python, JavaScript, TypeScript, SQL",
  "  > <span style='color: #67e8f9;'>Backend:</span>     Spring Boot, FastAPI, Flask, REST APIs, WebSockets",
  "  > <span style='color: #67e8f9;'>Frontend:</span>    React.js, Next.js, Angular, HTML, CSS",
  "  > <span style='color: #67e8f9;'>Databases:</span>   PostgreSQL, MySQL, Supabase, Redis, Dragonfly",
  "  > <span style='color: #67e8f9;'>DevOps:</span>      Docker, Kubernetes, Git, GitHub Actions, GCP, AWS",
  "  > <span style='color: #67e8f9;'>AI & Data:</span>   LangChain, LangGraph, RAG, LLM APIs, Vector Embeddings",
  "  > <span style='color: #67e8f9;'>Tools:</span>       Maven, Postman, Linux, Android Development"
],
    weather: [
      " ~ Simulated Atmospheric Status:",
      "  > Location:      Localhost [0.0.0.0]",
      "  > Forecast:      Clear, 100% chance of code commits",
      "  > Temperature:   CPU core at a comfortable 42°C",
      "  > Latency:       0.4ms to local Gateway",
      "  > Packet Loss:   0.0%"
    ],
    ping: [
      "PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.",
      "64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.042 ms",
      "64 bytes from 127.0.0.1: icmp_seq=2 ttl=64 time=0.038 ms",
      "--- 127.0.0.1 ping statistics ---",
      "2 packets transmitted, 2 received, 0% packet loss, time 1002ms"
    ],
    projects: [
  " ~ Featured Engineering Projects:",
  "  > <a href='https://github.com/akashkanabur/upi-mesh' target='_blank' rel='noopener noreferrer'>UPI Mesh</a> (Java, AES-256-GCM, RSA-OAEP, Bluetooth Mesh, REST APIs)",
  "  > <a href='https://github.com/akashkanabur/Real-Time-Chat-app' target='_blank' rel='noopener noreferrer'>Real-Time Chat Application</a> (Java, Spring Boot, WebSockets, Docker, DragonflyDB)",
  "  > <a href='https://github.com/akashkanabur/AI-Resume-Parsing' target='_blank' rel='noopener noreferrer'>AI Resume Screening</a> (Python, LLM APIs, PDF Parsing, Candidate Evaluation)",
  "  > <a href='https://github.com/akashkanabur/Video-summarizer' target='_blank' rel='noopener noreferrer'>AI Video Summarizer</a> (Python, AI/ML, Video Processing)",
  "  > <a href='https://github.com/akashkanabur/DataWareHouse' target='_blank' rel='noopener noreferrer'>Data Warehouse</a> (Data Engineering, SQL)",
  " ~ View all projects: <a href='/projects'>Explore /projects</a>"
    ],
    connect: [
      " ~ GitHub: <a href='https://github.com/akashkanabur' target='_blank' rel='noopener noreferrer'>https://github.com/akashkanabur</a>",
      " ~ Email: <a href='mailto:akashkanabur@gmail.com'>akashkanabur@gmail.com</a>",
      " ~ Strava: <a href='https://www.strava.com/athletes/108554384' target='_blank' rel='noopener noreferrer'>https://www.strava.com/athletes/108554384</a>",
      " ~ LinkedIn: <a href='https://www.linkedin.com/in/akash-kanabur-810372247/' target='_blank' rel='noopener noreferrer'>https://linkedin.com/in/akash-kanabur-810372247/</a>"
    ],
    pwd: [
      "/home/akash"
    ],
    ls: [
      "<span style='color: #67e8f9;'>about.txt</span>    <span style='color: #a7f3d0;'>projects/</span>    <span style='color: #fca5a5;'>resume.pdf</span>"
    ],
    help: [
      " ~ Available commands:",
      "  > <span style='color: #67e8f9;'>skills</span>       Technical stack & proficiencies",
      "  > <span style='color: #67e8f9;'>crt</span>          Toggle CRT scanlines & phosphor glow",
      "  > <span style='color: #67e8f9;'>sound</span>        Toggle mechanical switch audio clicks",
      "  > <span style='color: #67e8f9;'>theme &lt;name&gt;</span> Switch theme (matrix, amber, cyan, slate)",
      "  > <span style='color: #67e8f9;'>whoami</span>       Who is Akash?",
      "  > <span style='color: #67e8f9;'>projects</span>     View featured projects",
      "  > <span style='color: #67e8f9;'>connect</span>      Contact & social handles",
      "  > <span style='color: #67e8f9;'>ls</span>           List directory contents",
      "  > <span style='color: #67e8f9;'>cat &lt;file&gt;</span>   Read file (e.g. cat about.txt)",
      "  > <span style='color: #67e8f9;'>cd &lt;dir&gt;</span>    Navigate (e.g. cd projects)",
      "  > <span style='color: #67e8f9;'>quote</span>        Philosophical quotes (Zarathustra/CS)",
      "  > <span style='color: #67e8f9;'>stats</span>        Runtime environment & viewport specs",
      "  > <span style='color: #67e8f9;'>history</span>      View command history for this session",
      "  > <span style='color: #67e8f9;'>matrix</span>       Digital rain simulation",
      "  > <span style='color: #67e8f9;'>resume</span>       Download PDF resume",
      "  > <span style='color: #67e8f9;'>clear</span>        Clear terminal window"
    ]
  };

  responses.sysinfo = responses.neofetch;
  responses.scanlines = responses.crt;

  const simulateTyping = async (lines) => {
    setIsTyping(true);
    for (let line of lines) {
      await new Promise((r) => setTimeout(r, 22));
      setHistory((prev) => [...prev, line]);
    }
    setIsTyping(false);
  };

  const downloadResume = () => {
    const link = document.createElement("a");
    link.href = "/resume.pdf";
    link.download = "resume.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCommand = (command) => {
    const raw = command.trim();
    if (!raw) return;

    const parts = raw.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const arg = parts.slice(1).join(" ");

    if (cmd === "clear") {
      setHistory(["> Type 'help' to begin."]);
    } else if (cmd === "snake") {
      setIsSnakeMode(true);
    } else if (cmd === "crt" || cmd === "scanlines") {
      const nextState = !crtOn;
      setCrtOn(nextState);
      try {
        localStorage.setItem("a_shell_crt", String(nextState));
      } catch {}
      if (nextState) {
        document.documentElement.setAttribute("data-crt", "true");
      } else {
        document.documentElement.removeAttribute("data-crt");
      }
      window.dispatchEvent(new CustomEvent("crt-toggle", { detail: { enabled: nextState } }));
      setHistory((prev) => [
        ...prev,
        ` ~ CRT Scanlines & Phosphor Glow: [${nextState ? "ENABLED" : "DISABLED"}]`
      ]);
    } else if (cmd === "history") {
      if (cmdHistory.length === 0) {
        setHistory((prev) => [...prev, " ~ No commands in history yet."]);
      } else {
        const lines = cmdHistory.map((c, i) => `  ${String(i + 1).padStart(3, " ")}  ${c}`);
        setHistory((prev) => [...prev, " ~ Command history:", ...lines]);
      }
    } else if (cmd === "stats") {
      setHistory((prev) => [
        ...prev,
        " ~ System Runtime & Client Stats:",
        `  > Viewport:    ${window.innerWidth} x ${window.innerHeight} (${window.devicePixelRatio || 1}x DPR)`,
        `  > Audio State: ${isSoundEnabled() ? 'ENABLED (Mechanical switches)' : 'MUTED'}`,
        `  > CRT Mode:    ${crtOn ? 'ACTIVE' : 'OFF'}`
      ]);
    } else if (cmd === "cowsay") {
      const msg = arg || "Dance with chaos, for the stars are waiting!";
      const border = "-".repeat(Math.min(msg.length + 2, 40));
      setHistory((prev) => [
        ...prev,
        `<span style='color: #86efac; font-family: monospace; white-space: pre;'>
  ${border}
&lt; ${msg} &gt;
  ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
</span>`
      ]);
    } else if (cmd === "sound") {
      let nextSound;
      if (arg === "on") nextSound = true;
      else if (arg === "off") nextSound = false;
      else nextSound = !isSoundEnabled();
      setSoundEnabled(nextSound);
      if (nextSound) playKeySound();
      setHistory((prev) => [
        ...prev,
        ` ~ Mechanical Keyclick Audio: [${nextSound ? "ENABLED" : "DISABLED"}]`
      ]);
    } else if (cmd === "matrix") {
      startMatrixEffect();
    } else if (cmd === "resume") {
      downloadResume();
      setHistory((prev) => [...prev, " ~ Initiated resume download..."]);
    } else if (cmd === "date") {
      setHistory((prev) => [...prev, ` ~ ${new Date().toString()}`]);
    } else if (cmd === "quote" || cmd === "ponder" || cmd === "zarathustra" || cmd === "nihilism") {
      const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      setHistory((prev) => [...prev, ` ~ ${q}`]);
    } else if (cmd === "sudo") {
      setHistory((prev) => [
        ...prev,
        `[sudo] password for visitor: *********`,
        `visitor is not in the sudoers file. This incident will be reported to Santa 🎅`
      ]);
    } else if (cmd === "echo") {
      setHistory((prev) => [...prev, arg || ""]);
    } else if (cmd === "cd") {
      const target = arg.toLowerCase().replace(/\/$/, "");
      if (!target || target === "~" || target === "/") {
        navigate("/");
        setHistory((prev) => [...prev, " ~ Navigated to /home/akash"]);
      } else if (target === "projects") {
        navigate("/projects");
        setHistory((prev) => [...prev, " ~ Navigated to /projects"]);
      } else if (target === "..") {
        navigate("/");
        setHistory((prev) => [...prev, " ~ Navigated to /"]);
      } else {
        setHistory((prev) => [...prev, `cd: no such file or directory: ${arg}`]);
      }
    } else if (cmd === "cat") {
      const file = arg.toLowerCase().replace(/\/$/, "");
      if (!file) {
        setHistory((prev) => [...prev, "cat: missing file argument. Try: cat about.txt"]);
      } else if (file === "about.txt") {
        setHistory((prev) => [
          ...prev,
          " ~ Akash D Kanabur: I love math, logic, and code for the web.",
          " ~ Exploring systems, high-performance web backends, and AI."
        ]);
      } else if (file === "resume.pdf") {
        downloadResume();
        setHistory((prev) => [...prev, " ~ Downloading resume.pdf..."]);
      } else if (file === "projects") {
        setHistory((prev) => [...prev, "cat: projects: Is a directory (try: cd projects)"]);
      } else {
        setHistory((prev) => [...prev, `cat: ${arg}: No such file or directory`]);
      }
    } else if (cmd === "theme") {
      const t = arg.toLowerCase().trim();
      const themes = ["matrix", "amber", "cyan", "slate"];
      if (!t) {
        setHistory((prev) => [
          ...prev,
          " ~ Usage: theme &lt;name&gt;",
          ` ~ Available: <span style='color: #67e8f9;'>${themes.join(", ")}</span>`
        ]);
      } else if (themes.includes(t)) {
        if (t === "matrix") {
          document.documentElement.removeAttribute("data-theme");
          setHistory((prev) => [...prev, " ~ Switched theme to Matrix Green"]);
        } else {
          document.documentElement.setAttribute("data-theme", t);
          setHistory((prev) => [...prev, ` ~ Switched theme to ${t.toUpperCase()}`]);
        }
      } else {
        setHistory((prev) => [
          ...prev,
          `theme: unknown theme '${arg}'. Available: ${themes.join(", ")}`
        ]);
      }
    } else if (responses[cmd]) {
      simulateTyping(responses[cmd]);
    } else {
      setHistory((prev) => [
        ...prev,
        `command not found: ${command}. Type 'help' for available commands.`
      ]);
    }
  };

  const handleKeyDown = (e) => {
    // Mechanical key sound & canvas spark
    playKeySound();
    window.dispatchEvent(new CustomEvent("terminal-type"));

    // Command History: ArrowUp
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const nextIdx = historyIdx === -1 ? cmdHistory.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInput(cmdHistory[nextIdx]);
    }

    // Command History: ArrowDown
    else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIdx === -1) return;
      if (historyIdx < cmdHistory.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      } else {
        setHistoryIdx(-1);
        setInput("");
      }
    }

    // Tab Autocompletion
    else if (e.key === "Tab") {
      e.preventDefault();
      const current = input.trim().toLowerCase();
      if (!current) return;

      // Handle "cat " or "cd " sub-completion
      if (current.startsWith("cat ") || current.startsWith("cd ")) {
        const prefix = current.slice(0, 4);
        const partial = current.slice(4).trim();
        const pool = current.startsWith("cd ")
          ? ["projects"]
          : FILES.map((f) => f.replace(/\/$/, ""));
        const matches = pool.filter((item) => item.startsWith(partial));

        if (matches.length === 1) {
          setInput(`${prefix}${matches[0]}`);
        } else if (matches.length > 1) {
          setHistory((prev) => [...prev, `$ ${input}`, matches.join("    ")]);
        }
        return;
      }

      // Handle "theme " sub-completion
      if (current.startsWith("theme ")) {
        const partial = current.slice(6).trim();
        const themes = ["matrix", "amber", "cyan", "slate"];
        const matches = themes.filter((t) => t.startsWith(partial));
        if (matches.length === 1) {
          setInput(`theme ${matches[0]}`);
        } else if (matches.length > 1) {
          setHistory((prev) => [...prev, `$ ${input}`, matches.join("    ")]);
        }
        return;
      }

      // Command autocomplete
      const matches = ALL_COMMANDS.filter((cmd) => cmd.startsWith(current));
      if (matches.length === 1) {
        setInput(matches[0]);
      } else if (matches.length > 1) {
        setHistory((prev) => [...prev, `$ ${input}`, matches.join("    ")]);
      }
    }
  };

  const startMatrixEffect = () => {
    const terminal = terminalRef.current;
    if (!terminal) return;

    const existing = document.getElementById("matrix-canvas");
    if (existing && terminal.contains(existing)) terminal.removeChild(existing);

    const canvas = document.createElement("canvas");
    canvas.id = "matrix-canvas";
    terminal.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let width = (canvas.width = terminal.clientWidth);
    let height = (canvas.height = terminal.clientHeight);

    const letters = "01アカサタナハマヤラワガザダバパ";
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = "#46ef97";
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = letters.charAt(Math.floor(Math.random() * letters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);

    const handleResize = () => {
      width = canvas.width = terminal.clientWidth;
      height = canvas.height = terminal.clientHeight;
    };
    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      canvas.style.opacity = "0";
      canvas.style.transition = "opacity 2s ease-out";
      setTimeout(() => {
        clearInterval(interval);
        window.removeEventListener("resize", handleResize);
        if (terminal.contains(canvas)) {
          terminal.removeChild(canvas);
        }
      }, 2000);
    }, 10000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const submitted = input;
    setHistory((prev) => [...prev, `$ ${submitted}`]);
    setCmdHistory((prev) => [...prev, submitted]);
    setHistoryIdx(-1);
    handleCommand(submitted);
    setInput("");
  };

  useEffect(() => {
    terminalRef.current?.scrollTo(0, terminalRef.current.scrollHeight);
  }, [history]);

  useEffect(() => {
    const handler = () => startMatrixEffect();
    window.addEventListener("matrix", handler);
    return () => window.removeEventListener("matrix", handler);
  }, []);

  const handleTerminalClick = (event) => {
    const projectLink =
      event.target instanceof Element && event.target.closest('a[href="/projects"]');
    if (projectLink) {
      event.preventDefault();
      navigate("/projects");
      return;
    }
    inputRef.current?.focus();
  };

  return (
    <div
      className="terminal"
      onClick={handleTerminalClick}
      ref={terminalRef}
    >
      {isSnakeMode ? (
        <SnakeGame
          onExit={() => {
            setIsSnakeMode(false);
            setHistory((prev) => [...prev, " ~ Exited Snake game."]);
          }}
        />
      ) : (
        <>
          <div className="terminal-content-body">
            {history.map((line, idx) => (
              <div key={idx} dangerouslySetInnerHTML={{ __html: line }} />
            ))}

            {!isTyping && (
              <form onSubmit={handleSubmit} className="terminal-line">
                <span>$</span>
                <div
                  className="input-wrapper"
                  onClick={() => inputRef.current?.focus()}
                >
                  <span className="fake-input">{input}</span>
                  <div className="block-cursor" />
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="real-input"
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                  />
                </div>
              </form>
            )}
          </div>
          <LightsaberDuel />
        </>
      )}
    </div>
  );
};

export default Terminal;