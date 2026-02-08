// ============================================
// ✨ AESTHETIC SMOOTH THEME ENGINE ✨
// ============================================

function applyTheme() {
    const config = window.VALENTINE_CONFIG;
    const root = document.documentElement;

    // 1. Setup the "Live" Animated Background
    // This creates a smooth shifting gradient of dark and light pinks
    document.body.style.margin = "0";
    document.body.style.height = "100vh";
    document.body.style.overflow = "hidden";
    document.body.style.background = "linear-gradient(-45deg, #2d0a15, #800f2f, #ff4d6d, #ffb3c1)";
    document.body.style.backgroundSize = "400% 400%";
    
    // Inject the keyframes for the smooth movement
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        body {
            animation: gradientMove 15s ease infinite !important;
        }
        .heart {
            filter: drop-shadow(0 0 5px rgba(255,182,193,0.8));
            transition: transform 0.3s ease;
        }
        button {
            transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255,255,255,0.2) !important;
        }
    `;
    document.head.appendChild(style);

    // 2. Map the rest of your config variables to CSS
    root.style.setProperty('--button-color', config.colors.buttonBackground);
    root.style.setProperty('--button-hover', config.colors.buttonHover);
    root.style.setProperty('--text-color', "#ffffff"); // Pure white looks better on dark pink

    // 3. Smooth Heart Animations
    root.style.setProperty('--float-duration', "12s"); // Made it smoother
    root.style.setProperty('--float-distance', "70px");
    root.style.setProperty('--bounce-speed', "0.4s");
}

// Apply the smooth theme when the page loads
window.addEventListener('DOMContentLoaded', applyTheme);
