document.addEventListener('DOMContentLoaded', function() {
    // Login Modal
    const loginModal = document.getElementById('loginModal') ? new bootstrap.Modal(document.getElementById('loginModal')) : null;
    const registerModal = document.getElementById('registerModal') ? new bootstrap.Modal(document.getElementById('registerModal')) : null;
    const showRegister = document.getElementById('showRegister');

    // Добавляем обработчики только если элементы существуют
    if (showRegister && loginModal && registerModal) {
        showRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.hide();
            registerModal.show();
        });
    }

    // Form Submissions
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const feedbackForm = document.getElementById('feedbackForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            
            try {
                const response = await fetch('api/login.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    if (loginModal) loginModal.hide();
                    window.location.reload();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при входе');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            
            try {
                const response = await fetch('api/register.php', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Ошибка при регистрации');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    if (registerModal) registerModal.hide();
                    if (loginModal) loginModal.show();
                    alert('Регистрация успешна! Теперь вы можете войти.');
                } else {
                    alert(data.message || 'Ошибка при регистрации');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || 'Произошла ошибка при регистрации');
            }
        });
    }

    if (feedbackForm) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(feedbackForm);
            
            try {
                const response = await fetch('api/feedback.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    alert('Спасибо за ваше сообщение! Мы свяжемся с вами в ближайшее время.');
                    feedbackForm.reset();
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Произошла ошибка при отправке сообщения');
            }
        });
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            // Пропускаем пустые ссылки и ссылки с id
            if (href === '#' || this.id) return;
            
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        // Устанавливаем постоянный темный стиль для навигации
        navbar.style.padding = '0.5rem 0';
        navbar.style.backgroundColor = 'rgba(26, 26, 26, 0.95)';
    }

    // Animation on Scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.animate__animated');
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight && elementBottom > 0) {
                element.style.visibility = 'visible';
            }
        });
    };

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
}); 