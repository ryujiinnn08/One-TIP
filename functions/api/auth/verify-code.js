export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { email, code } = body;

        if (!email || !code) {
            return new Response(JSON.stringify({ error: 'Email and verification code are required' }), { status: 400 });
        }

        if (code.length !== 6) {
            return new Response(JSON.stringify({ error: 'Invalid verification code format' }), { status: 400 });
        }

        const db = env.DB;

        // Find the most recent valid (unused, not expired) code for this email
        const record = await db.prepare(
            `SELECT id, user_id, code FROM email_verification_codes 
             WHERE email = ? AND used = 0 AND expires_at > datetime('now')
             ORDER BY created_at DESC LIMIT 1`
        ).bind(email).first();

        if (!record) {
            return new Response(JSON.stringify({ error: 'Verification code has expired. Please request a new one.' }), { status: 410 });
        }

        // Compare codes
        if (record.code !== code) {
            return new Response(JSON.stringify({ error: 'Invalid verification code. Please check and try again.' }), { status: 401 });
        }

        // Mark code as used
        await db.prepare(
            `UPDATE email_verification_codes SET used = 1 WHERE id = ?`
        ).bind(record.id).run();

        // Activate the user account
        await db.prepare(
            `UPDATE users SET status = 'active' WHERE user_id = ?`
        ).bind(record.user_id).run();

        return new Response(JSON.stringify({
            success: true,
            message: 'Email verified successfully! Your account is now active.',
            user_id: record.user_id
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Verify Code Error:', error);
        return new Response(JSON.stringify({ error: 'Verification failed. Please try again.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
