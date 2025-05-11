document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'main.html';
        return;
    }

    // DOM Elements
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAddress = document.getElementById('userAddress');
    const userPhone = document.getElementById('userPhone');
    const ordersList = document.getElementById('ordersList');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    const logoutBtn = document.getElementById('logoutBtn');

    // Modals
    const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
    const deleteAccountModal = new bootstrap.Modal(document.getElementById('deleteAccountModal'));

    // Load user data
    async function loadUserData() {
        try {
            const response = await fetch('api/user.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load user data');
            }
            
            const userData = await response.json();
            
            // Update UI with user data
            userName.textContent = `${userData.first_name} ${userData.last_name}`;
            userEmail.textContent = userData.email;
            userAddress.textContent = userData.address;
            userPhone.textContent = userData.phone || 'Не указан';

            // Fill edit form with current data
            const editForm = document.getElementById('editProfileForm');
            editForm.elements.firstName.value = userData.first_name;
            editForm.elements.lastName.value = userData.last_name;
            editForm.elements.email.value = userData.email;
            editForm.elements.address.value = userData.address;
            editForm.elements.phone.value = userData.phone || '';
        } catch (error) {
            console.error('Error loading user data:', error);
            alert('Ошибка загрузки данных пользователя');
        }
    }

    // Load orders
    async function loadOrders() {
        try {
            const response = await fetch('api/orders.php', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load orders');
            }
            
            const orders = await response.json();
            
            if (orders.length === 0) {
                ordersList.innerHTML = '<p class="text-center">У вас пока нет заказов</p>';
                return;
            }

            ordersList.innerHTML = orders.map(order => `
                <div class="order-item">
                    <div class="order-header">
                        <div>
                            <span class="order-number">Заказ #${order.id}</span>
                            <span class="order-date">${new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <span class="order-status status-${order.status.toLowerCase()}">
                            ${getStatusText(order.status)}
                        </span>
                    </div>
                    <div class="order-items">
                        ${order.items.map(item => `
                            <div class="order-item-detail">
                                <img src="${item.image_path}" alt="${item.name}" class="order-item-image">
                                <div class="order-item-info">
                                    <div class="order-item-name">${item.name}</div>
                                    <div class="order-item-price">${item.price} ₽ x ${item.quantity}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="order-total">
                        Итого: ${order.total_amount} ₽
                    </div>
                </div>
            `).join('');
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersList.innerHTML = '<p class="text-center text-danger">Ошибка загрузки заказов</p>';
        }
    }

    // Get status text
    function getStatusText(status) {
        const statusMap = {
            'pending': 'В обработке',
            'completed': 'Выполнен',
            'cancelled': 'Отменен'
        };
        return statusMap[status.toLowerCase()] || status;
    }

    // Edit profile
    editProfileBtn.addEventListener('click', () => {
        editProfileModal.show();
    });

    document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('api/update_profile.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to update profile');
            }
            
            const result = await response.json();
            
            if (result.success) {
                editProfileModal.hide();
                loadUserData();
                alert('Профиль успешно обновлен');
            } else {
                alert(result.message || 'Ошибка обновления профиля');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Ошибка обновления профиля');
        }
    });

    // Delete account
    deleteAccountBtn.addEventListener('click', () => {
        deleteAccountModal.show();
    });

    document.getElementById('deleteAccountForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        try {
            const response = await fetch('api/delete_account.php', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete account');
            }
            
            const result = await response.json();
            
            if (result.success) {
                localStorage.removeItem('token');
                window.location.href = 'main.html';
            } else {
                alert(result.message || 'Ошибка удаления аккаунта');
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Ошибка удаления аккаунта');
        }
    });

    // Logout
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('token');
        window.location.href = 'main.html';
    });

    // Initial load
    loadUserData();
    loadOrders();
}); 