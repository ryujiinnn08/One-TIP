export async function onRequestPost({ request, env }) {
    try {
        const body = await request.json();
        
        const { 
            user_id, 
            type, // 'marketplace', 'service', 'announcement'
            title, 
            description, 
            price = 0, 
            category, 
            condition_status = null,
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
        
        // Insert into D1 posts table
        // We use returning so we can send the response back ID
        const result = await db.prepare(`
            INSERT INTO posts (user_id, type, title, description, price, category, condition_status, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'active') 
            RETURNING id
        `).bind(
            user_id,
            type,
            title,
            description,
            parseFloat(price) || 0.0,
            category || '',
            condition_status
        ).first();
        
        if (result && result.id) {
            
            // Insert images if provided
            if (images && images.length > 0) {
                try {
                    const stmts = images.map((img, index) => {
                        return db.prepare(`
                            INSERT INTO post_images (post_id, image_url, is_main)
                            VALUES (?, ?, ?)
                        `).bind(result.id, img, index === 0 ? 1 : 0);
                    });
                    await db.batch(stmts);
                } catch (imgError) {
                    console.error("Failed to save images:", imgError);
                    // Decide if you want to fail the whole post or just ignore images
                }
            }

            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Post created successfully',
                post_id: result.id
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
