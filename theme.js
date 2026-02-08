// ============================================
// ✨ AESTHETIC LIVE HEART-LAYER THEME ✨
// ============================================

function applyTheme() {
    const config = window.VALENTINE_CONFIG;
    const root = document.documentElement;

    // 1. Create the Live Animated Background
    document.body.style.background = "linear-gradient(-45deg, #2d0a15, #800f2f, #ff4d6d, #ffb3c1)";
    document.body.style.backgroundSize = "400% 400%";
    
    // 2. Inject CSS for the "Hearts in the Background" effect
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        @keyframes heartFloat {
            0% { transform: translateY(100vh) scale(0); opacity: 0; }
            50% { opacity: 0.6; }
            100% { transform: translateY(-10vh) scale(1.5); opacity: 0; }
        }
        body {
            animation: gradientMove 15s ease infinite !important;
            overflow-x: hidden;
            position: relative;
        }
        /* The Background Heart Layer */
        .bg-heart {
            position: fixed;
            color: rgba(255, 255, 255, 0.3);
            font-size: 20px;
            user-select: none;
            pointer-events: none;
            z-index: -1; /* Keeps them behind the text/buttons */
            animation: heartFloat linear infinite;
        }
        .container { 
            position: relative;
            z-index: 10; /* Ensures buttons stay on top */
            backdrop-filter: blur(2px);
        }
    `;
    document.head.appendChild(style);

    // 3. Script to generate the hearts in the background
    function createBackgroundHeart() {
        const heart = document.createElement('div');
        heart.classList.add('bg-heart');
        heart.innerHTML = '❤️';
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = (Math.random() * 5 + 5) + 's';
        heart.style.opacity = Math.random();
        document.body.appendChild(heart);

        // Remove heart after animation ends to keep site fast
        setTimeout(() => { heart.remove(); }, 10000);
    }

    // Spawn a heart every 300ms
    setInterval(createBackgroundHeart, 300);

    // 4. Apply config colors to the rest of the site
    root.style.setProperty('--button-color', config.colors.buttonBackground);
    root.style.setProperty('--button-hover', config.colors.buttonHover);
    root.style.setProperty('--text-color', "#ffffff");
}

window.addEventListener('DOMContentLoaded', applyTheme);
