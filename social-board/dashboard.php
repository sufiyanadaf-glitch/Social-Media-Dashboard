<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

session_start();
if (!isset($_SESSION['loggedin'])) {
    header("Location: index.php");
    exit();
}
require_once 'db.php';

$result = $conn->query("SELECT * FROM analytics");
if (!$result) {
    die("Database query failed: " . $conn->error);
}
$platforms = $result->fetch_all(MYSQLI_ASSOC);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Social Media Dashboard</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body class="dash-bg">
  <div class="dashboard">
    <header>
      <h1>Social Media Dashboard</h1>
      <p>Select a platform from the dock or grid to explore detailed analytics</p>
    </header>

    <div class="grid">
      <?php foreach ($platforms as $p): ?>
      <a href="detail.php?platform=<?=urlencode($p['platform'])?>" class="platform-card">
        <img src="assets/icons/<?=$p['icon']?>" alt="<?=$p['platform']?>" width="40" height="40">
        <h3><?=$p['platform']?></h3>
        <div class="followers"><?=$p['followers']?>k</div>
        <div class="engagement"><?=$p['engagement']?>%</div>
      </a>
      <?php endforeach; ?>
    </div>

    <div class="dock">
      <?php foreach ($platforms as $p): ?>
      <a href="detail.php?platform=<?=urlencode($p['platform'])?>">
        <img src="assets/icons/<?=$p['icon']?>" alt="<?=$p['platform']?>" width="40" height="40">
      </a>
      <?php endforeach; ?>
    </div>
  </div>
</body>
</html>