// ===== DOM ELEMENTS =====
const heroSection = document.getElementById('heroSection');
const zonesSection = document.getElementById('zonesSection');
const bookingsSection = document.getElementById('bookingsSection');
const adminSection = document.getElementById('adminSection');

const zonesGrid = document.getElementById('zonesGrid');
const bookingsList = document.getElementById('bookingsList');
const adminBookingsList = document.getElementById('adminBookingsList');
const usersList = document.getElementById('usersList');
const adminZonesGrid = document.getElementById('adminZonesGrid');

const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const bookingModal = document.getElementById('bookingModal');
const paymentModal = document.getElementById('paymentModal');
const receiptModal = document.getElementById('receiptModal');

const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');

// Payment state
let selectedPaymentMethod = null;
let pendingBookingData = null;

// ===== NAVIGATION =====
document.getElementById('homeBtn').addEventListener('click', () => showSection('hero'));
document.getElementById('zonesBtn').addEventListener('click', () => showSection('zones'));
document.getElementById('myBookingsBtn').addEventListener('click', () => {
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Iltimos, avval tizimga kiring', 'error');
        showModal('login');
        return;
    }
    showSection('bookings');
    loadUserBookings();
});
document.getElementById('loginBtn').addEventListener('click', () => showModal('login'));
document.getElementById('logoutBtn').addEventListener('click', handleLogout);
document.getElementById('adminBtn').addEventListener('click', () => {
    showSection('admin');
    loadAdminData();
});
document.getElementById('startBookingBtn').addEventListener('click', () => showSection('zones'));

function showSection(section) {
    heroSection.classList.add('hidden');
    zonesSection.classList.add('hidden');
    bookingsSection.classList.add('hidden');
    adminSection.classList.add('hidden');

    switch(section) {
        case 'hero':
            heroSection.classList.remove('hidden');
            break;
        case 'zones':
            zonesSection.classList.remove('hidden');
            loadZones();
            break;
        case 'bookings':
            bookingsSection.classList.remove('hidden');
            break;
        case 'admin':
            adminSection.classList.remove('hidden');
            break;
    }
}

// ===== MODAL FUNCTIONS =====
function showModal(modalType) {
    loginModal.classList.add('hidden');
    registerModal.classList.add('hidden');
    bookingModal.classList.add('hidden');
    paymentModal.classList.add('hidden');
    receiptModal.classList.add('hidden');

    switch(modalType) {
        case 'login':
            loginModal.classList.remove('hidden');
            break;
        case 'register':
            registerModal.classList.remove('hidden');
            break;
        case 'booking':
            bookingModal.classList.remove('hidden');
            break;
        case 'payment':
            paymentModal.classList.remove('hidden');
            break;
        case 'receipt':
            receiptModal.classList.remove('hidden');
            break;
    }
}

function hideAllModals() {
    loginModal.classList.add('hidden');
    registerModal.classList.add('hidden');
    bookingModal.classList.add('hidden');
    paymentModal.classList.add('hidden');
    receiptModal.classList.add('hidden');
    selectedPaymentMethod = null;
    pendingBookingData = null;
}

document.getElementById('closeLoginModal').addEventListener('click', hideAllModals);
document.getElementById('closeRegisterModal').addEventListener('click', hideAllModals);
document.getElementById('closeBookingModal').addEventListener('click', hideAllModals);
document.getElementById('closePaymentModal').addEventListener('click', hideAllModals);
document.getElementById('closeReceiptModal').addEventListener('click', hideAllModals);
document.getElementById('closeReceiptBtn').addEventListener('click', hideAllModals);

document.getElementById('showRegisterBtn').addEventListener('click', (e) => {
    e.preventDefault();
    showModal('register');
});

document.getElementById('showLoginBtn').addEventListener('click', (e) => {
    e.preventDefault();
    showModal('login');
});

// Close modal on overlay click
[loginModal, registerModal, bookingModal, paymentModal, receiptModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideAllModals();
        }
    });
});

// ===== API CONFIG =====
const API_BASE = 'http://localhost:5000/api';

// ===== LOCAL STORAGE FOR CURRENT USER =====
function getCurrentUser() {
    const user = localStorage.getItem('current_user');
    return user ? JSON.parse(user) : null;
}

function setCurrentUser(user) {
    if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
    } else {
        localStorage.removeItem('current_user');
    }
}

// ===== AUTH FUNCTIONS =====
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('registerForm').addEventListener('submit', handleRegister);

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();
        
        if (result.success) {
            setCurrentUser(result.user);
            showToast(result.message, 'success');
            hideAllModals();
            updateAuthUI();
            document.getElementById('loginForm').reset();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Xatolik yuz berdi', 'error');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    try {
        const response = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role: 'user' })
        });
        const result = await response.json();
        
        if (result.success) {
            showToast(result.message, 'success');
            hideAllModals();
            showModal('login');
            document.getElementById('registerForm').reset();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('Xatolik yuz berdi', 'error');
    }
}

function handleLogout() {
    setCurrentUser(null);
    showToast('Tizimdan chiqdingiz', 'success');
    updateAuthUI();
    showSection('hero');
}

function updateAuthUI() {
    const currentUser = getCurrentUser();
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminBtn = document.getElementById('adminBtn');
    
    if (currentUser) {
        loginBtn.classList.add('hidden');
        logoutBtn.classList.remove('hidden');
        
        if (currentUser.role === 'admin') {
            adminBtn.classList.remove('hidden');
        } else {
            adminBtn.classList.add('hidden');
        }
    } else {
        loginBtn.classList.remove('hidden');
        logoutBtn.classList.add('hidden');
        adminBtn.classList.add('hidden');
    }
}

async function isAdmin() {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    try {
        const response = await fetch(`${API_BASE}/users/${currentUser.id}/is-admin`);
        const data = await response.json();
        return data.is_admin;
    } catch (error) {
    return false;
    }
}

// ===== ZONES FUNCTIONS =====
async function loadZones() {
    console.log('Starting to load zones...');
    try {
        console.log('Fetching from:', `${API_BASE}/zones`);
        const response = await fetch(`${API_BASE}/zones`);
        console.log('Response status:', response.status);
        const zones = await response.json();
        console.log('Loaded zones:', zones);
        console.log('Zones count:', zones.length);
        
        zonesGrid.innerHTML = '';
        console.log('Cleared zonesGrid');
        
        zones.forEach((zone, index) => {
            console.log(`Creating card for zone ${index}:`, zone.title);
            const card = createZoneCard(zone);
            zonesGrid.appendChild(card);
        });
        
        console.log('All zones rendered');
    } catch (error) {
        console.error('Error loading zones:', error);
        showToast('Zonalarni yuklashda xatolik', 'error');
    }
}

async function getZoneById(zoneId) {
    try {
        const response = await fetch(`${API_BASE}/zones/${zoneId}`);
        return await response.json();
    } catch (error) {
        return null;
    }
}

function createZoneCard(zone) {
    const card = document.createElement('div');
    card.className = 'zone-card';
    
    const iconsHtml = zone.icons.map(icon => `<span class="zone-card-icon">${icon}</span>`).join('');
    
    card.innerHTML = `
        <img src="${zone.image_url}" alt="${zone.title}" class="zone-card-image">
        <div class="zone-card-content">
            <h3 class="zone-card-title">${zone.title}</h3>
            <p class="zone-card-price">${formatPrice(zone.price)} / ${zone.period}</p>
            <div class="zone-card-info">
                <div class="zone-card-info-item">
                    <span>👥</span>
                    <span>${zone.current_booked}/${zone.capacity} kishi</span>
                </div>
                <div class="zone-card-info-item">
                    <span>📊</span>
                    <span>${zone.capacity - zone.current_booked} joy qoldi</span>
                </div>
            </div>
            <div class="zone-card-icons">
                ${iconsHtml}
            </div>
            <span class="zone-card-status status-${zone.status}">
                ${zone.status === 'available' ? 'Mavjud' : 'To\'la'}
            </span>
            <button class="zone-card-btn" ${zone.status === 'full' ? 'disabled' : ''}>
                ${zone.status === 'available' ? 'Bron qilish' : 'Joy yo\'q'}
            </button>
        </div>
    `;
    
    const btn = card.querySelector('.zone-card-btn');
    if (zone.status === 'available') {
        btn.addEventListener('click', () => openBookingModal(zone));
    }
    
    return card;
}

// ===== BOOKING FUNCTIONS =====
function openBookingModal(zone) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) {
        showToast('Iltimos, avval tizimga kiring', 'error');
        showModal('login');
        return;
    }
    
    document.getElementById('bookingZoneId').value = zone.id;
    document.getElementById('bookingZoneName').textContent = zone.title;
    document.getElementById('bookingZonePrice').textContent = formatPrice(zone.price);
    document.getElementById('bookingTotalPrice').textContent = formatPrice(zone.price);
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').setAttribute('min', today);
    
    showModal('booking');
}

document.getElementById('bookingForm').addEventListener('submit', handleBooking);

document.getElementById('bookingTime').addEventListener('change', calculateTotalPrice);

async function calculateTotalPrice() {
    const zoneId = parseInt(document.getElementById('bookingZoneId').value);
    const zone = await getZoneById(zoneId);
    
    if (zone) {
        document.getElementById('bookingTotalPrice').textContent = formatPrice(zone.price);
    }
}

async function handleBooking(e) {
    e.preventDefault();
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        showToast('Iltimos, avval tizimga kiring', 'error');
        return;
    }
    
    const zoneId = parseInt(document.getElementById('bookingZoneId').value);
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    
    const zone = await getZoneById(zoneId);
    
    // Store pending booking data
    pendingBookingData = {
        user_id: currentUser.id,
        zone_id: zoneId,
        date: date,
        time: time,
        total_price: zone.price,
        status: 'pending'
    };
    
    // Open payment modal
    openPaymentModal(zone, date, time);
}

// ===== USER BOOKINGS =====
async function loadUserBookings() {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    try {
        const response = await fetch(`${API_BASE}/bookings/user/${currentUser.id}`);
        const bookings = await response.json();
        bookingsList.innerHTML = '';
        
        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p class="empty-state-text">Hali bron qilmagansiz</p>
                </div>
            `;
            return;
        }
        
        bookings.forEach(booking => {
            const bookingItem = createBookingItem(booking);
            bookingsList.appendChild(bookingItem);
        });
    } catch (error) {
        showToast('Bronlarni yuklashda xatolik', 'error');
    }
}

async function createBookingItem(booking) {
    const zone = await getZoneById(booking.zone_id);
    const item = document.createElement('div');
    item.className = 'booking-item';
    
    item.innerHTML = `
        <div class="booking-header">
            <h3 class="booking-zone-name">${zone ? zone.title : 'Noma\'lum zona'}</h3>
            <span class="booking-status ${booking.status}">
                ${booking.status === 'paid' ? 'To\'langan' : 
                  booking.status === 'confirmed' ? 'Tasdiqlangan' : 
                  booking.status === 'pending' ? 'Kutilmoqda' : 'Bekor qilingan'}
            </span>
        </div>
        <div class="booking-details">
            <div class="booking-detail">
                <span class="booking-detail-label">Sana</span>
                <span class="booking-detail-value">${formatDate(booking.date)}</span>
            </div>
            <div class="booking-detail">
                <span class="booking-detail-label">Vaqt</span>
                <span class="booking-detail-value">${formatTime(booking.time)}</span>
            </div>
            <div class="booking-detail">
                <span class="booking-detail-label">Narx</span>
                <span class="booking-detail-value">${formatPrice(booking.total_price)}</span>
            </div>
        </div>
        <div class="booking-total">
            <span class="booking-total-price">${formatPrice(booking.total_price)}</span>
            ${booking.status !== 'cancelled' ? `
                <button class="booking-cancel-btn" data-booking-id="${booking.booking_id}">
                    Bekor qilish
                </button>
            ` : ''}
        </div>
    `;
    
    const cancelBtn = item.querySelector('.booking-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => handleCancelBooking(booking.booking_id));
    }
    
    return item;
}

async function handleCancelBooking(bookingId) {
    if (confirm('Haqiqatan ham bu bronni bekor qilmoqchimisiz?')) {
        try {
            const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
                method: 'PUT'
            });
            const result = await response.json();
            
            if (result.success) {
                showToast(result.message, 'success');
                loadUserBookings();
                loadZones(); // Refresh zones to update booked counts
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    }
}

// ===== ADMIN FUNCTIONS =====
async function loadAdminData() {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
        showToast('Siz admin emassiz', 'error');
        showSection('hero');
        return;
    }
    
    loadAdminBookings();
    loadAdminUsers();
    loadAdminZones();
}

async function loadAdminBookings() {
    try {
        const response = await fetch(`${API_BASE}/bookings`);
        const bookings = await response.json();
        adminBookingsList.innerHTML = '';
        
        if (bookings.length === 0) {
            adminBookingsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p class="empty-state-text">Bronlar yo\'q</p>
                </div>
            `;
            return;
        }
        
        bookings.forEach(booking => {
            const bookingItem = createAdminBookingItem(booking);
            adminBookingsList.appendChild(bookingItem);
        });
    } catch (error) {
        showToast('Bronlarni yuklashda xatolik', 'error');
    }
}

async function createAdminBookingItem(booking) {
    const zone = await getZoneById(booking.zone_id);
    const user = await getUserById(booking.user_id);
    const item = document.createElement('div');
    item.className = 'booking-item';
    
    item.innerHTML = `
        <div class="booking-header">
            <h3 class="booking-zone-name">${zone ? zone.title : 'Noma\'lum zona'}</h3>
            <span class="booking-status ${booking.status}">
                ${booking.status === 'paid' ? 'To\'langan' : 
                  booking.status === 'confirmed' ? 'Tasdiqlangan' : 
                  booking.status === 'pending' ? 'Kutilmoqda' : 'Bekor qilingan'}
            </span>
        </div>
        <div class="booking-details">
            <div class="booking-detail">
                <span class="booking-detail-label">Foydalanuvchi</span>
                <span class="booking-detail-value">${user ? user.name : 'Noma\'lum'}</span>
            </div>
            <div class="booking-detail">
                <span class="booking-detail-label">Email</span>
                <span class="booking-detail-value">${user ? user.email : 'Noma\'lum'}</span>
            </div>
            <div class="booking-detail">
                <span class="booking-detail-label">Sana</span>
                <span class="booking-detail-value">${formatDate(booking.date)}</span>
            </div>
            <div class="booking-detail">
                <span class="booking-detail-label">Vaqt</span>
                <span class="booking-detail-value">${formatTime(booking.time)}</span>
            </div>
            <div class="booking-detail">
                <span class="booking-detail-label">Narx</span>
                <span class="booking-detail-value">${formatPrice(booking.total_price)}</span>
            </div>
        </div>
        <div class="booking-total">
            <span class="booking-total-price">${formatPrice(booking.total_price)}</span>
            ${booking.status !== 'cancelled' ? `
                <button class="booking-cancel-btn" data-booking-id="${booking.booking_id}">
                    Bekor qilish
                </button>
            ` : ''}
        </div>
    `;
    
    const cancelBtn = item.querySelector('.booking-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => handleAdminCancelBooking(booking.booking_id));
    }
    
    return item;
}

async function handleAdminCancelBooking(bookingId) {
    if (confirm('Haqiqatan ham bu bronni bekor qilmoqchimisiz?')) {
        try {
            const response = await fetch(`${API_BASE}/bookings/${bookingId}/cancel`, {
                method: 'PUT'
            });
            const result = await response.json();
            
            if (result.success) {
                showToast(result.message, 'success');
                loadAdminBookings();
                loadZones();
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    }
}

async function loadAdminUsers() {
    try {
        const response = await fetch(`${API_BASE}/users`);
        const users = await response.json();
        usersList.innerHTML = '';
        
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'user-item';
            
            userItem.innerHTML = `
                <div class="user-info">
                    <span class="user-name">${user.name}</span>
                    <span class="user-email">${user.email}</span>
                </div>
                <span class="user-role ${user.role}">${user.role === 'admin' ? 'Admin' : 'Foydalanuvchi'}</span>
            `;
            
            usersList.appendChild(userItem);
        });
    } catch (error) {
        showToast('Foydalanuvchilarni yuklashda xatolik', 'error');
    }
}

async function getUserById(userId) {
    try {
        const response = await fetch(`${API_BASE}/users/${userId}`);
        return await response.json();
    } catch (error) {
        return null;
    }
}

async function loadAdminZones() {
    try {
        const response = await fetch(`${API_BASE}/zones`);
        const zones = await response.json();
        adminZonesGrid.innerHTML = '';
        
        zones.forEach(zone => {
            const card = createZoneCard(zone);
            adminZonesGrid.appendChild(card);
        });
    } catch (error) {
        showToast('Zonalarni yuklashda xatolik', 'error');
    }
}

// ===== ADMIN TABS =====
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show corresponding content
        const tabName = tab.dataset.tab;
        document.getElementById(`${tabName}Tab`).classList.add('active');
    });
});

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    toastMessage.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ===== PAYMENT FUNCTIONS =====
async function openPaymentModal(zone, date, time) {
    document.getElementById('paymentZoneName').textContent = zone.title;
    document.getElementById('paymentDate').textContent = formatDate(date);
    document.getElementById('paymentTime').textContent = formatTime(time);
    document.getElementById('paymentTotalPrice').textContent = formatPrice(zone.price);
    
    // Reset payment form
    document.getElementById('paymentForm').classList.add('hidden');
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    selectedPaymentMethod = null;
    
    showModal('payment');
}

// Payment method selection
document.querySelectorAll('.payment-method-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.payment-method-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedPaymentMethod = btn.dataset.method;
        
        // Show payment form
        document.getElementById('paymentForm').classList.remove('hidden');
    });
});

// Card number formatting
document.getElementById('cardNumber').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = formatted;
});

// Card expiry formatting
document.getElementById('cardExpiry').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
});

// Card payment form submission
document.getElementById('cardPaymentForm').addEventListener('submit', handleCardPayment);

async function handleCardPayment(e) {
    e.preventDefault();
    
    if (!selectedPaymentMethod) {
        showToast('Iltimos, to\'lov usulini tanlang', 'error');
        return;
    }
    
    const cardNumber = document.getElementById('cardNumber').value;
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    const smsCode = document.getElementById('smsCode').value;
    
    // Mock validation
    if (cardNumber.length < 16 || cardExpiry.length < 5 || cardCvv.length < 3 || smsCode.length < 6) {
        showToast('Iltimos, barcha maydonlarni to\'ldiring', 'error');
        return;
    }
    
    // Simulate payment processing
    showToast('To\'lov qayta ishlanmoqda...', 'success');
    
    setTimeout(async () => {
        try {
            // Create booking with payment
            const response = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...pendingBookingData,
                    payment_method: selectedPaymentMethod,
                    status: 'paid'
                })
            });
            const result = await response.json();
            
            if (result.success) {
                // Show receipt
                showReceipt(result.booking, selectedPaymentMethod);
                hideAllModals();
                showModal('receipt');
                document.getElementById('cardPaymentForm').reset();
                loadZones();
            } else {
                showToast(result.message, 'error');
            }
        } catch (error) {
            showToast('Xatolik yuz berdi', 'error');
        }
    }, 1500);
}

async function showReceipt(booking, paymentMethod) {
    const zone = await getZoneById(booking.zone_id);
    
    document.getElementById('receiptBookingId').textContent = '#' + booking.booking_id;
    document.getElementById('receiptZoneName').textContent = zone ? zone.title : 'Noma\'lum';
    document.getElementById('receiptDate').textContent = formatDate(booking.date);
    document.getElementById('receiptTime').textContent = formatTime(booking.time);
    document.getElementById('receiptPaymentMethod').textContent = paymentMethod === 'click' ? 'Click' : 'Payme';
    document.getElementById('receiptTotalPrice').textContent = formatPrice(booking.total_price);
}

// ===== PARTICLES ANIMATION =====
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// ===== INITIALIZE APP =====
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    loadZones();
    createParticles();
});
