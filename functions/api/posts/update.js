export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        
        const {
            post_id,
            user_id, 
            type, // 'marketplace', 'service', 'announcement'
            title, 
            description, 
            price = 0, 
            category, 
            condition_status = null
        } = body;
        
        if (!post_id || !user_id || !type || !title || !description) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const db = env.DB;
        
        // Ensure user owns post
        const post = await db.prepare("SELECT id FROM posts WHERE id = ? AND user_id = ?")
            .bind(post_id, user_id).first();
            
        if (!post) {
            return new Response(JSON.stringify({ error: 'Unauthorized or post does not exist' }), { status: 403 });
        }

        const { success } = await db.prepare(`
            UPDATE posts 
            SET title = ?, description = ?, price = ?, category = ?, condition_status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `).bind(
            title,
            description,
            parseFloat(price) || 0.0,
            category || '',
            condition_status,
            post_id,
            user_id
        ).run();
        
        if (success) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Post updated successfully'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error("Update operation failed");
        }
        
    } catch (error) {
        console.error("Update Post Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to update post. ' + error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
