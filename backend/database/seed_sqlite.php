<?php

$dbFile = __DIR__ . '/database.sqlite';
$sqlFile = __DIR__ . '/seed.sql';

if (!file_exists($dbFile)) {
    die("Database file not found at: $dbFile\n");
}
if (!file_exists($sqlFile)) {
    die("Seed SQL file not found at: $sqlFile\n");
}

try {
    $pdo = new PDO("sqlite:" . $dbFile);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Disable foreign keys temporarily
    $pdo->exec("PRAGMA foreign_keys = OFF;");

    // Read seed.sql content
    $sqlContent = file_get_contents($sqlFile);

    // Replace MySQL specific functions and truncate commands
    // 1. Remove SET FOREIGN_KEY_CHECKS
    $sqlContent = preg_replace('/SET FOREIGN_KEY_CHECKS\s*=\s*[01];/i', '', $sqlContent);

    // 2. Convert TRUNCATE TABLE to DELETE FROM
    $sqlContent = preg_replace('/TRUNCATE TABLE\s+(\w+);/i', 'DELETE FROM $1;', $sqlContent);

    // 3. Replace NOW() with CURRENT_TIMESTAMP or datetime('now')
    $sqlContent = str_ireplace('NOW()', "datetime('now')", $sqlContent);

    // Split statements by semicolon, but be careful with newlines or semicolons inside values if any.
    // For our seed.sql, it's simple enough to split by ";\n" or similar.
    $statements = explode(";\n", $sqlContent);

    echo "Starting seeding...\n";
    $count = 0;
    foreach ($statements as $statement) {
        $statement = trim($statement);
        if (empty($statement)) {
            continue;
        }

        try {
            $pdo->exec($statement . ";");
            $count++;
        } catch (PDOException $e) {
            echo "Error executing statement: \n$statement\n";
            echo "Error message: " . $e->getMessage() . "\n\n";
        }
    }

    // Enable foreign keys back
    $pdo->exec("PRAGMA foreign_keys = ON;");

    echo "Seeding completed successfully! Executed $count statements.\n";

} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage() . "\n");
}
