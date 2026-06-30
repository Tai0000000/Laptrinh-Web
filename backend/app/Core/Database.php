<?php

namespace App\Core;

use PDO;
use PDOException;

/**
 * Database - PDO Singleton
 *
 * Ensures there is only ONE unique PDO connection in the entire application.
 * Usage: $pdo = Database::getInstance()->getConnection();
 */
class Database
{
    /** @var Database|null Unique instance */
    private static ?Database $instance = null;

    /** @var PDO PDO connection */
    private PDO $connection;

    /**
     * Private constructor to prevent direct instantiation
     */
    private function __construct()
    {
        $host     = env('DB_HOST',     'db');
        $port     = env('DB_PORT',     '3306');
        $database = env('DB_DATABASE', 'horse_racing');
        $username = env('DB_USERNAME', 'horse_user');
        $password = env('DB_PASSWORD', 'horse_pass');
        $charset  = 'utf8mb4';

        $dsn = "mysql:host={$host};port={$port};dbname={$database};charset={$charset}";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->connection = new PDO($dsn, $username, $password, $options);
        } catch (PDOException $e) {
            throw new PDOException(
                'Could not connect to the database: ' . $e->getMessage(),
                (int) $e->getCode()
            );
        }
    }

    /**
     * Prevent clone instance
     */
    private function __clone() {}

    /**
     * Prevent unserialize instance
     */
    public function __wakeup()
    {
        throw new \RuntimeException('Cannot unserialize a PDO Singleton.');
    }

    /**
     * Get the unique instance (Singleton pattern)
     *
     * @return static
     */
    public static function getInstance(): static
    {
        if (static::$instance === null) {
            static::$instance = new static();
        }

        return static::$instance;
    }

    /**
     * Get the PDO connection object
     *
     * @return PDO
     */
    public function getConnection(): PDO
    {
        return $this->connection;
    }

    /**
     * Helper: execute SELECT and return multiple rows
     *
     * @param string $sql
     * @param array  $params
     * @return array
     */
    public function fetchAll(string $sql, array $params = []): array
    {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    /**
     * Helper: execute SELECT and return a single row
     *
     * @param string $sql
     * @param array  $params
     * @return array|false
     */
    public function fetchOne(string $sql, array $params = []): array|false
    {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetch();
    }

    /**
     * Helper: execute INSERT/UPDATE/DELETE
     *
     * @param string $sql
     * @param array  $params
     * @return int Number of affected rows
     */
    public function execute(string $sql, array $params = []): int
    {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt->rowCount();
    }

    /**
     * Get the ID of the last inserted record
     *
     * @return string
     */
    public function lastInsertId(): string
    {
        return $this->connection->lastInsertId();
    }
}
