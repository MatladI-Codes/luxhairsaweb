/**
 * LuxHair ZA - Checkout Page Logic (Backend Integrated)
 * Handles checkout form, payment selection, and backend API calls
 */

// Initialize cart manager
const cartManager = new CartManager();

// API Base URL - FIXED: Now uses window.location.origin for production
const API_BASE_URL = window.location.origin;

// Checkout state
let checkoutData = {
    customer: {
        firstName: '',
        lastName: '',
        email: '',
        phone: ''
    },
    shipping: {
        address: '',
        city: '',
        province: '',
        postalCode: ''
    },
    paymentMethod: '',
    notes: ''
};

let shippingCost = 0; // Free shipping
const FREE_SHIPPING_THRESHOLD = 0; // Free shipping on all orders

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    initializeCheckout();
});

/**
 * Initialize checkout page
 */
function initializeCheckout() {
    // Load theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    
    // Check if cart is empty
    if (cartManager.isEmpty()) {
        showEmptyCart();
        return;
    }
    
    // Load cart summary
    loadCartSummary();
    
    // Load checkout form
    loadCheckoutForm();
}

/**
 * Show empty cart message
 */
function showEmptyCart() {
    const checkoutContent = document.getElementById('checkoutContent');
    
    checkoutContent.innerHTML = `
        <div class="empty-cart">
            <div class="empty-icon">
                <i class="fas fa-shopping-bag"></i>
            </div>
            <p class="empty-text">Your cart is empty</p>
            <a href="index.html" class="btn">Continue Shopping</a>
        </div>
    `;
}

/**
 * Load cart summary in sidebar
 */
function loadCartSummary() {
    const summaryItems = document.getElementById('summaryItems');
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryTotal = document.getElementById('summaryTotal');
    
    const items = cartManager.getItems();
    const subtotal = cartManager.getSubtotal();
    
    // Calculate shipping
    shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 0; // Currently free
    const total = subtotal + shippingCost;
    
    // Render items
    let itemsHTML = '';
    items.forEach(item => {
        itemsHTML += `
            <div class="cart-item">
                <div class="item-image">
                    <img src="media/PLH.png" alt="${item.name}">
                </div>
                <div class="item-details">
                    <div class="item-name">${item.name}</div>
                    <div class="item-qty">Qty: ${item.quantity}</div>
                </div>
                <div class="item-price">R${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    });
    
    summaryItems.innerHTML = itemsHTML;
    summarySubtotal.textContent = `R${subtotal.toFixed(2)}`;
    summaryShipping.textContent = shippingCost === 0 ? 'FREE' : `R${shippingCost.toFixed(2)}`;
    summaryTotal.textContent = `R${total.toFixed(2)}`;
}

/**
 * Load checkout form
 */
function loadCheckoutForm() {
    const checkoutContent = document.getElementById('checkoutContent');
    
    // Get saved user data if exists
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    
    checkoutContent.innerHTML = `
        <!-- Customer Information -->
        <div class="checkout-section">
            <div class="section-header">
                <div class="section-number">1</div>
                <h2 class="section-title">Contact Information</h2>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">First Name *</label>
                    <input type="text" class="form-input" id="firstName" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Last Name *</label>
                    <input type="text" class="form-input" id="lastName" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Email Address *</label>
                    <input type="email" class="form-input" id="email" value="${currentUser ? currentUser.email : ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone Number *</label>
                    <input type="tel" class="form-input" id="phone" placeholder="+27" required>
                </div>
            </div>
        </div>
        
        <!-- Shipping Address -->
        <div class="checkout-section">
            <div class="section-header">
                <div class="section-number">2</div>
                <h2 class="section-title">Shipping Address</h2>
            </div>
            
            <div class="form-row-full">
                <div class="form-group">
                    <label class="form-label">Street Address *</label>
                    <input type="text" class="form-input" id="address" placeholder="123 Main Street" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">City *</label>
                    <input type="text" class="form-input" id="city" placeholder="Johannesburg" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Province *</label>
                    <select class="form-input" id="province" required>
                        <option value="">Select Province</option>
                        <option value="GP">Gauteng</option>
                        <option value="WC">Western Cape</option>
                        <option value="EC">Eastern Cape</option>
                        <option value="KZN">KwaZulu-Natal</option>
                        <option value="LP">Limpopo</option>
                        <option value="MP">Mpumalanga</option>
                        <option value="NC">Northern Cape</option>
                        <option value="NW">North West</option>
                        <option value="FS">Free State</option>
                    </select>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">Postal Code *</label>
                    <input type="text" class="form-input" id="postalCode" placeholder="2000" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Delivery Notes (Optional)</label>
                    <input type="text" class="form-input" id="notes" placeholder="e.g., Gate code">
                </div>
            </div>
        </div>
        
        <!-- Payment Method -->
        <div class="checkout-section">
            <div class="section-header">
                <div class="section-number">3</div>
                <h2 class="section-title">Payment Method</h2>
            </div>
            
            <div class="payment-methods">
                <div class="payment-option" data-method="card">
                    <div class="payment-radio"></div>
                    <div class="payment-icon">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="payment-info">
                        <div class="payment-name">Credit/Debit Card</div>
                        <div class="payment-desc">Secure payment via PayFast</div>
                    </div>
                </div>
                
                <div class="payment-option" data-method="eft">
                    <div class="payment-radio"></div>
                    <div class="payment-icon">
                        <i class="fas fa-university"></i>
                    </div>
                    <div class="payment-info">
                        <div class="payment-name">Bank Transfer (EFT)</div>
                        <div class="payment-desc">Direct bank transfer</div>
                    </div>
                </div>
                
                <div class="payment-option" data-method="cash">
                    <div class="payment-radio"></div>
                    <div class="payment-icon">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="payment-info">
                        <div class="payment-name">Cash Deposit</div>
                        <div class="payment-desc">Deposit at any bank branch</div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Place Order Button -->
        <button class="place-order-btn" id="placeOrderBtn" disabled>
            <i class="fas fa-lock" style="margin-right: 8px;"></i>
            Place Order
        </button>
        
        <p style="text-align: center; color: var(--muted); font-size: 0.85rem; margin-top: 20px;">
            By placing your order, you agree to our Terms & Conditions and Privacy Policy.
        </p>
    `;
    
    // Setup event listeners
    setupFormListeners();
}

/**
 * Setup form event listeners
 */
function setupFormListeners() {
    // Payment method selection
    const paymentOptions = document.querySelectorAll('.payment-option');
    paymentOptions.forEach(option => {
        option.addEventListener('click', () => {
            paymentOptions.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            checkoutData.paymentMethod = option.getAttribute('data-method');
            validateForm();
        });
    });
    
    // Form inputs - validate on change
    const requiredInputs = document.querySelectorAll('.form-input[required]');
    requiredInputs.forEach(input => {
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateForm);
    });
    
    // Place order button
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', handlePlaceOrder);
    }
}

/**
 * Validate form
 */
function validateForm() {
    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('lastName')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const phone = document.getElementById('phone')?.value.trim();
    const address = document.getElementById('address')?.value.trim();
    const city = document.getElementById('city')?.value.trim();
    const province = document.getElementById('province')?.value;
    const postalCode = document.getElementById('postalCode')?.value.trim();
    const paymentMethod = checkoutData.paymentMethod;
    
    const isValid = firstName && lastName && email && phone && 
                    address && city && province && postalCode && 
                    paymentMethod;
    
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    if (placeOrderBtn) {
        placeOrderBtn.disabled = !isValid;
    }
    
    return isValid;
}

/**
 * Handle place order - BACKEND INTEGRATED
 */
async function handlePlaceOrder() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields');
        return;
    }
    
    // Collect form data
    checkoutData.customer.firstName = document.getElementById('firstName')?.value.trim();
    checkoutData.customer.lastName = document.getElementById('lastName')?.value.trim();
    checkoutData.customer.email = document.getElementById('email')?.value.trim();
    checkoutData.customer.phone = document.getElementById('phone')?.value.trim();
    
    checkoutData.shipping.address = document.getElementById('address')?.value.trim();
    checkoutData.shipping.city = document.getElementById('city')?.value.trim();
    checkoutData.shipping.province = document.getElementById('province')?.value;
    checkoutData.shipping.postalCode = document.getElementById('postalCode')?.value.trim();
    checkoutData.notes = document.getElementById('notes')?.value.trim();
    
    // Get cart summary
    const orderSummary = {
        items: cartManager.getItems(),
        subtotal: cartManager.getSubtotal(),
        shipping: shippingCost,
        total: cartManager.getSubtotal() + shippingCost
    };
    
    // Create order object
    const order = {
        orderId: 'ORD-' + Date.now(),
        customer: checkoutData.customer,
        shipping: checkoutData.shipping,
        payment: {
            method: checkoutData.paymentMethod,
            status: 'pending'
        },
        order: orderSummary,
        notes: checkoutData.notes,
        createdAt: new Date().toISOString()
    };
    
    // Show loading
    const placeOrderBtn = document.getElementById('placeOrderBtn');
    placeOrderBtn.disabled = true;
    placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i> Processing...';
    
    // Process payment based on method
    try {
        if (checkoutData.paymentMethod === 'card') {
            await processCardPayment(order);
        } else {
            await processManualPayment(order);
        }
    } catch (error) {
        console.error('Payment error:', error);
        showNotification('Payment processing failed. Please try again.');
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = '<i class="fas fa-lock" style="margin-right: 8px;"></i> Place Order';
    }
}

/**
 * Process card payment via PayFast (BACKEND)
 */
async function processCardPayment(order) {
    try {
        // Call backend to create PayFast payment
        const response = await fetch(`${API_BASE_URL}/api/payments/payfast/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order: {
                    items: order.order.items,
                    subtotal: order.order.subtotal,
                    shipping: order.order.shipping,
                    total: order.order.total
                },
                customer: order.customer
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to create payment: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Save order before redirecting
        localStorage.setItem('pendingOrder', JSON.stringify(order));
        
        // Create form to submit to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl || 'https://sandbox.payfast.co.za/eng/process';
        
        // Add all payment data as hidden inputs
        for (let key in data.paymentData) {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data.paymentData[key];
            form.appendChild(input);
        }
        
        document.body.appendChild(form);
        form.submit();
        
    } catch (error) {
        console.error('Card payment error:', error);
        showNotification(`Payment error: ${error.message}`);
        throw error;
    }
}

/**
 * Process manual payment (EFT/Cash) via BACKEND
 */
async function processManualPayment(order) {
    try {
        // Determine which endpoint to call based on payment method
        let endpoint = '';
        if (checkoutData.paymentMethod === 'eft') {
            endpoint = '/api/payments/eft/create';
        } else if (checkoutData.paymentMethod === 'cash') {
            // Use EFT endpoint for cash deposits too (similar process)
            endpoint = '/api/payments/eft/create';
        } else {
            throw new Error('Invalid payment method');
        }
        
        // Call backend to create order
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                order: {
                    items: order.order.items,
                    subtotal: order.order.subtotal,
                    shipping: order.order.shipping,
                    total: order.order.total
                },
                customer: order.customer
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to create order: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Save order
        order.orderId = data.orderId || order.orderId;
        localStorage.setItem('pendingOrder', JSON.stringify(order));
        
        // Clear cart
        cartManager.clearCart();
        
        // Redirect to success page
        window.location.href = `paymentsuccess.html?order=${order.orderId}&status=pending&method=${checkoutData.paymentMethod}`;
        
    } catch (error) {
        console.error('Manual payment error:', error);
        showNotification(`Payment setup failed: ${error.message}`);
        throw error;
    }
}

/**
 * Show notification
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 90px;
        right: 20px;
        background: var(--gold);
        color: #000;
        padding: 12px 20px;
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
    
    setTimeout(() => notification.style.transform = 'translateX(0)', 10);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(150%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}