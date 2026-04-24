// Utility to hash the password securely
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
    // We'll generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Using PBKDF2 for password hashing, which is standard
    const baseKey = await crypto.subtle.importKey(
        "raw",
        data,
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    );
    
    const key = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        baseKey,
        256
    );
    
    // Convert salt and hash to hex string for database storage
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    const hashHex = Array.from(new Uint8Array(key)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return `${saltHex}:${hashHex}`;
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        
        // Destructure payload
        const { first_name, last_name, tip_email, student_number, password, department } = body;
        
        // Basic backend validation
        if (!tip_email || !tip_email.endsWith('@tip.edu.ph')) {
            return new Response(JSON.stringify({ error: 'Valid TiP email required' }), { status: 400 });
        }
        
        if (!password || password.length < 8) {
            return new Response(JSON.stringify({ error: 'Password must be at least 8 characters' }), { status: 400 });
        }
        
        // Hash the password securely
        const passwordHash = await hashPassword(password);
        
        // Map student_number to username as initial default
        const username = student_number;
        
        const db = env.DB;
        
        // Check if user already exists
        const existingUser = await db.prepare("SELECT email FROM users WHERE email = ? OR username = ? OR student_no = ?")
            .bind(tip_email, username, student_number)
            .first();
            
        if (existingUser) {
            return new Response(JSON.stringify({ error: 'An account with this email or student number already exists' }), { status: 409 });
        }
        
        // Look up dept_id from departments table
        let deptId = null;
        if (department) {
            const deptMap = {
                'college_of_arts': 'College of Arts',
                'college_of_engineering': 'College of Engineering and Architecture',
                'college_of_computer_science': 'College of Computer Science',
                'college_of_business': 'College of Business Education'
            };
            const deptName = deptMap[department] || department;
            const dept = await db.prepare("SELECT dept_id FROM departments WHERE dept_name = ? LIMIT 1")
                .bind(deptName)
                .first();
            if (dept) {
                deptId = dept.dept_id;
            }
        }
        
        // Insert new user into D1
        const result = await db.prepare(`
            INSERT INTO users (username, email, password_hash, first_name, last_name, student_no, dept_id, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'unverified')
            RETURNING user_id
        `).bind(username, tip_email, passwordHash, first_name, last_name, student_number, deptId).first();
        
        if (result && result.user_id) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Account created successfully',
                user_id: result.user_id
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error("Failed to insert user");
        }
        
    } catch (error) {
        console.error("Registration Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to create account. Please try again later.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
