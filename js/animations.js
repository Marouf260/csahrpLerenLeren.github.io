// Professional Scroll Animation System
// Adds smooth reveal animations as elements enter viewport

document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for scroll reveals
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: unobserve after animation to improve performance
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with .reveal class
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // Add reveal class to elements that should animate on scroll
    const animateOnScroll = document.querySelectorAll(
        '.exercise-box, .project-card, .callout, .alert, pre, .theory-box'
    );

    animateOnScroll.forEach((el, index) => {
        // Add reveal class if not already present
        if (!el.classList.contains('reveal')) {
            el.classList.add('reveal');
            observer.observe(el);
        }
    });

    // Parallax effect for background elements
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const scrolled = window.pageYOffset;
                const parallaxElements = document.querySelectorAll('.bg-orb, .hero-bg');

                parallaxElements.forEach(el => {
                    const speed = el.classList.contains('orb-1') ? 0.3 : 0.5;
                    el.style.transform = `translateY(${scrolled * speed}px)`;
                });

                ticking = false;
            });
            ticking = true;
        }
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    /* Tilt disabled
    // Add hover tilt effect to cards
    const cards = document.querySelectorAll('.exercise-box, .project-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    */

    // Typing effect for hero command (if exists)
    const heroCommand = document.getElementById('hero-command');
    if (heroCommand) {
        const originalText = heroCommand.textContent;
        heroCommand.textContent = '';

        let i = 0;
        const typeWriter = () => {
            if (i < originalText.length) {
                heroCommand.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        };

        setTimeout(typeWriter, 500);
    }

    console.log('🎨 Professional animations loaded');
});
