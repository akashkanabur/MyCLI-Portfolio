import React, { useEffect, useRef } from "react";
import {
  isSoundEnabled,
  playSaberClash,
  playSaberLockBuzz,
  playSaberScratch,
  playSaberSwing,
  playForcePush
} from "../utils/audio";

// ==========================================
// CINEMATIC DEEP SPACE ORBIT & STAR DESTROYER SCENIC ASSETS
// ==========================================

// Realistic cosmic stars with varying magnitudes, colors, and twinkle rates
const COSMIC_STARS = Array.from({ length: 48 }, (_, i) => ({
  xNorm: ((i * 41 + 17) % 100) / 100,
  yNorm: ((i * 67 + 11) % 72) / 100, // Sky zone
  radius: (i % 8 === 0) ? 1.4 : ((i % 3 === 0) ? 1.0 : 0.65),
  speed: 0.8 + (i % 6) * 0.35,
  phase: (i * 2.1) % (Math.PI * 2),
  isSpike: i % 7 === 0,
  color: (i % 5 === 0) ? "#67e8f9" : ((i % 7 === 0) ? "#4ade80" : "#ffffff")
}));

const drawDeepSpaceStars = (ctx, width, height, time) => {
  ctx.save();

  // Subtle Cosmic Nebula Clouds in Deep Space
  const neb1 = ctx.createRadialGradient(width * 0.22, height * 0.35, 5, width * 0.22, height * 0.35, 95);
  neb1.addColorStop(0, "rgba(99, 102, 241, 0.05)"); // Interstellar Indigo
  neb1.addColorStop(0.6, "rgba(79, 70, 229, 0.02)");
  neb1.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = neb1;
  ctx.fillRect(0, 0, width, height);

  const neb2 = ctx.createRadialGradient(width * 0.80, height * 0.38, 5, width * 0.80, height * 0.38, 85);
  neb2.addColorStop(0, "rgba(6, 182, 212, 0.05)"); // Cyan/Emerald Orbital Dust
  neb2.addColorStop(0.7, "rgba(34, 197, 94, 0.02)");
  neb2.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = neb2;
  ctx.fillRect(0, 0, width, height);

  // Deep Space Starfield
  for (let i = 0; i < COSMIC_STARS.length; i++) {
    const s = COSMIC_STARS[i];
    const x = s.xNorm * width;
    const y = s.yNorm * (height - 22);
    const alpha = 0.12 + 0.18 * Math.sin(time * s.speed + s.phase);

    ctx.save();
    ctx.globalAlpha = Math.max(0.05, alpha);
    ctx.fillStyle = s.color;
    ctx.strokeStyle = s.color;

    if (s.isSpike) {
      // 4-point optical diffraction spike for bright stars
      ctx.beginPath();
      ctx.moveTo(x - 2.5, y);
      ctx.lineTo(x + 2.5, y);
      ctx.moveTo(x, y - 2.5);
      ctx.lineTo(x, y + 2.5);
      ctx.lineWidth = 0.6;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
  ctx.restore();
};

const drawImperialStarDestroyer = (ctx, isdX, isdY, isdLen, time) => {
  ctx.save();

  const isdWidth = isdLen * 0.48;
  const prowX = isdX + isdLen;
  const prowY = isdY + 1;
  const sternX = isdX;
  const portWingY = isdY - isdWidth * 0.5;
  const stbdWingY = isdY + isdWidth * 0.5 - 2;

  // 1. Stern Ion Engine Plume & Drive Flares
  const engineY1 = isdY - 3;
  const engineY2 = isdY + 0.5;
  const engineY3 = isdY + 4;

  const engineFlare = ctx.createLinearGradient(sternX, isdY, sternX - 16, isdY);
  engineFlare.addColorStop(0, "rgba(56, 189, 248, 0.75)");
  engineFlare.addColorStop(0.3, "rgba(14, 165, 233, 0.35)");
  engineFlare.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = engineFlare;
  ctx.beginPath();
  ctx.moveTo(sternX, portWingY + 3);
  ctx.lineTo(sternX - 14, isdY);
  ctx.lineTo(sternX, stbdWingY - 3);
  ctx.closePath();
  ctx.fill();

  // 3 Primary Ion Engine Emitters
  ctx.fillStyle = "#67e8f9";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 6;
  [engineY1, engineY2, engineY3].forEach((ey) => {
    ctx.beginPath();
    ctx.arc(sternX + 0.5, ey, 1.2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.shadowBlur = 0;

  // 2. Star Destroyer Triangular Wedge Hull
  // Upper Dorsal Hull Facet (Sunlit)
  ctx.beginPath();
  ctx.moveTo(sternX, portWingY);
  ctx.lineTo(prowX, prowY);
  ctx.lineTo(sternX + isdLen * 0.15, isdY);
  ctx.closePath();
  ctx.fillStyle = "rgba(180, 195, 215, 0.28)";
  ctx.fill();
  ctx.strokeStyle = "rgba(226, 232, 240, 0.35)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Lower Ventral Hull Facet (Shadowed)
  ctx.beginPath();
  ctx.moveTo(sternX, stbdWingY);
  ctx.lineTo(prowX, prowY);
  ctx.lineTo(sternX + isdLen * 0.15, isdY);
  ctx.closePath();
  ctx.fillStyle = "rgba(51, 65, 85, 0.32)";
  ctx.fill();
  ctx.strokeStyle = "rgba(100, 116, 139, 0.25)";
  ctx.stroke();

  // Dorsal Spine Ridge
  ctx.beginPath();
  ctx.moveTo(prowX, prowY);
  ctx.lineTo(sternX + isdLen * 0.15, isdY);
  ctx.strokeStyle = "rgba(241, 245, 249, 0.45)";
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // 3. Multi-Tiered Superstructure Terraces
  const sX1 = sternX + isdLen * 0.18;
  const sX2 = sternX + isdLen * 0.42;
  ctx.fillStyle = "rgba(148, 163, 184, 0.32)";
  ctx.beginPath();
  ctx.moveTo(sX1, isdY - 4.5);
  ctx.lineTo(sX2, isdY - 1);
  ctx.lineTo(sX1, isdY + 3.5);
  ctx.closePath();
  ctx.fill();

  // 4. Command Bridge Tower & Shield Generator Globes
  const bridgeX = sternX + isdLen * 0.22;
  const bridgeY = isdY - 6.5;

  // Bridge tower neck & crossbar
  ctx.fillStyle = "rgba(203, 213, 225, 0.45)";
  ctx.fillRect(bridgeX - 1.5, bridgeY + 2, 3, 3);
  ctx.fillRect(bridgeX - 3.5, bridgeY, 7, 2);

  // Twin Deflector Shield Globes on top of the bridge
  ctx.fillStyle = "#e2e8f0";
  ctx.beginPath();
  ctx.arc(bridgeX - 3, bridgeY - 1.2, 1.0, 0, Math.PI * 2);
  ctx.arc(bridgeX + 3, bridgeY - 1.2, 1.0, 0, Math.PI * 2);
  ctx.fill();

  // Ventral Main Hangar Bay Aperture Glow
  ctx.fillStyle = "rgba(56, 189, 248, 0.4)";
  ctx.fillRect(sternX + isdLen * 0.55, isdY - 0.5, 3.5, 1.2);

  ctx.restore();
};

const drawCinematicDeathStar = (ctx, dsX, dsY, dsR, time) => {
  ctx.save();

  // Faint celestial moonlit atmosphere aura
  const aura = ctx.createRadialGradient(
    dsX - dsR * 0.35,
    dsY - dsR * 0.35,
    dsR * 0.2,
    dsX,
    dsY,
    dsR * 1.5
  );
  aura.addColorStop(0, "rgba(148, 163, 184, 0.12)");
  aura.addColorStop(0.5, "rgba(71, 85, 105, 0.04)");
  aura.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(dsX, dsY, dsR * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // 1. Spherical Body with Realistic Lunar Sunlight & Shadow
  ctx.save();
  ctx.beginPath();
  ctx.arc(dsX, dsY, dsR, 0, Math.PI * 2);
  ctx.clip();

  const sphereGrad = ctx.createRadialGradient(
    dsX - dsR * 0.38,
    dsY - dsR * 0.38,
    dsR * 0.05,
    dsX + dsR * 0.2,
    dsY + dsR * 0.2,
    dsR * 1.15
  );
  sphereGrad.addColorStop(0, "rgba(203, 213, 225, 0.38)"); // Sunlit lunar crust
  sphereGrad.addColorStop(0.42, "rgba(100, 116, 139, 0.30)"); // Midtones
  sphereGrad.addColorStop(0.75, "rgba(30, 41, 59, 0.42)");  // Terminator shadow
  sphereGrad.addColorStop(1, "rgba(15, 23, 42, 0.75)");     // Space shadow
  ctx.fillStyle = sphereGrad;
  ctx.fill();

  // 2. Faint Surface Panel Bands / Modular Greebles
  ctx.strokeStyle = "rgba(226, 232, 240, 0.08)";
  ctx.lineWidth = 0.7;
  const lats = [-0.55, -0.25, 0.28, 0.58];
  for (const lat of lats) {
    const yOff = lat * dsR;
    const rAtLat = Math.sqrt(Math.max(0, dsR * dsR - yOff * yOff));
    ctx.beginPath();
    ctx.ellipse(dsX, dsY + yOff, rAtLat, rAtLat * 0.2, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 3. Equatorial Trench Cut
  ctx.beginPath();
  ctx.ellipse(dsX, dsY, dsR, dsR * 0.12, -0.06, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
  ctx.lineWidth = 1.6;
  ctx.stroke();

  // Faint Docking Bay Trench Lights
  for (let a = -0.7; a <= 0.7; a += 0.22) {
    const lx = dsX + Math.sin(a) * (dsR * 0.85);
    const ly = dsY + Math.cos(a) * (dsR * 0.1);
    ctx.fillStyle = "rgba(226, 232, 240, 0.45)";
    ctx.fillRect(lx, ly, 0.9, 0.9);
  }

  // 4. Concave Superlaser Focus Crater (Indented 3D Dish)
  const dishDist = dsR * 0.45;
  const dishAngle = -Math.PI * 0.72;
  const dishX = dsX + Math.cos(dishAngle) * dishDist;
  const dishY = dsY + Math.sin(dishAngle) * dishDist;
  const dishR = dsR * 0.33;

  // Concave interior crater shadow
  const dishGrad = ctx.createRadialGradient(
    dishX + dishR * 0.3,
    dishY + dishR * 0.3,
    1,
    dishX,
    dishY,
    dishR
  );
  dishGrad.addColorStop(0, "rgba(15, 23, 42, 0.75)");
  dishGrad.addColorStop(0.7, "rgba(30, 41, 59, 0.5)");
  dishGrad.addColorStop(1, "rgba(71, 85, 105, 0.35)");
  ctx.fillStyle = dishGrad;
  ctx.beginPath();
  ctx.arc(dishX, dishY, dishR, 0, Math.PI * 2);
  ctx.fill();

  // Sunlit crater rim edge
  ctx.beginPath();
  ctx.arc(dishX, dishY, dishR, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(226, 232, 240, 0.38)";
  ctx.lineWidth = 0.9;
  ctx.stroke();

  // Inner focus dish step
  ctx.beginPath();
  ctx.arc(dishX, dishY, dishR * 0.46, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(74, 222, 128, 0.32)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  // Central Superlaser Focal Crystal
  ctx.beginPath();
  ctx.arc(dishX, dishY, 1.4, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.shadowColor = "#4ade80";
  ctx.shadowBlur = 6;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Converging green laser energy filaments
  for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
    ctx.beginPath();
    ctx.moveTo(dishX + Math.cos(a) * (dishR * 0.46), dishY + Math.sin(a) * (dishR * 0.46));
    ctx.lineTo(dishX + Math.cos(a) * (dishR * 0.9), dishY + Math.sin(a) * (dishR * 0.9));
    ctx.strokeStyle = "rgba(74, 222, 128, 0.28)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
  }

  ctx.restore(); // Exit sphere clip

  // 5. Sunlit Celestial Crescent Rim
  ctx.beginPath();
  ctx.arc(dsX, dsY, dsR, Math.PI * 0.85, Math.PI * 1.65);
  ctx.strokeStyle = "rgba(241, 245, 249, 0.45)";
  ctx.lineWidth = 1.1;
  ctx.stroke();

  ctx.restore();
};

const drawTieFighterFlyby = (ctx, width, height, time) => {
  // Silent TIE Fighter Patrol Event every 20 seconds
  const cycle = (time * 0.5) % 20;
  if (cycle > 8.0) return; // Only active during flight window

  const tProg = cycle / 8.0;
  const leadX = -30 + tProg * (width + 60);
  const leadY = 16 + Math.sin(tProg * Math.PI) * 10;

  const drawSingleTie = (x, y, scale = 1.0) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Twin Hexagonal Solar Wing Panels (Left and Right)
    ctx.fillStyle = "rgba(30, 41, 59, 0.75)";
    ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
    ctx.lineWidth = 0.8;

    // Left Wing
    ctx.beginPath();
    ctx.moveTo(-4.5, -4.5);
    ctx.lineTo(-3.5, 0);
    ctx.lineTo(-4.5, 4.5);
    ctx.stroke();

    // Right Wing
    ctx.beginPath();
    ctx.moveTo(4.5, -4.5);
    ctx.lineTo(3.5, 0);
    ctx.lineTo(4.5, 4.5);
    ctx.stroke();

    // Cross Strut Pylon
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(4, 0);
    ctx.strokeStyle = "rgba(203, 213, 225, 0.6)";
    ctx.stroke();

    // Spherical Central Command Pod
    ctx.beginPath();
    ctx.arc(0, 0, 2.0, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
    ctx.fill();

    // Viewport Dot
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(0.4, -0.6, 1.0, 1.0);

    // Twin Green Ion Engine Exhaust Flares
    ctx.fillStyle = "#22c55e";
    ctx.fillRect(-2.5, -0.5, 1.2, 1.0);
    ctx.fillRect(-2.5, 0.5, 1.2, 1.0);

    ctx.restore();
  };

  // Lead TIE Fighter
  drawSingleTie(leadX, leadY, 1.0);
  // Wingman in escort formation
  drawSingleTie(leadX - 16, leadY - 7, 0.75);
};

const drawImperialHangarFloor = (ctx, width, groundY) => {
  ctx.save();

  // Hangar platform edge line
  ctx.strokeStyle = "rgba(100, 116, 139, 0.35)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(width, groundY);
  ctx.stroke();

  // Runway sub-strip
  ctx.strokeStyle = "rgba(71, 85, 105, 0.2)";
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(0, groundY + 3);
  ctx.lineTo(width, groundY + 3);
  ctx.stroke();

  // Embedded Runway Docking Beacons (Alternating red and cyan guide lights)
  const beaconSpacing = 36;
  for (let bx = 18; bx < width; bx += beaconSpacing) {
    const isRed = (Math.floor(bx / beaconSpacing) % 2 === 0);
    ctx.fillStyle = isRed ? "rgba(248, 113, 113, 0.55)" : "rgba(56, 189, 248, 0.55)";
    ctx.beginPath();
    ctx.arc(bx, groundY + 1.5, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

export default function LightsaberDuel() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId;
    let dpr = window.devicePixelRatio || 1;
    let width = 0;
    let height = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);
    resize();

    // Visual Effects: Sparks, Flashes, Shockwaves & Screen-Shake
    const sparks = [];
    const flashes = [];
    const shockwaves = [];
    let screenShake = 0;

    const addSparks = (x, y, color1, color2, count = 12) => {
      // Real-time blade clash & plasma scratch audio
      if (Math.random() > 0.35) {
        playSaberClash(Math.min(1.2, count / 8));
      } else {
        playSaberScratch();
      }

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.5;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.0,
          color: Math.random() > 0.5 ? color1 : color2,
          life: 1.0,
          decay: 0.04 + Math.random() * 0.05,
          size: 1.2 + Math.random() * 1.8
        });
      }
      flashes.push({ x, y, life: 1.0, color: "#ffffff", maxRadius: 7 + Math.random() * 5 });
      screenShake = Math.max(screenShake, 2.0);
    };

    const addShockwave = (x, y, color) => {
      playForcePush();
      shockwaves.push({ x, y, radius: 4, maxRadius: 36, life: 1.0, color });
      screenShake = Math.max(screenShake, 3.0);
    };

    // Lightsaber Blade Trail Histories
    const trails = {
      obi: [],
      ana: [],
      maul1: [],
      maul2: []
    };

    const updateTrail = (history, x, y, max = 5) => {
      history.push({ x, y, time: Date.now() });
      if (history.length > max) history.shift();
    };

    const drawBlade = (ctx, x1, y1, x2, y2, color, trailHistory = null) => {
      ctx.save();

      // Render blade motion-blur trail if moving fast
      if (trailHistory && trailHistory.length > 2) {
        ctx.beginPath();
        ctx.moveTo(trailHistory[0].x, trailHistory[0].y);
        for (let i = 1; i < trailHistory.length; i++) {
          ctx.lineTo(trailHistory[i].x, trailHistory[i].y);
        }
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 4.5;
        ctx.globalAlpha = 0.25;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }

      // Outer glowing aura
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3.6;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.lineCap = "round";
      ctx.stroke();

      // White-hot plasma core
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.3;
      ctx.shadowBlur = 0;
      ctx.stroke();
      ctx.restore();
    };

    // Stick-figure character drawer with full joint articulation and body rotation
    const drawFighter = (
      ctx,
      {
        x,
        y,
        facing,
        bodyRotation = 0,
        robeColor,
        hairType,
        legPhase,
        armAngle,
        saberAngle,
        saberColor,
        isDoubleSaber,
        trailKey
      }
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(bodyRotation);

      // Floor contact shadow
      ctx.fillStyle = "rgba(45, 212, 71, 0.1)";
      ctx.beginPath();
      ctx.ellipse(0, 1, 9, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Articulated legs
      const hipY = -9;
      const leg1X = Math.sin(legPhase) * 7;
      const leg2X = -Math.sin(legPhase) * 7;
      const foot1Y = -Math.max(0, Math.cos(legPhase) * 3);
      const foot2Y = -Math.max(0, -Math.cos(legPhase) * 3);

      ctx.strokeStyle = robeColor;
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // Legs
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(leg1X, foot1Y);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(leg2X, foot2Y);
      ctx.stroke();

      // Robe tail dynamics
      ctx.beginPath();
      ctx.moveTo(0, hipY - 2);
      ctx.lineTo(-facing * (8 + Math.abs(Math.sin(legPhase) * 4)), -2);
      ctx.stroke();

      // Torso
      const headY = -22;
      ctx.beginPath();
      ctx.moveTo(0, hipY);
      ctx.lineTo(0, headY + 3.5);
      ctx.stroke();

      // Head
      ctx.fillStyle = hairType === "maul" ? "#0f172a" : "#f5d0b5";
      ctx.beginPath();
      ctx.arc(0, headY, 3.6, 0, Math.PI * 2);
      ctx.fill();

      // Facial / Hair Details
      if (hairType === "obiwan") {
        ctx.fillStyle = "#b48a60";
        ctx.beginPath();
        ctx.arc(-facing * 1, headY - 1, 3.8, Math.PI, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#967049";
        ctx.fillRect(facing * 1.5, headY + 1.2, 2, 2);
      } else if (hairType === "anakin") {
        ctx.fillStyle = "#8a6642";
        ctx.beginPath();
        ctx.arc(-facing * 1, headY - 1.5, 4.2, Math.PI * 0.75, Math.PI * 2.15);
        ctx.fill();
      } else if (hairType === "maul") {
        // Red facial markings
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(facing * 1.2, headY - 0.5, 1.8, 2.8);
        // Horns
        ctx.fillStyle = "#e2e8f0";
        for (let h = -2.2; h <= 2.2; h += 1.4) {
          ctx.fillRect(h, headY - 4.8, 1.1, 2.0);
        }
      }

      // Arm & Lightsaber
      const shoulderY = headY + 5;
      const handX = Math.cos(armAngle) * 9;
      const handY = shoulderY + Math.sin(armAngle) * 9;

      ctx.strokeStyle = robeColor;
      ctx.beginPath();
      ctx.moveTo(0, shoulderY);
      ctx.lineTo(handX, handY);
      ctx.stroke();

      // Hilt
      const hiltLen = isDoubleSaber ? 7.5 : 4.5;
      const hiltX1 = handX - Math.cos(saberAngle) * (hiltLen / 2);
      const hiltY1 = handY - Math.sin(saberAngle) * (hiltLen / 2);
      const hiltX2 = handX + Math.cos(saberAngle) * (hiltLen / 2);
      const hiltY2 = handY + Math.sin(saberAngle) * (hiltLen / 2);

      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 1.9;
      ctx.beginPath();
      ctx.moveTo(hiltX1, hiltY1);
      ctx.lineTo(hiltX2, hiltY2);
      ctx.stroke();

      // Blades
      const bladeLen = 18;
      if (isDoubleSaber) {
        const tip1X = hiltX2 + Math.cos(saberAngle) * bladeLen;
        const tip1Y = hiltY2 + Math.sin(saberAngle) * bladeLen;
        const tip2X = hiltX1 - Math.cos(saberAngle) * bladeLen;
        const tip2Y = hiltY1 - Math.sin(saberAngle) * bladeLen;

        updateTrail(trails.maul1, x + tip1X, y + tip1Y);
        updateTrail(trails.maul2, x + tip2X, y + tip2Y);

        drawBlade(ctx, hiltX2, hiltY2, tip1X, tip1Y, saberColor, trails.maul1);
        drawBlade(ctx, hiltX1, hiltY1, tip2X, tip2Y, saberColor, trails.maul2);
      } else {
        const tipX = hiltX2 + Math.cos(saberAngle) * bladeLen;
        const tipY = hiltY2 + Math.sin(saberAngle) * bladeLen;

        const trailList = trailKey === "obi" ? trails.obi : trails.ana;
        updateTrail(trailList, x + tipX, y + tipY);

        drawBlade(ctx, hiltX2, hiltY2, tipX, tipY, saberColor, trailList);
      }

      ctx.restore();
    };

    // ==========================================
    // PROCEDURAL COMBAT CHOREOGRAPHER
    // ==========================================
    // Instead of a predictable loop, we have an unpredictable combat state engine
    // with 8 distinct maneuvers, randomized strike variations, dynamic arena roaming,
    // and direction reversals so the duel never looks repetitive.
    const COMBAT_ACTIONS = [
      "RAPID_FLURRY",
      "OBIWAN_VAULT_PINCER",
      "MAUL_CYCLONE_CHARGE",
      "ANAKIN_AERIAL_SLAM",
      "BLADE_LOCK_STRUGGLE",
      "REVERSE_SIDES_CHARGE",
      "FORCE_WAVE_DISENGAGE",
      "HIGH_LOW_SPLIT"
    ];

    let action = "RAPID_FLURRY";
    let actionElapsed = 0;
    let actionDuration = 2.4;
    let recentActions = ["RAPID_FLURRY"];
    let lastClashTime = 0;

    // Arena Anchor roaming: duel organically drifts across the width of the terminal!
    let arenaOffset = 0;
    let targetArenaOffset = 0;

    // Maul position orientation (can switch sides!)
    let maulOnRight = true;

    const pickNextAction = () => {
      // Pick next move that hasn't run recently
      const candidates = COMBAT_ACTIONS.filter((a) => !recentActions.slice(-2).includes(a));
      action = candidates[Math.floor(Math.random() * candidates.length)] || "RAPID_FLURRY";
      recentActions.push(action);
      if (recentActions.length > 5) recentActions.shift();

      actionElapsed = 0;
      // Randomized action duration for natural organic rhythm
      actionDuration = 1.8 + Math.random() * 1.5;

      // Roam duel center slightly across the terminal width
      targetArenaOffset = (Math.random() - 0.5) * Math.min(width * 0.35, 140);

      // Dynamic maneuver audio cues
      if (action === "OBIWAN_VAULT_PINCER" || action === "ANAKIN_AERIAL_SLAM") {
        playSaberSwing(true);
      } else if (action === "MAUL_CYCLONE_CHARGE") {
        playSaberSwing(false);
      } else if (action === "REVERSE_SIDES_CHARGE") {
        playSaberScratch();
      }
    };

    let totalTime = 0;

    const render = () => {
      const dt = 0.022;
      totalTime += dt;
      actionElapsed += dt;

      if (actionElapsed >= actionDuration) {
        pickNextAction();
      }

      // Smooth arena drift
      arenaOffset += (targetArenaOffset - arenaOffset) * 0.05;

      ctx.save();
      ctx.scale(dpr, dpr);

      // Micro Screen-shake
      if (screenShake > 0) {
        const sx = (Math.random() - 0.5) * screenShake;
        const sy = (Math.random() - 0.5) * screenShake;
        ctx.translate(sx, sy);
        screenShake *= 0.85;
        if (screenShake < 0.1) screenShake = 0;
      }

      ctx.clearRect(0, 0, width, height);

      const groundY = height - 5;
      const centerX = width * 0.5 + arenaOffset;

      // 1. Cosmic Nebulae & Deep Space Stars
      drawDeepSpaceStars(ctx, width, height, totalTime);

      // 2. Cruising Imperial Star Destroyer in Mid-Space
      const isdLen = Math.min(52, Math.max(38, width * 0.13));
      const isdX = width > 520 ? width * 0.16 + Math.sin(totalTime * 0.06) * 6 : width * 0.08;
      const isdY = Math.max(16, height * 0.28);
      drawImperialStarDestroyer(ctx, isdX, isdY, isdLen, totalTime);

      // 3. Shaded Cinematic Death Star in High Orbit
      const dsR = Math.min(30, Math.max(22, height * 0.32));
      const dsX = width > 520 ? width * 0.80 : width * 0.74;
      const dsY = Math.max(dsR + 4, height * 0.38);
      drawCinematicDeathStar(ctx, dsX, dsY, dsR, totalTime);

      // 4. Distant TIE Fighter Patrol Flyby
      drawTieFighterFlyby(ctx, width, height, totalTime);

      // 5. Imperial Hangar Runway Floor with Embedded Docking Beacons
      drawImperialHangarFloor(ctx, width, groundY);
      const progress = Math.min(1.0, actionElapsed / actionDuration);

      // Characters dynamic coordinates
      let obiX, obiY = groundY, obiFacing = maulOnRight ? 1 : -1, obiRot = 0, obiArm = 0, obiSaber = 0, obiLeg = 0;
      let anaX, anaY = groundY, anaFacing = maulOnRight ? 1 : -1, anaRot = 0, anaArm = 0, anaSaber = 0, anaLeg = 0;
      let maulX, maulY = groundY, maulFacing = maulOnRight ? -1 : 1, maulRot = 0, maulArm = 0, maulSaber = 0, maulLeg = 0;

      const dir = maulOnRight ? 1 : -1;

      // ==========================================
      // MANEUVER KINEMATICS & CHOREOGRAPHY
      // ==========================================
      if (action === "RAPID_FLURRY") {
        // High-speed, intense 6-8 strike parry exchange
        obiX = centerX - dir * (42 + Math.sin(totalTime * 14) * 4);
        anaX = centerX - dir * (82 + Math.cos(totalTime * 12) * 5);
        maulX = centerX + dir * (26 - Math.sin(totalTime * 13) * 4);

        obiLeg = Math.sin(totalTime * 8) * 0.5;
        anaLeg = Math.sin(totalTime * 9) * 0.6;
        maulLeg = Math.cos(totalTime * 8) * 0.4;

        obiArm = -0.4 * dir + Math.sin(totalTime * 18) * 0.35;
        obiSaber = -0.3 * dir + Math.sin(totalTime * 18) * 0.5;

        anaArm = -0.2 * dir + Math.cos(totalTime * 15) * 0.35;
        anaSaber = -0.6 * dir + Math.cos(totalTime * 15) * 0.4;

        maulArm = (maulOnRight ? Math.PI * 0.8 : 0.2) + Math.sin(totalTime * 12) * 0.3;
        maulSaber = totalTime * 16;

        if (totalTime - lastClashTime > 0.14) {
          lastClashTime = totalTime;
          const cx = (obiX + maulX) / 2;
          const cy = groundY - 14 + Math.sin(totalTime * 25) * 6;
          addSparks(cx, cy, "#38bdf8", "#ef4444", 8);
          addSparks(cx - dir * 10, cy + 3, "#22c55e", "#ef4444", 8);
        }
      } else if (action === "OBIWAN_VAULT_PINCER") {
        // Obi-Wan flips over Maul to opposite flank, setting up a pincer attack!
        const leap = Math.sin(progress * Math.PI);
        obiX = centerX - dir * 55 + progress * dir * 110;
        obiY = groundY - leap * 24;
        obiRot = progress * Math.PI * 2 * dir; // Full 360 aerial flip!
        obiLeg = progress * Math.PI * 2;
        obiArm = -0.8;
        obiSaber = 0.5;

        anaX = centerX - dir * (70 - progress * 20);
        anaArm = -0.4 * dir;
        anaSaber = -0.5 * dir;
        anaLeg = totalTime * 12;

        maulX = centerX + dir * 8;
        maulArm = Math.PI * 0.5;
        maulSaber = totalTime * 22; // Furious twin blade spin blocking front and back
        maulLeg = totalTime * 6;

        if (progress > 0.4 && progress < 0.65 && totalTime - lastClashTime > 0.12) {
          lastClashTime = totalTime;
          addSparks(maulX, groundY - 18, "#38bdf8", "#ef4444", 10);
        }
      } else if (action === "MAUL_CYCLONE_CHARGE") {
        // Maul aggressively twirls double-blade forward, driving both Jedi back
        const charge = Math.sin(progress * Math.PI);
        maulX = centerX + dir * (30 - charge * 45);
        maulArm = (maulOnRight ? Math.PI * 0.75 : 0.25) + Math.sin(totalTime * 15) * 0.4;
        maulSaber = totalTime * 24;
        maulLeg = totalTime * 14;

        obiX = centerX - dir * (45 + charge * 40);
        anaX = centerX - dir * (85 + charge * 40);
        obiLeg = -totalTime * 10; // Stepping backward
        anaLeg = -totalTime * 10;

        obiArm = -0.6 * dir;
        obiSaber = -0.2 * dir + Math.sin(totalTime * 16) * 0.3;

        anaArm = -0.4 * dir;
        anaSaber = -0.8 * dir + Math.cos(totalTime * 16) * 0.3;

        if (totalTime - lastClashTime > 0.15) {
          lastClashTime = totalTime;
          addSparks(maulX - dir * 12, groundY - 12, "#22c55e", "#ef4444", 8);
        }
      } else if (action === "ANAKIN_AERIAL_SLAM") {
        // Anakin leaps high for an overhead two-handed power strike
        const jump = Math.sin(progress * Math.PI);
        anaX = centerX - dir * 75 + progress * dir * 45;
        anaY = groundY - jump * 22;
        anaArm = 0.9 * dir;
        anaSaber = 0.9 * dir; // High vertical slam
        anaLeg = progress * Math.PI;

        obiX = centerX - dir * 55;
        obiArm = -0.7 * dir;
        obiSaber = -0.4 * dir;

        maulX = centerX + dir * 12;
        maulArm = maulOnRight ? Math.PI * 0.5 : Math.PI * 0.5;
        maulSaber = 0; // Horizontal block over head!
        maulLeg = 0;

        if (progress > 0.45 && progress < 0.6 && totalTime - lastClashTime > 0.12) {
          lastClashTime = totalTime;
          addSparks(anaX + dir * 10, anaY + 10, "#22c55e", "#ef4444", 16);
          screenShake = 3.5;
        }
      } else if (action === "BLADE_LOCK_STRUGGLE") {
        // Intense blade lock: sizzle, sparks and sudden disengage
        obiX = centerX - dir * 32 + (Math.random() - 0.5) * 2;
        maulX = centerX + dir * 18 + (Math.random() - 0.5) * 2;
        anaX = centerX - dir * (65 - progress * 20);

        obiArm = -0.3 * dir;
        obiSaber = 0.2 * dir;

        maulArm = (maulOnRight ? Math.PI * 0.85 : 0.15);
        maulSaber = -0.2 * dir;

        anaArm = -0.5 * dir;
        anaSaber = -0.6 * dir;
        anaLeg = totalTime * 10;

        // Continuous sparks at contact node & electrical blade sizzle
        if (totalTime - lastClashTime > 0.08) {
          lastClashTime = totalTime;
          addSparks((obiX + maulX) / 2, groundY - 14, "#38bdf8", "#ef4444", 4);
          playSaberLockBuzz();
        }
      } else if (action === "REVERSE_SIDES_CHARGE") {
        // Combatants trade positions across the arena!
        const p = progress;
        maulX = centerX + dir * 40 - p * dir * 100;
        obiX = centerX - dir * 40 + p * dir * 100;
        anaX = centerX - dir * 75 + p * dir * 100;

        maulArm = Math.PI * 0.5;
        maulSaber = totalTime * 20;
        maulLeg = totalTime * 14;

        obiLeg = totalTime * 14;
        anaLeg = totalTime * 14;

        obiArm = -0.4 * dir;
        obiSaber = -0.7 * dir;

        anaArm = -0.3 * dir;
        anaSaber = -0.5 * dir;

        if (p > 0.95) {
          maulOnRight = !maulOnRight; // Swap side permanently!
        }
      } else if (action === "FORCE_WAVE_DISENGAGE") {
        // Maul unleashes a Force shockwave; Jedi are blown back then sprint right back
        const waveProgress = Math.min(1.0, progress * 1.5);
        if (progress < 0.1 && shockwaves.length === 0) {
          addShockwave(maulX - dir * 8, groundY - 12, "#ef4444");
        }

        const pushBack = Math.sin(progress * Math.PI) * 25;
        obiX = centerX - dir * (55 + pushBack);
        anaX = centerX - dir * (95 + pushBack * 1.3);
        maulX = centerX + dir * 35;

        // Maul Force push posture
        maulArm = (maulOnRight ? Math.PI : 0);
        maulSaber = Math.PI * 0.3;
        maulLeg = 0;

        obiLeg = -totalTime * 8;
        anaLeg = -totalTime * 8;
        obiArm = -0.6 * dir;
        obiSaber = -0.8 * dir;
        anaArm = -0.4 * dir;
        anaSaber = -0.6 * dir;
      } else {
        // HIGH_LOW_SPLIT
        obiX = centerX - dir * (40 + Math.sin(totalTime * 10) * 3);
        anaX = centerX - dir * (70 + Math.cos(totalTime * 10) * 3);
        maulX = centerX + dir * 20;

        obiArm = -0.7 * dir;
        obiSaber = -0.1 * dir; // High cut
        anaArm = 0.2 * dir;
        anaSaber = 0.8 * dir; // Low sweep

        maulArm = Math.PI * 0.6;
        maulSaber = totalTime * 16;
        maulLeg = totalTime * 6;

        if (totalTime - lastClashTime > 0.14) {
          lastClashTime = totalTime;
          addSparks(obiX + dir * 16, groundY - 20, "#38bdf8", "#ef4444", 7);
          addSparks(anaX + dir * 20, groundY - 6, "#22c55e", "#ef4444", 7);
        }
      }

      // ==========================================
      // DRAW CHARACTERS
      // ==========================================
      // Draw Obi-Wan Kenobi (Cyan-Blue Blade)
      drawFighter(ctx, {
        x: obiX,
        y: obiY,
        facing: obiFacing,
        bodyRotation: obiRot,
        robeColor: "#d6c7a7",
        hairType: "obiwan",
        legPhase: obiLeg,
        armAngle: obiArm,
        saberAngle: obiSaber,
        saberColor: "#38bdf8",
        isDoubleSaber: false,
        trailKey: "obi"
      });

      // Draw Anakin Skywalker (Emerald-Green Blade)
      drawFighter(ctx, {
        x: anaX,
        y: anaY,
        facing: anaFacing,
        bodyRotation: anaRot,
        robeColor: "#64748b",
        hairType: "anakin",
        legPhase: anaLeg,
        armAngle: anaArm,
        saberAngle: anaSaber,
        saberColor: "#22c55e",
        isDoubleSaber: false,
        trailKey: "ana"
      });

      // Draw Darth Maul (Dual-Bladed Crimson-Red Blade)
      drawFighter(ctx, {
        x: maulX,
        y: maulY,
        facing: maulFacing,
        bodyRotation: maulRot,
        robeColor: "#0f172a",
        hairType: "maul",
        legPhase: maulLeg,
        armAngle: maulArm,
        saberAngle: maulSaber,
        saberColor: "#ef4444",
        isDoubleSaber: true,
        trailKey: "maul"
      });

      // ==========================================
      // RENDER SHOCKWAVES & CLASH FLASHES
      // ==========================================
      // Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 1.8;
        sw.life -= 0.05;
        if (sw.life <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = sw.color;
        ctx.lineWidth = 2 * sw.life;
        ctx.shadowColor = sw.color;
        ctx.shadowBlur = 8;
        ctx.globalAlpha = sw.life;
        ctx.stroke();
        ctx.restore();
      }

      // Clash Flashes
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= 0.16;
        if (f.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.maxRadius * (1.2 - f.life), 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowColor = f.color;
        ctx.shadowBlur = 12;
        ctx.globalAlpha = f.life;
        ctx.fill();
        ctx.restore();
      }

      // Physics Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.16; // gravity
        s.life -= s.decay;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowColor = s.color;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  const handleClick = (e) => {
    e.stopPropagation();
    playSaberClash(1.0);
  };

  return (
    <div
      className="lightsaber-duel-track"
      onClick={handleClick}
      title="Obi-Wan & Anakin vs Darth Maul (Duel of the Fates - Endless Procedural Duel)"
      aria-label="Interactive Star Wars lightsaber duel animation"
    >
      <canvas ref={canvasRef} className="lightsaber-duel-canvas" />
    </div>
  );
}