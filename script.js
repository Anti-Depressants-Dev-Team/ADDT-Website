/**
 * ADDT Website — Interactive Scripts
 * Particle background, scroll effects, card mouse tracking, animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initNavbar();
    initCardMouseTracking();
    initScrollReveal();
});

/* ============================================
   Pill Rain Background — 💊 falling everywhere
   ============================================ */
function initParticles() {
    const container = document.getElementById('particles');
    const ctx = container.getContext('2d');

    // We'll use the canvas for a subtle purple fog behind the pills
    let pills = [];
    let animFrame;
    let mouseX = -1000;
    let mouseY = -1000;

    function resize() {
        container.width = window.innerWidth;
        container.height = window.innerHeight;
    }

    // ── Pill class ──────────────────────────────────
    class Pill {
        constructor(spawnAbove = false) {
            this.el = document.createElement('span');
            this.el.textContent = '💊';
            this.el.style.cssText = `
                position: fixed;
                pointer-events: none;
                z-index: 0;
                will-change: transform, opacity;
                line-height: 1;
                text-shadow: 0 0 12px rgba(168,85,247,0.6), 0 0 30px rgba(139,92,246,0.3);
            `;
            document.body.appendChild(this.el);
            this.reset(spawnAbove);
        }

        reset(spawnAbove) {
            this.size = Math.random() * 1.2 + 0.7;          // rem (font-size only, not in transform)
            this.x = Math.random() * window.innerWidth;
            this.y = spawnAbove
                ? -(Math.random() * window.innerHeight)
                : Math.random() * window.innerHeight;
            this.speedY = Math.random() * 1.4 + 0.5;        // px per frame @ 60fps
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.rotation = Math.random() * 360;
            this.rotationSpeed = (Math.random() - 0.5) * 1.5; // degrees per frame
            this.wobbleAmp = Math.random() * 30 + 10;
            this.wobbleSpeed = Math.random() * 0.02 + 0.005;
            this.wobbleOffset = Math.random() * Math.PI * 2;
            this.opacity = Math.random() * 0.45 + 0.25;     // 0.25 – 0.7 — much more visible
            this.opacityFlicker = Math.random() * 0.06;
            this.opacityPhase = Math.random() * Math.PI * 2;
            this.blur = Math.random() > 0.85 ? 'blur(0.5px)' : 'none';
            this.frame = 0;
            this.syncEl();
        }

        syncEl() {
            // NOTE: no scale() — fontSize handles pill size
            this.el.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
            this.el.style.opacity = this.opacity;
            this.el.style.fontSize = `${this.size}rem`;
            this.el.style.filter = this.blur;
        }

        update() {
            this.frame++;
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.frame * this.wobbleSpeed + this.wobbleOffset) * 0.4;
            this.rotation += this.rotationSpeed;

            // Flicker opacity
            this.opacityPhase += 0.03;
            const flicker = Math.sin(this.opacityPhase) * this.opacityFlicker;

            // Mouse repulsion — pills avoid the cursor
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120 && dist > 0) {
                const force = (120 - dist) / 120 * 2;
                this.x += (dx / dist) * force;
                this.y += (dy / dist) * force;
            }

            // Wrap around when off screen
            if (this.y > window.innerHeight + 60) {
                this.y = -60;
                this.x = Math.random() * window.innerWidth;
                this.rotation = Math.random() * 360;
            }
            if (this.x < -60) this.x = window.innerWidth + 40;
            if (this.x > window.innerWidth + 60) this.x = -40;

            // Apply flicker with clamping
            this.opacity = Math.max(0.15, Math.min(0.75, this.opacity + flicker));

            this.syncEl();
        }

        destroy() {
            if (this.el && this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
        }
    }

    // ── Fog layer on canvas behind pills ───────────
    let fogParticles = [];
    class FogParticle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * container.width;
            this.y = Math.random() * container.height;
            this.radius = Math.random() * 120 + 40;
            this.alpha = Math.random() * 0.04 + 0.01;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = (Math.random() - 0.5) * 0.2;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            if (this.x < -200) this.x = container.width + 200;
            if (this.x > container.width + 200) this.x = -200;
            if (this.y < -200) this.y = container.height + 200;
            if (this.y > container.height + 200) this.y = -200;
        }
        draw() {
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
            gradient.addColorStop(0, `rgba(139, 92, 246, ${this.alpha})`);
            gradient.addColorStop(0.5, `rgba(139, 92, 246, ${this.alpha * 0.3})`);
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function createFog() {
        const count = Math.floor((container.width * container.height) / 40000);
        fogParticles = [];
        for (let i = 0; i < count; i++) {
            fogParticles.push(new FogParticle());
        }
    }

    // ── Spawn / manage pills ───────────────────────
    function createPills() {
        const count = Math.floor((window.innerWidth * window.innerHeight) / 5000);
        // Remove old pills
        pills.forEach(p => p.destroy());
        pills = [];
        for (let i = 0; i < count; i++) {
            pills.push(new Pill(true)); // spawn scattered above viewport
        }
    }

    function animate() {
        // Clear canvas & draw fog
        ctx.clearRect(0, 0, container.width, container.height);
        fogParticles.forEach(f => {
            f.update();
            f.draw();
        });

        // Update pill positions
        pills.forEach(p => p.update());

        animFrame = requestAnimationFrame(animate);
    }

    // ── Events ─────────────────────────────────────
    window.addEventListener('resize', () => {
        resize();
        createFog();
        createPills();
    });

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }, { passive: true });

    // ── Kick off ───────────────────────────────────
    resize();
    createFog();
    createPills();
    animate();
}

/* ============================================
   Navbar Scroll Effect
   ============================================ */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        if (scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = scrollY;
    }, { passive: true });
}

/* ============================================
   Card Mouse Tracking (glow effect)
   ============================================ */
function initCardMouseTracking() {
    const cards = document.querySelectorAll('.about-card, .project-card, .team-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', `${x}%`);
            card.style.setProperty('--mouse-y', `${y}%`);
        });

        card.addEventListener('mouseleave', () => {
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });
    });
}

/* ============================================
   Scroll Reveal Animation
   ============================================ */
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe section elements
    const revealElements = document.querySelectorAll(
        '.about-card, .project-card, .team-card, .patient-item, .connect-card, .section-header'
    );

    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.05}s`;
        observer.observe(el);
    });
}

/* ============================================
   Smooth parallax on hero orbs
   ============================================ */
window.addEventListener('mousemove', (e) => {
    const orbs = document.querySelectorAll('.orb');
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;

    if (orbs[0]) {
        orbs[0].style.transform = `translate(${x * 1.5}px, ${y * 1.5}px)`;
    }
    if (orbs[1]) {
        orbs[1].style.transform = `translate(${x * -1}px, ${y * -1}px)`;
    }
    if (orbs[2]) {
        orbs[2].style.transform = `translate(calc(-50% + ${x * 0.5}px), calc(-50% + ${y * 0.5}px))`;
    }
});
