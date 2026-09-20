CREATE DATABASE IF NOT EXISTS bapd_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE bapd_management;

CREATE TABLE IF NOT EXISTS users (
 id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(190) NOT NULL UNIQUE, password_hash VARCHAR(255), role ENUM('player','coach','official','admin') NOT NULL DEFAULT 'player', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS admins (
 id INT AUTO_INCREMENT PRIMARY KEY, email VARCHAR(190) NOT NULL UNIQUE, name VARCHAR(120), is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS coaches_officials (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NULL, full_name VARCHAR(150) NOT NULL, role_title VARCHAR(100) NOT NULL, club VARCHAR(150), phone VARCHAR(30), email VARCHAR(190), photo VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS players (
 id INT AUTO_INCREMENT PRIMARY KEY, user_id INT NOT NULL UNIQUE, full_name VARCHAR(150) NOT NULL, dob DATE NOT NULL, gender ENUM('Male','Female','Other') NOT NULL, weight_category VARCHAR(80) NOT NULL, age_group VARCHAR(80) NOT NULL, club VARCHAR(150), coach_id INT NULL, photo VARCHAR(255), age_proof VARCHAR(255), status ENUM('pending','approved','rejected') DEFAULT 'pending', phone VARCHAR(30), address VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE, FOREIGN KEY(coach_id) REFERENCES coaches_officials(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS tournaments (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(180) NOT NULL, tournament_date DATE NOT NULL, registration_last_date DATE, venue VARCHAR(255) NOT NULL, category VARCHAR(120), description TEXT, status ENUM('upcoming','ongoing','completed') DEFAULT 'upcoming', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS tournament_registrations (
 id INT AUTO_INCREMENT PRIMARY KEY, tournament_id INT NOT NULL, player_id INT NOT NULL, registration_status ENUM('registered','approved','withdrawn') DEFAULT 'registered', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, UNIQUE KEY unique_registration(tournament_id,player_id), FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE, FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS matches (
 id INT AUTO_INCREMENT PRIMARY KEY, tournament_id INT NOT NULL, match_no VARCHAR(30), round_name VARCHAR(80), category VARCHAR(120), scheduled_at DATETIME, venue VARCHAR(255), player_a_id INT, player_b_id INT, status ENUM('scheduled','completed','cancelled') DEFAULT 'scheduled', FOREIGN KEY(tournament_id) REFERENCES tournaments(id) ON DELETE CASCADE, FOREIGN KEY(player_a_id) REFERENCES players(id) ON DELETE SET NULL, FOREIGN KEY(player_b_id) REFERENCES players(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS results (
 id INT AUTO_INCREMENT PRIMARY KEY, match_id INT NOT NULL UNIQUE, winner_player_id INT NULL, loser_player_id INT NULL, result_type VARCHAR(80), points_awarded INT DEFAULT 0, notes TEXT, recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY(match_id) REFERENCES matches(id) ON DELETE CASCADE, FOREIGN KEY(winner_player_id) REFERENCES players(id) ON DELETE SET NULL, FOREIGN KEY(loser_player_id) REFERENCES players(id) ON DELETE SET NULL
);
CREATE TABLE IF NOT EXISTS rankings (
 id INT AUTO_INCREMENT PRIMARY KEY, player_id INT NOT NULL, weight_category VARCHAR(80) NOT NULL, age_group VARCHAR(80) NOT NULL, points INT DEFAULT 0, rank_position INT DEFAULT 0, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, UNIQUE KEY unique_player_category(player_id,weight_category,age_group), FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS news (
 id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(220) NOT NULL, content TEXT NOT NULL, is_published BOOLEAN DEFAULT TRUE, published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS gallery (
 id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(180), image_path VARCHAR(255) NOT NULL, caption TEXT, uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS contact_messages (
 id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(150) NOT NULL, email VARCHAR(190) NOT NULL, phone VARCHAR(30), message TEXT NOT NULL, status ENUM('new','read','resolved') DEFAULT 'new', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO news(title,content) SELECT 'Welcome to BAPD','Boxing Association of Palghar District is building a central digital platform for players, coaches, officials and boxing enthusiasts.' WHERE NOT EXISTS (SELECT 1 FROM news);
