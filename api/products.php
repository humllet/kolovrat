<?php
require_once 'database.php'; // Здесь уже создается $pdo
header('Content-Type: application/json');

try {
    // Получаем параметры фильтрации
    $brand = $_GET['brand'] ?? '';
    $system = $_GET['system'] ?? '';
    $search = $_GET['search'] ?? '';

    // Формируем SQL-запрос с учетом фильтров
    $sql = "SELECT * FROM products WHERE 1=1";
    $params = [];

    if ($brand && $brand !== 'Все') {
        $sql .= " AND car_brand = ?";
        $params[] = $brand;
    }

    if ($system && $system !== 'Все') {
        $sql .= " AND car_system = ?";
        $params[] = $system;
    }

    if ($search) {
        $sql .= " AND (name LIKE ? OR description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $sql .= " ORDER BY car_system, name";

    // Выполняем запрос
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Форматируем цены и добавляем URL изображений
    foreach ($products as &$product) {
        $product['price'] = number_format($product['price'], 2, '.', '');
        if (!empty($product['image_path'])) {
            $product['image_url'] = $product['image_path'];
        }
    }

    echo json_encode([
        'success' => true,
        'products' => $products
    ]);

} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при получении списка товаров'
    ]);
}
?>
