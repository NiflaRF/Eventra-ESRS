<?php
/**
 * Database Configuration
 * Eventra ESRS Backend
 */

class Database {
    private $host = 'localhost';
    private $db_name = 'eventra_esrs';
    private $username = 'root';
    private $password = '';
    private $conn;

    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->exec("set names utf8");
            // Set timezone to UTC for consistency
            $this->conn->exec("SET time_zone = '+00:00'");
            // Also set PHP timezone to UTC
            date_default_timezone_set('UTC');
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?> 