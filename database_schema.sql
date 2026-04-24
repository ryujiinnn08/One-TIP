-- ============================================================
-- ONE-TiP Normalized Database Schema
-- Optimized for Cloudflare D1 (SQLite)
-- ============================================================

PRAGMA foreign_keys = OFF;

DROP TABLE IF EXISTS admin_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS warnings;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS vouches;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS post_images;
DROP TABLE IF EXISTS service_offers;
DROP TABLE IF EXISTS marketplace_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS email_verification_codes;
DROP TABLE IF EXISTS password_reset_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS activities;

-- ============================================================
-- DOMAIN 1: USERS & DEPARTMENTS
-- ============================================================

CREATE TABLE departments (
    dept_id INTEGER PRIMARY KEY AUTOINCREMENT,
    dept_name TEXT NOT NULL,
    campus TEXT NOT NULL
);

CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    student_no TEXT UNIQUE,
    dept_id INTEGER,
    campus TEXT,
    role TEXT DEFAULT 'student' CHECK(role IN ('student', 'admin')),
    status TEXT DEFAULT 'unverified' CHECK(status IN ('active', 'suspended', 'unverified')),
    bio TEXT,
    profile_photo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE password_reset_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DOMAIN 2: MARKETPLACE & SERVICES
-- ============================================================

CREATE TABLE categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('marketplace', 'service'))
);

CREATE TABLE marketplace_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    seller_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL DEFAULT 0.00,
    condition TEXT CHECK(condition IN ('Brand New', 'Like New', 'Good', 'Fair')),
    category_id INTEGER,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'sold', 'hidden', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE service_offers (
    service_id INTEGER PRIMARY KEY AUTOINCREMENT,
    provider_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    starting_price REAL DEFAULT 0.00,
    category_id INTEGER,
    delivery_time TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'hidden', 'deleted')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE post_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_type TEXT NOT NULL CHECK(item_type IN ('marketplace', 'service')),
    item_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    is_main INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DOMAIN 3: SOCIAL INTERACTIONS
-- ============================================================

CREATE TABLE messages (
    message_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    receiver_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_read INTEGER DEFAULT 0
);

CREATE TABLE vouches (
    vouch_id INTEGER PRIMARY KEY AUTOINCREMENT,
    voucher_id INTEGER NOT NULL,
    vouchee_id INTEGER NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reviews (
    review_id INTEGER PRIMARY KEY AUTOINCREMENT,
    reviewer_id INTEGER NOT NULL,
    target_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DOMAIN 4: MODERATION & REPORTS
-- ============================================================

CREATE TABLE reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    reporter_id INTEGER NOT NULL,
    reported_item_id INTEGER,
    report_type TEXT NOT NULL CHECK(report_type IN ('user', 'marketplace_item', 'service_offer', 'message')),
    reason TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE warnings (
    warning_id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    report_id INTEGER,
    message TEXT NOT NULL,
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- DOMAIN 5: ADMIN LOGS & NOTIFICATIONS
-- ============================================================

CREATE TABLE admin_logs (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    details TEXT,
    logged_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    notif_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO departments (dept_name, campus) VALUES ('College of Arts', 'Manila');
INSERT INTO departments (dept_name, campus) VALUES ('College of Engineering and Architecture', 'Manila');
INSERT INTO departments (dept_name, campus) VALUES ('College of Computer Science', 'Manila');
INSERT INTO departments (dept_name, campus) VALUES ('College of Business Education', 'Manila');
INSERT INTO departments (dept_name, campus) VALUES ('College of Arts', 'QC');
INSERT INTO departments (dept_name, campus) VALUES ('College of Engineering and Architecture', 'QC');
INSERT INTO departments (dept_name, campus) VALUES ('College of Computer Science', 'QC');
INSERT INTO departments (dept_name, campus) VALUES ('College of Business Education', 'QC');

INSERT INTO categories (name, type) VALUES ('Electronics', 'marketplace');
INSERT INTO categories (name, type) VALUES ('Books & Notes', 'marketplace');
INSERT INTO categories (name, type) VALUES ('Clothing', 'marketplace');
INSERT INTO categories (name, type) VALUES ('School Supplies', 'marketplace');
INSERT INTO categories (name, type) VALUES ('Food & Beverages', 'marketplace');
INSERT INTO categories (name, type) VALUES ('Others', 'marketplace');

INSERT INTO categories (name, type) VALUES ('Tutoring', 'service');
INSERT INTO categories (name, type) VALUES ('Design & Creative', 'service');
INSERT INTO categories (name, type) VALUES ('Tech & Programming', 'service');
INSERT INTO categories (name, type) VALUES ('Writing & Editing', 'service');
INSERT INTO categories (name, type) VALUES ('Errands & Delivery', 'service');
INSERT INTO categories (name, type) VALUES ('Others', 'service');

PRAGMA foreign_keys = ON;
