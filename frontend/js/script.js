// ============ TYPING ANIMATION ============
const roles = ['Full Stack Developer', 'Flutter Developer', 'Problem Solver', 'Creative Thinker'];
let roleIndex = 0, charIndex = 0, isDeleting = false;

function typeEffect() {
    const element = document.getElementById('typing-text');
    if (!element) return;
    const currentRole = roles[roleIndex];
    if (isDeleting) {
        element.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
    } else {
        element.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
    }
    let speed = isDeleting ? 50 : 100;
    if (!isDeleting && charIndex === currentRole.length) {
        speed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 500;
    }
    setTimeout(typeEffect, speed);
}

// ============ DARK MODE ============
function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    if (!toggle) return;
    if (localStorage.getItem('dark-mode') === 'true') {
        document.body.classList.add('dark-mode');
        toggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('dark-mode', isDark);
        toggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });
}

// ============ MOBILE MENU ============
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (!hamburger || !navLinks) return;
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ============ ACTIVE NAV LINK ============
function initActiveNav() {
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 200;
            if (window.scrollY >= sectionTop) current = section.getAttribute('id');
        });
        navItems.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) link.classList.add('active');
        });
        document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ============ BACK TO TOP ============
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ============ SCROLL ANIMATIONS ============
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// ============ COUNTER ANIMATION ============
function initCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                let current = 0;
                const increment = target / 50;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        entry.target.textContent = target;
                        clearInterval(timer);
                    } else {
                        entry.target.textContent = Math.floor(current);
                    }
                }, 40);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));
}

// ============ PROJECT FILTERS ============
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.dataset.filter;
            document.querySelectorAll('.project-card').forEach(card => {
                card.style.display = (filter === 'all' || card.dataset.category === filter) ? 'block' : 'none';
            });
        });
    });
}

// ============ CONTACT FORM ============
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();
        const formMessage = document.getElementById('form-message');

        if (!name || !email || !message) {
            formMessage.textContent = '⚠️ Please fill all fields.';
            formMessage.className = 'error';
            return;
        }

        const mailtoLink = `mailto:dharmashamvarthini29@gmail.com?subject=${encodeURIComponent(subject || 'Portfolio Contact')}&body=Name: ${encodeURIComponent(name)}%0AEmail: ${encodeURIComponent(email)}%0A%0A${encodeURIComponent(message)}`;
        window.open(mailtoLink, '_blank');

        formMessage.textContent = '✅ Email opened! Please send the message.';
        formMessage.className = 'success';
        form.reset();
    });
}

// ============ INITIALIZE ============
document.addEventListener('DOMContentLoaded', () => {
    typeEffect();
    initDarkMode();
    initMobileMenu();
    initActiveNav();
    initBackToTop();
    initScrollAnimations();
    initCounters();
    initFilters();
    initContactForm();
    console.log('🚀 Portfolio loaded!');
});