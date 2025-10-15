document.getElementById('menu-toggle').addEventListener('click', () => {
    const dropdownMenu = document.getElementById('dropdown-menu');
    dropdownMenu.classList.toggle('hidden');
});

const { createClient } = supabase;
const supabaseClient = createClient(
    'https://pqffootznndbljthwayl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZmZvb3R6bm5kYmxqdGh3YXlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyMjkyMjUsImV4cCI6MjA3NDgwNTIyNX0.qThWzc6d62ZvM9S3YWs1XIiXFrapsePKHhfEeC1r8kw'
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

async function loadGallery(tab) {
    const grid = document.getElementById(`${tab}-grid`);
    grid.innerHTML = '<p>Loading...</p>'; // Loading state

    const { data: files, error: listError } = await supabaseClient.storage
        .from(tab)
        .list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });

    if (listError) {
        console.error('Error loading images:', listError);
        grid.innerHTML = '<p>Error loading gallery.</p>';
        return;
    }

    if (!files || files.length === 0) {
        grid.innerHTML = '<p>No photos available.</p>';
        return;
    }

    const imageIds = files.map(file => file.name);
    const { data: viewsData, error: viewsError } = await supabaseClient
        .from('image_views')
        .select('image_id, view_count')
        .in('image_id', imageIds);

    if (viewsError) {
        console.error('Error fetching views:', viewsError);
    }

    const viewsMap = {};
    if (viewsData) {
        viewsData.forEach(v => viewsMap[v.image_id] = v.view_count);
    }

    grid.innerHTML = ''; // Clear loading
    files.forEach(file => {
        const publicUrl = supabaseClient.storage.from(tab).getPublicUrl(file.name).data.publicUrl;
        const views = viewsMap[file.name] || 0;
        const item = document.createElement('div');
        item.className = 'gallery-item relative';
        item.innerHTML = `
            <img src="${publicUrl}" alt="${file.name}" data-lightbox-src="${publicUrl}" data-image-id="${file.name}" loading="lazy" class="cursor-pointer">
            <span class="view-count-display absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded" data-image-id="${file.name}">👁️ ${views}</span>
        `;
        grid.appendChild(item);
    });

    // Re-attach click listeners after dynamic load
    attachImageClickListeners(tab);
}

async function incrementAndUpdateViewCount(imageId) {
    const { error } = await supabaseClient.rpc('increment_view', { image_id_param: imageId });
    if (error) {
        console.error('Error incrementing view:', error);
        return;
    }

    // Fetch updated count
    const { data, error: fetchError } = await supabaseClient
        .from('image_views')
        .select('view_count')
        .eq('image_id', imageId)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // Ignore no row
        console.error('Fetch error:', fetchError);
        return;
    }

    const newCount = data ? data.view_count : 1; // If new row
    const elements = document.querySelectorAll(`.view-count-display[data-image-id="${imageId}"]`);
    elements.forEach(el => el.textContent = `👁️ ${newCount}`);
}

const debouncedIncrement = debounce(incrementAndUpdateViewCount, 500);

function attachImageClickListeners(tab) {
    document.querySelectorAll(`#${tab}-grid .gallery-item img`).forEach(img => {
        img.onclick = function() {
            openLightbox(this.getAttribute('data-lightbox-src'), this.getAttribute('data-image-id'));
        };
    });
}

function openLightbox(src, imageId) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    lightboxImg.src = src;
    lightbox.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    if (imageId) {
        debouncedIncrement(imageId);
    }
}

function closeLightbox(event) {
    const lightbox = document.getElementById('lightbox');
    if (event) {
        const lightboxImg = document.getElementById('lightbox-img');
        if (event.target === lightbox || event.target === lightboxImg || event.target.tagName === 'BUTTON') {
            lightbox.classList.add('hidden');
            document.body.style.overflow = '';
        }
    } else {
        lightbox.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(section).classList.remove('hidden');
    document.getElementById('dropdown-menu').classList.add('hidden');
    window.scrollTo(0, 0);

    if (section === 'gallery') {
        showGalleryTab('events');
    }

    // Nav color logic...
    const nav = document.querySelector('nav');
    const dropdownMenu = document.getElementById('dropdown-menu');
    const navColors = { home: 'bg-blue-600', gallery: 'bg-blue-600', cv: 'bg-blue-900' };
    const navBarColorClass = navColors[section] || 'bg-blue-600';
    nav.className = `p-4 fixed top-0 left-0 w-full z-20 shadow-lg ${navBarColorClass}`;
    dropdownMenu.className = `hidden md:hidden ${navBarColorClass}`;
}

function showGalleryTab(tab) {
    document.querySelectorAll('.gallery-tab').forEach(t => t.classList.add('hidden'));
    document.getElementById(tab).classList.remove('hidden');
    
    // Button styles...
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active', 'bg-blue-900', 'text-white');
        btn.classList.add('bg-white', 'text-blue-600');
    });
    const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
    activeBtn.classList.add('active', 'bg-blue-900', 'text-white');
    activeBtn.classList.remove('bg-white', 'text-blue-600');

    loadGallery(tab);
}

// DOM Loaded
document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
    document.getElementById('current-year').textContent = new Date().getFullYear();

    // Keyboard escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
    });
});

document.querySelectorAll('[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showSection(link.dataset.section);
    });
});

document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => showGalleryTab(button.dataset.tab));
});