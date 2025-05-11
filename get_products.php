<?php
header('Content-Type: application/json');
require_once '../config/database.php'; // Подключается и создаёт $pdo

try {
    $stmt = $pdo->query("SELECT * FROM products ORDER BY car_system, name");
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($products);
} catch(PDOException $e) {
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
