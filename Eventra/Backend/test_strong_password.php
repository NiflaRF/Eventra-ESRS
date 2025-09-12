<?php
$ch = curl_init();
$testData = ['name' => 'Test User', 'email' => 'testpassword@unique.com', 'password' => 'Password123!', 'role' => 'student'];
curl_setopt($ch, CURLOPT_URL, 'http://localhost/Eventra-ESRS/Eventra/Backend/api/auth/register.php');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($testData));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);
echo 'HTTP Status: ' . $httpCode . PHP_EOL;
echo 'Response: ' . $response . PHP_EOL;
?>