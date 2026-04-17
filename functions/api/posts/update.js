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
        const numPostId = parseInt(post_id, 10);
        const numUserId = parseInt(user_id, 10);
        const numPrice = parseFloat(price) || 0.0;
        
        // Ensure user owns post
        const post = await db.prepare("SELECT id FROM posts WHERE id = ? AND user_id = ?")
            .bind(numPostId, numUserId).first();
            
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
            numPrice,
            category || '',
            condition_status,
            numPostId,
            numUserId
        ).run();
        
        if (success) {
            // Update images if provided
            if (body.images && body.images.length > 0) {
                try {
                    // First, delete existing images
                    await db.prepare("DELETE FROM post_images WHERE post_id = ?").bind(numPostId).run();
                    
                    // Insert new images
                    const stmts = body.images.map((img, index) => {
                        return db.prepare(`
                            INSERT INTO post_images (post_id, image_url, is_main)
                            VALUES (?, ?, ?)
                        `).bind(numPostId, img, index === 0 ? 1 : 0);
                    });
                    await db.batch(stmts);
                } catch (imgError) {
                    console.error("Failed to update images:", imgError);
                }
            }

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Post updated successfully'
            }), {
                status: 200,
                headers: { 
                    'Content-Type': 'application/json',
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
                }
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
