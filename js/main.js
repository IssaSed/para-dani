function togglePlay() {
    const music = document.getElementById('bgMusic');
    const btn = document.getElementById('playBtn');
    if (music.paused) {
        music.play().catch(() => {
            alert('No se pudo cargar la música. Revisa que el archivo de audio esté cargado en GitHub y que el nombre coincida.');
        });
        btn.textContent = '❚❚';
    } else {
        music.pause();
        btn.textContent = '▶';
    }
    const hint = document.getElementById('musicHint');
    if (hint) hint.style.display = 'none';
}

// Generador de pétalos
const petalContainer = document.getElementById('petals-container');
const numberOfPetals = 60;

for (let i = 0; i < numberOfPetals; i++) {
    const petal = document.createElement('div');
    petal.classList.add('petal');
    if (Math.random() < 0.3) petal.classList.add('petal-gold');

    const size = Math.random() * 12 + 10;
    petal.style.width = `${size}px`;
    petal.style.height = `${size}px`;
    petal.style.left = `${Math.random() * 100}%`;
    petal.style.animationDuration = `${Math.random() * 10 + 8}s`;
    petal.style.animationDelay = `${Math.random() * 10}s`;

    petalContainer.appendChild(petal);
}

// Generador de brillitos
const sparkleContainer = document.getElementById('sparkles-container');
const numberOfSparkles = 45;

for (let i = 0; i < numberOfSparkles; i++) {
    const sparkle = document.createElement('div');
    sparkle.classList.add('sparkle');

    const size = Math.random() * 5 + 3;
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    sparkle.style.animationDuration = `${Math.random() * 2.5 + 1.8}s`;
    sparkle.style.animationDelay = `${Math.random() * 5}s`;

    sparkleContainer.appendChild(sparkle);
}

// ---------- Woodstock volando ----------
(function () {
    const bird = document.getElementById('woodstock');
    const trailLayer = document.getElementById('trail-layer');
    if (!bird) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let W = window.innerWidth;
    let H = window.innerHeight;
    window.addEventListener('resize', () => { W = window.innerWidth; H = window.innerHeight; });

    function basePos(t) {
        const mx = Math.min(90, W * 0.07);
        const my = Math.min(150, H * 0.2);
        const ax = (W - 2 * mx) / 2;
        const ay = (H - 2 * my) / 2;
        const x = W / 2 + ax * (0.8 * Math.sin(t * 0.23) + 0.2 * Math.sin(t * 0.61 + 1.3));
        const y = H / 2 + ay * (0.75 * Math.sin(t * 0.31 + 0.8) + 0.25 * Math.sin(t * 0.83));
        return [x, y];
    }

    function place(x, y, sx, rot, flap) {
        const w = bird.offsetWidth;
        const h = bird.offsetHeight;
        bird.style.transform =
            `translate3d(${x - w / 2}px, ${y - h / 2}px, 0) scaleX(${sx}) rotate(${rot}rad) scale(1, ${flap})`;
    }

    if (reduceMotion) {
        place(W * 0.85, 150, 1, 0, 1);
        return;
    }

    const LOOP_TIME = 1.9;
    const LOOP_R = 62;
    let t = 0;
    let last = null;
    let prev = null;
    let facing = 1;
    let facingSmooth = 1;
    let rot = 0;
    let nextLoop = 4;
    let loopStart = -1;
    let loopDir = -1;
    let trailTimer = 0;
    let distAcc = 0;
    const DOT_SPACING = 15;

    const easeLoop = (u) => u - (0.6 * Math.sin(2 * Math.PI * u)) / (2 * Math.PI);
    const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

    function spawnTrail(x, y, vx, vy) {
        const d = document.createElement('div');
        d.className = 'trail ' + (Math.random() < 0.5 ? 'gold' : 'pink');
        const len = Math.hypot(vx, vy) || 1;
        d.style.left = (x - (vx / len) * 22 + (Math.random() - 0.5) * 8) + 'px';
        d.style.top = (y - (vy / len) * 22 + (Math.random() - 0.5) * 8) + 'px';
        d.style.setProperty('--dx', ((Math.random() - 0.5) * 24) + 'px');
        d.addEventListener('animationend', () => d.remove());
        trailLayer.appendChild(d);
    }

    function spawnDot(x, y, vx, vy) {
        const len = Math.hypot(vx, vy);
        if (len < 1) return;
        const d = document.createElement('div');
        d.className = 'trail-dot';
        d.style.left = (x - (vx / len) * 34) + 'px';
        d.style.top = (y - (vy / len) * 34) + 'px';
        d.addEventListener('animationend', () => d.remove());
        trailLayer.appendChild(d);
    }

    function frame(now) {
        if (last === null) last = now;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        t += dt;

        const [bx, by] = basePos(t);
        const [bx2] = basePos(t + 0.02);
        const baseVx = bx2 - bx;

        const inLoop = loopStart >= 0;
        if (!inLoop) {
            facing = baseVx >= 0 ? 1 : -1;
            if (t >= nextLoop) {
                loopStart = t;
                loopDir = by > H / 2 ? -1 : 1;
            }
        }

        let ox = 0, oy = 0;
        if (loopStart >= 0) {
            const u = (t - loopStart) / LOOP_TIME;
            if (u >= 1) {
                loopStart = -1;
                nextLoop = t + 6 + Math.random() * 5;
            } else {
                const phi = 2 * Math.PI * easeLoop(u);
                ox = facing * LOOP_R * Math.sin(phi);
                oy = loopDir * LOOP_R * (1 - Math.cos(phi));
            }
        }

        const bob = Math.sin(t * 7) * 5;
        const x = bx + ox;
        const y = by + oy + bob;

        let vx = 0, vy = 0;
        if (prev) {
            vx = (x - prev[0]) / Math.max(dt, 0.001);
            vy = (y - prev[1]) / Math.max(dt, 0.001);
            distAcc += Math.hypot(x - prev[0], y - prev[1]);
        }
        prev = [x, y];

        let target = Math.atan2(vy, vx * facing);
        if (loopStart < 0) target = clamp(target, -0.5, 0.5);
        rot += wrapAngle(target - rot) * (1 - Math.exp(-dt * 12));

        facingSmooth += (facing - facingSmooth) * (1 - Math.exp(-dt * 9));
        const sx = Math.abs(facingSmooth) < 0.05 ? 0.05 * Math.sign(facing) : facingSmooth;

        const flap = 1 + Math.sin(t * 18) * 0.03;
        place(x, y, sx, rot, flap);

        if (distAcc >= DOT_SPACING) {
            distAcc = 0;
            spawnDot(x, y, vx, vy);
        }

        trailTimer += dt;
        if (trailTimer > 0.07) {
            trailTimer = 0;
            spawnTrail(x, y, vx, vy);
        }

        requestAnimationFrame(frame);
    }

    requestAnimationFrame(frame);
})();