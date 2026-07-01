-- ============================================================
-- Horse Racing Tournament Management System
-- Seed SQL — Sample Seed Data
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE bets;
TRUNCATE TABLE race_results;
TRUNCATE TABLE registrations;
TRUNCATE TABLE races;
TRUNCATE TABLE tournaments;
TRUNCATE TABLE horses;
TRUNCATE TABLE admins;
TRUNCATE TABLE spectators;
TRUNCATE TABLE race_referees;
TRUNCATE TABLE jockeys;
TRUNCATE TABLE horse_owners;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- Users (password = bcrypt('password'))
-- ============================================================
INSERT INTO users (id, name, email, password, role, created_at, updated_at) VALUES
(1,  'System Administrator', 'admin@horse.vn',      '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin',        NOW(), NOW()),
(2,  'Nguyen Van An',         'an.owner@horse.vn',   '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'horse_owner',  NOW(), NOW()),
(3,  'Tran Thi Binh',         'binh.owner@horse.vn', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'horse_owner',  NOW(), NOW()),
(4,  'Le Van Cuong',          'cuong.jockey@horse.vn','$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi','jockey',       NOW(), NOW()),
(5,  'Pham Thị Dung',         'dung.jockey@horse.vn','$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'jockey',       NOW(), NOW()),
(6,  'Hoang Van Em',          'em.referee@horse.vn', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'race_referee', NOW(), NOW()),
(7,  'Vu Thi Giang',          'giang.spec@horse.vn', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'spectator',    NOW(), NOW()),
(8,  'Dang Van Hung',         'hung.spec@horse.vn',  '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'spectator',    NOW(), NOW());

-- ============================================================
-- Profile tables
-- ============================================================
INSERT INTO admins (id, user_id) VALUES (1, 1);

INSERT INTO horse_owners (id, user_id) VALUES (1, 2), (2, 3);

INSERT INTO jockeys (id, user_id) VALUES (1, 4), (2, 5);

INSERT INTO race_referees (id, user_id) VALUES (1, 6);

INSERT INTO spectators (id, user_id) VALUES (1, 7), (2, 8);

-- ============================================================
-- Horses
-- ============================================================
INSERT INTO horses (id, name, age, breed, horse_owner_id, status, created_at, updated_at) VALUES
(1, 'Thunder Bolt',  4, 'Thoroughbred', 1, 'active',   NOW(), NOW()),
(2, 'Silver Wind',   5, 'Arabian',      1, 'active',   NOW(), NOW()),
(3, 'Golden Star',   3, 'Quarter Horse',2, 'active',   NOW(), NOW()),
(4, 'Dark Storm',    6, 'Thoroughbred', 2, 'active',   NOW(), NOW()),
(5, 'Midnight Run',  4, 'Arabian',      1, 'inactive', NOW(), NOW());

-- ============================================================
-- Tournaments
-- ============================================================
INSERT INTO tournaments (id, name, start_date, end_date, location, created_at, updated_at) VALUES
(1, 'Spring Tournament 2026', '2026-03-01', '2026-03-15', 'Phu Tho Racetrack, HCMC', NOW(), NOW()),
(2, 'Golden Cup 2026',        '2026-06-10', '2026-06-20', 'Dai Nam Racetrack, Binh Duong', NOW(), NOW());

-- ============================================================
-- Races
-- ============================================================
INSERT INTO races (id, tournament_id, race_time, distance, status, created_at, updated_at) VALUES
(1, 1, '2026-03-05 08:00:00', 1200, 'finished',  NOW(), NOW()),
(2, 1, '2026-03-10 09:30:00', 1600, 'finished',  NOW(), NOW()),
(3, 2, '2026-06-12 08:00:00', 2000, 'scheduled', NOW(), NOW()),
(4, 2, '2026-06-18 10:00:00', 1400, 'scheduled', NOW(), NOW());

-- ============================================================
-- Registrations
-- ============================================================
INSERT INTO registrations (id, race_id, horse_id, jockey_id, status, created_at, updated_at) VALUES
(1, 1, 1, 4, 'confirmed', NOW(), NOW()),
(2, 1, 3, 5, 'confirmed', NOW(), NOW()),
(3, 2, 2, 4, 'confirmed', NOW(), NOW()),
(4, 2, 4, 5, 'confirmed', NOW(), NOW()),
(5, 3, 1, 4, 'pending',   NOW(), NOW()),
(6, 3, 3, 5, 'pending',   NOW(), NOW()),
(7, 4, 2, 4, 'pending',   NOW(), NOW());

-- ============================================================
-- Race Results
-- ============================================================
INSERT INTO race_results (id, race_id, registration_id, rank, finish_time, notes, created_at, updated_at) VALUES
(1, 1, 1, 1, '01:12.34', 'Excellent finish', NOW(), NOW()),
(2, 1, 2, 2, '01:13.50', NULL,               NOW(), NOW()),
(3, 2, 3, 1, '01:35.22', 'New track record', NOW(), NOW()),
(4, 2, 4, 2, '01:36.88', NULL,               NOW(), NOW());

-- ============================================================
-- Bets
-- ============================================================
INSERT INTO bets (id, user_id, registration_id, amount, prediction_type, status, created_at, updated_at) VALUES
(1, 7, 1, 500000.00,  'win',   'won',     NOW(), NOW()),
(2, 7, 2, 200000.00,  'place', 'won',     NOW(), NOW()),
(3, 8, 1, 1000000.00, 'win',   'won',     NOW(), NOW()),
(4, 8, 4, 300000.00,  'win',   'lost',    NOW(), NOW()),
(5, 7, 5, 500000.00,  'win',   'pending', NOW(), NOW()),
(6, 8, 6, 400000.00,  'place', 'pending', NOW(), NOW());
