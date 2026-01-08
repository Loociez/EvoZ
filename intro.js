// ===============================
// EvoZ Intro Screen (Enhanced Neon)
// ===============================

(function () {
    if (document.getElementById("evoz-intro")) return;

    // ---------- Styles ----------
    const style = document.createElement("style");
    style.innerHTML = `
        #evoz-intro {
            position: fixed;
            inset: 0;
            background:
                radial-gradient(circle at center, #002b45, #000);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            overflow: hidden;
            animation: introFadeIn 1s ease forwards;
        }

        /* ===== STAR LAYERS ===== */
        .evoz-star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0,255,204,0.9);
            border-radius: 50%;
            animation: starFloat linear infinite;
        }

        .evoz-star.dim {
            opacity: 0.3;
            width: 1px;
            height: 1px;
        }

        .evoz-star.bright {
            box-shadow: 0 0 6px rgba(0,255,204,0.8);
        }

        @keyframes starFloat {
            from { transform: translateY(-10vh); }
            to { transform: translateY(120vh); }
        }

        /* ===== TITLE ===== */
        #evoz-title {
            font-size: 104px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            letter-spacing: 8px;
            color: #00ffcc;
            position: relative;
            transform: translateY(-220%);
            animation:
                titleDrop 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards,
                neonPulse 3s ease-in-out infinite;
            text-shadow:
                0 0 10px #00ffcc,
                0 0 25px #00ffcc,
                0 0 60px rgba(0,255,204,0.9);
            z-index: 2;
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
            to { transform: translateY(0); }
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
            margin-top: 26px;
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
            animation:
                btnFadeIn 0.8s ease forwards,
                btnPulse 2.5s ease-in-out infinite;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            z-index: 2;
        }

        .evoz-btn:hover {
            transform: scale(1.1);
            box-shadow:
                0 0 30px rgba(0,255,204,1),
                0 0 80px rgba(0,255,204,0.9);
        }

        @keyframes btnPulse {
            0%,100% { filter: brightness(1); }
            50% { filter: brightness(1.3); }
        }

        #evoz-play { animation-delay: 1.1s; }
        #evoz-credits { animation-delay: 1.3s; }

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

        /* ===== CREDITS ===== */
        #evoz-credits-panel {
            position: absolute;
            inset: 0;
            background: rgba(0,10,20,0.95);
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: #00ffcc;
            font-size: 24px;
            z-index: 3;
        }

        #evoz-credits-panel p {
            margin: 10px 0;
            text-shadow: 0 0 15px rgba(0,255,204,0.8);
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

    // Stars (depth layers)
    for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "evoz-star " + (Math.random() > 0.6 ? "bright" : "dim");
        star.style.left = Math.random() * 100 + "vw";
        star.style.top = Math.random() * -120 + "vh";
        star.style.animationDuration = 5 + Math.random() * 12 + "s";
        intro.appendChild(star);
    }

    const title = document.createElement("div");
    title.id = "evoz-title";
    title.textContent = "EvoZ";

    const playBtn = document.createElement("button");
    playBtn.id = "evoz-play";
    playBtn.className = "evoz-btn";
    playBtn.textContent = "PLAY";

    const creditsBtn = document.createElement("button");
    creditsBtn.id = "evoz-credits";
    creditsBtn.className = "evoz-btn";
    creditsBtn.textContent = "CREDITS";

    const creditsPanel = document.createElement("div");
    creditsPanel.id = "evoz-credits-panel";
    creditsPanel.innerHTML = `
        <p>Beta 1.1: <strong>Under construction</strong></p>
        <p>Game created by <strong>Loocie</strong></p>
        <p>Music: <strong>N3x - Anything</strong></p>
        <button class="evoz-btn" id="evoz-back">BACK</button>
    `;

    intro.appendChild(title);
    intro.appendChild(playBtn);
    intro.appendChild(creditsBtn);
    intro.appendChild(creditsPanel);
    document.body.appendChild(intro);

    // ---------- Interaction ----------
    playBtn.addEventListener("click", (e) => {
        const ring = document.createElement("div");
        ring.className = "energy-ring";
        ring.style.left = e.clientX + "px";
        ring.style.top = e.clientY + "px";
        intro.appendChild(ring);

        intro.classList.add("fade-out");
        document.dispatchEvent(new Event("evoz-start-game"));
        setTimeout(() => intro.remove(), 800);
    });

    creditsBtn.addEventListener("click", () => {
        creditsPanel.style.display = "flex";
    });

    creditsPanel.querySelector("#evoz-back").addEventListener("click", () => {
        creditsPanel.style.display = "none";
    });

})();
