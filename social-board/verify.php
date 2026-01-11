<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['phone']) || !isset($_POST['otp'])) {
    header("Location: index.php");
    exit();
}

$otp = trim($_POST['otp']);

if ($otp === '1234') {
    $_SESSION['loggedin'] = true;
    unset($_SESSION['otp_sent']);
    header("Location: dashboard.php");
    exit();
} else {
    $_SESSION['error'] = "Invalid OTP. Use 1234";
    header("Location: index.php");
    exit();
}
?>