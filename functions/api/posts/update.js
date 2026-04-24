export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        
        const {
            post_id,
            user_id, 
            type, // 'marketplace' or 'service'
            title, 
            description, 
            price = 0, 
            category,
            condition = null,
            delivery_time = null
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

        // Look up category_id
        let categoryId = null;
        if (category) {
            const cat = await db.prepare(
                "SELECT category_id FROM categories WHERE name = ? AND type = ? LIMIT 1"
            ).bind(category, type).first();
            if (cat) categoryId = cat.category_id;
        }
        
        let success;
        
        if (type === 'marketplace') {
            // Ensure user owns the item
            const item = await db.prepare("SELECT item_id FROM marketplace_items WHERE item_id = ? AND seller_id = ?")
                .bind(numPostId, numUserId).first();
            if (!item) {
                return new Response(JSON.stringify({ error: 'Unauthorized or item does not exist' }), { status: 403 });
            }

            const result = await db.prepare(`
                UPDATE marketplace_items 
                SET title = ?, description = ?, price = ?, condition = ?, category_id = ?
                WHERE item_id = ? AND seller_id = ?
            `).bind(title, description, numPrice, condition, categoryId, numPostId, numUserId).run();
            success = result.success;
        } else if (type === 'service') {
            // Ensure user owns the service
            const service = await db.prepare("SELECT service_id FROM service_offers WHERE service_id = ? AND provider_id = ?")
                .bind(numPostId, numUserId).first();
            if (!service) {
                return new Response(JSON.stringify({ error: 'Unauthorized or service does not exist' }), { status: 403 });
            }

            const result = await db.prepare(`
                UPDATE service_offers 
                SET title = ?, description = ?, starting_price = ?, category_id = ?, delivery_time = ?
                WHERE service_id = ? AND provider_id = ?
            `).bind(title, description, numPrice, categoryId, delivery_time, numPostId, numUserId).run();
            success = result.success;
        } else {
            return new Response(JSON.stringify({ error: 'Invalid post type' }), { status: 400 });
        }
        
        if (success) {
            // Update images if provided
            if (body.images && body.images.length > 0) {
                try {
                    // Delete existing images
                    await db.prepare("DELETE FROM post_images WHERE item_type = ? AND item_id = ?")
                        .bind(type, numPostId).run();
                    
                    // Insert new images
                    const stmts = body.images.map((img, index) => {
                        return db.prepare(`
                            INSERT INTO post_images (item_type, item_id, image_url, is_main)
                            VALUES (?, ?, ?, ?)
                        `).bind(type, numPostId, img, index === 0 ? 1 : 0);
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
