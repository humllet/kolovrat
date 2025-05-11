<?php
require_once 'config.php';
require_once 'auth.php';

// Check if user is authenticated
$user = authenticate();
if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid request data']);
    exit;
}

try {
    // Start transaction
    $pdo->beginTransaction();

    // Create order
    $stmt = $pdo->prepare("
        INSERT INTO orders (user_id, delivery_address, pickup_location, comments, status, total_amount)
        VALUES (?, ?, ?, ?, 'pending', ?)
    ");

    // Calculate total amount
    $totalAmount = 0;
    foreach ($data['items'] as $item) {
        $totalAmount += $item['price'] * $item['quantity'];
    }
    $totalAmount += 500; // Add delivery cost

    $stmt->execute([
        $user['id'],
        $data['delivery_address'],
        $data['pickup_location'],
        $data['comments'],
        $totalAmount
    ]);

    $orderId = $pdo->lastInsertId();

    // Create order items
    $stmt = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
    ");

    foreach ($data['items'] as $item) {
        $stmt->execute([
            $orderId,
            $item['id'],
            $item['quantity'],
            $item['price']
        ]);
    }

    // Commit transaction
    $pdo->commit();

    // Send success response
    echo json_encode([
        'success' => true,
        'order_id' => $orderId,
        'message' => 'Order created successfully'
    ]);

} catch (Exception $e) {
    // Rollback transaction on error
    $pdo->rollBack();
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to create order',
        'message' => $e->getMessage()
    ]);
} 