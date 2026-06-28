-- ============================================================
-- Horse Racing Tournament Management System
-- Schema SQL — MySQL 8.0
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS bets;
DROP TABLE IF EXISTS race_results;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS races;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS horses;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS spectators;
DROP TABLE IF EXISTS race_referees;
DROP TABLE IF EXISTS jockeys;
DROP TABLE IF EXISTS horse_owners;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. Users Table
-- ============================================================
CREATE TABLE users (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(255)    NOT NULL,
    email         VARCHAR(255)    NOT NULL UNIQUE,
    password      VARCHAR(255)    NOT NULL,
    role          ENUM('horse_owner','jockey','race_referee','spectator','admin')
                                  NOT NULL DEFAULT 'spectator',
    remember_token VARCHAR(100)   NULL,
    created_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP       NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Horse Owners Table
-- ============================================================
CREATE TABLE horse_owners (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ho_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Jockeys Table
-- ============================================================
CREATE TABLE jockeys (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_jockey_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. Race Referees Table
-- ============================================================
CREATE TABLE race_referees (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_referee_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. Spectators Table
-- ============================================================
CREATE TABLE spectators (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_spectator_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. Admins Table
-- ============================================================
CREATE TABLE admins (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL UNIQUE,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. Horses Table
-- ============================================================
CREATE TABLE horses (
    id             BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(255)    NOT NULL,
    age            INT             NOT NULL,
    breed          VARCHAR(255)    NOT NULL,
    horse_owner_id BIGINT UNSIGNED NOT NULL,
    status         VARCHAR(50)     NOT NULL DEFAULT 'active',
    created_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_horse_owner FOREIGN KEY (horse_owner_id) REFERENCES horse_owners(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. Tournaments Table
-- ============================================================
CREATE TABLE tournaments (
    id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    start_date DATE         NOT NULL,
    end_date   DATE         NOT NULL,
    location   VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. Races Table
-- ============================================================
CREATE TABLE races (
    id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tournament_id BIGINT UNSIGNED NOT NULL,
    race_time     DATETIME        NOT NULL,
    distance      INT             NOT NULL COMMENT 'distance in meters',
    status        VARCHAR(50)     NOT NULL DEFAULT 'scheduled'
                                  COMMENT 'scheduled|ongoing|finished|cancelled',
    created_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_race_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. Registrations Table
-- ============================================================
CREATE TABLE registrations (
    id        BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    race_id   BIGINT UNSIGNED NOT NULL,
    horse_id  BIGINT UNSIGNED NOT NULL,
    jockey_id BIGINT UNSIGNED NOT NULL,
    status    ENUM('pending','confirmed','rejected','withdrawn') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_reg_race    FOREIGN KEY (race_id)   REFERENCES races(id)  ON DELETE CASCADE,
    CONSTRAINT fk_reg_horse   FOREIGN KEY (horse_id)  REFERENCES horses(id) ON DELETE CASCADE,
    CONSTRAINT fk_reg_jockey  FOREIGN KEY (jockey_id) REFERENCES users(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. Race Results Table
-- ============================================================
CREATE TABLE race_results (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    race_id         BIGINT UNSIGNED NOT NULL,
    registration_id BIGINT UNSIGNED NOT NULL,
    rank            INT             NULL,
    finish_time     VARCHAR(50)     NULL,
    notes           TEXT            NULL,
    created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_result_race FOREIGN KEY (race_id)         REFERENCES races(id)         ON DELETE CASCADE,
    CONSTRAINT fk_result_reg  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. Bets Table
-- ============================================================
CREATE TABLE bets (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    registration_id BIGINT UNSIGNED NOT NULL,
    amount          DECIMAL(10,2)   NOT NULL,
    prediction_type VARCHAR(100)    NOT NULL COMMENT 'win|place|show',
    status          VARCHAR(50)     NOT NULL DEFAULT 'pending'
                                    COMMENT 'pending|won|lost',
    created_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_bet_user FOREIGN KEY (user_id)         REFERENCES users(id)         ON DELETE CASCADE,
    CONSTRAINT fk_bet_reg  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
