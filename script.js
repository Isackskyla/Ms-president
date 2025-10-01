document.getElementById('menu-toggle').addEventListener('click', () => {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.classList.toggle('hidden');
});

const { createClient } = supabase;
const supabaseClient = createClient(
    process.env.SUPABASE_URL ,
    process.env.SUPABASE_KEY
);

function debounce(func, wait) {
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

async function fetchViewCounts(tab) {
    const imageIds = getImageIdsForTab(tab);
    if (imageIds.length === 0) return;

    const { data, error } = await supabaseClient
        .from('image_views')
        .select('image_id, view_count')
        .in('image_id', imageIds);
    
    if (error) {
        console.error('Error fetching view counts:', error);
        return;
    }

    data.forEach(({ image_id, view_count }) => {
        const element = document.querySelector(`.view-count-display[data-image-id="${image_id}"]`);
        if (element) {
            element.textContent = `👁️ ${view_count}`;
        }
    });
}

async function incrementAndUpdateViewCount(imageId) {
    const { error } = await supabaseClient
        .rpc('increment_view', { image_id_param: imageId });
    
    if (error) {
        console.error('Error incrementing view count:', error);
        return;
    }

    const { data, error: fetchError } = await supabaseClient
        .from('image_views')
        .select('view_count')
        .eq('image_id', imageId)
        .single();
    
    if (fetchError) {
        console.error('Error fetching updated view count:', fetchError);
        return;
    }

    const galleryViewCount = document.querySelector(`.view-count-display[data-image-id="${imageId}"]`);
    if (galleryViewCount) {
        galleryViewCount.textContent = `👁️ ${data.view_count}`;
    }
}

const debouncedIncrementAndUpdateViewCount = debounce(incrementAndUpdateViewCount, 500);

function getImageIdsForTab(tab) {
    return Array.from(document.querySelectorAll(`#${tab} .gallery-item img`))
        .map(img => img.getAttribute('data-image-id'))
        .filter(id => id);
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section).classList.remove('hidden');
    document.getElementById('dropdown-menu').classList.add('hidden');
    window.scrollTo(0, 0);

    if (section === 'gallery') {
        showGalleryTab('events');
    }

    const nav = document.querySelector('nav');
    const dropdownMenu = document.getElementById('dropdown-menu');

    const navColors = {
        home: 'bg-blue-600',
        gallery: 'bg-blue-600',
        cv: 'bg-blue-900'
    };

    const navBarColorClass = navColors[section] || 'bg-blue-600';
    nav.className = `p-4 fixed top-0 left-0 w-full z-20 shadow-lg ${navBarColorClass}`;
    dropdownMenu.className = `hidden md:hidden ${navBarColorClass}`;
}

function showGalleryTab(tab) {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(tab).classList.remove('hidden');
    
    const activeBlue = 'bg-blue-900';
    const inactiveWhite = 'bg-white';
    const inactiveTextBlue = 'text-blue-600';

    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-600', 'bg-pink-600', 'text-white', 'bg-gray-300', 'text-gray-800');
        btn.classList.add(inactiveWhite, inactiveTextBlue);
    });
    
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    activeBtn.classList.add('active');
    activeBtn.classList.remove(inactiveWhite, inactiveTextBlue);
    activeBtn.classList.add(activeBlue, 'text-white');

    fetchViewCounts(tab);
}

document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
    showGalleryTab('events');

    // Fetch initial view counts for the default 'events' tab
    fetchViewCounts('events');

    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    document.querySelectorAll('.gallery-item img').forEach(img => {
        img.addEventListener('click', function() {
            const largeSrc = this.getAttribute('data-lightbox-src');
            const imageId = this.getAttribute('data-image-id');
            lightboxImg.src = largeSrc || this.src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            lightboxImg.onerror = () => {
                console.error('Failed to load image:', largeSrc);
                lightboxImg.src = 'assets/fallback.jpg';
            };

            if (imageId) {
                debouncedIncrementAndUpdateViewCount(imageId);
            } else {
                console.error('Missing data-image-id for image:', largeSrc);
            }
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