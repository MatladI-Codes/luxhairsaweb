/**
 * LuxHair ZA - Authentication Module
 * Handles login, signup, and user session
 */

const API_BASE_URL = window.location.origin;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

/**
 * Check authentication status
 */
function checkAuthStatus() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');
    
    if (currentUser) {
        // User is logged in
        if (authButtons) authButtons.style.display = 'none';
        if (userProfile) {
            userProfile.style.display = 'flex';
            
            const userAvatar = document.getElementById('userAvatar');
            const userName = document.getElementById('userName');
            
            if (userAvatar) {
                userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
            }
            if (userName) {
                userName.textContent = currentUser.name.split(' ')[0];
            }
        }
    } else {
        // User is not logged in
        if (authButtons) authButtons.style.display = 'flex';
        if (userProfile) userProfile.style.display = 'none';
    }
}

/**
 * Handle signup
 */
async function handleSignup(event) {
    event.preventDefault();
    
    const name = document.getElementById('signupName')?.value;
    const email = document.getElementById('signupEmail')?.value;
    const password = document.getElementById('signupPassword')?.value;
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value;
    
    // Validation
    if (!name || !email || !password || !confirmPassword) {
        showNotification('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters');
        return;
    }
    
    const submitBtn = event.target.querySelector('.btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'CREATING ACCOUNT...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Signup failed');
        }
        
        // Save user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Update UI
        checkAuthStatus();
        
        // Close modal
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.remove('active');
        
        // Reset form
        event.target.reset();
        
        showNotification(`Welcome to LuxHair, ${data.user.name}!`);
        
    } catch (error) {
        console.error('Signup error:', error);
        showNotification(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'CREATE ACCOUNT';
    }
}

/**
 * Handle login
 */
async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    
    if (!email || !password) {
        showNotification('Please fill in all fields');
        return;
    }
    
    const submitBtn = event.target.querySelector('.btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'LOGGING IN...';
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        
        // Save user to localStorage
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Update UI
        checkAuthStatus();
        
        // Close modal
        const authModal = document.getElementById('authModal');
        if (authModal) authModal.classList.remove('active');
        
        // Reset form
        event.target.reset();
        
        showNotification(`Welcome back, ${data.user.name}!`);
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification(error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'LOGIN';
    }
}

/**
 * Handle logout
 */
function handleLogout() {
    localStorage.removeItem('currentUser');
    checkAuthStatus();
    showNotification('Logged out successfully');
    
    // Redirect to homepage if on protected page
    if (window.location.pathname.includes('profile') || window.location.pathname.includes('orders')) {
        window.location.href = 'index.html';
    }
}

/**
 * Check if user is authenticated (for protected pages)
 */
function requireAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        showNotification('Please login to access this page');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return false;
    }
    
    return true;
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
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}