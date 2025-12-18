/**
 * LuxHair ZA - Main UI Script
 * Handles all user interface interactions
 * Requires: cart.js
 */

// Initialize cart manager
const cartManager = new CartManager();

// State variables
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let products = JSON.parse(localStorage.getItem('products')) || [
    { id: '1', name: 'Brazilian Straight 22"', price: 1200, rating: 4.5, reviews: 12 },
    { id: '2', name: 'Peruvian Body Wave 24"', price: 1550, rating: 4.0, reviews: 8 },
    { id: '3', name: 'HD Lace Frontal 13x4', price: 1800, rating: 5.0, reviews: 15 },
    { id: '4', name: 'Virgin Indian Wave Bundle', price: 999, rating: 4.5, reviews: 6 },
    { id: '5', name: 'Closure 4x4 Deep Wave', price: 850, rating: 4.0, reviews: 9 },
    { id: '6', name: 'Raw Vietnamese Straight 26"', price: 1950, rating: 5.0, reviews: 20 },
    { id: '7', name: 'Transparent Lace Wig 13x6', price: 2200, rating: 4.5, reviews: 14 }
];
let reviews = JSON.parse(localStorage.getItem('reviews')) || [
    { id: '1', productId: '6', name: 'Sarah M.', rating: 5, text: 'Absolutely stunning quality! The Vietnamese hair is so silky and natural-looking.', date: '2023-10-15' },
    { id: '2', productId: '3', name: 'Amanda K.', rating: 5, text: 'Best lace frontal I\'ve ever purchased. The HD lace is truly invisible!', date: '2023-10-10' },
    { id: '3', productId: '1', name: 'Jessica T.', rating: 4, text: 'Love the Brazilian straight! Great value for money and lasted really well.', date: '2023-10-05' },
    { id: '4', productId: '7', name: 'Chloe B.', rating: 5, text: 'The transparent lace wig exceeded my expectations. So comfortable and realistic!', date: '2023-09-28' },
    { id: '5', productId: '4', name: 'Michelle R.', rating: 4, text: 'Beautiful Indian wave bundle. Perfect for creating voluminous hairstyles.', date: '2023-09-20' },
    { id: '6', productId: '2', name: 'Danielle P.', rating: 4, text: 'Peruvian body wave has amazing bounce and texture. Very happy with my purchase!', date: '2023-09-15' }
];
let currentRating = 0;
let lastScrollTop = 0;
let shopButtonVisible = true;

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize application
 */
function initializeApp() {
    // Set current year
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Initialize UI
    updateCartUI();
    loadReviews();
    checkAuthStatus();
    
    // Setup event listeners
    setupEventListeners();
    setupCartButtons();
    setupScrollListener();
    setupTouchEvents();
    
    // Show loading screen briefly
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 3000);
    }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
    // Logo click - scroll to top
    const logo = document.getElementById('logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            showLoadingAndScroll('hero');
            showShopButton();
            closeAllDrawers();
        });
    }

    // Theme toggles
    setupThemeToggles();
    
    // Search
    setupSearch();
    
    // Cart drawer
    setupCartDrawer();
    
    // Modals
    setupModals();
    
    // Navigation
    setupNavigation();
    
    // Auth
    setupAuth();
    
    // Reviews
    setupReviews();
}

/**
 * Setup theme toggle buttons
 */
function setupThemeToggles() {
    const themeToggle = document.getElementById('themeToggle');
    const themeToggleLoggedIn = document.getElementById('themeToggleLoggedIn');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    if (themeToggleLoggedIn) {
        themeToggleLoggedIn.addEventListener('click', toggleTheme);
    }
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

/**
 * Update theme icon based on current theme
 */
function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-toggle i');
    icons.forEach(icon => {
        icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
}

/**
 * Setup search functionality
 */
function setupSearch() {
    const searchBar = document.getElementById('searchBar');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    if (searchBar) {
        searchBar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

/**
 * Perform product search
 */
function performSearch() {
    const searchBar = document.getElementById('searchBar');
    if (!searchBar) return;
    
    const searchTerm = searchBar.value.toLowerCase().trim();
    
    if (!searchTerm) {
        showNotification('Please enter a search term');
        return;
    }
    
    const searchResults = [];
    
    document.querySelectorAll('.product-card').forEach(card => {
        const title = card.getAttribute('data-name')?.toLowerCase() || '';
        const description = card.querySelector('.product-title')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            searchResults.push(card);
        }
    });
    
    if (searchResults.length === 0) {
        showNotification(`No products found for "${searchTerm}"`);
        return;
    }
    
    // Highlight results
    searchResults.forEach(result => {
        result.style.boxShadow = '0 0 0 2px var(--gold)';
        result.style.transition = 'box-shadow 0.3s ease';
        
        setTimeout(() => {
            result.style.boxShadow = '';
        }, 3000);
    });
    
    // Scroll to first result
    if (searchResults[0]) {
        searchResults[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        showNotification(`Found ${searchResults.length} product(s) for "${searchTerm}"`);
    }
}

/**
 * Setup cart drawer
 */
function setupCartDrawer() {
    const cartBtnLoggedOut = document.getElementById('cartBtnLoggedOut');
    const cartBtnLoggedIn = document.getElementById('cartBtnLoggedIn');
    const cartDrawer = document.getElementById('cartDrawer');
    const closeCart = document.getElementById('closeCart');
    const checkoutBtn = document.getElementById('checkoutBtn');
    const priceDrawer = document.getElementById('priceDrawer');
    
    // Cart button for logged out users - show login prompt
    if (cartBtnLoggedOut) {
        cartBtnLoggedOut.addEventListener('click', () => {
            if (!currentUser) {
                showNotification('Please login to access your cart');
                const authModal = document.getElementById('authModal');
                if (authModal) {
                    authModal.classList.add('active');
                    switchToTab('login');
                }
            }
        });
    }
    
    // Cart button for logged in users - open drawer
    if (cartBtnLoggedIn) {
        cartBtnLoggedIn.addEventListener('click', () => {
            if (cartDrawer) {
                cartDrawer.classList.add('active');
            }
            if (priceDrawer) {
                priceDrawer.classList.remove('active');
            }
        });
    }
    
    // Close cart drawer
    if (closeCart && cartDrawer) {
        closeCart.addEventListener('click', () => {
            cartDrawer.classList.remove('active');
        });
    }
    
    // Checkout button
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', handleCheckout);
    }
}

/**
 * Handle checkout button click
 */
function handleCheckout() {
    if (!currentUser) {
        showNotification('Please login to checkout');
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.classList.add('active');
            switchToTab('login');
        }
        return;
    }
    
    if (cartManager.isEmpty()) {
        showNotification('Your cart is empty');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

/**
 * Setup modals
 */
function setupModals() {
    // Feedback modal
    const feedbackBtn = document.getElementById('feedbackBtn');
    const feedbackBtnLoggedIn = document.getElementById('feedbackBtnLoggedIn');
    const feedbackModal = document.getElementById('feedbackModal');
    const closeFeedback = document.getElementById('closeFeedback');
    
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            if (feedbackModal) feedbackModal.classList.add('active');
        });
    }
    if (feedbackBtnLoggedIn) {
        feedbackBtnLoggedIn.addEventListener('click', () => {
            if (feedbackModal) feedbackModal.classList.add('active');
        });
    }
    if (closeFeedback && feedbackModal) {
        closeFeedback.addEventListener('click', () => {
            feedbackModal.classList.remove('active');
        });
    }
    
    // Track order modal
    const trackBtn = document.getElementById('trackBtn');
    const trackBtnLoggedIn = document.getElementById('trackBtnLoggedIn');
    const trackModal = document.getElementById('trackModal');
    const closeTrack = document.getElementById('closeTrack');
    const trackForm = document.getElementById('trackForm');
    
    if (trackBtn) {
        trackBtn.addEventListener('click', () => {
            if (trackModal) trackModal.classList.add('active');
        });
    }
    if (trackBtnLoggedIn) {
        trackBtnLoggedIn.addEventListener('click', () => {
            if (trackModal) trackModal.classList.add('active');
        });
    }
    if (closeTrack && trackModal) {
        closeTrack.addEventListener('click', () => {
            trackModal.classList.remove('active');
        });
    }
    if (trackForm) {
        trackForm.addEventListener('submit', handleTrackOrder);
    }
    
    // Price list drawer
    const priceListBtn = document.getElementById('priceListBtn');
    const priceDrawer = document.getElementById('priceDrawer');
    const closePrice = document.getElementById('closePrice');
    const cartDrawer = document.getElementById('cartDrawer');
    
    if (priceListBtn) {
        priceListBtn.addEventListener('click', () => {
            if (priceDrawer) priceDrawer.classList.add('active');
            if (cartDrawer) cartDrawer.classList.remove('active');
        });
    }
    if (closePrice && priceDrawer) {
        closePrice.addEventListener('click', () => {
            priceDrawer.classList.remove('active');
        });
    }
    
    // Close modals on outside click
    window.addEventListener('click', (e) => {
        if (e.target === feedbackModal) feedbackModal.classList.remove('active');
        if (e.target === trackModal) trackModal.classList.remove('active');
        
        const authModal = document.getElementById('authModal');
        if (e.target === authModal) authModal.classList.remove('active');
    });
    
    // Close price drawer on outside click
    document.addEventListener('click', (e) => {
        if (priceDrawer && !priceDrawer.contains(e.target) && 
            !priceListBtn.contains(e.target) && 
            priceDrawer.classList.contains('active')) {
            priceDrawer.classList.remove('active');
        }
    });
}

/**
 * Handle track order form submission
 */
function handleTrackOrder(e) {
    e.preventDefault();
    const orderNumber = document.getElementById('orderNumber')?.value;
    
    if (!orderNumber) {
        showNotification('Please enter your order number');
        return;
    }
    
    // In a real implementation, this would call an API
    alert(`Tracking order: ${orderNumber}\n\nIn a real implementation, this would show tracking details.`);
    const trackModal = document.getElementById('trackModal');
    if (trackModal) trackModal.classList.remove('active');
}

/**
 * Setup navigation
 */
function setupNavigation() {
    const subHeaderLinks = document.querySelectorAll('.sub-header-link');
    const shopCollectionBtn = document.getElementById('shopCollectionBtn');
    
    subHeaderLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all links
            subHeaderLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            const target = link.getAttribute('data-target');
            
            if (target) {
                showLoadingAndScroll(target);
                hideShopButton();
            }
        });
    });
    
    if (shopCollectionBtn) {
        shopCollectionBtn.addEventListener('click', () => {
            showLoadingAndScroll('new');
            hideShopButton();
        });
    }
}

/**
 * Setup cart buttons on product cards
 */
function setupCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const card = e.target.closest('.product-card');
            if (!card) return;
            
            const productId = card.getAttribute('data-id');
            const productName = card.getAttribute('data-name');
            const productPrice = card.getAttribute('data-price');
            
            if (productId && productName && productPrice) {
                handleAddToCart(productId, productName, productPrice);
            }
        });
    });
}

/**
 * Handle add to cart
 */
function handleAddToCart(productId, productName, productPrice) {
    cartManager.addItem(productId, productName, productPrice);
    updateCartUI();
    showNotification(`Added ${productName} to cart`);
}

/**
 * Update cart UI
 */
function updateCartUI() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartCounts = document.querySelectorAll('.cart-count');
    
    const items = cartManager.getItems();
    const count = cartManager.getCount();
    const total = cartManager.getTotal();
    
    // Update cart count badges
    cartCounts.forEach(badge => {
        badge.textContent = count;
    });
    
    // Update cart total
    if (cartTotal) {
        cartTotal.textContent = `R${total.toFixed(2)}`;
    }
    
    // Update cart items display
    if (cartItems) {
        if (items.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--muted);">Your cart is empty</p>';
        } else {
            let itemsHTML = '';
            items.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                itemsHTML += `
                    <div style="padding: 18px 0; border-bottom: 1px solid rgba(193, 160, 70, 0.1);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                            <div>
                                <div style="font-weight: 500; margin-bottom: 5px; color: var(--text); font-size: 0.9rem;">${item.name}</div>
                                <div style="color: var(--gold); font-weight: 600; margin-bottom: 5px; font-size: 0.95rem;">R${item.price.toFixed(2)}</div>
                                <div style="color: var(--muted); font-size: 0.85rem;">Qty: ${item.quantity}</div>
                            </div>
                            <div>
                                <button onclick="removeFromCart(${index})" style="background: none; border: none; color: var(--muted); cursor: pointer; padding: 5px; font-size: 0.9rem;">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            cartItems.innerHTML = itemsHTML;
        }
    }
}

/**
 * Remove item from cart (global function for inline onclick)
 */
window.removeFromCart = function(index) {
    cartManager.removeItem(index);
    updateCartUI();
    showNotification('Item removed from cart');
};

/**
 * Setup scroll listener
 */
function setupScrollListener() {
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            hideShopButton();
        } else {
            showShopButton();
        }
        
        lastScrollTop = scrollTop;
    });
}

/**
 * Show shop collection button
 */
function showShopButton() {
    const shopCollectionContainer = document.getElementById('shopCollectionContainer');
    if (shopCollectionContainer && !shopButtonVisible) {
        shopCollectionContainer.classList.remove('hidden');
        shopButtonVisible = true;
    }
}

/**
 * Hide shop collection button
 */
function hideShopButton() {
    const shopCollectionContainer = document.getElementById('shopCollectionContainer');
    if (shopCollectionContainer && shopButtonVisible) {
        shopCollectionContainer.classList.add('hidden');
        shopButtonVisible = false;
    }
}

/**
 * Show loading screen and scroll to section
 */
function showLoadingAndScroll(sectionId) {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
    
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
        }
        
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 500);
}

/**
 * Close all drawers
 */
function closeAllDrawers() {
    const cartDrawer = document.getElementById('cartDrawer');
    const priceDrawer = document.getElementById('priceDrawer');
    
    if (cartDrawer) cartDrawer.classList.remove('active');
    if (priceDrawer) priceDrawer.classList.remove('active');
}

/**
 * Setup touch events for mobile
 */
function setupTouchEvents() {
    if ('ontouchstart' in window) {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('touchstart', function() {
                this.classList.toggle('touch');
            });
        });
    }
}

/**
 * Show notification
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 160px;
        right: 20px;
        background: var(--gold);
        color: #000;
        padding: 12px 20px;
        border-radius: 0;
        font-weight: 500;
        z-index: 10000;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        transform: translateX(150%);
        transition: transform 0.3s ease;
        font-family: 'Montserrat', sans-serif;
        letter-spacing: 0.8px;
        text-transform: uppercase;
        font-size: 0.8rem;
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

/**
 * LuxHair ZA - Authentication & Reviews Module
 * Part 2 of script.js - handles auth and review functionality
 * Include this after cart.js and script.js
 */

/**
 * Setup authentication
 */
function setupAuth() {
    const loginBtn = document.getElementById('loginBtn');
    const authModal = document.getElementById('authModal');
    const closeAuth = document.getElementById('closeAuth');
    const authTabs = document.querySelectorAll('.auth-tab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const switchToSignup = document.getElementById('switchToSignup');
    const switchToLogin = document.getElementById('switchToLogin');
    const logoutLink = document.getElementById('logoutLink');
    const profileLink = document.getElementById('profileLink');
    const ordersLink = document.getElementById('ordersLink');
    const wishlistLink = document.getElementById('wishlistLink');
    
    // Open login modal
    if (loginBtn && authModal) {
        loginBtn.addEventListener('click', () => {
            authModal.classList.add('active');
            switchToTab('login');
        });
    }
    
    // Close auth modal
    if (closeAuth && authModal) {
        closeAuth.addEventListener('click', () => {
            authModal.classList.remove('active');
        });
    }
    
    // Tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchToTab(tabName);
        });
    });
    
    // Switch links
    if (switchToSignup) {
        switchToSignup.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab('signup');
        });
    }
    if (switchToLogin) {
        switchToLogin.addEventListener('click', (e) => {
            e.preventDefault();
            switchToTab('login');
        });
    }
    
    // Form submissions
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    // User actions
    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Profile page would open here');
        });
    }
    if (ordersLink) {
        ordersLink.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Orders page would open here');
        });
    }
    if (wishlistLink) {
        wishlistLink.addEventListener('click', (e) => {
            e.preventDefault();
            showNotification('Wishlist page would open here');
        });
    }
}

/**
 * Switch between login/signup tabs
 */
function switchToTab(tabName) {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    // Update tabs
    authTabs.forEach(tab => {
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Update forms
    authForms.forEach(form => {
        if (form.id === tabName + 'Form') {
            form.classList.add('active');
        } else {
            form.classList.remove('active');
        }
    });
}

/**
 * Handle login form submission
 */
function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields');
        return;
    }
    
    const submitBtn = e.target.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'LOGGING IN...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        // For demo purposes, accept any email/password
        const user = {
            id: 'user_' + Date.now(),
            name: email.split('@')[0],
            email: email,
            joined: new Date().toISOString()
        };
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI
        checkAuthStatus();
        
        // Reset form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) loginForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Close modal
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.remove('active');
        
        showNotification(`Welcome back, ${user.name}!`);
    }, 1500);
}

/**
 * Handle signup form submission
 */
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
    const termsAgree = document.getElementById('termsAgree')?.checked;
    
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields');
        return;
    }
    
    if (!termsAgree) {
        showNotification('Please agree to the terms and conditions');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match');
        return;
    }
    
    const submitBtn = e.target.querySelector('.btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'CREATING ACCOUNT...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        const user = {
            id: 'user_' + Date.now(),
            name: name,
            email: email,
            joined: new Date().toISOString()
        };
        
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        // Update UI
        checkAuthStatus();
        
        // Reset form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) signupForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Close modal
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.remove('active');
        
        showNotification(`Welcome to LuxHair, ${name}!`);
    }, 1500);
}

/**
 * Handle logout
 */
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    checkAuthStatus();
    showNotification('Logged out successfully');
}

/**
 * Check authentication status and update UI
 */
function checkAuthStatus() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    
    if (currentUser) {
        // User is logged in
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) userProfile.style.display = 'flex';
        
        if (userAvatar) {
            userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
        }
        if (userName) {
            userName.textContent = currentUser.name.split(' ')[0];
        }
    } else {
        // User is not logged in
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
}

/**
 * Setup reviews functionality
 */
function setupReviews() {
    const ratingStars = document.querySelectorAll('.rating-star');
    const submitFeedback = document.getElementById('submitFeedback');
    
    // Rating stars
    ratingStars.forEach(star => {
        star.addEventListener('click', (e) => {
            const value = parseInt(e.target.getAttribute('data-value'));
            currentRating = value;
            
            // Update all stars
            ratingStars.forEach((s, index) => {
                if (index < value) {
                    s.style.color = 'var(--gold)';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
    
    // Submit feedback
    if (submitFeedback) {
        submitFeedback.addEventListener('click', handleSubmitFeedback);
    }
}

/**
 * Handle feedback submission
 */
function handleSubmitFeedback() {
    const productId = document.getElementById('feedbackProduct')?.value;
    const feedback = document.getElementById('feedbackText')?.value;
    const name = document.getElementById('feedbackName')?.value || 'Anonymous';
    
    if (!productId) {
        showNotification('Please select a product');
        return;
    }
    
    if (currentRating === 0) {
        showNotification('Please provide a rating');
        return;
    }
    
    if (!feedback || !feedback.trim()) {
        showNotification('Please share your experience');
        return;
    }
    
    // Add review
    const review = {
        id: 'rev_' + Date.now(),
        productId: productId,
        name: name,
        rating: currentRating,
        text: feedback,
        date: new Date().toISOString().split('T')[0]
    };
    
    reviews.push(review);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    
    // Update product rating
    const productReviews = reviews.filter(r => r.productId === productId);
    const averageRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex > -1) {
        products[productIndex].rating = parseFloat(averageRating.toFixed(1));
        products[productIndex].reviews = productReviews.length;
        localStorage.setItem('products', JSON.stringify(products));
        
        // Update product card rating
        const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
        if (productCard) {
            const ratingElement = productCard.querySelector('.product-rating');
            const stars = Math.floor(averageRating);
            const hasHalfStar = averageRating % 1 >= 0.5;
            const emptyStars = 5 - stars - (hasHalfStar ? 1 : 0);
            
            ratingElement.innerHTML = `
                ${'<i class="fas fa-star"></i>'.repeat(stars)}
                ${hasHalfStar ? '<i class="fas fa-star-half-alt"></i>' : ''}
                ${'<i class="far fa-star"></i>'.repeat(emptyStars)}
                <span>(${averageRating.toFixed(1)})</span>
            `;
        }
    }
    
    // Reset form
    document.getElementById('feedbackProduct').value = '';
    document.getElementById('feedbackText').value = '';
    document.getElementById('feedbackName').value = '';
    currentRating = 0;
    document.querySelectorAll('.rating-star').forEach(s => s.style.color = '#ddd');
    
    const feedbackModal = document.getElementById('feedbackModal');
    if (feedbackModal) feedbackModal.classList.remove('active');
    
    showNotification('Thank you for your review!');
    
    // Reload reviews
    loadReviews();
}

/**
 * Load reviews into the reviews section
 */
function loadReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;
    
    let reviewsHTML = '';
    const recentReviews = [...reviews].reverse().slice(0, 6);
    
    if (recentReviews.length === 0) {
        reviewsHTML = '<p style="text-align: center; color: var(--muted); grid-column: 1/-1;">No reviews yet. Be the first to review!</p>';
    } else {
        recentReviews.forEach(review => {
            const product = products.find(p => p.id === review.productId);
            if (product) {
                reviewsHTML += `
                    <div class="review-card">
                        <div class="review-header">
                            <div>
                                <div class="reviewer-name">${review.name}</div>
                                <div style="color: var(--muted); font-size: 0.85rem; margin-top: 2px;">${product.name}</div>
                            </div>
                            <div class="review-rating">
                                ${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}
                            </div>
                        </div>
                        <div class="review-text">"${review.text}"</div>
                        <div class="review-date">${review.date}</div>
                    </div>
                `;
            }
        });
    }
    
    reviewsGrid.innerHTML = reviewsHTML;
}