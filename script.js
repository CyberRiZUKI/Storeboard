function navigateToTab(tabName) {
    // Hide homepage
    document.getElementById('homepage').classList.add('hidden');

    // Show tab navigation and content
    document.getElementById('tabNavigation').classList.remove('hidden');
    document.getElementById('tabContent').classList.remove('hidden');

    // Hide all tab contents
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    // Remove active class from all buttons
    var tabButtons = document.getElementsByClassName("tab-button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Show the selected tab
    document.getElementById(tabName).classList.add("active");

    // Mark the corresponding button as active
    var buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(function(button) {
        if (button.textContent.toLowerCase().includes(tabName) ||
            (tabName === 'oshikatsu' && button.textContent.includes('Oshikatsu'))) {
            button.classList.add('active');
        }
    });
}

function openTab(evt, tabName) {
    // Hide all tab contents
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }

    // Remove active class from all buttons
    var tabButtons = document.getElementsByClassName("tab-button");
    for (var i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove("active");
    }

    // Show the selected tab and mark button as active
    document.getElementById(tabName).classList.add("active");
    evt.currentTarget.classList.add("active");
}

function goHome() {
    // Show homepage
    document.getElementById('homepage').classList.remove('hidden');

    // Hide tab navigation and content
    document.getElementById('tabNavigation').classList.add('hidden');
    document.getElementById('tabContent').classList.add('hidden');

    // Hide all tab contents
    var tabContents = document.getElementsByClassName("tab-content");
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove("active");
    }
}

// Update active nav link based on current page
document.addEventListener('DOMContentLoaded', function() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.page-header nav a');

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage ||
            (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

async function loadBlogs() {
    try {
        const response = await fetch('blogs.json');
        const data = await response.json();
        const blogGrid = document.getElementById('blogGrid');

        data.blogs.forEach(blog => {
            const tagsList = blog.tags.map(tag =>
                `<span class="tag">${tag}</span>`
            ).join('');

            const dataTags = blog.tags.map(tag =>
                tag.toLowerCase().replace(/\//g, '-').replace(/\s+/g, '-')
            ).join(',');

            const card = `
                <a href="${blog.url}" class="blog-card" data-tags="${dataTags}" data-image="${blog.image}">
                    <h3>${blog.title}</h3>
                    <div class="blog-meta">
                        <span class="blog-date">${blog.date}</span>
                        <div class="blog-tags">${tagsList}</div>
                    </div>
                    <p class="blog-excerpt">${blog.excerpt}</p>
                    <span class="read-more">more →</span>
                </a>
            `;

            blogGrid.innerHTML += card;
        });

        // Set background images
        document.querySelectorAll('.blog-card').forEach(card => {
            const image = card.getAttribute('data-image');
            card.style.setProperty('--bg-image', `url('${image}')`);
        });

        initializeFilters();

    } catch (error) {
        console.error('Error loading blogs:', error);
    }
}

// Tag Filter Functionality
function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-tag');
    const blogCards = document.querySelectorAll('.blog-card');
    let activeFilters = new Set(['all']);

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tag = this.getAttribute('data-tag');

            if (tag === 'all') {
                activeFilters.clear();
                activeFilters.add('all');
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            } else {
                activeFilters.delete('all');
                document.querySelector('[data-tag="all"]').classList.remove('active');

                if (activeFilters.has(tag)) {
                    activeFilters.delete(tag);
                    this.classList.remove('active');
                } else {
                    activeFilters.add(tag);
                    this.classList.add('active');
                }

                if (activeFilters.size === 0) {
                    activeFilters.add('all');
                    document.querySelector('[data-tag="all"]').classList.add('active');
                }
            }

            filterBlogCards();
        });
    });

    function filterBlogCards() {
        const cards = document.querySelectorAll('.blog-card'); // Re-query to get loaded cards
        cards.forEach(card => {
            const cardTags = card.getAttribute('data-tags').split(',');

            if (activeFilters.has('all')) {
                card.classList.remove('hidden');
            } else {
                const hasMatch = cardTags.some(tag => activeFilters.has(tag));
                if (hasMatch) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            }
        });
    }
}
// Call on page load
document.addEventListener('DOMContentLoaded', loadBlogs);


// Load photos from JSON
async function loadPhotos() {
    try {
        const response = await fetch('photos.json');
        const data = await response.json();
        const galleryList = document.getElementById('gallery-list');

        data.photos.forEach(photo => {
            const item = document.createElement('a');
            item.href = photo.link;
            item.className = 'gallery-item';

            // Set background directly on the element
            item.style.backgroundImage = `url('${photo.image}')`;

            item.innerHTML = `
                <span class="gallery-title">${photo.title}</span>
                <span class="gallery-date">${photo.date}</span>
            `;

            galleryList.appendChild(item);
        });
    } catch (error) {
        console.error('Error loading photos:', error);
    }
}

// Load photos when page loads
if (document.getElementById('gallery-list')) {
    loadPhotos();
}

// For the one in PHOTO

// Photo viewer functionality
let photos = [];
let currentIndex = 0;
let currentFolder = '';

async function Photoviewer() {
    const response = await fetch('../photos.json');
    const data = await response.json();

    // Get folder from URL parameter
    const params = new URLSearchParams(window.location.search);
    currentFolder = params.get('folder') || '';
    const photoId = params.get('id');

    // Filter photos by folder
    if (currentFolder) {
        photos = data.photos.filter(p => p.image.includes(currentFolder));
    } else {
        photos = data.photos;
    }

    // Find starting photo
    if (photoId) {
        const index = photos.findIndex(p => p.image.includes(photoId));
        if (index !== -1) currentIndex = index;
    }

    displayPhoto();
}

function displayPhoto() {
    const photo = photos[currentIndex];
    document.getElementById('photo-title').textContent = photo.title;
    document.getElementById('photo-date').textContent = photo.date;
    document.getElementById('photo-id').textContent = photo.image.split('/').pop();
    document.getElementById('photo-count').textContent = `${currentIndex + 1} / ${photos.length}`;
    document.getElementById('photo-display').src = '../' + photo.image;

    // Update arrow states
    document.getElementById('prev-arrow').classList.toggle('disabled', currentIndex === 0);
    document.getElementById('next-arrow').classList.toggle('disabled', currentIndex === photos.length - 1);
}

function navigate(direction) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < photos.length) {
        currentIndex = newIndex;
        displayPhoto();
    }
}

// Initialize photo viewer if elements exist
if (document.getElementById('photo-display')) {
    document.getElementById('prev-arrow').addEventListener('click', () => navigate(-1));
    document.getElementById('next-arrow').addEventListener('click', () => navigate(1));

    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
    });

    Photoviewer();
}



