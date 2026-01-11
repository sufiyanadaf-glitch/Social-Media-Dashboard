<?php
session_start();
require_once 'db.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $phone = trim($_POST['phone']);

    // Simple validation
    if (empty($phone) || strlen($phone) < 10) {
        echo "Invalid phone number";
        exit;
    }

    // Generate 4-digit OTP
    $otp = "1234";  // Demo OTP (real project mein rand(1000,9999) karna)

    // Save in session
    $_SESSION['otp'] = $otp;
    $_SESSION['phone'] = $phone;
    $_SESSION['otp_sent'] = true;
    $_SESSION['otp_time'] = time();

    // Save OTP in database (optional)
    $stmt = $conn->prepare("INSERT INTO users (phone, otp, created_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE otp = ?, created_at = NOW()");
    $stmt->bind_param("sss", $phone, $otp, $otp);
    $stmt->execute();

    // Redirect back to index
    header("Location: index.php");
    exit();
}
?>