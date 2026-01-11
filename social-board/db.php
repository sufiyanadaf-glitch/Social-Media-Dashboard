<?php
$host = "localhost";
$user = "root";
$pass = ""; 
$dbname = "social_board";   // ye exact naam hona chahiye

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>