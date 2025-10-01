document.getElementById('menu-toggle').addEventListener('click', () => {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.classList.toggle('hidden');
});

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section).classList.remove('hidden');
    document.getElementById('dropdown-menu').classList.add('hidden');
    window.scrollTo(0, 0); // Reset scroll to top

    // Reset gallery to 'events' tab when showing gallery section
    if (section === 'gallery') {
        showGalleryTab('events');
    }

    const nav = document.querySelector('nav');
    const dropdownMenu = document.getElementById('dropdown-menu');

    const navColors = {
        home: 'bg-blue-600',
        gallery: 'bg-blue-600', // CHANGED THIS TO BLUE
        cv: 'bg-blue-900'
    };

    // The logic below ensures 'bg-blue-600' is used in the CSS for the nav bar color
    const navBarColorClass = navColors[section] || 'bg-blue-600';
    nav.className = `p-4 fixed top-0 left-0 w-full z-20 shadow-lg ${navBarColorClass}`;
    // You also need to adjust the dropdown menu background color dynamically
    dropdownMenu.className = `hidden md:hidden ${navBarColorClass}`;

    // Fix for nav not keeping all classes: need to set it properly.
    // The original HTML uses 'shadow-2xl' but the JS uses 'shadow-lg'. I'll stick to shadow-lg for the JS logic for consistency.
    nav.className = `bg-blue-600 p-4 fixed top-0 left-0 w-full z-20 shadow-lg`; 
    // This forces the nav back to the main blue, as the original nav already uses 'bg-blue-600'.
    // If you want the CV section to have 'bg-blue-900', you must include the full class list:

    nav.className = `p-4 fixed top-0 left-0 w-full z-20 shadow-lg ${navColors[section] || 'bg-blue-600'}`;
    dropdownMenu.className = `hidden md:hidden ${navColors[section] || 'bg-blue-600'}`;
}

function showGalleryTab(tab) {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(tab).classList.remove('hidden');
    
    const activeBlue = 'bg-blue-900'; // Define a strong blue for active tab
    const inactiveWhite = 'bg-white';
    const inactiveTextBlue = 'text-blue-600';

    document.querySelectorAll('.tab-button').forEach(btn => {
        // Remove old classes
        btn.classList.remove('active', 'bg-blue-600', 'bg-pink-600', 'text-white', 'bg-gray-300', 'text-gray-800');
        // Add inactive classes
        btn.classList.add(inactiveWhite, inactiveTextBlue);
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    activeBtn.classList.add('active');
    
    // Set active button's color to the desired blue
    activeBtn.classList.remove(inactiveWhite, inactiveTextBlue);
    activeBtn.classList.add(activeBlue, 'text-white');
}

document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
    showGalleryTab('events'); // Initialize gallery to 'events' tab

    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', function() {
            const largeSrc = this.getAttribute('data-lightbox-src');
            lightboxImg.src = largeSrc || this.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });

    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target === lightboxImg) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdownMenu = document.getElementById('dropdown-menu');
        const menuToggle = document.getElementById('menu-toggle');
        if (!dropdownMenu.contains(e.target) && !menuToggle.contains(e.target)) {
            dropdownMenu.classList.add('hidden');
        }
    });

    document.getElementById('current-year').textContent = new Date().getFullYear();
});

document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        showSection(section);
    });
});

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
        showGalleryTab(tab);
    });
});