export function initHeader() {
    const header = document.getElementById("header");
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const menuClose = document.querySelector('.nav-close-btn');
    const navLinks = document.querySelector('.nav-links');
    const menuIcon = menuToggle ? menuToggle.querySelector('i') : null;

    if (header) {
        window.addEventListener("scroll", () => {
            if (window.pageYOffset > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        });
    }

    const closeMenu = () => {
        navLinks.classList.remove('active');
        if (menuToggle) menuToggle.classList.remove('active');
        header.classList.remove('menu-open');
        if (menuIcon) {
            menuIcon.classList.add('fa-bars');
            menuIcon.classList.remove('fa-times');
        }
        document.body.style.overflow = '';
    };

    const toggleMenu = () => {
        const isOpen = navLinks.classList.toggle('active');
        if (menuToggle) menuToggle.classList.toggle('active');
        header.classList.toggle('menu-open');
        if (menuIcon) {
            menuIcon.classList.toggle('fa-bars');
            menuIcon.classList.toggle('fa-times');
        }
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', toggleMenu);
        if (menuClose) menuClose.addEventListener('click', closeMenu);

        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
    }
}
