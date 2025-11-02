/* ===== assets/js/main.js (ensure it is included) ===== */
// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
anchor.addEventListener('click', function (e) {
const targetId = this.getAttribute('href');
if (targetId && targetId.startsWith('#')) {
e.preventDefault();
const targetElement = document.querySelector(targetId);
if (targetElement) {
targetElement.scrollIntoView({ behavior: 'smooth' });
}
}
});
});


// Header shadow toggle on scroll
window.addEventListener('scroll', () => {
const header = document.querySelector('header');
if (window.scrollY > 40) {
header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
header.style.background = 'rgba(15, 23, 36, 0.9)';
header.style.backdropFilter = 'blur(6px)';
} else {
header.style.boxShadow = 'none';
header.style.background = 'transparent';
header.style.backdropFilter = 'none';
}
});


// Fade-in animation on scroll
const fadeElems = document.querySelectorAll('.card, .project-card, .experience-item');
const observer = new IntersectionObserver((entries) => {
entries.forEach(entry => {
if (entry.isIntersecting) {
entry.target.style.opacity = 1;
entry.target.style.transform = 'translateY(0)';
}
});
}, { threshold: 0.1 });


fadeElems.forEach(elem => {
elem.style.opacity = 0;
elem.style.transform = 'translateY(40px)';
elem.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
observer.observe(elem);
});