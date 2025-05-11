document.addEventListener('DOMContentLoaded', function() {
    // Инициализация анимаций при скролле
    AOS.init();

    // Инициализация корзины
    let cart = {
        items: JSON.parse(localStorage.getItem('cart')) || [],
        total: 0,
        count: 0
    };

    // Функция для обновления отображения корзины
    function updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.getElementById('cartItems');
        const cartTotal = document.getElementById('cartTotal');
        
        // Обновляем счетчик
        cartCount.textContent = cart.items.length;
        
        // Обновляем содержимое корзины
        cartItems.innerHTML = '';
        cart.total = 0;
        
        cart.items.forEach((item, index) => {
            cart.total += item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-details">
                    <h4>${item.name}</h4>
                    <p>${item.price} ₽ x ${item.quantity}</p>
                </div>
                <button class="remove-item" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            cartItems.appendChild(cartItem);
        });
        
        // Обновляем общую сумму
        cartTotal.textContent = `${cart.total.toFixed(2)} ₽`;
        
        // Сохраняем корзину в localStorage
        localStorage.setItem('cart', JSON.stringify(cart.items));
    }

    // Функции для работы с корзиной
    function openCart() {
        document.getElementById('cartSidebar').classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем скролл при открытой корзине
    }

    function closeCart() {
        document.getElementById('cartSidebar').classList.remove('active');
        document.body.style.overflow = ''; // Разблокируем скролл
    }

    // Обработчики событий для корзины
    document.getElementById('cartIcon').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);

    // Закрытие корзины при клике вне её области
    document.addEventListener('click', (e) => {
        const cartSidebar = document.getElementById('cartSidebar');
        const cartIcon = document.getElementById('cartIcon');
        
        if (cartSidebar.classList.contains('active') && 
            !cartSidebar.contains(e.target) && 
            !cartIcon.contains(e.target)) {
            closeCart();
        }
    });

    // Закрытие корзины при нажатии Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCart();
        }
    });

    document.getElementById('cartItems').addEventListener('click', (e) => {
        if (e.target.closest('.remove-item')) {
            const index = e.target.closest('.remove-item').dataset.index;
            cart.items.splice(index, 1);
            updateCartDisplay();
        }
    });

    // Функция для загрузки товаров
    async function loadProducts() {
        try {
            const brand = document.getElementById('brandFilter').value;
            const system = document.getElementById('systemFilter').value;
            const search = document.getElementById('searchInput').value;
            
            const response = await fetch(`api/products.php?brand=${brand}&system=${system}&search=${search}`);
            const products = await response.json();
            
            displayProducts(products);
        } catch (error) {
            console.error('Ошибка при загрузке товаров:', error);
        }
    }

    // Функция для отображения товаров
    function displayProducts(products) {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '';
        
        // Группируем товары по системам
        const groupedProducts = products.reduce((acc, product) => {
            if (!acc[product.car_system]) {
                acc[product.car_system] = [];
            }
            acc[product.car_system].push(product);
            return acc;
        }, {});
        
        // Создаем секции для каждой системы
        Object.entries(groupedProducts).forEach(([system, products]) => {
            const section = document.createElement('div');
            section.className = 'catalog-section mb-5';
            section.innerHTML = `
                <h2 class="system-title" data-aos="fade-right">${system}</h2>
                <div class="row">
                    ${products.map(product => `
                        <div class="col-md-4 mb-4" data-aos="fade-up">
                            <div class="product-card">
                                <div class="product-image">
                                    <img src="${product.image}" alt="${product.name}">
                                </div>
                                <div class="product-info">
                                    <h3>${product.name}</h3>
                                    <p>${product.description}</p>
                                    <div class="product-meta">
                                        <span class="price">${product.price} ₽</span>
                                        <span class="stock ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}">
                                            ${product.stock > 0 ? 'В наличии' : 'Нет в наличии'}
                                        </span>
                                    </div>
                                    <button class="btn btn-primary w-100 add-to-cart" 
                                            data-id="${product.id}"
                                            ${product.stock === 0 ? 'disabled' : ''}>
                                        Добавить в корзину
                                    </button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.appendChild(section);
        });
        
        // Добавляем обработчики для кнопок "Добавить в корзину"
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.dataset.id;
                const product = products.find(p => p.id === productId);
                
                if (product) {
                    const existingItem = cart.items.find(item => item.id === productId);
                    
                    if (existingItem) {
                        existingItem.quantity++;
                    } else {
                        cart.items.push({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.image,
                            quantity: 1
                        });
                    }
                    
                    updateCartDisplay();
                    openCart();
                }
            });
        });
    }

    // Обработчики событий для фильтров
    document.getElementById('brandFilter').addEventListener('change', loadProducts);
    document.getElementById('systemFilter').addEventListener('change', loadProducts);
    
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            loadProducts();
        }, 500);
    });

    // Обработчики для модальных окон
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));

    // Обработчики форм
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        fetch('api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loginModal.hide();
                window.location.href = 'profile.html';
            } else {
                alert(data.message || 'Ошибка при входе');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при входе');
        });
    });

    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        
        fetch('api/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                registerModal.hide();
                loginModal.show();
                alert('Регистрация успешна! Теперь вы можете войти.');
            } else {
                alert(data.message || 'Ошибка при регистрации');
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при регистрации');
        });
    });

    // Обработчик оформления заказа
    document.getElementById('checkoutButton').addEventListener('click', () => {
        if (cart.items.length === 0) {
            alert('Корзина пуста');
            return;
        }
        
        // Проверяем авторизацию
        fetch('api/check_auth.php')
            .then(response => response.json())
            .then(data => {
                if (data.isLoggedIn) {
                    window.location.href = 'zakaz.html';
                } else {
                    // Показываем модальное окно входа
                    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                    loginModal.show();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Произошла ошибка при проверке авторизации');
            });
    });

    // Загружаем товары при загрузке страницы
    loadProducts();
    updateCartDisplay();

    // Инициализация мобильного меню
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav .nav-link');

    // Обработчик клика по кнопке меню
    navbarToggler.addEventListener('click', function() {
        navbarCollapse.classList.toggle('show');
    });

    // Закрытие меню при клике на ссылку
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            navbarCollapse.classList.remove('show');
        });
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', function(event) {
        if (!navbarCollapse.contains(event.target) && !navbarToggler.contains(event.target)) {
            navbarCollapse.classList.remove('show');
        }
    });

    // Закрытие меню при нажатии Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            navbarCollapse.classList.remove('show');
        }
    });
}); 