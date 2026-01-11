<?php
session_start();
require_once 'db.php';

// Turn on error reporting
ini_set('display_errors', 1);
error_reporting(E_ALL);

$error = "";

if ($_SERVER['REQUEST_METHOD'] == 'POST' && isset($_POST['phone'])) {
    $phone = preg_replace('/\D/', '', $_POST['phone']);
    if (strlen($phone) != 10) {
        $error = "Enter valid 10-digit phone";
    } else {
        $otp = rand(1000, 9999);
        $expiry = date('Y-m-d H:i:s', time() + 300);

        $stmt = $conn->prepare("INSERT INTO users (phone, otp, otp_expiry) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE otp=?, otp_expiry=?");
        $stmt->bind_param("sssss", $phone, $otp, $expiry, $otp, $expiry);
        if ($stmt->execute()) {
            $_SESSION['phone'] = $phone;
            $_SESSION['otp_sent'] = true;
            header("Location: verify.php");
            exit();
        } else {
            $error = "Database error. Check connection.";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Login</title>
  <link rel="stylesheet" href="style.css?v=<?php echo time(); ?>" />
  <style>
    .debug { background: #f8d7da; color: #721c24; padding: 10px; margin: 10px 0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <h2>Enter Phone Number</h2>
      <?php if ($error): ?>
        <div class="debug"><?php echo $error; ?></div>
      <?php endif; ?>
      <form method="POST">
  <input type="text" name="phone" placeholder="10-digit phone" maxlength="10" value="9876543210" required />
  <p style="color:#d32f2f; font-weight:bold;">Enter any 10-digit number</p>
  <button type="submit">Send OTP</button>
</form>
      <p><small>Test: Enter any 10 digits</small></p>
    </div>
  </div>
</body>
</html>