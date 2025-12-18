/**
 * LuxHair ZA - User Profile Module
 * Handles user profile and order history
 */

const API_BASE_URL = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!requireAuth()) return;
    
    // Load profile data
    loadUserProfile();
    loadUserOrders();
});

/**
 * Load user profile
 */
async function loadUserProfile() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=${currentUser.email}`);
        const data = await response.json();
        
        if (data.success) {
            displayUserProfile(data.user, data.addresses);
        }
        
    } catch (error) {
        console.error('Profile load error:', error);
    }
}

/**
 * Display user profile
 */
function displayUserProfile(user, addresses) {
    const profileContainer = document.getElementById('profileContainer');
    
    if (!profileContainer) return;
    
    const defaultAddress = addresses.find(a => a.is_default) || {};
    
    profileContainer.innerHTML = `
        <div class="profile-section">
            <h2>Personal Information</h2>
            <form id="profileForm">
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="profileName" value="${user.name || ''}" class="form-input" required>
                </div>
                
                <div class="form-group">
                    <label>Email Address</label>
                    <input type="email" value="${user.email}" class="form-input" disabled>
                </div>
                
                <div class="form-group">
                    <label>Phone Number</label>
                    <input type="tel" id="profilePhone" value="${user.phone || ''}" class="form-input" placeholder="+27">
                </div>
                
                <h3 style="margin-top: 30px;">Default Shipping Address</h3>
                
                <div class="form-group">
                    <label>Street Address</label>
                    <input type="text" id="profileAddress" value="${defaultAddress.address || ''}" class="form-input">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>City</label>
                        <input type="text" id="profileCity" value="${defaultAddress.city || ''}" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label>Province</label>
                        <select id="profileProvince" class="form-input">
                            <option value="">Select Province</option>
                            <option value="GP" ${defaultAddress.province === 'GP' ? 'selected' : ''}>Gauteng</option>
                            <option value="WC" ${defaultAddress.province === 'WC' ? 'selected' : ''}>Western Cape</option>
                            <option value="EC" ${defaultAddress.province === 'EC' ? 'selected' : ''}>Eastern Cape</option>
                            <option value="KZN" ${defaultAddress.province === 'KZN' ? 'selected' : ''}>KwaZulu-Natal</option>
                            <option value="LP" ${defaultAddress.province === 'LP' ? 'selected' : ''}>Limpopo</option>
                            <option value="MP" ${defaultAddress.province === 'MP' ? 'selected' : ''}>Mpumalanga</option>
                            <option value="NC" ${defaultAddress.province === 'NC' ? 'selected' : ''}>Northern Cape</option>
                            <option value="NW" ${defaultAddress.province === 'NW' ? 'selected' : ''}>North West</option>
                            <option value="FS" ${defaultAddress.province === 'FS' ? 'selected' : ''}>Free State</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Postal Code</label>
                    <input type="text" id="profilePostalCode" value="${defaultAddress.postal_code || ''}" class="form-input">
                </div>
                
                <button type="submit" class="btn">Update Profile</button>
            </form>
        </div>
    `;
    
    // Add form submit handler
    document.getElementById('profileForm').addEventListener('submit', handleProfileUpdate);
}

/**
 * Handle profile update
 */
async function handleProfileUpdate(event) {
    event.preventDefault();
    
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const name = document.getElementById('profileName').value;
    const phone = document.getElementById('profilePhone').value;
    const address = {
        address: document.getElementById('profileAddress').value,
        city: document.getElementById('profileCity').value,
        province: document.getElementById('profileProvince').value,
        postalCode: document.getElementById('profilePostalCode').value
    };
    
    const submitBtn = event.target.querySelector('.btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'UPDATING...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/profile?email=${currentUser.email}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, address })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Update localStorage
            const updatedUser = { ...currentUser, name, phone };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            
            showNotification('Profile updated successfully');
        } else {
            throw new Error(data.error);
        }
        
    } catch (error) {
        console.error('Profile update error:', error);
        showNotification('Failed to update profile');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Profile';
    }
}

/**
 * Load user orders
 */
async function loadUserOrders() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) return;
    
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (!ordersContainer) return;
    
    ordersContainer.innerHTML = '<p>Loading orders...</p>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/orders?email=${currentUser.email}`);
        const data = await response.json();
        
        if (data.success) {
            displayUserOrders(data.orders);
        }
        
    } catch (error) {
        console.error('Orders load error:', error);
        ordersContainer.innerHTML = '<p>Failed to load orders</p>';
    }
}

/**
 * Display user orders
 */
function displayUserOrders(orders) {
    const ordersContainer = document.getElementById('ordersContainer');
    
    if (!ordersContainer) return;
    
    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <i class="fas fa-shopping-bag" style="font-size: 3rem; color: var(--gold); margin-bottom: 20px;"></i>
                <p style="color: var(--muted); font-size: 1.1rem;">No orders yet</p>
                <a href="index.html" class="btn" style="margin-top: 20px;">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    let ordersHTML = '';
    
    orders.forEach(order => {
        const statusColor = {
            'completed': '#27ae60',
            'pending': '#f39c12',
            'failed': '#e74c3c'
        }[order.payment_status] || '#95a5a6';
        
        ordersHTML += `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <h3>Order #${order.order_id}</h3>
                        <p class="order-date">${new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div class="order-status" style="background: ${statusColor}; color: white; padding: 5px 15px; border-radius: 20px; text-transform: uppercase; font-size: 0.75rem; font-weight: 600;">
                        ${order.payment_status}
                    </div>
                </div>
                
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <span>${item.product_name} x ${item.quantity}</span>
                            <span>R${item.subtotal.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-total">
                    <span>Total:</span>
                    <span style="color: var(--gold); font-weight: 600; font-size: 1.1rem;">R${order.total.toFixed(2)}</span>
                </div>
            </div>
        `;
    });
    
    ordersContainer.innerHTML = ordersHTML;
}