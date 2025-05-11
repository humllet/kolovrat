<?php
require_once __DIR__ . '/config.php';
session_start();

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Необходима авторизация'
    ]);
    exit;
}

// Получаем данные из POST-запроса
$data = [
    'first_name' => $_POST['firstName'] ?? '',
    'last_name' => $_POST['lastName'] ?? '',
    'email' => $_POST['email'] ?? '',
    'address' => $_POST['address'] ?? ''
];

// Проверяем наличие всех необходимых полей
if (empty($data['first_name']) || empty($data['last_name']) || 
    empty($data['email']) || empty($data['address'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Все поля обязательны для заполнения'
    ]);
    exit;
}

try {
    // Проверяем, не занят ли email другим пользователем
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$data['email'], $_SESSION['user_id']]);
    
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Этот email уже используется другим пользователем'
        ]);
        exit;
    }

    // Обновляем данные пользователя
    $stmt = $pdo->prepare("
        UPDATE users 
        SET first_name = ?, last_name = ?, email = ?, address = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $data['address'],
        $_SESSION['user_id']
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Профиль успешно обновлен'
    ]);

} catch (PDOException $e) {
    error_log("Profile update error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при обновлении профиля'
    ]);
} 
