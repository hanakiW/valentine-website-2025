// script.js
// Initialize configuration
const config = window.VALENTINE_CONFIG;

// Validate configuration
function validateConfig() {
    const warnings = [];

    // Check required fields
    if (!config.valentineName) {
        warnings.push("Valentine's name is not set! Using default.");
        config.valentineName = "My Love";
    }

    // Validate colors
    const isValidHex = (hex) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
    Object.entries(config.colors).forEach(([key, value]) => {
        if (!isValidHex(value)) {
            warnings.push(`Invalid color for ${key}! Using default.`);
            config.colors[key] = getDefaultColor(key);
        }
    });

    // Validate animation values
    if (parseFloat(config.animations.floatDuration) < 5) {
        warnings.push("Float duration too short! Setting to 5s minimum.");
        config.animations.floatDuration = "5s";
    }

    if (config.animations.heartExplosionSize < 1 || config.animations.heartExplosionSize > 3) {
        warnings.push("Heart explosion size should be between 1 and 3! Using default.");
        config.animations.heartExplosionSize = 1.5;
    }

    // Log warnings if any
    if (warnings.length > 0) {
        console.warn("⚠️ Configuration Warnings:");
        warnings.forEach(warning => console.warn("- " + warning));
    }
}

// Default color values
function getDefaultColor(key) {
    const defaults = {
        backgroundStart: "#ffafbd",
        backgroundEnd: "#ffc3a0",
        buttonBackground: "#ff6b6b",
        buttonHover: "#ff8787",
        textColor: "#ff4757"
    };
    return defaults[key];
}

// Set page title
document.title = config.pageTitle;

// Initialize the page content when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Validate configuration first
    validateConfig();

    // Set texts from config
    document.getElementById('valentineTitle').textContent = `${config.valentineName}, my love...`;
    
    // Set first question texts
    document.getElementById('question1Text').textContent = config.questions.first.text;
    document.getElementById('yesBtn1').textContent = config.questions.first.yesBtn;
    document.getElementById('noBtn1').textContent = config.questions.first.noBtn;
    document.getElementById('secretAnswerBtn').textContent = config.questions.first.secretAnswer;
    
    // Set second question texts
    document.getElementById('question2Text').textContent = config.questions.second.text;
    document.getElementById('startText').textContent = config.questions.second.startText;
    document.getElementById('nextBtn').textContent = config.questions.second.nextBtn;
    
    // Set third question texts
    document.getElementById('question3Text').textContent = config.questions.third.text;
    document.getElementById('yesBtn3').textContent = config.questions.third.yesBtn;
    document.getElementById('noBtn3').textContent = config.questions.third.noBtn;

    // Start the interactive background
    startInteractiveBackground();

    // Setup music player
    setupMusicPlayer();
});

// Interactive heart background
let bg = null;

function startInteractiveBackground() {
    const canvas = document.getElementById('bgCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    const state = {
        canvas,
        ctx,
        dpr: Math.max(1, Math.min(2, window.devicePixelRatio || 1)),
        w: 0,
        h: 0,
        hearts: [],
        mouse: { x: -9999, y: -9999, active: false },
        raf: 0
    };
    bg = state;

    const resize = () => {
        state.w = window.innerWidth;
        state.h = window.innerHeight;
        canvas.width = Math.floor(state.w * state.dpr);
        canvas.height = Math.floor(state.h * state.dpr);
        canvas.style.width = state.w + 'px';
        canvas.style.height = state.h + 'px';
        ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    };

    const onMove = (clientX, clientY) => {
        state.mouse.x = clientX;
        state.mouse.y = clientY;
        state.mouse.active = true;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY), { passive: true });
    window.addEventListener('touchmove', (e) => {
        const t = e.touches && e.touches[0];
        if (t) onMove(t.clientX, t.clientY);
    }, { passive: true });
    window.addEventListener('mouseleave', () => { state.mouse.active = false; });

    resize();

    const count = Math.max(28, Math.min(60, Math.floor(state.w / 22)));
    state.hearts = Array.from({ length: count }, () => makeHeart(state.w, state.h));

    const tick = () => {
        state.raf = requestAnimationFrame(tick);
        drawBackground(state);
    };
    tick();
}

function makeHeart(w, h) {
    const size = 6 + Math.random() * 12;
    return {
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.006,
        size,
        alpha: 0.22 + Math.random() * 0.26
    };
}

function drawBackground(state) {
    const { ctx, w, h, hearts, mouse } = state;
    ctx.clearRect(0, 0, w, h);

    const repelRadius = 120;
    const repelRadius2 = repelRadius * repelRadius;

    for (const p of hearts) {
        // Drift
        p.x += p.vx;
        p.y += p.vy;
        p.r += p.vr;

        // Wrap
        if (p.x < -40) p.x = w + 40;
        if (p.x > w + 40) p.x = -40;
        if (p.y < -40) p.y = h + 40;
        if (p.y > h + 40) p.y = -40;

        // Mouse interaction
        if (mouse.active) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < repelRadius2) {
                const d = Math.max(1, Math.sqrt(d2));
                const force = (repelRadius - d) / repelRadius;
                p.x += (dx / d) * force * 6;
                p.y += (dy / d) * force * 6;
                p.vx += (dx / d) * force * 0.03;
                p.vy += (dy / d) * force * 0.03;
            }
        }

        // Soft damping
        p.vx *= 0.995;
        p.vy *= 0.995;

        drawHeart(ctx, p.x, p.y, p.size, p.r, p.alpha);
    }
}

function drawHeart(ctx, x, y, size, rotation, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = 'rgba(255, 90, 107, 1)';

    const s = size;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.35);
    ctx.bezierCurveTo(s * 0.6, -s * 0.2, s * 1.15, s * 0.35, 0, s);
    ctx.bezierCurveTo(-s * 1.15, s * 0.35, -s * 0.6, -s * 0.2, 0, s * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

// Function to show next question
function showNextQuestion(questionNumber) {
    document.querySelectorAll('.question-section').forEach(q => q.classList.add('hidden'));
    document.getElementById(`question${questionNumber}`).classList.remove('hidden');
}

// Function to move the "No" button when clicked
function moveButton(button) {
    const pad = 14;
    const x = pad + Math.random() * (window.innerWidth - button.offsetWidth - pad * 2);
    const y = pad + Math.random() * (window.innerHeight - button.offsetHeight - pad * 2);
    button.style.position = 'fixed';
    button.style.left = x + 'px';
    button.style.top = y + 'px';
}

// Love meter functionality
const loveMeter = document.getElementById('loveMeter');
const loveValue = document.getElementById('loveValue');
const extraLove = document.getElementById('extraLove');

function setInitialPosition() {
    loveMeter.value = 100;
    loveValue.textContent = 100;
    loveMeter.style.width = '100%';
}

loveMeter.addEventListener('input', () => {
    const value = parseInt(loveMeter.value);
    loveValue.textContent = value;
    
    if (value > 100) {
        extraLove.classList.remove('hidden');
        const overflowPercentage = (value - 100) / 9900;
        const extraWidth = overflowPercentage * window.innerWidth * 0.8;
        loveMeter.style.width = `calc(100% + ${extraWidth}px)`;
        loveMeter.style.transition = 'width 0.3s';
        
        // Show different messages based on the value
        if (value >= 5000) {
            extraLove.classList.add('super-love');
            extraLove.textContent = config.loveMessages.extreme;
        } else if (value > 1000) {
            extraLove.classList.remove('super-love');
            extraLove.textContent = config.loveMessages.high;
        } else {
            extraLove.classList.remove('super-love');
            extraLove.textContent = config.loveMessages.normal;
        }
    } else {
        extraLove.classList.add('hidden');
        extraLove.classList.remove('super-love');
        loveMeter.style.width = '100%';
    }
});

// Initialize love meter
window.addEventListener('DOMContentLoaded', setInitialPosition);
window.addEventListener('load', setInitialPosition);

// Celebration function
function celebrate() {
    document.querySelectorAll('.question-section').forEach(q => q.classList.add('hidden'));
    const celebration = document.getElementById('celebration');
    celebration.classList.remove('hidden');
    
    // Set celebration messages
    document.getElementById('celebrationTitle').textContent = config.celebration.title;
    document.getElementById('celebrationEmojis').textContent = config.celebration.emojis;

    // Soft burst of background hearts
    burstHearts();
}

function burstHearts() {
    if (!bg || !bg.hearts) return;
    const w = bg.w;
    const h = bg.h;
    const cx = w * 0.5;
    const cy = h * 0.35;

    for (let i = 0; i < 26; i++) {
        const p = makeHeart(w, h);
        p.x = cx + (Math.random() - 0.5) * 40;
        p.y = cy + (Math.random() - 0.5) * 40;
        p.vx = (Math.random() - 0.5) * 3.2;
        p.vy = (Math.random() - 0.5) * 2.6;
        p.alpha = 0.28 + Math.random() * 0.22;
        p.size = 10 + Math.random() * 16;
        bg.hearts.push(p);
    }

    // Keep the list from growing forever
    if (bg.hearts.length > 90) {
        bg.hearts.splice(0, bg.hearts.length - 90);
    }
}

// Music Player Setup
function setupMusicPlayer() {
    const musicControls = document.getElementById('musicControls');
    const musicToggle = document.getElementById('musicToggle');
    const bgMusic = document.getElementById('bgMusic');
    const musicSource = document.getElementById('musicSource');

    // Only show controls if music is enabled in config
    if (!config.music.enabled) {
        musicControls.style.display = 'none';
        return;
    }

    // Set music source and volume
    musicSource.src = config.music.musicUrl;
    bgMusic.volume = config.music.volume || 0.5;
    bgMusic.load();

    // Try autoplay if enabled
    if (config.music.autoplay) {
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("Autoplay prevented by browser");
                musicToggle.textContent = config.music.startText;
            });
        }
    }

    // Toggle music on button click
    musicToggle.addEventListener('click', () => {
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.textContent = config.music.stopText;
        } else {
            bgMusic.pause();
            musicToggle.textContent = config.music.startText;
        }
    });
}
