document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'main.html';
        return;
    }

    // DOM Elements
    const orderItemsContainer = document.getElementById('orderItems');
    const subtotalElement = document.getElementById('subtotal');
    const deliveryElement = document.getElementById('delivery');
    const totalElement = document.getElementById('total');
    const orderForm = document.getElementById('orderForm');
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));

    // Load cart items from localStorage
    let cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update order summary
    function updateOrderSummary() {
        orderItemsContainer.innerHTML = '';
        let subtotal = 0;

        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const itemElement = document.createElement('div');
            itemElement.className = 'order-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="order-item-image">
                <div class="order-item-info">
                    <h4 class="order-item-name">${item.name}</h4>
                    <p class="order-item-details">${item.details}</p>
                    <span class="order-item-price">${item.price.toFixed(2)} ₽</span>
                </div>
                <div class="order-item-quantity">
                    <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" 
                           onchange="updateQuantity(${item.id}, this.value)">
                    <button class="btn btn-outline-secondary btn-sm" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                </div>
            `;
            orderItemsContainer.appendChild(itemElement);
        });

        const deliveryCost = subtotal > 0 ? 500 : 0;
        const total = subtotal + deliveryCost;

        subtotalElement.textContent = `${subtotal.toFixed(2)} ₽`;
        deliveryElement.textContent = `${deliveryCost.toFixed(2)} ₽`;
        totalElement.textContent = `${total.toFixed(2)} ₽`;
    }

    // Update item quantity
    window.updateQuantity = function(itemId, newQuantity) {
        newQuantity = parseInt(newQuantity);
        if (newQuantity < 1) return;

        const itemIndex = cartItems.findIndex(item => item.id === itemId);
        if (itemIndex !== -1) {
            cartItems[itemIndex].quantity = newQuantity;
            localStorage.setItem('cart', JSON.stringify(cartItems));
            updateOrderSummary();
        }
    };

    // Handle order submission
    orderForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert('Ваша корзина пуста');
            return;
        }

        const formData = new FormData(orderForm);
        const orderData = {
            items: cartItems,
            delivery_address: formData.get('delivery_address'),
            pickup_location: formData.get('pickup_location'),
            comments: formData.get('comments')
        };

        try {
            const response = await fetch('api/create_order.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });

            if (!response.ok) {
                throw new Error('Ошибка при создании заказа');
            }

            const result = await response.json();
            
            // Clear cart
            localStorage.removeItem('cart');
            
            // Show success modal
            successModal.show();
            
            // Redirect to profile after 3 seconds
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 3000);

        } catch (error) {
            alert(error.message);
        }
    });

    // Initial update
    updateOrderSummary();
}); 