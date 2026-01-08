// ===============================
// EvoZ Intro Screen (Animated Nebula + Stars + Neon Title + Buttons with Intro Sequence)
// ===============================

(function () {
  if (document.getElementById("evoz-intro")) return;

  // ---------- Styles ----------
  const style = document.createElement("style");
  style.innerHTML = `
    #evoz-intro {
      position: fixed;
      inset: 0;
      background: #000;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: introFadeIn 1s ease forwards;
      user-select: none;
      color: #00ffcc;
    }

    canvas#nebula-canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      pointer-events: none;
      background: #000;
      display: block;
    }

    /* ===== TITLE ===== */
    #evoz-title {
      font-size: 104px;
      font-family: Arial, sans-serif;
      font-weight: bold;
      letter-spacing: 8px;
      color: #00ffcc;
      position: relative;
      opacity: 0;
      transform: translateY(-220%);
      animation-fill-mode: forwards;
      text-shadow:
          0 0 10px #00ffcc,
          0 0 25px #00ffcc,
          0 0 60px rgba(0,255,204,0.9);
      z-index: 2;
      margin-bottom: 24px;
      user-select: none;
    }

    /* Glitch overlay */
    #evoz-title::before,
    #evoz-title::after {
      content: "EvoZ";
      position: absolute;
      left: 0;
      top: 0;
      opacity: 0.4;
      mix-blend-mode: screen;
      user-select: none;
    }

    #evoz-title::before {
      color: #00aaff;
      transform: translate(2px, -2px);
      animation: glitchShift 4s infinite;
    }

    #evoz-title::after {
      color: #00ff88;
      transform: translate(-2px, 2px);
      animation: glitchShift 3s infinite reverse;
    }

    @keyframes glitchShift {
      0%, 95%, 100% { transform: translate(0,0); }
      96% { transform: translate(4px,-2px); }
      97% { transform: translate(-3px,2px); }
    }

    @keyframes titleDrop {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @keyframes neonPulse {
      0%, 100% {
        text-shadow:
          0 0 10px #00ffcc,
          0 0 25px #00ffcc,
          0 0 60px rgba(0,255,204,0.9);
      }
      50% {
        text-shadow:
          0 0 20px #00ffcc,
          0 0 50px #00ffcc,
          0 0 120px rgba(0,255,204,1);
      }
    }

    /* ===== BUTTONS ===== */
    .evoz-btn {
      margin-top: 18px;
      padding: 14px 54px;
      font-size: 22px;
      letter-spacing: 3px;
      cursor: pointer;
      border: none;
      border-radius: 8px;
      background: linear-gradient(135deg, #00ffcc, #009977);
      color: #00131f;
      box-shadow:
        0 0 15px rgba(0,255,204,0.7),
        0 0 40px rgba(0,255,204,0.4);
      opacity: 0;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      z-index: 2;
      user-select: none;
      pointer-events: none;
    }

    .evoz-btn.visible {
      opacity: 1;
      pointer-events: auto;
      animation:
        btnFadeIn 0.8s ease forwards,
        btnPulse 2.5s ease-in-out infinite;
    }

    .evoz-btn:hover {
      transform: scale(1.1);
      box-shadow:
        0 0 30px rgba(0,255,204,1),
        0 0 80px rgba(0,255,204,0.9);
    }

    #evoz-play.visible { animation-delay: 0.0s; }
    #evoz-credits.visible { animation-delay: 0.3s; }
    #evoz-howto.visible { animation-delay: 0.6s; }

    @keyframes btnPulse {
      0%,100% { filter: brightness(1); }
      50% { filter: brightness(1.3); }
    }

    @keyframes btnFadeIn {
      to { opacity: 1; }
    }

    /* ===== PLAY BURST ===== */
    .energy-ring {
      position: absolute;
      width: 20px;
      height: 20px;
      border: 3px solid #00ffcc;
      border-radius: 50%;
      animation: ringExpand 0.8s ease-out forwards;
      pointer-events: none;
      z-index: 5;
    }

    @keyframes ringExpand {
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(15);
      }
    }

    /* ===== FADE OUT ===== */
    #evoz-intro.fade-out {
      animation: introFadeOut 0.8s ease forwards;
    }

    @keyframes introFadeOut {
      to {
        opacity: 0;
        transform: scale(1.06);
      }
    }

    /* ===== CREDITS & HOW TO PLAY PANELS ===== */
    #evoz-credits-panel,
    #evoz-howto-panel {
      position: absolute;
      inset: 0;
      background: rgba(0,10,20,0.95);
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #00ffcc;
      font-size: 24px;
      padding: 20px 40px;
      text-align: center;
      z-index: 3;
      overflow-y: auto;
      user-select: text;
    }

    #evoz-credits-panel p,
    #evoz-howto-panel p {
      margin: 10px 0;
      text-shadow: 0 0 15px rgba(0,255,204,0.8);
    }

    #evoz-howto-panel pre {
      white-space: pre-wrap;
      font-family: monospace, monospace;
      font-size: 20px;
      margin-top: 20px;
      text-shadow: 0 0 15px rgba(0,255,204,0.8);
    }

    #evoz-howto-panel button,
    #evoz-credits-panel button {
      margin-top: 30px;
      align-self: center;
      cursor: pointer;
      user-select: none;
    }

    @keyframes introFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `;
  document.head.appendChild(style);

  // ---------- DOM ----------
  const intro = document.createElement("div");
  intro.id = "evoz-intro";

  // Nebula canvas for background
  const canvas = document.createElement("canvas");
  canvas.id = "nebula-canvas";
  intro.appendChild(canvas);

  // Title
  const title = document.createElement("div");
  title.id = "evoz-title";
  title.textContent = "EvoZ";
  intro.appendChild(title);

  // Buttons
  const playBtn = document.createElement("button");
  playBtn.id = "evoz-play";
  playBtn.className = "evoz-btn";
  playBtn.textContent = "PLAY";

  const creditsBtn = document.createElement("button");
  creditsBtn.id = "evoz-credits";
  creditsBtn.className = "evoz-btn";
  creditsBtn.textContent = "CREDITS";

  const howtoBtn = document.createElement("button");
  howtoBtn.id = "evoz-howto";
  howtoBtn.className = "evoz-btn";
  howtoBtn.textContent = "HOW TO PLAY";

  // Credits panel
  const creditsPanel = document.createElement("div");
  creditsPanel.id = "evoz-credits-panel";
  creditsPanel.innerHTML = `
    <p>Beta 1.1: <strong>Under construction</strong></p>
    <p>Game created by <strong>Loocie</strong></p>
    <p>Music: <strong>N3x - Anything</strong></p>
    <button class="evoz-btn" id="evoz-back-credits">BACK</button>
  `;

  // How To Play panel
  const howtoPanel = document.createElement("div");
  howtoPanel.id = "evoz-howto-panel";
  howtoPanel.innerHTML = `
    <h2>How to Play</h2>
    <pre>
W - A - S - D to move.
Spacebar or Left click to shoot.
Numbers to level skills up.

The idea is to survive, upgrade and become the EvoZ.
    </pre>
    <button class="evoz-btn" id="evoz-back-howto">BACK</button>
  `;

  intro.appendChild(creditsPanel);
  intro.appendChild(howtoPanel);

  // Buttons container for easy fade in/out
  const buttons = document.createElement("div");
  buttons.style.display = "flex";
  buttons.style.flexDirection = "column";
  buttons.style.alignItems = "center";
  buttons.style.justifyContent = "center";
  buttons.style.zIndex = "2";
  buttons.style.marginTop = "10px";
  buttons.appendChild(playBtn);
  buttons.appendChild(creditsBtn);
  buttons.appendChild(howtoBtn);
  intro.appendChild(buttons);

  document.body.appendChild(intro);

  // ---------- Nebula + Stars animation setup ----------
  const ctx = canvas.getContext("2d");
  let width, height;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  resize();
  window.addEventListener("resize", resize);

  // Nebula blobs
  const blobs = [];
  const blobCount = 7;

  for (let i = 0; i < blobCount; i++) {
    blobs.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 150 + Math.random() * 250,
      speedX: (Math.random() - 0.5) * 0.3,
      speedY: (Math.random() - 0.5) * 0.3,
      color: `hsla(${Math.random() * 360}, 70%, 50%, 0.15)`,
    });
  }

  // Stars setup
  const stars = [];
  const starCount = 150;

  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.3 + 0.2,
      twinkleSpeed: 0.002 + Math.random() * 0.006,
      twinklePhase: Math.random() * Math.PI * 2,
    });
  }

  // Animate stars and blobs
  let animationId;

  function animate(time = 0) {
    ctx.clearRect(0, 0, width, height);

    // Draw nebula blobs
    blobs.forEach((blob) => {
      blob.x += blob.speedX;
      blob.y += blob.speedY;

      if (blob.x - blob.radius > width) blob.x = -blob.radius;
      if (blob.x + blob.radius < 0) blob.x = width + blob.radius;
      if (blob.y - blob.radius > height) blob.y = -blob.radius;
      if (blob.y + blob.radius < 0) blob.y = height + blob.radius;

      const grad = ctx.createRadialGradient(
        blob.x,
        blob.y,
        0,
        blob.x,
        blob.y,
        blob.radius
      );
      grad.addColorStop(0, blob.color);
      grad.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw twinkling stars
    stars.forEach((star) => {
      star.twinklePhase += star.twinkleSpeed;
      if (star.twinklePhase > Math.PI * 2) star.twinklePhase -= Math.PI * 2;
      const alpha = 0.5 + 0.5 * Math.sin(star.twinklePhase);

      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(2)})`;
      ctx.fill();
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();

  // ---------- Intro Sequence Logic ----------

  // Hide buttons initially
  buttons.querySelectorAll("button").forEach((btn) => {
    btn.classList.remove("visible");
    btn.style.pointerEvents = "none";
  });
  title.style.opacity = "0";

  // After 2 seconds: animate title drop + fade in
  setTimeout(() => {
    title.style.animation = "titleDrop 1.2s cubic-bezier(0.2,0.8,0.2,1) forwards";
  }, 2000);

  // After 3.3 seconds: start neon pulse
  setTimeout(() => {
    title.style.animation += ", neonPulse 3s ease-in-out infinite";
  }, 3200);

  // After 4.5 seconds: fade buttons in sequentially with pulse and enable them
  setTimeout(() => {
    playBtn.classList.add("visible");
    creditsBtn.classList.add("visible");
    howtoBtn.classList.add("visible");
  }, 4500);

  // ---------- Interaction ----------

  // Play button click
  playBtn.addEventListener("click", (e) => {
    const ring = document.createElement("div");
    ring.className = "energy-ring";
    ring.style.left = e.clientX + "px";
    ring.style.top = e.clientY + "px";
    intro.appendChild(ring);

    intro.classList.add("fade-out");

    setTimeout(() => {
      cancelAnimationFrame(animationId);
      intro.remove();
    }, 800);

    document.dispatchEvent(new Event("evoz-start-game"));
  });

  // Credits open/close
  creditsBtn.addEventListener("click", () => {
    creditsPanel.style.display = "flex";
  });
  creditsPanel.querySelector("#evoz-back-credits").addEventListener("click", () => {
    creditsPanel.style.display = "none";
  });

  // How To Play open/close
  howtoBtn.addEventListener("click", () => {
    howtoPanel.style.display = "flex";
  });
  howtoPanel.querySelector("#evoz-back-howto").addEventListener("click", () => {
    howtoPanel.style.display = "none";
  });
})();
