export async function onRequestGet({ env }) {
    try {
        const db = env.DB;
        
        // Fetch marketplace items with seller info and category
        const { results } = await db.prepare(`
            SELECT 
                m.item_id as id, m.title, m.price, m.condition,
                c.name as category, m.description, m.created_at,
                u.first_name || ' ' || u.last_name as seller_name, 
                d.dept_name as seller_department,
                u.user_id as seller_id,
                (SELECT COUNT(*) FROM vouches WHERE vouchee_id = u.user_id) as seller_vouches,
                (SELECT image_url FROM post_images WHERE item_type = 'marketplace' AND item_id = m.item_id AND is_main = 1 LIMIT 1) as main_image,
                (SELECT image_url FROM post_images WHERE item_type = 'marketplace' AND item_id = m.item_id AND is_main = 0 LIMIT 1) as sub_image
            FROM marketplace_items m
            JOIN users u ON m.seller_id = u.user_id
            LEFT JOIN departments d ON u.dept_id = d.dept_id
            LEFT JOIN categories c ON m.category_id = c.category_id
            WHERE m.status = 'active'
            ORDER BY m.created_at DESC
        `).all();
        
        // Post-process to structure images array
        const processedPosts = results.map(post => {
            const images = [];
            if (post.main_image) images.push(post.main_image);
            if (post.sub_image) images.push(post.sub_image);
            
            // Delete raw auxiliary properties to keep response clean
            delete post.main_image;
            delete post.sub_image;
            
            return {
                ...post,
                images: images,
                type: 'marketplace',
                seller_vouches: post.seller_vouches || 0
            };
        });

        return new Response(JSON.stringify({
            success: true,
            posts: processedPosts
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store'
            }
        });
        
    } catch (error) {
        console.error("Marketplace Fetch Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to load marketplace items' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
