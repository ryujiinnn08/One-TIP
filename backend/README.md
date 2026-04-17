## Overview

PREEEE ETO MGA NEED

## Database Setup (Using phpMyAdmin)

### 1. Create Database

```sql
CREATE DATABASE onetip_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE onetip_db;
```

### 2. Users Table (The Main User Data)

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(20) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    student_number VARCHAR(15) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    department ENUM('arts', 'engineering', 'computer_science', 'business') NOT NULL,
    campus ENUM('arlegui', 'casal') DEFAULT 'arlegui',
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('pending', 'active', 'suspended') DEFAULT 'active',
    email_verified BOOLEAN DEFAULT TRUE,
    profile_image VARCHAR(255) DEFAULT 'default-avatar.png',
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 3. Posts Table (For Both Marketplace & Services)

```sql
CREATE TABLE posts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type ENUM('marketplace', 'service') NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    condition_item ENUM('new', 'like_new', 'good', 'fair') NULL,
    delivery_time ENUM('1_day', '3_days', '1_week', '2_weeks') NULL,
    status ENUM('active', 'sold', 'deleted') DEFAULT 'active',
    view_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    image_url VARCHAR(255),
    contact_email VARCHAR(100),
    contact_facebook VARCHAR(100),
    chat_availability VARCHAR(100),
    meetup_availability VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_user_id (user_id)
);
```

### 4. Simple Notifications Table

```sql
CREATE TABLE notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'general',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. Vouches Table (User Reviews)

```sql
CREATE TABLE vouches (
    id INT PRIMARY KEY AUTO_INCREMENT,
    giver_id INT NOT NULL,
    receiver_id INT NOT NULL,
    post_id INT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (giver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE SET NULL
);
```

### 6. Post Likes Table

```sql
CREATE TABLE post_likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (user_id, post_id)
);
```

### 7. Password Reset Table

```sql
CREATE TABLE password_resets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_expires (expires_at)
);
```

## Required Test Accounts

### Admin Account (Copy-paste this into phpMyAdmin)

```sql
INSERT INTO users (
    username, first_name, last_name, email, student_number,
    password_hash, department, role, status, email_verified
) VALUES (
    'Admin', 'System', 'Administrator', 'admin@tip.edu.ph', 'ADMIN-001',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'computer_science', 'admin', 'active', TRUE
);
```

### Student Account (Copy-paste this into phpMyAdmin)

```sql
INSERT INTO users (
    username, first_name, last_name, email, student_number,
    password_hash, department, role, status, email_verified
) VALUES (
    'Student', 'John', 'Doe', 'student@tip.edu.ph', '2024-12345',
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'computer_science', 'user', 'active', TRUE
);
```

**Login Credentials:**

- **Admin**: admin@tip.edu.ph / Admin123
- **Student**: student@tip.edu.ph / Student123

## Basic PHP Files You Need to Create

### 1. Database Connection (`config/database.php`)

```php
<?php
// Simple database connection for students
$host = 'localhost';
$dbname = 'onetip_db';
$username = 'root';  // Default XAMPP username
$password = '';      // Default XAMPP password (empty)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>
```

### 2. Simple Login System (`backend/login.php`)

```php
<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$email = $input['email'] ?? '';
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Email and password required']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, username, first_name, last_name, email, password_hash, role FROM users WHERE email = ? AND status = 'active'");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        echo json_encode([
            'success' => true,
            'message' => 'Login successful',
            'user_id' => $user['id'],
            'username' => $user['username'],
            'token' => 'simple_token_' . $user['id'] // Simple token for demo
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email or password']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
```

### 3. Get User Posts (`backend/get-user-posts.php`)

```php
<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

try {
    // Get marketplace posts
    $stmt = $pdo->prepare("
        SELECT id, title, description, price, view_count, like_count, image_url, created_at
        FROM posts
        WHERE user_id = ? AND type = 'marketplace' AND status = 'active'
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user_id]);
    $marketplace = $stmt->fetchAll();

    // Get service posts
    $stmt = $pdo->prepare("
        SELECT id, title, description, price, view_count, like_count, created_at
        FROM posts
        WHERE user_id = ? AND type = 'service' AND status = 'active'
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user_id]);
    $services = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'marketplace' => $marketplace,
        'services' => $services
    ]);

} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
```

### 4. Create New Post (`backend/create-post.php`)

```php
<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not logged in']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$user_id = $_SESSION['user_id'];
$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$price = $_POST['price'] ?? 0;
$type = $_POST['type'] ?? 'marketplace';
$category = $_POST['category'] ?? '';

// Simple validation
if (empty($title) || empty($description) || $price <= 0) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO posts (user_id, type, title, description, price, category, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");

    $result = $stmt->execute([$user_id, $type, $title, $description, $price, $category]);

    if ($result) {
        echo json_encode(['success' => true, 'message' => 'Post created successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create post']);
    }

} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
```

### 5. Forgot Password System (`backend/forgot-password.php`)

```php
<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$emailOrUsername = $input['email_or_username'] ?? '';

if (empty($emailOrUsername)) {
    echo json_encode(['success' => false, 'message' => 'Email or username required']);
    exit;
}

try {
    // Find user by email or username
    $stmt = $pdo->prepare("SELECT id, email, username FROM users WHERE (email = ? OR username = ?) AND status = 'active'");
    $stmt->execute([$emailOrUsername, $emailOrUsername]);
    $user = $stmt->fetch();

    if ($user) {
        // Generate reset token
        $token = bin2hex(random_bytes(32));
        $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour'));

        // Store reset token
        $stmt = $pdo->prepare("INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)");
        $stmt->execute([$user['id'], $token, $expiresAt]);

        // In a real app, send email here
        // sendPasswordResetEmail($user['email'], $token);

        echo json_encode([
            'success' => true,
            'message' => 'Reset link sent to your email',
            'debug_token' => $token // Remove in production
        ]);
    } else {
        // Don't reveal if user exists for security
        echo json_encode(['success' => true, 'message' => 'If an account exists, reset link will be sent']);
    }
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
```

### 6. Reset Password System (`backend/reset-password.php`)

```php
<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$token = $input['token'] ?? '';
$newPassword = $input['new_password'] ?? '';

if (empty($token) || empty($newPassword)) {
    echo json_encode(['success' => false, 'message' => 'Token and new password required']);
    exit;
}

if (strlen($newPassword) < 8) {
    echo json_encode(['success' => false, 'message' => 'Password must be at least 8 characters']);
    exit;
}

try {
    // Verify token is valid and not expired
    $stmt = $pdo->prepare("
        SELECT pr.id, pr.user_id
        FROM password_resets pr
        WHERE pr.token = ? AND pr.expires_at > NOW() AND pr.used = FALSE
    ");
    $stmt->execute([$token]);
    $resetRecord = $stmt->fetch();

    if (!$resetRecord) {
        echo json_encode(['success' => false, 'message' => 'Invalid or expired reset token']);
        exit;
    }

    // Update user password
    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
    $stmt->execute([$passwordHash, $resetRecord['user_id']]);

    // Mark token as used
    $stmt = $pdo->prepare("UPDATE password_resets SET used = TRUE WHERE id = ?");
    $stmt->execute([$resetRecord['id']]);

    echo json_encode(['success' => true, 'message' => 'Password updated successfully']);

} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}
?>
```

## AI Chatbot Integration

### LLM Service Options

Choose one of these AI/LLM services:

#### Option 1: OpenAI GPT API

```php
// backend/ai-chat.php
$response = openai_chat_completion([
    'model' => 'gpt-3.5-turbo',
    'messages' => [
        ['role' => 'system', 'content' => 'You are a helpful assistant for ONE-TiP, a student marketplace platform.'],
        ['role' => 'user', 'content' => $userMessage]
    ]
]);
```

#### Option 2: Google Gemini API

```php
// Using Google AI PHP SDK
$response = $gemini->generateContent([
    'contents' => [
        'parts' => [
            ['text' => $systemPrompt . ' User: ' . $userMessage]
        ]
    ]
]);
```

#### Option 3: Local LLM (Ollama)

```php
// For local deployment
$response = curl_post('http://localhost:11434/api/generate', [
    'model' => 'llama2',
    'prompt' => $userMessage,
    'context' => $chatContext
]);
```

### Chat Endpoint Implementation

```php
// backend/ai-chat.php
<?php
session_start();
require_once '../config/database.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$userMessage = $input['message'] ?? '';
$chatHistory = $input['chat_history'] ?? [];

// Store chat message in database
$stmt = $pdo->prepare("INSERT INTO chat_logs (user_id, message, sender, created_at) VALUES (?, ?, 'user', NOW())");
$stmt->execute([$_SESSION['user_id'], $userMessage]);

// Get AI response
$aiResponse = getAIResponse($userMessage, $chatHistory);

// Store AI response
$stmt = $pdo->prepare("INSERT INTO chat_logs (user_id, message, sender, created_at) VALUES (?, ?, 'bot', NOW())");
$stmt->execute([$_SESSION['user_id'], $aiResponse]);

echo json_encode([
    'success' => true,
    'response' => $aiResponse
]);

function getAIResponse($message, $history) {
    // Your chosen LLM integration here
    // Return the AI response
}
?>
```

## Support Ticket System

### Database Schema

```sql
CREATE TABLE support_tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    category VARCHAR(50) NOT NULL,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    chat_log JSON NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    admin_response TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_created (created_at)
);

CREATE TABLE chat_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    sender ENUM('user', 'bot') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_created (user_id, created_at)
);
```

### Support Ticket Endpoint

```php
// backend/support-ticket.php
<?php
session_start();
require_once '../config/database.php';
require_once '../includes/email.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$category = $input['category'] ?? '';
$priority = $input['priority'] ?? 'medium';
$subject = $input['subject'] ?? '';
$message = $input['message'] ?? '';
$includeChatLog = $input['include_chat_log'] ?? false;
$chatHistory = $input['chat_history'] ?? [];

// Validate input
if (empty($category) || empty($subject) || empty($message)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

try {
    // Get user info
    $stmt = $pdo->prepare("SELECT username, first_name, last_name, email FROM users WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();

    // Prepare chat log if included
    $chatLogJson = $includeChatLog && !empty($chatHistory) ? json_encode($chatHistory) : null;

    // Create support ticket
    $stmt = $pdo->prepare("
        INSERT INTO support_tickets (user_id, category, priority, subject, message, chat_log, created_at)
        VALUES (?, ?, ?, ?, ?, ?, NOW())
    ");

    $result = $stmt->execute([$_SESSION['user_id'], $category, $priority, $subject, $message, $chatLogJson]);
    $ticketId = $pdo->lastInsertId();

    if ($result) {
        // Send email notification to admin team
        $adminEmails = ['admin@tip.edu.ph', 'support@tip.edu.ph'];

        $emailSubject = "ONE-TiP Support Ticket #{$ticketId}: {$subject}";
        $emailBody = generateSupportEmailBody($user, $ticketId, $category, $priority, $subject, $message, $chatHistory, $includeChatLog);

        foreach ($adminEmails as $adminEmail) {
            sendEmail($adminEmail, $emailSubject, $emailBody);
        }

        echo json_encode(['success' => true, 'ticket_id' => $ticketId]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create support ticket']);
    }

} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database error']);
}

function generateSupportEmailBody($user, $ticketId, $category, $priority, $subject, $message, $chatHistory, $includeChatLog) {
    $body = "
    <h2>New Support Ticket #{$ticketId}</h2>

    <h3>User Information:</h3>
    <ul>
        <li><strong>Name:</strong> {$user['first_name']} {$user['last_name']}</li>
        <li><strong>Username:</strong> @{$user['username']}</li>
        <li><strong>Email:</strong> {$user['email']}</li>
    </ul>

    <h3>Ticket Details:</h3>
    <ul>
        <li><strong>Category:</strong> " . ucfirst($category) . "</li>
        <li><strong>Priority:</strong> " . strtoupper($priority) . "</li>
        <li><strong>Subject:</strong> {$subject}</li>
    </ul>

    <h3>Message:</h3>
    <p>" . nl2br(htmlspecialchars($message)) . "</p>
    ";

    if ($includeChatLog && !empty($chatHistory)) {
        $body .= "
        <h3>Chat Log:</h3>
        <div style='background: #f5f5f5; padding: 10px; border-radius: 5px;'>";

        foreach ($chatHistory as $chat) {
            $sender = $chat['sender'] === 'user' ? 'User' : 'AI Assistant';
            $body .= "<p><strong>{$sender}:</strong> " . htmlspecialchars($chat['message']) . "</p>";
        }

        $body .= "</div>";
    }

    $body .= "
    <hr>
    <p><small>This ticket was generated automatically from the ONE-TiP platform.</small></p>
    ";

    return $body;
}
?>
```

### Email Configuration

```php
// includes/email.php
<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;

function sendEmail($to, $subject, $body) {
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Or your SMTP server
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your-email@gmail.com';
        $mail->Password   = 'your-app-password';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom('support@tip.edu.ph', 'ONE-TiP Support');
        $mail->addAddress($to);

        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $body;

        $mail->send();
        return true;
    } catch (Exception $e) {
        error_log("Email send failed: {$mail->ErrorInfo}");
        return false;
    }
}
?>
```

## Environment Variables

Add these to your `.env` file:

```env
# AI Service Configuration
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_HOST=http://localhost:11434

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=support@tip.edu.ph
SMTP_FROM_NAME=ONE-TiP Support

# Admin Email Addresses
ADMIN_EMAILS=admin@tip.edu.ph,support@tip.edu.ph
```

## Folder Structure (Put in your htdocs folder)

```
onetip/
├── index.html
├── dashboard.html
├── marketplace.html
├── services.html
├── admin-dashboard.html
├── config/
│   └── database.php
├── backend/
│   ├── login.php
│   ├── register.php
│   ├── create-post.php
│   ├── get-user-posts.php
│   └── get-marketplace.php
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
└── Images/
```

## Testing Your Backend

### 1. Test Database Connection

- Open phpMyAdmin (http://localhost/phpmyadmin)
- Create the database and tables
- Insert the test accounts

### 2. Test Login

- Open your website (http://localhost/onetip)
- Try logging in with: student@tip.edu.ph / Student123

### 3. Test Creating Posts

- Login and go to dashboard
- Try creating a marketplace item or service

## Simple Security Tips for Students

1. **Always use prepared statements** (we did this above)
2. **Validate user input** - Check if fields are empty
3. **Use password_hash()** for passwords - Never store plain text!
4. **Check if user is logged in** before showing sensitive data
5. **Use HTTPS in production** (not needed for local development)

## Common Student Mistakes to Avoid

❌ **Don't do this:**

```php
$query = "SELECT * FROM users WHERE email = '$email'"; // SQL injection risk!
```

✅ **Do this instead:**

```php
$stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
$stmt->execute([$email]);
```

❌ **Don't store passwords like this:**

```php
$password = $_POST['password']; // Plain text - very bad!
```

✅ **Do this instead:**

```php
$password_hash = password_hash($_POST['password'], PASSWORD_DEFAULT);
```

## Learning Resources for Students

1. **PHP Basics**: W3Schools PHP Tutorial
2. **MySQL**: W3Schools SQL Tutorial
3. **PDO**: PHP.net PDO Documentation
4. **XAMPP Setup**: XAMPP Official Guide
5. **JSON APIs**: MDN Web Docs

## What's Next?

After you get the basics working:

1. Add image upload functionality
2. Implement search features
3. Add email notifications
4. Create admin panel features
5. Add more security features

## Getting Help

If you're stuck:

1. Check your PHP error logs (in XAMPP control panel)
2. Use `var_dump()` to debug variables
3. Test your SQL queries in phpMyAdmin first
4. Ask your classmates or instructor

Remember: **Start simple, then add features gradually!** Don't try to build everything at once.

## Sample Data for Testing

You can add some test posts to see data:

```sql
INSERT INTO posts (user_id, type, title, description, price, category) VALUES
(2, 'marketplace', 'Used Laptop', 'Dell laptop in good condition', 15000.00, 'electronics'),
(2, 'marketplace', 'Math Textbook', 'Calculus book for engineering students', 500.00, 'books'),
(2, 'service', 'Math Tutoring', 'Help with calculus and algebra', 200.00, 'tutoring');
```

This will give you some posts to display and test with!

Good luck with your project! 🚀

- **Email**: admin@tip.edu.ph
- **Password**: Admin123
- **Access**: Admin Dashboard at `/admin-dashboard.html`

### Student Login

- **Email**: student@tip.edu.ph
- **Password**: Student123
- **Access**: Student Dashboard at `/dashboard.html`

## File Upload Requirements

### Image Upload

- **Location**: `/uploads/images/`
- **Max Size**: 10MB per image
- **Formats**: JPG, JPEG, PNG, GIF, WebP
- **Naming**: `{user_id}_{timestamp}_{random_string}.{extension}`
- **Thumbnails**: Generate 300x300 thumbnails for posts

### Profile Images

- **Location**: `/uploads/profiles/`
- **Max Size**: 5MB
- **Formats**: JPG, JPEG, PNG
- **Naming**: `profile_{user_id}_{timestamp}.{extension}`
- **Resize**: 200x200 for profile display

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Server Error

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Error message"]
  },
  "code": "ERROR_CODE"
}
```

## Performance Optimization

### Database Indexing

- Index all foreign keys
- Index frequently queried columns (email, username, status)
- Use composite indexes for complex queries
- Full-text search on posts table

### Caching Strategy

- Cache user sessions in Redis
- Cache frequently accessed data (user profiles, popular posts)
- Implement query result caching
- Cache static assets with appropriate headers

### Database Queries

- Use prepared statements for all queries
- Implement pagination for large result sets
- Use JOINs efficiently to avoid N+1 problems
- Monitor slow queries and optimize

## Security Checklist

- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS protection (escape output)
- [ ] CSRF token validation
- [ ] Rate limiting on sensitive endpoints
- [ ] File upload security (type validation, size limits)
- [ ] User authorization checks
- [ ] Secure password hashing
- [ ] Email verification required
- [ ] Admin action logging

## Deployment Notes

### Production Requirements

- PHP 8.0 or higher
- MySQL 8.0 or higher
- Redis for session storage
- SSL certificate required
- Proper file permissions
- Regular database backups
- Error logging and monitoring

### Development Setup

1. Clone repository
2. Copy `.env.example` to `.env`
3. Configure database credentials
4. Run database migrations
5. Seed dummy data
6. Configure virtual host
7. Test all endpoints

This README provides comprehensive guidance for implementing the ONE-TiP backend. All database schemas, API endpoints, and security requirements are documented to ensure consistent implementation.
