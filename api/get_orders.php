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

try {
    // Получаем заказы пользователя
    $stmt = $pdo->prepare("
        SELECT id, created_at as date, status, total_amount as total
        FROM orders
        WHERE user_id = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$_SESSION['user_id']]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Форматируем даты
    foreach ($orders as &$order) {
        $order['date'] = date('d.m.Y H:i', strtotime($order['date']));
    }

    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);

} catch (PDOException $e) {
    error_log("Orders fetch error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при получении списка заказов'
    ]);
} 
