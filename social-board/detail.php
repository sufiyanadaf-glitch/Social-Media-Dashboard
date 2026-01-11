<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
session_start();
if (!isset($_SESSION['loggedin'])) {
    header("Location: index.php");
    exit();
}
require_once 'db.php';

$platform = $_GET['platform'] ?? 'LinkedIn';
$platform = $conn->real_escape_string($platform);
$result = $conn->query("SELECT * FROM analytics WHERE platform = '$platform'");
if (!$result || $result->num_rows == 0) {
    die("Platform not found.");
}
$data = $result->fetch_assoc();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title><?=htmlspecialchars($data['platform'])?> Analytics</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css" />
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

  <style>
    /* BACK BUTTON - Fixed at TOP of window */
    .back-btn {
      position: fixed;
      top: 20px;
      left: 20px;
      color: white;
      text-decoration: none;
      font-weight: bold;
      font-size: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
      z-index: 9999;
      transition: color 0.3s ease;
    }
    .back-btn:hover { color: #8b5cf6; }
    .back-btn::before { content: "Back"; font-size: 18px; }
  </style>
</head>
<body class="dash-bg">

  <!-- BACK BUTTON (TOP OF WINDOW) -->
  <a href="dashboard.php" class="back-btn">Back to Dashboard</a>

  <div class="analytics-page">
    <!-- STATS -->
    <div class="stats-grid">
      <div class="stat-card large">
        <div class="label">Followers</div>
        <div class="value"><?=number_format($data['followers'])?>k</div>
      </div>
      <div class="stat-card">
        <div class="label">Impressions</div>
        <div class="value"><?=number_format($data['impressions'] ?? 18000)?>k</div>
      </div>
      <div class="stat-card">
        <div class="label">Likes</div>
        <div class="value"><?=number_format($data['likes'] ?? 460)?></div>
      </div>
      <div class="stat-card">
        <div class="label">Comments</div>
        <div class="value"><?=number_format($data['comments'] ?? 78)?></div>
      </div>
      <div class="stat-card accent">
        <div class="label">Engagement</div>
        <div class="value"><?=$data['engagement']?>%</div>
      </div>
    </div>

    <!-- TABS -->
    <div class="tabs">
      <button class="tab active">Website Traffic</button>
      <button class="tab">Revenue by Code</button>
    </div>

    <!-- CHART + DOCK -->
    <div class="chart-card">
      <div class="chart-header">
        <h3>Traffic from <?=htmlspecialchars($data['platform'])?></h3>
        <span class="badge">+19</span>
      </div>
      <canvas id="trafficChart"></canvas>

      <!-- DOCK (10 ICONS) -->
      <div class="dock">
        <?php
        $all = $conn->query("SELECT icon, platform FROM analytics LIMIT 10")->fetch_all(MYSQLI_ASSOC);
        foreach ($all as $p): ?>
        <a href="detail.php?platform=<?=urlencode($p['platform'])?>">
          <img src="assets/icons/<?=$p['icon']?>" alt="<?=htmlspecialchars($p['platform'])?>">
        </a>
        <?php endforeach; ?>
      </div>
    </div>
  </div>

<script>
  const ctx = document.getElementById('trafficChart').getContext('2d');

  // Start with smooth initial data
  let data = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3000) + 6000);
  let index = 0;

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array(30).fill(''),
      datasets: [{
        data: data,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.12)',
        borderWidth: 3,
        pointRadius: 0,
        fill: true,
        tension: 0.5,
        borderCapStyle: 'round',
        borderJoinStyle: 'round'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 0 },
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: false,
          min: 3000,
          max: 13000,
          ticks: { color: '#94a3b8', callback: v => (v / 1000).toFixed(1) + 'k' },
          grid: { color: 'rgba(255,255,255,0.05)' }
        },
        x: { ticks: { display: false }, grid: { display: false } }
      }
    }
  });

  // CONTINUOUS MOVING UPDATE
  setInterval(() => {
    const last = data[data.length - 1];
    const change = (Math.random() - 0.5) * 600; // Smooth step
    const next = Math.max(4000, Math.min(12000, last + change));
    
    data.shift();           // Remove oldest
    data.push(Math.round(next)); // Add new value

    chart.update('quiet');  // Instant, no flicker
  }, 800); // Updates every 0.8s → feels like live stream
</script>
</body>
</html>