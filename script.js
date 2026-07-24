/**
 * ADDT Website — Interactive Scripts
 * Pill rain on canvas, scroll effects, card mouse tracking, animations
 */

document.addEventListener('DOMContentLoaded', () => {
    initPills();
    initNavbar();
    initCardMouseTracking();
    initScrollReveal();
});

/* ============================================
   Pill Rain — all drawn on one canvas
   ============================================ */
function initPills() {
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');

    let pills = [];
    let mouseX = -1000;
    let mouseY = -1000;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Pill {
        constructor() {
            this.reset(true);
        }

        reset(initial) {
            this.x = Math.random() * canvas.width;
            this.y = initial
                ? Math.random() * canvas.height - 60
                : -60 - Math.random() * 300;
            this.size = Math.random() * 20 + 12;
            this.speed = Math.random() * 30 + 15;
            this.wobbleAmp = Math.random() * 2.5 + 1.0;
            this.wobbleSpeed = Math.random() * 0.04 + 0.015;
            this.wobbleOffset = Math.random() * Math.PI * 2;
            this.rotation = Math.random() * 360;
            this.rotSpeed = (Math.random() - 0.5) * 8;
            this.alpha = Math.random() * 0.4 + 0.3;
            this.flickerSpeed = Math.random() * 0.04 + 0.01;
            this.flickerPhase = Math.random() * Math.PI * 2;
            this.frame = 0;
        }

        update() {
            this.frame++;
            this.y += this.speed;
            this.x += Math.sin(this.frame * this.wobbleSpeed + this.wobbleOffset) * this.wobbleAmp;
            this.rotation += this.rotSpeed;

            this.flickerPhase += this.flickerSpeed;
            const flicker = Math.sin(this.flickerPhase) * 0.08;
            this.alpha = Math.max(0.2, Math.min(0.75, this.alpha + flicker));

            // Mouse push
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 100 && dist > 0) {
                const force = (100 - dist) / 100 * 2.5;
                this.x += (dx / dist) * force;
                this.y += (dy / dist) * force;
            }

            if (this.y > canvas.height + 60) {
                this.y = -60;
                this.x = Math.random() * canvas.width;
            }
            if (this.x < -60) this.x = canvas.width + 40;
            if (this.x > canvas.width + 60) this.x = -40;
        }

        draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);

            ctx.font = this.size + 'px serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Purple glow
            ctx.shadowColor = 'rgba(168, 85, 247, 0.7)';
            ctx.shadowBlur = 14;
            ctx.fillText('💊', 0, 0);

            // Sharp second pass
            ctx.shadowBlur = 0;
            ctx.fillText('💊', 0, 0);

            ctx.restore();
        }
    }

    function createPills() {
        const count = Math.floor((canvas.width * canvas.height) / 2500);
        pills = [];
        for (let i = 0; i < count; i++) {
            pills.push(new Pill());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Purple fog blobs
        for (let i = 0; i < 6; i++) {
            const fx = (Math.sin(Date.now() * 0.0001 + i * 1.7) * 0.5 + 0.5) * canvas.width;
            const fy = (Math.cos(Date.now() * 0.00013 + i * 2.1) * 0.5 + 0.5) * canvas.height;
            const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 200);
            g.addColorStop(0, 'rgba(139, 92, 246, 0.04)');
            g.addColorStop(1, 'rgba(139, 92, 246, 0)');
            ctx.fillStyle = g;
            ctx.fillRect(fx - 200, fy - 200, 400, 400);
        }

        pills.forEach(p => {
            p.update();
            p.draw(ctx);
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        createPills();
    });

    window.addEventListener('mousemove', function (e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('touchmove', function (e) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
    }, { passive: true });

    resize();
    createPills();
    animate();
}

/* ============================================
   Navbar Scroll Effect
   ============================================ */
function initNavbar() {
    var navbar = document.getElementById('navbar');

    window.addEventListener('scroll', function () {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, { passive: true });
}

/* ============================================
   Card Mouse Tracking (glow effect)
   ============================================ */
function initCardMouseTracking() {
    var cards = document.querySelectorAll('.about-card, .project-card, .team-card');

    cards.forEach(function (card) {
        card.addEventListener('mousemove', function (e) {
            var rect = card.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
        });

        card.addEventListener('mouseleave', function () {
            card.style.setProperty('--mouse-x', '50%');
            card.style.setProperty('--mouse-y', '50%');
        });
    });
}

/* ============================================
   Scroll Reveal Animation
   ============================================ */
function initScrollReveal() {
    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    var revealElements = document.querySelectorAll(
        '.about-card, .project-card, .team-card, .patient-item, .connect-card, .section-header'
    );

    revealElements.forEach(function (el, index) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1) ' + (index * 0.05) + 's, transform 0.6s cubic-bezier(0.4, 0, 0.2, 1) ' + (index * 0.05) + 's';
        observer.observe(el);
    });
}

/* ============================================
   Smooth parallax on hero orbs
   ============================================ */
window.addEventListener('mousemove', function (e) {
    var orbs = document.querySelectorAll('.orb');
    var x = (e.clientX / window.innerWidth - 0.5) * 20;
    var y = (e.clientY / window.innerHeight - 0.5) * 20;

    if (orbs[0]) {
        orbs[0].style.transform = 'translate(' + (x * 1.5) + 'px, ' + (y * 1.5) + 'px)';
    }
    if (orbs[1]) {
        orbs[1].style.transform = 'translate(' + (x * -1) + 'px, ' + (y * -1) + 'px)';
    }
    if (orbs[2]) {
        orbs[2].style.transform = 'translate(calc(-50% + ' + (x * 0.5) + 'px), calc(-50% + ' + (y * 0.5) + 'px))';
    }
});
