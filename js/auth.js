// Функция проверки авторизации
async function checkAuth() {
    try {
        const response = await fetch('api/check_auth.php');
        const data = await response.json();
        
        // Обновляем навигацию в зависимости от статуса авторизации
        updateNavigation(data.isLoggedIn);
        
        // Если пользователь не авторизован и пытается зайти на защищенные страницы
        if (!data.isLoggedIn && isProtectedPage()) {
            window.location.href = 'main.html';
            return false;
        }
        
        return data.isLoggedIn;
    } catch (error) {
        console.error('Error:', error);
        return false;
    }
}

// Функция проверки защищенных страниц
function isProtectedPage() {
    const currentPage = window.location.pathname.split('/').pop();
    return ['profile.html', 'zakaz.html'].includes(currentPage);
}

// Функция обновления навигации
function updateNavigation(isLoggedIn) {
    const loginBtn = document.querySelector('.btn-outline-light[data-bs-toggle="modal"]');
    if (!loginBtn) return;

    if (isLoggedIn) {
        // Скрываем кнопку входа
        loginBtn.style.display = 'none';
        
        // Добавляем кнопку меню пользователя
        const userMenu = document.createElement('div');
        userMenu.className = 'dropdown';
        userMenu.innerHTML = `
            <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
                <i class="fas fa-bars"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="profile.html">Профиль</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" id="logoutBtn">Выйти</a></li>
            </ul>
        `;
        
        // Заменяем кнопку входа на меню пользователя
        loginBtn.parentNode.replaceChild(userMenu, loginBtn);
        
        // Добавляем обработчик для кнопки выхода
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                try {
                    const response = await fetch('api/logout.php');
                    const data = await response.json();
                    if (data.success) {
                        window.location.reload();
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Произошла ошибка при выходе');
                }
            });
        }
    } else {
        // Показываем кнопку входа
        loginBtn.style.display = 'block';
    }
}

// Проверяем авторизацию при загрузке страницы
document.addEventListener('DOMContentLoaded', checkAuth); 
