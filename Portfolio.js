// Portfolio JavaScript - Advanced Features and Interactions

class PortfolioApp {
    constructor() {
        this.currentTheme = 'light';
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeTheme();
        this.setupAnimatedBackground();
        this.setupScrollAnimations();
        this.setupNavigation();
        this.setupContactForm();
        this.setupSkillAnimations();
        this.setupTypingEffect();
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('portfolio-theme') || 'light';
        this.setTheme(savedTheme);
    }

    setTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('portfolio-theme', theme);
        
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            if (theme === 'dark') {
                icon.textContent = 'light_mode';
            } else {
                icon.textContent = 'dark_mode';
            }
        }

        // Update animated background colors on theme switch
        if (this.particles && this.particles.length) {
            this.particles.forEach(p => p.color = this.generateParticleColor());
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    // Animated Background
    setupAnimatedBackground() {
        this.canvas = document.getElementById('bg-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.onResize();
        window.addEventListener('resize', this.debounce(() => this.onResize(), 200));
        window.addEventListener('mousemove', this.throttle((e) => this.onMouseMove(e), 50));

        const baseCount = window.innerWidth < 768 ? 70 : 130;
        this.createParticles(baseCount);
        this.animate();
    }

    onResize() {
        if (!this.canvas) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;
        this.canvas.width = Math.floor(window.innerWidth * dpr);
        this.canvas.height = Math.floor(window.innerHeight * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    onMouseMove(e) {
        // Subtle parallax via velocity shift
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        const dx = (e.clientX - cx) / cx;
        const dy = (e.clientY - cy) / cy;
        this.particles.forEach(p => {
            p.vx += dx * 0.02;
            p.vy += dy * 0.02;
        });
    }

    createParticles(count) {
        this.particles = new Array(count).fill(0).map(() => this.createParticle());
    }

    createParticle() {
        const speed = Math.random() * 0.6 + 0.2;
        const angle = Math.random() * Math.PI * 2;
        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: Math.random() * 2 + 0.5,
            color: this.generateParticleColor(),
            alpha: Math.random() * 0.7 + 0.2
        };
    }

    generateParticleColor() {
        // Deep but bright palette depending on theme
        if (this.currentTheme === 'dark') {
            const palette = ['#00e5ff', '#7c4dff', '#b47cff'];
            return palette[Math.floor(Math.random() * palette.length)];
        } else {
            const palette = ['#7c4dff', '#00e5ff', '#ff9800'];
            return palette[Math.floor(Math.random() * palette.length)];
        }
    }

    animate() {
        if (!this.ctx || !this.canvas) return;
        this.animationId = requestAnimationFrame(() => this.animate());
        const { width, height } = this.canvas;
        this.ctx.clearRect(0, 0, width, height);

        // Draw soft gradient glow background for extra depth
        const gradient = this.ctx.createRadialGradient(
            width * 0.3, height * 0.2, 100,
            width * 0.7, height * 0.8, Math.max(width, height)
        );
        if (this.currentTheme === 'dark') {
            gradient.addColorStop(0, 'rgba(124,77,255,0.06)');
            gradient.addColorStop(0.5, 'rgba(0,229,255,0.05)');
            gradient.addColorStop(1, 'rgba(0,0,0,0)');
        } else {
            gradient.addColorStop(0, 'rgba(124,77,255,0.08)');
            gradient.addColorStop(0.5, 'rgba(0,229,255,0.06)');
            gradient.addColorStop(1, 'rgba(255,255,255,0)');
        }
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, width, height);

        // Update particles
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < -50) p.x = width + 50;
            if (p.x > width + 50) p.x = -50;
            if (p.y < -50) p.y = height + 50;
            if (p.y > height + 50) p.y = -50;
        }

        // Draw connecting lines between close particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const a = this.particles[i];
                const b = this.particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const alpha = (1 - dist / 120) * 0.35;
                    this.ctx.strokeStyle = `rgba(180, 124, 255, ${alpha})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw particles with glow
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.closePath();
            this.ctx.fillStyle = p.color;
            this.ctx.globalAlpha = p.alpha;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
            this.ctx.shadowBlur = 0;
        }
    }

    // Event Listeners Setup
    setupEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Mobile navigation toggle
        const navToggle = document.querySelector('.nav-toggle');
        const navMenu = document.querySelector('.nav-menu');
        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });
        }

        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu) navMenu.classList.remove('active');
                if (navToggle) navToggle.classList.remove('active');
            });
        });

        // Form submission
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
    }

    // Navigation Setup
    setupNavigation() {
        const navbar = document.querySelector('.navbar');
        let lastScrollTop = 0;

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Navbar background on scroll
            if (scrollTop > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }

            // Hide/show navbar on scroll
            if (scrollTop > lastScrollTop && scrollTop > 200) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });

        // Active navigation highlighting
        this.updateActiveNavigation();
        window.addEventListener('scroll', () => this.updateActiveNavigation());
    }

    updateActiveNavigation() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // Scroll Animations
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
        });

        // Add scroll-animate class to elements
        this.addScrollAnimateClass();
    }

    addScrollAnimateClass() {
        const elements = document.querySelectorAll('.skill-category, .project-card, .timeline-item, .contact-item');
        elements.forEach((el, index) => {
            el.classList.add('scroll-animate');
            el.style.animationDelay = `${index * 0.1}s`;
        });
    }

    // Skill Animations
    setupSkillAnimations() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        const skillObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target;
                    const width = progressBar.style.width;
                    progressBar.style.width = '0%';
                    
                    setTimeout(() => {
                        progressBar.style.width = width;
                    }, 200);
                }
            });
        }, { threshold: 0.5 });

        skillBars.forEach(bar => {
            skillObserver.observe(bar);
        });
    }

    // Typing Effect
    setupTypingEffect() {
        const heroTitle = document.querySelector('.hero-title');
        if (!heroTitle) return;

        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid var(--primary-color)';

        let i = 0;
        const typeWriter = () => {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                heroTitle.style.borderRight = 'none';
            }
        };

        // Start typing effect when page loads
        setTimeout(typeWriter, 1000);
    }

    // Contact Form Handling
    setupContactForm() {
        const form = document.getElementById('contactForm');
        if (!form) return;

        // Form validation
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Remove existing error
        this.clearFieldError(field);

        // Validation rules
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (field.type === 'email' && value && !this.isValidEmail(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        } else if (field.type === 'tel' && value && !this.isValidPhone(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid phone number';
        }

        if (!isValid) {
            this.showFieldError(field, errorMessage);
        }

        return isValid;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    showFieldError(field, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = 'var(--error-color)';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = 'var(--error-color)';
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = 'var(--border-color)';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const formData = new FormData(form);
        
        // Validate all fields
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        if (!isValid) return;

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="material-icons rotating">refresh</i> Sending...';
        submitBtn.classList.add('loading');

        try {
            // Simulate form submission (replace with actual API call)
            await this.simulateFormSubmission(formData);
            
            // Show success message
            this.showNotification('Message sent successfully!', 'success');
            form.reset();
            
        } catch (error) {
            // Show error message
            this.showNotification('Failed to send message. Please try again.', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="material-icons">send</i> Send Message';
            submitBtn.classList.remove('loading');
        }
    }

    async simulateFormSubmission(formData) {
        // Simulate API delay
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate 90% success rate
                if (Math.random() > 0.1) {
                    resolve();
                } else {
                    reject(new Error('Network error'));
                }
            }, 2000);
        });
    }

    // Notification System
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="material-icons">${this.getNotificationIcon(type)}</i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="material-icons">close</i>
            </button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: var(--radius-lg);
            box-shadow: 0 10px 30px var(--shadow-heavy);
            border: 1px solid var(--border-color);
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check_circle',
            error: 'error',
            warning: 'warning',
            info: 'info'
        };
        return icons[type] || icons.info;
    }

    // Utility Functions
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    // Performance Optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioApp();
});

// Add some additional utility functions
window.PortfolioUtils = {
    // Smooth scroll to element
    scrollToElement: (elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    },

    // Toggle mobile menu
    toggleMobileMenu: () => {
        const navMenu = document.querySelector('.nav-menu');
        const navToggle = document.querySelector('.nav-toggle');
        if (navMenu && navToggle) {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        }
    },

    // Download resume (placeholder)
    downloadResume: () => {
        // This would typically trigger a file download
        alert('Resume download functionality would be implemented here');
    },

    // Copy email to clipboard
    copyEmail: () => {
        const email = 'ghorpadesunil2005@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
            // Show success notification
            if (window.portfolioApp) {
                window.portfolioApp.showNotification('Email copied to clipboard!', 'success');
            }
        }).catch(() => {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = email;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (window.portfolioApp) {
                window.portfolioApp.showNotification('Email copied to clipboard!', 'success');
            }
        });
    }
};

// Add CSS for additional elements
const additionalStyles = `
    .rotating {
        animation: rotate 1s linear infinite;
    }
    
    @keyframes rotate {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    
    .notification-close {
        background: none;
        border: none;
        color: var(--text-secondary);
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 50%;
        transition: all 0.2s ease;
    }
    
    .notification-close:hover {
        background: var(--bg-secondary);
        color: var(--text-primary);
    }
    
    .nav-link.active {
        color: var(--primary-color);
        background-color: var(--bg-secondary);
    }
    
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.98);
        box-shadow: 0 2px 20px var(--shadow-medium);
    }
    
    [data-theme="dark"] .navbar.scrolled {
        background: rgba(18, 18, 18, 0.98);
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
