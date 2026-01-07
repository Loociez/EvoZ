// ===============================
// EvoZ Intro Screen
// ===============================

(function () {
    // Prevent double init
    if (document.getElementById("evoz-intro")) return;

    // ---------- Styles ----------
    const style = document.createElement("style");
    style.innerHTML = `
        #evoz-intro {
            position: fixed;
            inset: 0;
            background: radial-gradient(circle at center, #00131f, #000);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            overflow: hidden;
            animation: introFadeIn 1s ease forwards;
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
        }

        @keyframes titleDrop {
            to { transform: translateY(0); }
        }

        #evoz-play {
            margin-top: 40px;
            padding: 16px 48px;
            font-size: 24px;
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
            animation: playFadeIn 1s ease forwards;
            animation-delay: 1.1s;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        #evoz-play:hover {
            transform: scale(1.08);
            box-shadow:
                0 0 20px rgba(0,255,204,0.9),
                0 0 50px rgba(0,255,204,0.7);
        }

        @keyframes playFadeIn {
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
    `;
    document.head.appendChild(style);

    // ---------- DOM ----------
    const intro = document.createElement("div");
    intro.id = "evoz-intro";

    const title = document.createElement("div");
    title.id = "evoz-title";
    title.textContent = "EvoZ";

    const playBtn = document.createElement("button");
    playBtn.id = "evoz-play";
    playBtn.textContent = "PLAY";

    intro.appendChild(title);
    intro.appendChild(playBtn);
    document.body.appendChild(intro);

    // ---------- Interaction ----------
    playBtn.addEventListener("click", () => {
    intro.classList.add("fade-out");

    document.dispatchEvent(new Event("evoz-start-game"));

    setTimeout(() => {
        intro.remove();
    }, 800);
});

})();
