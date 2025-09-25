// Navigation functionality
document.getElementById('menu-toggle').addEventListener('click', () => {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
});

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section).classList.remove('hidden');
    document.getElementById('mobile-menu').classList.add('hidden');
    if (section === 'gallery') {
        showGalleryTab('events');
    }

    // Dynamic color changes
    const nav = document.querySelector('nav');
    const mobileMenu = document.getElementById('mobile-menu');

    const navColors = {
        home: 'bg-blue-600',
        about: 'bg-purple-600',
        gallery: 'bg-pink-600',
        cv: 'bg-blue-900',
        blog: 'bg-indigo-600',
        contact: 'bg-teal-600'
    };

    const mobileColors = {
        home: 'bg-blue-500',
        about: 'bg-purple-500',
        gallery: 'bg-pink-500',
        cv: 'bg-blue-800',
        blog: 'bg-indigo-500',
        contact: 'bg-teal-500'
    };

    nav.className = `p-4 fixed top-0 left-0 w-full z-20 shadow-lg ${navColors[section] || 'bg-blue-600'}`;
    mobileMenu.className = `hidden md:hidden ${mobileColors[section] || 'bg-pink-500'}`;
}


    document.addEventListener('DOMContentLoaded', async () => {
    await loadViewCounts(); // Fetch and display all counts initially
    showSection('home');
    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    // Add click event to all gallery images
    document.querySelectorAll('.gallery-item img').forEach(img => {
img.addEventListener('click', async function() {
    const imageId = this.getAttribute('data-views-id');
    if (imageId) {
        await updateViewCount(imageId); // Increment on click (view)
        // Then update the display immediately for this image
        const span = document.querySelector(`[data-views="${imageId}"]`);
        if (span) {
            const newCount = await getViewCount(imageId);
            span.textContent = formatCount(newCount);
        }
    }
    // Existing lightbox code...
    const largeSrc = this.getAttribute('data-lightbox-src');
    lightboxImg.src = largeSrc || this.src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
});
    });
    
    // Close lightbox when clicking on it
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target === lightboxImg) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
    
    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
});

document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        showSection(section);
    });
});

function showGalleryTab(tab) {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(tab).classList.remove('hidden');
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('bg-pink-600', 'text-white');
        btn.classList.add('bg-gray-300', 'text-gray-800');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.remove('bg-gray-300', 'text-gray-800');
    document.querySelector(`[data-tab="${tab}"]`).classList.add('bg-pink-600', 'text-white');
}

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        const tab = button.getAttribute('data-tab');
        showGalleryTab(tab);
    });
});




// Helper to format counts (e.g., 1200 -> 1.2K)
function formatCount(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
}

// Fetch current count for an image
async function getViewCount(imageId) {
    try {
        const response = await fetch(`/.netlify/functions/view-count?imageId=${imageId}`);
        if (!response.ok) throw new Error('Fetch failed');
        const data = await response.json();
        return data.count;
    } catch (error) {
        console.error('Error fetching view count:', error);
        return 0; // Fallback to 0 on error
    }
}

// Increment count for an image
async function updateViewCount(imageId) {
    try {
        const response = await fetch(`/.netlify/functions/view-count`, {
            method: 'POST',
            body: JSON.stringify({ imageId }),
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) throw new Error('Update failed');
    } catch (error) {
        console.error('Error updating view count:', error);
    }
}

// Load all view counts on page load or section show
async function loadViewCounts() {
    const viewsSpans = document.querySelectorAll('[data-views]');
    for (const span of viewsSpans) {
        const id = span.getAttribute('data-views');
        const count = await getViewCount(id);
        span.textContent = formatCount(count);
    }
}