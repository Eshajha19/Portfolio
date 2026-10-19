/* ════════════════════════════════════════════
   ESHA JHA — PORTFOLIO SCRIPTS
   Features: Particle constellation, role rotator,
   magnetic buttons, scroll reveals, card glow,
   timeline navigation, dynamic navbar
   ════════════════════════════════════════════ */

// ═══════ 0. COLOR THEME ═══════
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle?.querySelector('i');
let savedTheme = 'dark';

try {
    savedTheme = window.localStorage.getItem('portfolio-theme') || 'dark';
} catch (error) {
    console.warn('Unable to read the saved color theme.', error);
}

function applyTheme(theme, persist = false) {
    const isLight = theme === 'light';
    document.documentElement.dataset.theme = isLight ? 'light' : 'dark';
    themeToggle?.setAttribute('aria-pressed', String(isLight));
    themeToggle?.setAttribute('aria-label', `Switch to ${isLight ? 'dark' : 'light'} mode`);
    themeToggle?.setAttribute('title', `Switch to ${isLight ? 'dark' : 'light'} mode`);
    if (themeIcon) {
        themeIcon.className = `fas fa-${isLight ? 'moon' : 'sun'}`;
    }

    if (persist) {
        try {
            window.localStorage.setItem('portfolio-theme', isLight ? 'light' : 'dark');
        } catch (error) {
            console.warn('Unable to save the selected color theme.', error);
        }
    }
}

applyTheme(savedTheme);
themeToggle?.addEventListener('click', () => {
    applyTheme(document.documentElement.dataset.theme === 'light' ? 'dark' : 'light', true);
});

// ═══════ 1. INTERACTIVE PARTICLE CONSTELLATION ═══════
// Signature feature: particles form neural-network-like connections near the cursor
const canvas = document.getElementById('constellation');
const ctx = canvas.getContext('2d');
let particles = [];
let mouse = { x: -1000, y: -1000 };
let w, h;
const PARTICLE_COUNT = 100;
const CONNECTION_DIST = 150;
const MOUSE_RADIUS = 200;

function initCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            size: Math.random() * 1.5 + 0.5,
            baseAlpha: Math.random() * 0.4 + 0.1
        });
    }
}

function drawConstellation() {
    ctx.clearRect(0, 0, w, h);

    particles.forEach((p, i) => {
        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Distance to mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const distToMouse = Math.sqrt(dx * dx + dy * dy);

        // Glow brighter near mouse
        const alpha = distToMouse < MOUSE_RADIUS
            ? p.baseAlpha + (1 - distToMouse / MOUSE_RADIUS) * 0.6
            : p.baseAlpha;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 255, 218, ${alpha})`;
        ctx.fill();

        // Connect to nearby particles (only when near mouse for performance)
        if (distToMouse < MOUSE_RADIUS * 1.5) {
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const d = Math.sqrt((p.x - p2.x) ** 2 + (p.y - p2.y) ** 2);
                if (d < CONNECTION_DIST) {
                    const lineAlpha = (1 - d / CONNECTION_DIST) * 0.25;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.strokeStyle = `rgba(100, 255, 218, ${lineAlpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        // Draw line to mouse if close
        if (distToMouse < MOUSE_RADIUS) {
            const lineAlpha = (1 - distToMouse / MOUSE_RADIUS) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${lineAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
    });

    requestAnimationFrame(drawConstellation);
}

document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('resize', initCanvas);
initCanvas();
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawConstellation();
}


// ═══════ 2. CUSTOM CURSOR ═══════
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');

if (cursor && cursorDot) {
    let cursorVisible = false;

    document.addEventListener('mousemove', e => {
        if (!cursorVisible) { cursor.classList.add('visible'); cursorVisible = true; }

        cursorDot.style.left = e.clientX + 'px';
        cursorDot.style.top = e.clientY + 'px';

        requestAnimationFrame(() => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
    });

    // Hover detection
    const hoverTargets = 'a, button, .btn-primary, .btn-ghost, .featured-card, .compact-card, .timeline-card, .achievement-card, .cert-card, .bento-card, .stat, .social-bar a, .timeline-arrow';
    document.querySelectorAll(hoverTargets).forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('hovered'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hovered'));
    });
}


// ═══════ 3. ROLE ROTATOR (Typed effect) ═══════
const roles = ['AI Engineer', 'Web Developer', 'Hackathon Champion'];
const rotatorEl = document.getElementById('roleRotator');
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeRole() {
    if (!rotatorEl) return;
    const current = roles[roleIndex];

    if (!isDeleting) {
        rotatorEl.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        if (charIndex === current.length) {
            // Pause before deleting
            setTimeout(() => { isDeleting = true; typeRole(); }, 2000);
            return;
        }
    } else {
        rotatorEl.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        if (charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
    }

    const speed = isDeleting ? 40 : 80;
    setTimeout(typeRole, speed);
}

typeRole();

// ═══════ 3. ENCOURAGEMENT NOTE ═══════
const encouragementMessage = document.getElementById('encouragementMessage');
const encouragementMessages = [
    'Keep showing up. Your next idea matters.',
    'Small steps today. Big things tomorrow.',
    'Keep learning. Keep building.',
    'You are closer than you think.'
];

if (encouragementMessage && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let encouragementIndex = 0;

    window.setInterval(() => {
        encouragementMessage.classList.add('changing');
        window.setTimeout(() => {
            encouragementIndex = (encouragementIndex + 1) % encouragementMessages.length;
            encouragementMessage.textContent = encouragementMessages[encouragementIndex];
            encouragementMessage.classList.remove('changing');
        }, 350);
    }, 4600);
}


// ═══════ 4. NAVIGATION — Hide/Show + Active + Logo ═══════
const nav = document.getElementById('mainNav');
const navLogo = document.getElementById('navLogo');
const navLinks = document.querySelectorAll('.nav-links a');
const allSections = document.querySelectorAll('section, header');
let lastScrollY = 0;
let ticking = false;

function updateScrollProgress() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0;
    document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
}

function handleScroll() {
    const scrollY = window.scrollY;
    const heroHeight = document.getElementById('hero')?.offsetHeight || 600;
    updateScrollProgress();

    // Hide/show on scroll direction
    if (scrollY > lastScrollY && scrollY > 200) {
        nav.classList.add('nav-hidden');
    } else {
        nav.classList.remove('nav-hidden');
    }

    // Scrolled style
    if (scrollY > 80) {
        nav.classList.add('nav-scrolled');
    } else {
        nav.classList.remove('nav-scrolled');
    }

    // Logo visibility (show after hero)
    if (scrollY > heroHeight * 0.7) {
        navLogo.classList.add('visible');
    } else {
        navLogo.classList.remove('visible');
    }

    // Active link highlighting
    let currentSection = '';
    allSections.forEach(section => {
        const top = section.offsetTop - 200;
        if (scrollY >= top) {
            currentSection = section.getAttribute('id') || '';
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href && currentSection && href.includes(currentSection)) {
            link.classList.add('active');
        }
    });

    lastScrollY = scrollY;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(handleScroll);
        ticking = true;
    }
});
window.addEventListener('resize', updateScrollProgress);
updateScrollProgress();


// ═══════ 5. SCROLL REVEAL — Staggered ═══════
const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            // Stagger siblings
            const parent = entry.target.parentNode;
            const siblings = parent.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
            const idx = Array.from(siblings).indexOf(entry.target);
            const delay = idx * 120; // 120ms between each

            setTimeout(() => {
                entry.target.classList.add('revealed');
            }, Math.min(delay, 600)); // Cap at 600ms

            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealElements.forEach(el => revealObserver.observe(el));


// ═══════ 6. FEATURED CARD GLOW EFFECT ═══════
document.querySelectorAll('.featured-card').forEach(card => {
    const glow = card.querySelector('.featured-card-glow');
    if (!glow) return;

    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        glow.style.setProperty('--glow-x', x + '%');
        glow.style.setProperty('--glow-y', y + '%');
    });
});


// ═══════ 7. MAGNETIC BUTTONS ═══════
document.querySelectorAll('.magnetic-btn').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
        btn.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        setTimeout(() => { btn.style.transition = ''; }, 400);
    });

    btn.addEventListener('mouseenter', () => {
        btn.style.transition = 'none';
    });
});


// ═══════ 8. HACKATHON TIMELINE NAV ═══════
const timelineTrack = document.getElementById('timelineTrack');
const prevBtn = document.querySelector('.timeline-prev');
const nextBtn = document.querySelector('.timeline-next');

if (timelineTrack && prevBtn && nextBtn) {
    const scrollAmount = 324; // card width + gap

    prevBtn.addEventListener('click', () => {
        timelineTrack.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
        timelineTrack.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
}


// ═══════ 9. SMOOTH SCROLL FOR NAV LINKS ═══════
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
        const target = document.querySelector(link.getAttribute('href'));
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});


// ═══════ 10. ORBITING SKILLS — JS Positioned, Always Horizontal ═══════
(function () {
    const orbitContainer = document.getElementById('skillsOrbit');
    const orbitItems = document.querySelectorAll('.orbit-item');
    if (!orbitItems.length || !orbitContainer) return;

    const RING1_SPEED = 0.0003;
    const RING2_SPEED = 0.00022;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let startTime = null;

    function getRadii() {
        const size = orbitContainer.offsetWidth;
        // Ring 1 = ~60% of half-width, Ring 2 = ~86% of half-width
        return {
            r1: size * 0.30,
            r2: size * 0.43
        };
    }

    let radii = getRadii();
    window.addEventListener('resize', () => { radii = getRadii(); });

    function animateOrbit(timestamp) {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        orbitItems.forEach(item => {
            const ring = parseInt(item.dataset.ring);
            const index = parseInt(item.dataset.i);
            const total = 4;

            const radius = ring === 1 ? radii.r1 : radii.r2;
            const speed = ring === 1 ? RING1_SPEED : -RING2_SPEED;
            const baseAngle = (index / total) * Math.PI * 2;
            const angle = baseAngle + elapsed * speed;

            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            item.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
        });

        if (!prefersReducedMotion) {
            requestAnimationFrame(animateOrbit);
        }
    }

    requestAnimationFrame(animateOrbit);
})();


// ═══════ 11. CONTACT FORM HANDLER ═══════
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');
const formSubmitBtn = document.getElementById('formSubmitBtn');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btnSpan = formSubmitBtn.querySelector('span');
        const originalText = btnSpan.textContent;
        btnSpan.textContent = 'Sending...';
        formSubmitBtn.disabled = true;
        formStatus.textContent = '';
        formStatus.className = 'form-status';

        try {
            const res = await fetch(contactForm.action, {
                method: 'POST',
                body: new FormData(contactForm),
                headers: { 'Accept': 'application/json' }
            });

            if (res.ok) {
                formStatus.textContent = '✨ Message sent! I\'ll get back to you soon.';
                formStatus.classList.add('success');
                contactForm.reset();
            } else {
                formStatus.textContent = 'Oops, something went wrong. Try emailing me directly!';
                formStatus.classList.add('error');
            }
        } catch (err) {
            formStatus.textContent = 'Network error. Please try again later.';
            formStatus.classList.add('error');
        }

        btnSpan.textContent = originalText;
        formSubmitBtn.disabled = false;
    });
}
