-- Create database
CREATE DATABASE IF NOT EXISTS mr_fixer_db;
USE mr_fixer_db;
SET GLOBAL max_allowed_packet = 67108864;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'customer', 'fixer') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create admin user (optional)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@example.com', '$2b$10$YourHashedPasswordHere', 'admin') 
ON DUPLICATE KEY UPDATE id=id;

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image MEDIUMBLOB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

