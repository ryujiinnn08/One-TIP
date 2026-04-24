export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        const { email, user_id } = body;

        if (!email || !user_id) {
            return new Response(JSON.stringify({ error: 'Email and user ID are required' }), { status: 400 });
        }

        const db = env.DB;

        // Rate limit: max 5 codes per email per hour
        const recentCodes = await db.prepare(
            `SELECT COUNT(*) as count FROM email_verification_codes 
             WHERE email = ? AND created_at > datetime('now', '-1 hour')`
        ).bind(email).first();

        if (recentCodes && recentCodes.count >= 5) {
            return new Response(JSON.stringify({ error: 'Too many verification attempts. Please try again later.' }), { status: 429 });
        }

        // Generate cryptographically secure 6-digit code
        const codeArray = crypto.getRandomValues(new Uint32Array(1));
        const code = String(codeArray[0] % 1000000).padStart(6, '0');

        // Store code with 5-minute expiry
        await db.prepare(
            `INSERT INTO email_verification_codes (user_id, email, code, expires_at)
             VALUES (?, ?, ?, datetime('now', '+5 minutes'))`
        ).bind(user_id, email, code).run();

        // Send email via Resend API
        const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'ONE-TiP <onboarding@resend.dev>',
                to: [email],
                subject: 'Your ONE-TiP Verification Code',
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0a0e27; border-radius: 16px; overflow: hidden; border: 1px solid #1a1f3a;">
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">ONE-TiP</h1>
                            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Email Verification</p>
                        </div>
                        <div style="padding: 32px; text-align: center;">
                            <p style="color: #a0aec0; font-size: 15px; margin: 0 0 24px;">Enter this code to verify your email address:</p>
                            <div style="background: linear-gradient(135deg, #1a1f3a, #252b4a); border-radius: 12px; padding: 24px; margin: 0 0 24px; border: 1px solid #2d3460;">
                                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #667eea; font-family: 'Courier New', monospace;">${code}</span>
                            </div>
                            <p style="color: #718096; font-size: 13px; margin: 0;">This code expires in <strong style="color: #e2e8f0;">5 minutes</strong>.</p>
                            <p style="color: #718096; font-size: 13px; margin: 8px 0 0;">If you didn't request this, you can safely ignore this email.</p>
                        </div>
                        <div style="padding: 16px 32px; background: #060818; text-align: center; border-top: 1px solid #1a1f3a;">
                            <p style="color: #4a5568; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} ONE-TiP — Technological Institute of the Philippines</p>
                        </div>
                    </div>
                `
            })
        });

        if (!emailResponse.ok) {
            const errData = await emailResponse.json();
            console.error('Resend API Error:', errData);
            return new Response(JSON.stringify({ error: 'Failed to send verification email. Please try again.' }), { status: 500 });
        }

        return new Response(JSON.stringify({
            success: true,
            message: 'Verification code sent to your email'
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Send Code Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to send verification code' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
