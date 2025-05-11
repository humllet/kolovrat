<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

// Получаем данные из POST-запроса
$email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';

// Проверяем наличие всех необходимых полей
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Все поля обязательны для заполнения'
    ]);
    exit;
}

try {
    // Проверяем существование пользователя
    $stmt = $pdo->prepare("SELECT id, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Пользователь с таким email не найден'
        ]);
        exit;
    }

    // Проверяем пароль
    if (!password_verify($password, $user['password'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Неверный пароль'
        ]);
        exit;
    }

    // Начинаем сессию и сохраняем ID пользователя
    session_start();
    $_SESSION['user_id'] = $user['id'];

    echo json_encode([
        'success' => true,
        'message' => 'Вход выполнен успешно'
    ]);

} catch (PDOException $e) {
    error_log("Login error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при входе: ' . $e->getMessage()
    ]);
} 
