/**
 * 3D VISUALS ENGINE V2 (Ultra Premium - Smoothed)
 * Handles Card Tilt, Parallax, and Dynamic Particle Network
 */

document.addEventListener('DOMContentLoaded', () => {
    initTilt();
    initParallax();
    initParticleNetwork();
    initScrollReveal();
});

// --- 1. 3D Card Tilt (Smoothed with Lerp) ---
function initTilt() {
    // Tilt disabled manually
    /*
    const cards = document.querySelectorAll('.exercise-box, .hero-container');

    cards.forEach(card => {
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;
        let animationFrame;

        // Smooth Animation Loop for each card
        const update = () => {
            // Lerp (Linear Interpolation) for smoothness: 0.1 = speed factor
            currentX += (targetX - currentX) * 0.1;
            currentY += (targetY - currentY) * 0.1;

            if (Math.abs(targetX - currentX) > 0.01 || Math.abs(targetY - currentY) > 0.01) {
                card.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) scale3d(1.02, 1.02, 1.02)`;
                animationFrame = requestAnimationFrame(update);
            }
        };

        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Cap rotation to avoid extreme flips
            const rotateX = ((y - centerY) / centerY) * -5; // Reduced intensity
            const rotateY = ((x - centerX) / centerX) * 5;

            targetX = rotateX;
            targetY = rotateY;

            // Start loop if not running
            if (!animationFrame) animationFrame = requestAnimationFrame(update);
        });

        card.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
            if (!animationFrame) animationFrame = requestAnimationFrame(update);
        });
    });
    */
}

// --- 2. Floating Parallax (Smoothed) ---
function initParallax() {
    const shapes = document.querySelectorAll('.shape, .bg-orb, .shape-3d');
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    // Global loop for parallax
    function animateParallax() {
        currentX += (targetX - currentX) * 0.05; // Slower damping
        currentY += (targetY - currentY) * 0.05;

        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.5; // Reduced speed
            const rotation = currentX * 0.2;
            shape.style.transform = `translateX(${currentX * speed}px) translateY(${currentY * speed}px) rotate(${rotation}deg)`;
        });

        requestAnimationFrame(animateParallax);
    }
    animateParallax();

    document.addEventListener('mousemove', e => {
        targetX = (window.innerWidth / 2 - e.pageX) / 50;
        targetY = (window.innerHeight / 2 - e.pageY) / 50;
    });
}

// --- 3. Scroll Reveal (Fly-in) ---
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.exercise-box').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)'; // Removed rotateX(10deg)
        el.style.transition = `all 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) ${index * 0.15}s`; // Smooth cubic-bezier
        observer.observe(el);
    });

    const style = document.createElement('style');
    style.innerHTML = `
        .exercise-box.visible {
            opacity: 1 !important;
            transform: translateY(0) !important; /* Removed rotateX(0) */
        }
    `;
    document.head.appendChild(style);
}

// --- 4. Particle Network (Constellation) ---
function initParticleNetwork() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    Object.assign(canvas.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        zIndex: '-5', pointerEvents: 'none'
    });
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    const particleCount = window.innerWidth < 768 ? 20 : 50; // Performance optimization for mobile

    const resize = () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.vy = (Math.random() - 0.5) * 0.3;
            this.size = Math.random() * 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.5)';
            ctx.fill();
        }
    }

    for (let i = 0; i < particleCount; i++) particles.push(new Particle());

    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', e => { mouse.x = e.x; mouse.y = e.y; });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
            particles.forEach(p2 => {
                const dx = p.x - p2.x, dy = p.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 - dist / 1000})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
            if (mouse.x) {
                const dx = p.x - mouse.x, dy = p.y - mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 150) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(6, 182, 212, ${0.2 - dist / 1500})`;
                    ctx.lineWidth = 0.8;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        });
        requestAnimationFrame(animate);
    }
    animate();
}
