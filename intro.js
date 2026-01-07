// ===============================
// EvoZ Intro Screen
// ===============================

(function () {
    if (document.getElementById("evoz-intro")) return;

    // ---------- Styles ----------
    const style = document.createElement("style");
    style.innerHTML = `
        #evoz-intro {
            position: fixed;
            inset: 0;
            background: radial-gradient(circle at center, #001a2e, #000);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            overflow: hidden;
            animation: introFadeIn 1s ease forwards;
        }

        /* Star background */
        .evoz-star {
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0,255,204,0.8);
            border-radius: 50%;
            animation: starFloat linear infinite;
        }

        @keyframes starFloat {
            from { transform: translateY(0); opacity: 0.2; }
            to { transform: translateY(120vh); opacity: 1; }
        }

        @keyframes introFadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        #evoz-title {
            font-size: 96px;
            font-family: Arial, sans-serif;
            font-weight: bold;
            letter-spacing: 6px;
            color: #00ffcc;
            text-shadow:
                0 0 10px #00ffcc,
                0 0 30px #00ffcc,
                0 0 60px rgba(0,255,204,0.8);
            transform: translateY(-200%);
            animation: titleDrop 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
            z-index: 2;
        }

        @keyframes titleDrop {
            to { transform: translateY(0); }
        }

        .evoz-btn {
            margin-top: 24px;
            padding: 14px 48px;
            font-size: 22px;
            letter-spacing: 2px;
            cursor: pointer;
            border: none;
            border-radius: 6px;
            background: linear-gradient(135deg, #00ffcc, #00aa88);
            color: #00131f;
            box-shadow:
                0 0 10px rgba(0,255,204,0.6),
                0 0 30px rgba(0,255,204,0.4);
            opacity: 0;
            animation: btnFadeIn 0.8s ease forwards;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            z-index: 2;
        }

        .evoz-btn:hover {
            transform: scale(1.08);
            box-shadow:
                0 0 20px rgba(0,255,204,0.9),
                0 0 50px rgba(0,255,204,0.7);
        }

        #evoz-play { animation-delay: 1.1s; }
        #evoz-credits { animation-delay: 1.3s; }

        @keyframes btnFadeIn {
            to { opacity: 1; }
        }

        #evoz-intro.fade-out {
            animation: introFadeOut 0.8s ease forwards;
        }

        @keyframes introFadeOut {
            to {
                opacity: 0;
                transform: scale(1.05);
            }
        }

        /* Credits Panel */
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
            animation: creditsIn 0.5s ease forwards;
        }

        @keyframes creditsIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #evoz-credits-panel p {
            margin: 10px 0;
            text-shadow: 0 0 10px rgba(0,255,204,0.6);
        }
    `;
    document.head.appendChild(style);

    // ---------- DOM ----------
    const intro = document.createElement("div");
    intro.id = "evoz-intro";

    // Stars
    for (let i = 0; i < 80; i++) {
        const star = document.createElement("div");
        star.className = "evoz-star";
        star.style.left = Math.random() * 100 + "vw";
        star.style.top = Math.random() * -120 + "vh";
        star.style.animationDuration = 6 + Math.random() * 10 + "s";
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
        <p>Game created by <strong>Loocie</strong></p>
        <p>Music: <strong>n3x - Anything</strong></p>
        <button class="evoz-btn" id="evoz-back">BACK</button>
    `;

    intro.appendChild(title);
    intro.appendChild(playBtn);
    intro.appendChild(creditsBtn);
    intro.appendChild(creditsPanel);
    document.body.appendChild(intro);

    // ---------- Interaction ----------
    playBtn.addEventListener("click", () => {
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
