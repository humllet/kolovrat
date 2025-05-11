document.addEventListener('DOMContentLoaded', function() {
    const brandFilter = document.getElementById('brandFilter');
    const systemFilter = document.getElementById('systemFilter');
    const searchInput = document.getElementById('searchInput');
    const productsContainer = document.getElementById('productsContainer');

    // Загрузка фильтров
    fetch('api/get_filters.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Заполняем фильтр систем
                data.systems.forEach(system => {
                    const option = document.createElement('option');
                    option.value = system;
                    option.textContent = system;
                    systemFilter.appendChild(option);
                });

                // Заполняем фильтр марок
                data.brands.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand;
                    option.textContent = brand;
                    brandFilter.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Error loading filters:', error));

    // Функция фильтрации товаров
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedBrand = brandFilter.value;
        const selectedSystem = systemFilter.value;

        fetch('api/get_products.php')
            .then(response => response.json())
            .then(products => {
                const filteredProducts = products.filter(product => {
                    const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                                        product.description.toLowerCase().includes(searchTerm);
                    const matchesBrand = !selectedBrand || product.car_brand === selectedBrand;
                    const matchesSystem = !selectedSystem || product.car_system === selectedSystem;

                    return matchesSearch && matchesBrand && matchesSystem;
                });

                displayProducts(filteredProducts);
            })
            .catch(error => console.error('Error filtering products:', error));
    }

    // Обработчики событий для фильтров
    searchInput.addEventListener('input', filterProducts);
    brandFilter.addEventListener('change', filterProducts);
    systemFilter.addEventListener('change', filterProducts);

    // Функция отображения товаров
    function displayProducts(products) {
        productsContainer.innerHTML = '';
        
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'col-md-4 mb-4';
            productCard.innerHTML = `
                <div class="product-card">
                    <div class="product-image">
                        <img src="${product.image_path}" alt="${product.name}">
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
                        <button class="add-to-cart" ${product.stock > 0 ? '' : 'disabled'}>
                            Добавить в корзину
                        </button>
                    </div>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
    }

    // Начальная загрузка товаров
    filterProducts();
}); 