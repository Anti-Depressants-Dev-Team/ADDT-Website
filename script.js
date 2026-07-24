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
   Particle Background
   ============================================ */
function initParticles() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    let particles = [];
    let animFrame;
    let mouseX = 0;
    let mouseY = 0;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedY = -(Math.random() * 0.4 + 0.15);
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            this.opacitySpeed = Math.random() * 0.003 + 0.001;
            this.opacityPhase = Math.random() * Math.PI * 2;
            this.purple = Math.random() > 0.5;
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;

            // Gentle mouse attraction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.x += dx * 0.0003;
                this.y += dy * 0.0003;
            }

            // Pulse opacity
            this.opacityPhase += this.opacitySpeed;
            if (this.opacityPhase > Math.PI * 2) this.opacityPhase -= Math.PI * 2;

            if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                this.reset();
            }
        }

        draw() {
            const pulse = Math.sin(this.opacityPhase) * 0.15;
            const alpha = Math.max(0, Math.min(1, this.opacity + pulse));
            const color = this.purple
                ? `rgba(139, 92, 246, ${alpha})`
                : `rgba(168, 85, 247, ${alpha * 0.7})`;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();

            // Occasional glow
            if (this.purple && alpha > 0.35) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(139, 92, 246, ${alpha * 0.1})`;
                ctx.fill();
            }
        }
    }

    function createParticles() {
        const count = Math.floor((canvas.width * canvas.height) / 12000);
        particles = [];
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Subtle grid lines
        ctx.strokeStyle = 'rgba(139, 92, 246, 0.02)';
        ctx.lineWidth = 0.5;
        const gridSize = 80;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        animFrame = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        createParticles();
    });

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('touchmove', (e) => {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }, { passive: true });

    resize();
    createParticles();
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
