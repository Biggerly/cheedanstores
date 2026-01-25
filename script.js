/* =========================================
   1. CORE DATA & INITIALIZATION
   ========================================= */
let cart = JSON.parse(localStorage.getItem('cheedan_cart')) || [];

// Runs when the page finishes loading
window.onload = function() {
    updateStorage();
    renderCart();
};

/* =========================================
   2. UI MODALS & OVERLAYS
   ========================================= */
function toggleModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = (modal.style.display === "block") ? "none" : "block";
    }
}

// Close any modal if user clicks outside of the box
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = "none";
    }
}

/* =========================================
   3. LIVE SEARCH LOGIC
   ========================================= */
const searchInput = document.getElementById('liveSearchInput');
if(searchInput) {
    searchInput.addEventListener('input', function() {
        let val = this.value.trim();
        const clearBtn = document.getElementById('clearSearch');
        const recentBox = document.getElementById('recentSearch');
        const resultsBox = document.getElementById('liveResults');

        if (val.length > 0) {
            clearBtn.style.display = "block";
            recentBox.style.display = "none";
            resultsBox.style.display = "block";
            // Placeholder for real search results
            resultsBox.innerHTML = `<p class="section-title">Searching for "${val}"...</p>
                                    <div class="result-item"><span>Looking in Cheedan Database...</span></div>`;
        } else {
            revertSearch();
        }
    });
}

function revertSearch() {
    const clearBtn = document.getElementById('clearSearch');
    const recentBox = document.getElementById('recentSearch');
    const resultsBox = document.getElementById('liveResults');
    if(clearBtn) clearBtn.style.display = "none";
    if(recentBox) recentBox.style.display = "block";
    if(resultsBox) resultsBox.style.display = "none";
}

if(document.getElementById('clearSearch')) {
    document.getElementById('clearSearch').addEventListener('click', () => {
        if(searchInput) searchInput.value = "";
        revertSearch();
    });
}

/* =========================================
   4. AUTH (LOGIN/REGISTER) SWITCHING
   ========================================= */
function switchAuth(type) {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const tabs = document.querySelectorAll('.tab-btn');
    if (type === 'login') {
        loginForm.style.display = 'block'; registerForm.style.display = 'none';
        tabs[0].classList.add('active'); tabs[1].classList.remove('active');
    } else {
        loginForm.style.display = 'none'; registerForm.style.display = 'block';
        tabs[1].classList.add('active'); tabs[0].classList.remove('active');
    }
}

/* =========================================
   5. CAROUSEL SLIDER
   ========================================= */
// let currentIdx = 0;
// function showSlide(index) {
//     const slider = document.getElementById("slider");
//     const dots = document.querySelectorAll(".dot");
//     if(!slider || dots.length === 0) return;
    
//     slider.style.transform = `translateX(-${index * 50}%)`;
//     dots.forEach(dot => dot.classList.remove("active"));
//     dots[index].classList.add("active");
//     currentIdx = index;
// }

// function currentSlide(index) { showSlide(index); }

// setInterval(() => {
//     const dots = document.querySelectorAll(".dot");
//     if(dots.length > 0) {
//         currentIdx = (currentIdx + 1) % dots.length;
//         showSlide(currentIdx);
//     }
// }, 5000);

/* =========================================
   6. CART SYSTEM (STABLE VERSION)
   ========================================= */
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    if(sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.style.display = (overlay.style.display === "block") ? "none" : "block";
        renderCart();
    }
}

function addToCart(name, price, img) {
    const existing = cart.find(item => item.name === name);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ name, price, img, qty: 1 });
    }
    updateStorage();
    
    // Open sidebar if closed
    if(!document.getElementById('cartSidebar').classList.contains('active')) {
        toggleCart();
    } else {
        renderCart();
    }
}

function updateStorage() {
    localStorage.setItem('cheedan_cart', JSON.stringify(cart));
    const counts = document.querySelectorAll('.cart-count');
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    counts.forEach(el => el.innerText = totalQty);
}

function renderCart() {
    const container = document.getElementById('cartItemsContainer');
    const footer = document.getElementById('cartFooter');
    const emptyMsg = document.getElementById('emptyCartMsg');
    const subtotalEl = document.getElementById('cartSubtotal');
    const headerCount = document.getElementById('cartCountHeader');
    
    if (!container) return;
    container.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        // Handle empty state
        const emptyDiv = emptyMsg.cloneNode(true);
        emptyDiv.style.display = "block";
        container.appendChild(emptyDiv);
        if(footer) footer.style.display = 'none';
        if(headerCount) headerCount.innerText = "0";
    } else {
        if(footer) footer.style.display = 'block';

        cart.forEach((item, index) => {
            total += item.price * item.qty;
            const itemRow = document.createElement('div');
            itemRow.className = 'cart-item';
            itemRow.innerHTML = `
                <img src="${item.img}" alt="">
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p class="item-price">₦${(item.price * item.qty).toLocaleString()}</p>
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="updateQty(${index}, -1)">-</button>
                        <span>${item.qty}</span>
                        <button class="qty-btn" onclick="updateQty(${index}, 1)">+</button>
                    </div>
                </div>
                <i class="fa-solid fa-trash" onclick="removeItem(${index})" style="color:#ff4d4d; cursor:pointer;"></i>
            `;
            container.appendChild(itemRow);
        });
        if(subtotalEl) subtotalEl.innerText = `₦${total.toLocaleString()}`;
        if(headerCount) headerCount.innerText = cart.length;
    }
}

function updateQty(index, change) {
    cart[index].qty += change;
    if (cart[index].qty < 1) cart.splice(index, 1);
    updateStorage();
    renderCart();
}

function removeItem(index) {
    cart.splice(index, 1);
    updateStorage();
    renderCart();
}

function filterProducts(category, element) {
    const products = document.querySelectorAll('.product-card');
    const links = document.querySelectorAll('.cat-link');

    // Update active UI state
    links.forEach(link => link.classList.remove('active'));
    element.classList.add('active');

    products.forEach(product => {
        // Show all if 'all' is selected, otherwise match the data-category
        if (category === 'all' || product.getAttribute('data-category') === category) {
            product.style.display = "block";
            setTimeout(() => { product.style.opacity = "1"; }, 10);
        } else {
            product.style.opacity = "0";
            setTimeout(() => { product.style.display = "none"; }, 300);
        }
    });
}

function triggerCategory(categoryName) {
    // 1. Find the category link in the strip that matches the text
    const categoryLinks = document.querySelectorAll('.cat-link');
    let targetLink = null;

    categoryLinks.forEach(link => {
        if (link.innerText.trim() === categoryName) {
            targetLink = link;
        }
    });

    // 2. Trigger the filter function
    if (targetLink) {
        filterProducts(categoryName, targetLink);
        
        // 3. Smooth scroll to the product section
        document.querySelector('.product-section').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }
}

const sliderGrid = document.getElementById('flashSaleGrid');
const wrapper = document.querySelector('.carousel-wrapper');

sliderGrid.addEventListener('scroll', () => {
    // Check if user has scrolled to the end
    const maxScroll = sliderGrid.scrollWidth - sliderGrid.clientWidth;
    if (sliderGrid.scrollLeft >= maxScroll - 5) {
        wrapper.classList.add('at-end');
    } else {
        wrapper.classList.remove('at-end');
    }
});

// Universal Draggable Script for ALL product grids
const setupDraggable = (gridId, wrapperId) => {
    const sliderGrid = document.getElementById(gridId);
    const wrapper = document.getElementById(wrapperId);
    if(!sliderGrid) return;

    let isDown = false;
    let startX;
    let scrollLeft;

    // Handle the "Fade" visibility
    sliderGrid.addEventListener('scroll', () => {
        const maxScroll = sliderGrid.scrollWidth - sliderGrid.clientWidth;
        if (sliderGrid.scrollLeft >= maxScroll - 10) {
            wrapper.classList.add('at-end');
        } else {
            wrapper.classList.remove('at-end');
        }
    });

    // Mouse Drag Logic
    sliderGrid.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - sliderGrid.offsetLeft;
        scrollLeft = sliderGrid.scrollLeft;
        sliderGrid.style.cursor = 'grabbing';
    });

    sliderGrid.addEventListener('mouseleave', () => { isDown = false; sliderGrid.style.cursor = 'grab'; });
    sliderGrid.addEventListener('mouseup', () => { isDown = false; sliderGrid.style.cursor = 'grab'; });

    sliderGrid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - sliderGrid.offsetLeft;
        const walk = (x - startX) * 2; 
        sliderGrid.scrollLeft = scrollLeft - walk;
    });
};

// Initialize both sections
setupDraggable('flashSaleGrid', 'flashWrapper'); // Make sure your first wrapper has this ID
setupDraggable('groceryGrid', 'groceryWrapper');


    // General function to open/close any modal
    function toggleModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal.style.display === "block") {
            modal.style.display = "none";
        } else {
            modal.style.display = "block";
        }
    }

    // Specific function for the Quick View
   function openQuickView(name, price, images, desc, category) {
    // images should be an array, e.g., ['img1.jpg', 'img2.jpg']
    // If only one string is passed, turn it into an array
    const imgArray = Array.isArray(images) ? images : [images];

    document.getElementById('qv-name').innerText = name;
    document.getElementById('qv-price').innerText = '₦' + price.toLocaleString();
    document.getElementById('qv-desc').innerText = desc;
    document.getElementById('qv-cat').innerText = category;
    
    // Set Main Image
    const mainImg = document.getElementById('qv-img-main');
    mainImg.src = imgArray[0];

    // Setup Thumbnails
    const thumbContainer = document.getElementById('qv-thumbnails');
    thumbContainer.innerHTML = ''; // Clear old thumbs
    
    imgArray.forEach(imgSrc => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        thumb.onclick = () => { mainImg.src = imgSrc; };
        thumbContainer.appendChild(thumb);
    });

    document.getElementById('quickView').style.display = 'block';
}

function changeQty(amt) {
    const qtyInput = document.getElementById('qv-qty');
    let val = parseInt(qtyInput.value) + amt;
    if (val < 1) val = 1;
    qtyInput.value = val;
}
    // Close modal if user clicks outside of the box
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = "none";
        }
    }

    // Global variable to hold current product data for the cart
let currentModalProduct = null;

function openQuickView(name, price, images, desc, category) {
    // 1. Lock Body Scroll
    document.body.classList.add('modal-open');

    // 2. Set Content
    currentModalProduct = { name, price, img: Array.isArray(images) ? images[0] : images };
    
    document.getElementById('qv-name').innerText = name;
    document.getElementById('qv-price').innerText = '₦' + price.toLocaleString();
    document.getElementById('qv-desc').innerText = desc;
    
    // Image handling
    const imgArray = Array.isArray(images) ? images : [images];
    document.getElementById('qv-img-main').src = imgArray[0];
    
    // Reset Quantity
    document.getElementById('qv-qty').value = 1;

    // 3. Show Modal
    document.getElementById('quickView').style.display = 'block';
}

function closeProductModal() {
    document.body.classList.remove('modal-open');
    document.getElementById('quickView').style.display = 'none';
}

// Click outside to close
window.onclick = function(event) {
    let modal = document.getElementById('quickView');
    if (event.target == modal) {
        closeProductModal();
    }
}

// ADD TO CART LOGIC
document.getElementById('add-to-cart-trigger').onclick = function() {
    const qty = parseInt(document.getElementById('qv-qty').value);
    
    // Call your existing addToCart function
    // Assuming your function is addToCart(name, price, image, quantity)
    if (typeof addToCart === "function") {
        addToCart(currentModalProduct.name, currentModalProduct.price, currentModalProduct.img, qty);
        
        // Optional: Close modal after adding
        // closeProductModal();
        
        // Visual feedback
        this.innerText = "Added!";
        this.style.background = "#6DB33F";
        setTimeout(() => {
            this.innerText = "Add to Cart";
            this.style.background = "var(--orange)";
        }, 2000);
    }
};

// Simulate user login status (Change this based on your actual PHP session)
let isLoggedIn = true; 

function openQuickView(name, price, imageList, desc, category) {
    document.body.classList.add('modal-open');
    
    // Set text data
    document.getElementById('qv-name').innerText = name;
    document.getElementById('qv-price').innerText = '₦' + price.toLocaleString();
    document.getElementById('qv-desc').innerText = desc;
    
    // Handle Images (Assume imageList is an array of URLs)
    const images = Array.isArray(imageList) ? imageList : [imageList];
    const mainImg = document.getElementById('qv-img-main');
    const thumbContainer = document.getElementById('qv-thumbnails');
    
    mainImg.src = images[0];
    thumbContainer.innerHTML = ''; // Clear old thumbs

    images.forEach((imgSrc, index) => {
        const thumb = document.createElement('img');
        thumb.src = imgSrc;
        if(index === 0) thumb.classList.add('active');
        
        thumb.onclick = function() {
            mainImg.src = imgSrc;
            document.querySelectorAll('.thumbnail-strip img').forEach(i => i.classList.remove('active'));
            thumb.classList.add('active');
        };
        thumbContainer.appendChild(thumb);
    });

    // Handle Comment Section Logic
    const commentSection = document.getElementById('comment-section-logic');
    if (isLoggedIn) {
        commentSection.innerHTML = `
            <div class="comment-bar">
                <input type="text" placeholder="Write a comment...">
                <button onclick="postComment()">Post</button>
            </div>
        `;
    } else {
        commentSection.innerHTML = `
            <div class="login-prompt">
                Please <a href="#" onclick="openAuthModal()">log in</a> to leave a comment or rating.
            </div>
        `;
    }

    document.getElementById('quickView').style.display = 'block';
}

function postComment() {
    alert("Comment posted successfully!");
    // Here you would add an AJAX call to save to your database
}

function closeProductModal() {
    document.body.classList.remove('modal-open');
    document.getElementById('quickView').style.display = 'none';
}

function scrollLinks(direction) {
    const container = document.getElementById('linksContainer');
    // Scroll by 200px each click
    const scrollAmount = 200; 
    container.scrollBy({
        left: direction * scrollAmount,
        behavior: 'smooth'
    });
}

let currentBannerSlide = 0;
const bannerSlides = document.querySelectorAll('.banner-img');

function animateTopBanner() {
    // Remove active class from current
    bannerSlides[currentBannerSlide].classList.remove('active');
    
    // Move to next slide
    currentBannerSlide = (currentBannerSlide + 1) % bannerSlides.length;
    
    // Add active class to next
    bannerSlides[currentBannerSlide].classList.add('active');
}

// Run every 3 seconds
setInterval(animateTopBanner, 3000);

let currentIdx = 0;
const slider = document.getElementById('slider');
const dots = document.querySelectorAll('.dot');

function moveSlide(direction) {
    const totalSlides = document.querySelectorAll('.slide').length;
    currentIdx = (currentIdx + direction + totalSlides) % totalSlides;
    updateCarousel();
}

function currentSlide(index) {
    currentIdx = index;
    updateCarousel();
}

function updateCarousel() {
    slider.style.transform = `translateX(-${currentIdx * 100}%)`;
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIdx);
    });
}

// Mobile Menu Toggle
function toggleMenu() {
    document.getElementById('sideMenu').classList.toggle('active');
}

// Auto Slide
setInterval(() => moveSlide(1), 5000);

document.querySelector('.account-trigger').addEventListener('click', function(e) {
    if (window.innerWidth < 768) {
        e.preventDefault();
        const content = this.nextElementSibling;
        content.style.display = (content.style.display === 'block') ? 'none' : 'block';
    }
});