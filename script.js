/**
 * ADDT Website — Pill rain via CSS animations (GPU, zero lag)
 * No canvas rendering. No JS animation loops. Pure CSS @keyframes.
 */

document.addEventListener('DOMContentLoaded', function () {
    initPillRain();
    initNavbar();
    initCardMouseTracking();
    initScrollReveal();
});

function initPillRain() {
    // Replace canvas with a div container
    var canvas = document.getElementById('particles');
    if (canvas) canvas.remove();

    var container = document.createElement('div');
    container.id = 'pill-rain';
    document.body.insertBefore(container, document.body.firstChild);

    // Generate pill elements — each gets randomized CSS custom properties
    var count = 200;
    var frag = document.createDocumentFragment();

    for (var i = 0; i < count; i++) {
        var pill = document.createElement('span');
        pill.className = 'rain-pill';
        pill.textContent = '💊';
        pill.style.setProperty('--x', Math.random() * 100 + '%');
        pill.style.setProperty('--dur', (Math.random() * 4 + 3) + 's');
        pill.style.setProperty('--delay', (Math.random() * 6) + 's');
        pill.style.setProperty('--size', (Math.random() * 1.4 + 0.8) + 'rem');
        pill.style.setProperty('--drift', (Math.random() * 60 - 30) + 'px');
        pill.style.setProperty('--rot', (Math.random() * 360) + 'deg');
        pill.style.setProperty('--rot-end', (Math.random() * 720 - 360) + 'deg');
        frag.appendChild(pill);
    }

    container.appendChild(frag);
}

function initNavbar() {
    var nav = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
        nav.classList[window.scrollY > 50 ? 'add' : 'remove']('scrolled');
    }, { passive: true });
}

function initCardMouseTracking() {
    var cards = document.querySelectorAll('.about-card, .project-card, .team-card');
    for (var i = 0; i < cards.length; i++) {
        (function (c) {
            c.addEventListener('mousemove', function (e) {
                var r = c.getBoundingClientRect();
                c.style.setProperty('--mouse-x', ((e.clientX - r.left) / r.width * 100) + '%');
                c.style.setProperty('--mouse-y', ((e.clientY - r.top) / r.height * 100) + '%');
            });
            c.addEventListener('mouseleave', function () {
                c.style.setProperty('--mouse-x', '50%');
                c.style.setProperty('--mouse-y', '50%');
            });
        })(cards[i]);
    }
}

function initScrollReveal() {
    if (!('IntersectionObserver' in window)) return;
    var obs = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                entries[i].target.style.opacity = '1';
                entries[i].target.style.transform = 'translateY(0)';
                obs.unobserve(entries[i].target);
            }
        }
    }, { threshold: 0.1 });
    var els = document.querySelectorAll('.about-card, .project-card, .team-card, .patient-item, .connect-card, .section-header');
    for (var j = 0; j < els.length; j++) {
        els[j].style.opacity = '0';
        els[j].style.transform = 'translateY(30px)';
        els[j].style.transition = 'opacity 0.6s ease ' + (j * 0.05) + 's, transform 0.6s ease ' + (j * 0.05) + 's';
        obs.observe(els[j]);
    }
}

window.addEventListener('mousemove', function (e) {
    var orbs = document.querySelectorAll('.orb');
    var x = (e.clientX / window.innerWidth - 0.5) * 20;
    var y = (e.clientY / window.innerHeight - 0.5) * 20;
    if (orbs[0]) orbs[0].style.transform = 'translate(' + (x * 1.5) + 'px, ' + (y * 1.5) + 'px)';
    if (orbs[1]) orbs[1].style.transform = 'translate(' + (x * -1) + 'px, ' + (y * -1) + 'px)';
    if (orbs[2]) orbs[2].style.transform = 'translate(calc(-50% + ' + (x * 0.5) + 'px), calc(-50% + ' + (y * 0.5) + 'px))';
});
