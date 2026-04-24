// Utility to verify the password securely using Web Crypto
async function verifyPassword(password, storedHashStr) {
    // Expected format: "saltHex:hashHex"
    const parts = storedHashStr.split(':');
    if (parts.length !== 2) return false;
    
    const [saltHex, hashHex] = parts;
    
    // Convert hex string back to Uint8Array for salt
    const salt = new Uint8Array(saltHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    
    // Hash the incoming password with the same salt to compare
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    
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
    
    const computedHashHex = Array.from(new Uint8Array(key)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return computedHashHex === hashHex;
}

export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { email, password } = body;
        
        if (!email || !password) {
            return new Response(JSON.stringify({ error: 'Email and password are required' }), { status: 400 });
        }
        
        const db = env.DB;
        
        // Fetch user from D1 database with department join
        const user = await db.prepare(`
            SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, 
                   u.password_hash, u.role, u.status, u.student_no, u.campus,
                   u.profile_photo, d.dept_name as department
            FROM users u
            LEFT JOIN departments d ON u.dept_id = d.dept_id
            WHERE u.email = ?
        `).bind(email).first();
            
        // Security best practice: generic error message for invalid user or invalid password
        if (!user) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
        }
        
        if (user.status === 'suspended') {
            return new Response(JSON.stringify({ error: 'This account has been suspended by administrators' }), { status: 403 });
        }

        if (user.status === 'unverified') {
            return new Response(JSON.stringify({ 
                error: 'Please verify your email before logging in',
                needs_verification: true,
                user_id: user.user_id,
                email: user.email
            }), { status: 403 });
        }
        
        // Verify password
        const isValidMatch = await verifyPassword(password, user.password_hash);
        
        if (!isValidMatch) {
            return new Response(JSON.stringify({ error: 'Invalid email or password' }), { status: 401 });
        }
        
        // Login successful
        const tokenBytes = crypto.getRandomValues(new Uint8Array(24));
        const sessionToken = Array.from(tokenBytes).map(b => b.toString(16).padStart(2, '0')).join('');
        
        return new Response(JSON.stringify({
            success: true,
            token: sessionToken,
            user: {
                id: user.user_id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: user.role,
                department: user.department,
                student_no: user.student_no,
                profile_photo: user.profile_photo
            }
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
        
    } catch (error) {
        console.error("Login Authentication Error:", error);
        return new Response(JSON.stringify({ error: 'An unexpected server error occurred during authentication.' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
