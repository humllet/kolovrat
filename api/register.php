<?php
require_once __DIR__ . '/config.php';

header('Content-Type: application/json');

// Получаем данные из POST-запроса
$data = [
    'first_name' => $_POST['firstName'] ?? '',
    'last_name' => $_POST['lastName'] ?? '',
    'email' => $_POST['email'] ?? '',
    'address' => $_POST['address'] ?? '',
    'password' => $_POST['password'] ?? ''
];

// Проверяем наличие всех необходимых полей
if (empty($data['first_name']) || empty($data['last_name']) || 
    empty($data['email']) || empty($data['address']) || empty($data['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Все поля обязательны для заполнения'
    ]);
    exit;
}

try {
    // Проверяем, не существует ли уже пользователь с таким email
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$data['email']]);
    
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Пользователь с таким email уже существует'
        ]);
        exit;
    }

    // Хешируем пароль
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);

    // Создаем нового пользователя
    $stmt = $pdo->prepare("
        INSERT INTO users (first_name, last_name, email, address, password)
        VALUES (?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $data['first_name'],
        $data['last_name'],
        $data['email'],
        $data['address'],
        $hashedPassword
    ]);

    echo json_encode([
        'success' => true,
        'message' => 'Регистрация успешно завершена'
    ]);

} catch (PDOException $e) {
    error_log("Registration error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при регистрации: ' . $e->getMessage()
    ]);
} 
