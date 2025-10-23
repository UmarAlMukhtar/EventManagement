-- Event Management System Database Schema
-- This script initializes the database with all necessary tables

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS event_management;

-- Use the event_management database
USE event_management;

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS feedback;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS registrations;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS users;

-- Create users table
CREATE TABLE users (
  user_id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('participant', 'coordinator', 'admin') NOT NULL DEFAULT 'participant',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create events table
CREATE TABLE events (
  event_id VARCHAR(10) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  date DATETIME NOT NULL,
  venue VARCHAR(255) NOT NULL,
  coordinator_id VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (coordinator_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Create registrations table
CREATE TABLE registrations (
  reg_id VARCHAR(10) PRIMARY KEY,
  event_id VARCHAR(10) NOT NULL,
  user_id VARCHAR(10) NOT NULL,
  reg_date DATE NOT NULL,
  status ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  UNIQUE KEY unique_registration (event_id, user_id)
);

-- Create attendance table
CREATE TABLE attendance (
  att_id VARCHAR(10) PRIMARY KEY,
  reg_id VARCHAR(10) NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reg_id) REFERENCES registrations(reg_id) ON DELETE CASCADE
);

-- Create feedback table
CREATE TABLE feedback (
  fb_id VARCHAR(10) PRIMARY KEY,
  reg_id VARCHAR(10) NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (reg_id) REFERENCES registrations(reg_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_events_coordinator ON events(coordinator_id);
CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_attendance_reg ON attendance(reg_id);
CREATE INDEX idx_feedback_reg ON feedback(reg_id);
CREATE INDEX idx_users_email ON users(email);
