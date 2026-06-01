

SET NAMES utf8mb4;
SET foreign_key_checks = 0;

CREATE DATABASE IF NOT EXISTS horse_racing CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE horse_racing;

-- 1. users
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50)  NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','horse_owner','jockey','referee','spectator') NOT NULL,
  full_name     VARCHAR(100),
  email         VARCHAR(150),
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. horses
CREATE TABLE IF NOT EXISTS horses (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  owner_id  INT NOT NULL,
  name      VARCHAR(100) NOT NULL,
  breed     VARCHAR(100),
  age       INT,
  weight    DECIMAL(5,2),
  status    ENUM('active','retired','disqualified') NOT NULL DEFAULT 'active',
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. jockeys
CREATE TABLE IF NOT EXISTS jockeys (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL UNIQUE,
  license_number   VARCHAR(50) NOT NULL UNIQUE,
  weight           DECIMAL(5,2),
  experience_years INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. tournaments
CREATE TABLE IF NOT EXISTS tournaments (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(200) NOT NULL,
  start_date DATE,
  end_date   DATE,
  location   VARCHAR(200),
  status     ENUM('upcoming','ongoing','completed') NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. races
CREATE TABLE IF NOT EXISTS races (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  tournament_id INT NOT NULL,
  name          VARCHAR(200),
  round_number  INT,
  race_date     DATETIME,
  distance      INT,
  max_horses    INT NOT NULL DEFAULT 12,
  status        ENUM('scheduled','in_progress','finished','cancelled') NOT NULL DEFAULT 'scheduled',
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. horse_jockey (invite flow)
CREATE TABLE IF NOT EXISTS horse_jockey (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  horse_id   INT NOT NULL,
  jockey_id  INT NOT NULL,
  race_id    INT NOT NULL,
  status     ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (horse_id)  REFERENCES horses(id)  ON DELETE CASCADE,
  FOREIGN KEY (jockey_id) REFERENCES jockeys(id) ON DELETE CASCADE,
  FOREIGN KEY (race_id)   REFERENCES races(id)   ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. registrations
CREATE TABLE IF NOT EXISTS registrations (
  id                  INT AUTO_INCREMENT PRIMARY KEY,
  race_id             INT NOT NULL,
  horse_id            INT NOT NULL,
  jockey_id           INT,
  lane_number         INT,
  status              ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  confirmed_by_owner  TINYINT(1) NOT NULL DEFAULT 0,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (race_id)   REFERENCES races(id)   ON DELETE CASCADE,
  FOREIGN KEY (horse_id)  REFERENCES horses(id)  ON DELETE CASCADE,
  FOREIGN KEY (jockey_id) REFERENCES jockeys(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 8. race_results
CREATE TABLE IF NOT EXISTS race_results (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  race_id          INT NOT NULL,
  registration_id  INT NOT NULL UNIQUE,
  finish_position  INT,
  finish_time      DECIMAL(8,3),
  prize_amount     DECIMAL(12,2) DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (race_id)         REFERENCES races(id)         ON DELETE CASCADE,
  FOREIGN KEY (registration_id) REFERENCES registrations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. referee_reports
CREATE TABLE IF NOT EXISTS referee_reports (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  race_id      INT NOT NULL,
  referee_id   INT NOT NULL,
  violations   TEXT,
  notes        TEXT,
  confirmed_at DATETIME,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (race_id)    REFERENCES races(id) ON DELETE CASCADE,
  FOREIGN KEY (referee_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. bets
CREATE TABLE IF NOT EXISTS bets (
  id                 INT AUTO_INCREMENT PRIMARY KEY,
  spectator_id       INT NOT NULL,
  race_id            INT NOT NULL,
  horse_id           INT NOT NULL,
  predicted_position INT NOT NULL,
  reward_amount      DECIMAL(10,2) DEFAULT 0,
  status             ENUM('pending','won','lost') NOT NULL DEFAULT 'pending',
  created_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (spectator_id) REFERENCES users(id)   ON DELETE CASCADE,
  FOREIGN KEY (race_id)      REFERENCES races(id)   ON DELETE CASCADE,
  FOREIGN KEY (horse_id)     REFERENCES horses(id)  ON DELETE CASCADE
) ENGINE=InnoDB;

SET foreign_key_checks = 1;
