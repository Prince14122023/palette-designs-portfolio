
/* ==========================================
   PALETTE DESIGNS — GALLERY ENGINE
========================================== */

const GALLERY = {
    images: [],
    activeCategory: "all",
    visibleCount: 24,
    batchSize: 24
};

const portfolioGrid = document.getElementById("portfolioGrid");
const categoryFilters = document.getElementById("categoryFilters");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const portfolioCount = document.getElementById("portfolioCount");

/* ==========================================
   LOAD IMAGE MANIFEST
========================================== */

async function loadPortfolio() {
    try {
        const response = await fetch("./optimized-manifest.json");

        if (!response.ok) {
            throw new Error("Unable to load image manifest");
        }

        GALLERY.images = await response.json();

        renderGallery();
    } catch (error) {
        console.error("Portfolio loading error:", error);

        portfolioGrid.innerHTML = `
            <p class="gallery-message">
                Unable to load portfolio images.
                Please run the portfolio using a local development server.
            </p>
        `;
    }
}

/* ==========================================
   FILTER IMAGES
========================================== */

function getFilteredImages() {
    if (GALLERY.activeCategory === "all") {
        return GALLERY.images;
    }

    return GALLERY.images.filter(image =>
        image.category === GALLERY.activeCategory
    );
}

/* ==========================================
   CREATE GALLERY CARD
========================================== */

function createCard(image) {
    const card = document.createElement("article");
    card.className = "portfolio-card";

    const img = document.createElement("img");

    img.alt = `${image.folder} interior design by Palette Designs`;
    img.loading = "lazy";
    img.decoding = "async";

    img.addEventListener("load", () => {
        img.classList.add("image-loaded");
    });

    img.addEventListener("error", () => {
        card.classList.add("image-error");
    });

    img.src = image.image;

    const info = document.createElement("div");
    info.className = "image-info";

    const heading = document.createElement("h3");
    heading.textContent = image.folder;

    const category = document.createElement("span");
    category.textContent = image.category.replace("-", " ").toUpperCase();

    info.appendChild(heading);
    info.appendChild(category);

    card.appendChild(img);
    card.appendChild(info);

    card.addEventListener("click", () => {
    openLightbox(image);
    });

    return card;
}

/* ==========================================
   PALETTE DESIGNS — LIGHTBOX NAVIGATION
========================================== */

function openLightbox(image) {
    const filteredImages = getFilteredImages();
    let currentIndex = filteredImages.findIndex(
        item => item.image === image.image
    );

    if (currentIndex === -1) return;

    const overlay = document.createElement("div");
    overlay.className = "portfolio-lightbox";

    overlay.innerHTML = `
        <button class="lightbox-close" aria-label="Close preview">
            &times;
        </button>

        <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
            &#10094;
        </button>

        <button class="lightbox-nav lightbox-next" aria-label="Next image">
            &#10095;
        </button>

        <div class="lightbox-content">
            <img class="lightbox-image" src="" alt="">
            <div class="lightbox-caption">
                <h2 class="lightbox-title"></h2>
                <p class="lightbox-category"></p>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    document.body.style.overflow = "hidden";

    const previewImage = overlay.querySelector(".lightbox-image");
    const title = overlay.querySelector(".lightbox-title");
    const category = overlay.querySelector(".lightbox-category");
    const prevBtn = overlay.querySelector(".lightbox-prev");
    const nextBtn = overlay.querySelector(".lightbox-next");
    const closeBtn = overlay.querySelector(".lightbox-close");

    function showImage(index) {
        currentIndex = index;
        const currentImage = filteredImages[currentIndex];

        previewImage.src = currentImage.image;
        previewImage.alt = `${currentImage.folder} interior design`;

        title.textContent = currentImage.folder;
        category.textContent = currentImage.category
            .replace("-", " ")
            .toUpperCase();
    }

    function showPrevious() {
        currentIndex =
            (currentIndex - 1 + filteredImages.length) %
            filteredImages.length;

        showImage(currentIndex);
    }

    function showNext() {
        currentIndex =
            (currentIndex + 1) % filteredImages.length;

        showImage(currentIndex);
    }

    function closeLightbox() {
        overlay.remove();
        document.body.style.overflow = "";
        document.removeEventListener("keydown", handleKeyboard);
    }

    function handleKeyboard(event) {
        if (event.key === "Escape") closeLightbox();
        if (event.key === "ArrowLeft") showPrevious();
        if (event.key === "ArrowRight") showNext();
    }

    prevBtn.addEventListener("click", showPrevious);
    nextBtn.addEventListener("click", showNext);
    closeBtn.addEventListener("click", closeLightbox);

    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeLightbox();
    });

    document.addEventListener("keydown", handleKeyboard);

    showImage(currentIndex);
}
/* ==========================================
   RENDER GALLERY
========================================== */

function renderGallery() {
    const filteredImages = getFilteredImages();

    const imagesToShow = filteredImages.slice(
        0,
        GALLERY.visibleCount
    );

    portfolioGrid.innerHTML = "";

    const fragment = document.createDocumentFragment();

    imagesToShow.forEach(image => {
        fragment.appendChild(createCard(image));
    });

    portfolioGrid.appendChild(fragment);

    // DYNAMIC PORTFOLIO COUNTER
    if (portfolioCount) {
        portfolioCount.textContent =
            `Showing ${imagesToShow.length} of ${filteredImages.length} projects`;
    }

    updateLoadMoreButton(filteredImages.length);
}

/* ==========================================
   LOAD MORE BUTTON
========================================== */

function updateLoadMoreButton(totalImages) {
    const hasMore = GALLERY.visibleCount < totalImages;

    loadMoreBtn.hidden = !hasMore;

    if (hasMore) {
        const remaining = totalImages - GALLERY.visibleCount;
        const nextBatch = Math.min(remaining, GALLERY.batchSize);

        loadMoreBtn.textContent = `LOAD ${nextBatch} MORE PROJECTS +`;
    }
}

loadMoreBtn.addEventListener("click", () => {
    GALLERY.visibleCount += GALLERY.batchSize;
    renderGallery();
});

/* ==========================================
   CATEGORY FILTERS
========================================== */

categoryFilters.addEventListener("click", event => {
    const button = event.target.closest(".filter-btn");

    if (!button) return;

    GALLERY.activeCategory = button.dataset.category;
    GALLERY.visibleCount = GALLERY.batchSize;

    categoryFilters.querySelectorAll(".filter-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    renderGallery();
});

/* ==========================================
   NAVBAR SCROLL EFFECT
========================================== */

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 30);
});

/* ==========================================
   FOOTER YEAR
========================================== */

const yearElement = document.getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

/* ==========================================
   START PORTFOLIO
========================================== */

loadPortfolio();
