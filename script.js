
/* ==========================================
   PALETTE DESIGNS — GALLERY ENGINE
========================================== */

const GALLERY = {
    images: [],
    activeCategory: "all",
    searchTerm: "",
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
   SEARCH + CATEGORY FILTER
========================================== */

function getFilteredImages() {
    return GALLERY.images.filter(image => {
        const matchesCategory =
            GALLERY.activeCategory === "all" ||
            image.category === GALLERY.activeCategory;

        const searchableText = `${image.folder} ${image.category}`.toLowerCase();

        const matchesSearch =
            searchableText.includes(GALLERY.searchTerm.toLowerCase());

        return matchesCategory && matchesSearch;
    });
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
    updateSearchSuggestions();
});

/* ==========================================
   PORTFOLIO SEARCH
========================================== */

const portfolioSearch = document.getElementById("portfolioSearch");
const clearSearchBtn = document.getElementById("clearSearch");
const searchSuggestions = document.getElementById("searchSuggestions");

function updateSearchSuggestions() {
    const term = portfolioSearch.value.trim().toLowerCase();

    searchSuggestions.innerHTML = "";

    if (!term) {
        searchSuggestions.style.display = "none";
        return;
    }

    const matches = GALLERY.images.filter(image => {
        const matchesCategory =
            GALLERY.activeCategory === "all" ||
            image.category === GALLERY.activeCategory;

        const searchableText = `${image.folder} ${image.category}`.toLowerCase();

        return matchesCategory && searchableText.includes(term);
    }).slice(0, 8);

    searchSuggestions.style.display = "block";

    if (matches.length === 0) {
        searchSuggestions.innerHTML = `
            <div class="search-empty">
                No matching spaces found.
            </div>
        `;
        return;
    }

    matches.forEach(image => {
        const suggestion = document.createElement("button");
        suggestion.className = "search-suggestion";
        suggestion.type = "button";

        suggestion.innerHTML = `
            <strong></strong>
            <span></span>
        `;

        suggestion.querySelector("strong").textContent = image.folder;
        suggestion.querySelector("span").textContent =
            image.category.replace("-", " ").toUpperCase();

        suggestion.addEventListener("click", () => {
            searchSuggestions.style.display = "none";
            openLightbox(image);
        });

        searchSuggestions.appendChild(suggestion);
    });
}

portfolioSearch.addEventListener("input", () => {
    GALLERY.searchTerm = portfolioSearch.value.trim();
    GALLERY.visibleCount = GALLERY.batchSize;

    clearSearchBtn.style.display =
        portfolioSearch.value ? "block" : "none";

    updateSearchSuggestions();
    renderGallery();
});

clearSearchBtn.addEventListener("click", () => {
    portfolioSearch.value = "";
    GALLERY.searchTerm = "";
    GALLERY.visibleCount = GALLERY.batchSize;

    clearSearchBtn.style.display = "none";
    searchSuggestions.style.display = "none";

    renderGallery();
});

document.addEventListener("click", event => {
    if (!event.target.closest(".portfolio-search-wrap")) {
        searchSuggestions.style.display = "none";
    }
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
