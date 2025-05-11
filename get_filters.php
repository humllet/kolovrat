<?php
header('Content-Type: application/json');
require_once 'database.php'; // Здесь уже создаётся $pdo

try {
    // Получаем уникальные системы
    $stmt = $pdo->query("SELECT DISTINCT car_system FROM products WHERE car_system != 'Все' ORDER BY car_system");
    $systems = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Получаем уникальные марки
    $stmt = $pdo->query("SELECT DISTINCT car_brand FROM products WHERE car_brand != 'Все' ORDER BY car_brand");
    $brands = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true,
        'systems' => $systems,
        'brands' => $brands
    ]);
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>