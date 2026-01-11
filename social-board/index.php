<?php
session_start();
require_once 'db.php';
if (!isset($_POST['phone']) && !isset($_SESSION['otp_sent'])) {
    unset($_SESSION['otp_sent']);
    unset($_SESSION['phone']);
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Social Board - Login</title>
  <link rel="stylesheet" href="style.css" />
  
  <!-- YE LINE PAKKA ADD HONA CHAHIYE -->
  <style>
    html, body {height:100%; margin:0; padding:0;}
    .login-bg {
      background: url('assets/bg.jpg') center/cover no-repeat fixed !important;
    }
  </style>
</head>
<body class="login-bg">

  <div class="login-container">
    <div class="logo">SB</div>
    <h1>Social Board</h1>
    <p>Secure OTP Login</p>

    <?php if (isset($_SESSION['otp_sent']) && $_SESSION['otp_sent'] === true): ?>
      <form method="post" action="verify.php">
        <label>Enter OTP sent to <strong><?php echo substr($_SESSION['phone'], -4); ?> xxxx</strong></label>
        <input type="text" name="otp" placeholder="— — — —" maxlength="4" required autofocus />
        <button type="submit">Verify</button>
        <a href="index.php" class="change">Change Number</a>
      </form>
      <div class="demo">Demo OTP: <strong>1234</strong></div>
    <?php else: ?>
      <form method="post" action="send_otp.php">
        <input type="text" name="phone" placeholder="+91 98765 43210" value="+91 9876543210" maxlength="15" required />
        <button type="submit">Send OTP</button>
      </form>
    <?php endif; ?>

    <footer style="margin-top:30px;color:#888;font-size:13px;">© 2025 Social Board</footer>
  </div>

</body>
</html>