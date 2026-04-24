export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        
        const { 
            user_id, 
            type, // 'marketplace' or 'service'
            title, 
            description, 
            price = 0, 
            category,
            condition = null,
            delivery_time = null,
            images = []
        } = body;
        
        // Basic validation
        if (!user_id || !type || !title || !description) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        const db = env.DB;
        
        // Look up category_id if category name provided
        let categoryId = null;
        if (category) {
            const cat = await db.prepare(
                "SELECT category_id FROM categories WHERE name = ? AND type = ? LIMIT 1"
            ).bind(category, type).first();
            if (cat) categoryId = cat.category_id;
        }
        
        let result;
        let itemType;
        
        if (type === 'marketplace') {
            itemType = 'marketplace';
            result = await db.prepare(`
                INSERT INTO marketplace_items (seller_id, title, description, price, condition, category_id, status)
                VALUES (?, ?, ?, ?, ?, ?, 'active')
                RETURNING item_id
            `).bind(
                user_id,
                title,
                description,
                parseFloat(price) || 0.0,
                condition,
                categoryId
            ).first();
        } else if (type === 'service') {
            itemType = 'service';
            result = await db.prepare(`
                INSERT INTO service_offers (provider_id, title, description, starting_price, category_id, delivery_time, status)
                VALUES (?, ?, ?, ?, ?, ?, 'active')
                RETURNING service_id
            `).bind(
                user_id,
                title,
                description,
                parseFloat(price) || 0.0,
                categoryId,
                delivery_time
            ).first();
        } else {
            return new Response(JSON.stringify({ error: 'Invalid post type. Must be "marketplace" or "service".' }), { status: 400 });
        }
        
        const itemId = result ? (result.item_id || result.service_id) : null;
        
        if (itemId) {
            // Insert images if provided
            if (images && images.length > 0) {
                try {
                    const stmts = images.map((img, index) => {
                        return db.prepare(`
                            INSERT INTO post_images (item_type, item_id, image_url, is_main)
                            VALUES (?, ?, ?, ?)
                        `).bind(itemType, itemId, img, index === 0 ? 1 : 0);
                    });
                    await db.batch(stmts);
                } catch (imgError) {
                    console.error("Failed to save images:", imgError);
                }
            }

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Post created successfully',
                post_id: itemId,
                type: itemType
            }), {
                status: 201,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error("Insert operation failed to return an ID");
        }
        
    } catch (error) {
        console.error("Create Post Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to create post. ' + error.message }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
