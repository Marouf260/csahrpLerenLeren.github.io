// Initialize Highlight.js
document.addEventListener('DOMContentLoaded', (event) => {
    hljs.highlightAll();
});

// Active Link Handling
const currentPath = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    const href = link.getAttribute('href').split('/').pop();
    if (href === currentPath) {
        link.classList.add('active');
        // Auto-scroll sidebar to active link
        setTimeout(() => {
            link.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
});

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.menu-toggle');
    const overlay = document.querySelector('.sidebar-overlay');

    if (sidebar && toggle) {
        sidebar.classList.toggle('active');
        toggle.classList.toggle('active');
        if (overlay) overlay.classList.toggle('active');
    }
}

// Close mobile menu when clicking overlay
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('sidebar-overlay')) {
        toggleMobileMenu();
    }
});

// Smooth Scroll for Anchors
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            e.preventDefault();
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
            // Close mobile menu if open
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                toggleMobileMenu();
            }
        }
    });
});

// Connect Hero Command to Terminal
const heroCmd = document.getElementById('hero-command');
if (heroCmd) {
    heroCmd.addEventListener('click', () => {
        // Ensure terminal exists and is toggled
        if (typeof toggleTerminal === 'function') {
            toggleTerminal();

            // Optional: Auto-type the command for extra flair
            setTimeout(() => {
                const input = document.getElementById('term-input');
                if (input) {
                    input.value = "dotnet new career --level senior";
                    input.focus();
                }
            }, 300);
        }
    });
}

// Premium Mouse Move Effect for Cards
document.addEventListener('mousemove', (e) => {
    const cards = document.querySelectorAll('.exercise-box');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

// --- PROFESSIONAL FEATURES START ---

// 0. Motion System Init
document.addEventListener('DOMContentLoaded', () => {
    // A. Apply Animated Gradient to H1
    const h1 = document.querySelector('h1');
    if (h1) h1.classList.add('gradient-text-anim');

    // B. Scroll Reveal Observer
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('h2, h3, p, .exercise-box, pre').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });

    // C. 3D Tilt Effect - DISABLED (Handled by visuals.js now)
    /*
    document.querySelectorAll('.exercise-box').forEach(card => {
        card.classList.add('tilt-card');

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Calculate rotation (max 10deg)
            const xRot = -1 * ((y - rect.height / 2) / rect.height * 20);
            const yRot = (x - rect.width / 2) / rect.width * 20;

            card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
    */
});

// 1. Reading Progress Bar
const progressBarMarkup = `
    <div class="reading-progress-container">
        <div class="reading-progress-bar" id="reading-progress"></div>
    </div>
`;
document.body.insertAdjacentHTML('afterbegin', progressBarMarkup);

window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    const bar = document.getElementById('reading-progress');
    if (bar) bar.style.width = `${progress}%`;
});

// 2. Dynamic Footer Injection
const currentYear = new Date().getFullYear();
const footerMarkup = `
    <footer class="site-footer">
        <div class="footer-content">
            <div class="footer-brand">⚡ C# MASTERCLASS</div>
            <div class="footer-links">
                <a href="#" class="footer-link">Over ons</a>
                <a href="#" class="footer-link">Privacy</a>
                <a href="#" class="footer-link">Contact</a>
                <a href="#" class="footer-link">Roadmap</a>
            </div>
            <div class="footer-copyright">
                &copy; ${currentYear} C# Academy. All rights reserved. <br>
                <span style="font-size:0.7em; opacity:0.6;">Designed with C# Academy</span>
            </div>
        </div>
    </footer>
`;

// Inject footer into .main-content if it exists
const mainContent = document.querySelector('.main-content');
if (mainContent) {
    mainContent.insertAdjacentHTML('beforeend', footerMarkup);
}

// 3. Copy Code Button Logic
document.querySelectorAll('pre').forEach(pre => {
    // Check if button already exists
    if (!pre.querySelector('.copy-btn')) {
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = 'Copy';

        btn.addEventListener('click', () => {
            const code = pre.querySelector('code');
            if (code) {
                navigator.clipboard.writeText(code.innerText).then(() => {
                    btn.textContent = 'Copied!';
                    setTimeout(() => btn.textContent = 'Copy', 2000);
                });
            }
        });

        pre.appendChild(btn);
    }
});
