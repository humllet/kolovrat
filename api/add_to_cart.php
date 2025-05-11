<?php
session_start();
require_once 'database.php';

header('Content-Type: application/json');

// Проверяем авторизацию
if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        'success' => false,
        'message' => 'Необходима авторизация'
    ]);
    exit;
}

// Получаем данные из POST-запроса
$data = json_decode(file_get_contents('php://input'), true);
$product_id = $data['product_id'] ?? null;

if (!$product_id) {
    echo json_encode([
        'success' => false,
        'message' => 'Не указан ID товара'
    ]);
    exit;
}

try {
    // Проверяем существование товара
    $stmt = $pdo->prepare("SELECT id FROM products WHERE id = ?");
    $stmt->execute([$product_id]);
    
    if (!$stmt->fetch()) {
        echo json_encode([
            'success' => false,
            'message' => 'Товар не найден'
        ]);
        exit;
    }

    // Проверяем, есть ли уже такой товар в корзине
    $stmt = $pdo->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
    $stmt->execute([$_SESSION['user_id'], $product_id]);
    $cart_item = $stmt->fetch();

    if ($cart_item) {
        // Обновляем количество
        $stmt = $pdo->prepare("UPDATE cart SET quantity = quantity + 1 WHERE id = ?");
        $stmt->execute([$cart_item['id']]);
    } else {
        // Добавляем новый товар
        $stmt = $pdo->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, 1)");
        $stmt->execute([$_SESSION['user_id'], $product_id]);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Товар добавлен в корзину'
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при добавлении товара в корзину'
    ]);
} 
