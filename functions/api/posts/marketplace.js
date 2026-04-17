export async function onRequestGet({ env }) {
    try {
        const db = env.DB;
        
        // Fetch marketplace posts and join with users to get seller info
        const { results } = await db.prepare(`
            SELECT 
                p.id, p.title, p.price, p.condition_status as condition, 
                p.category, p.description, p.created_at, p.views_count,
                u.first_name || ' ' || u.last_name as seller_name, 
                u.department as seller_department,
                u.id as seller_id,
                (SELECT COUNT(*) FROM vouches WHERE post_id = p.id) as vouch_count,
                (SELECT COUNT(*) FROM vouches WHERE receiver_id = u.id) as seller_vouches,
                (SELECT image_url FROM post_images WHERE post_id = p.id AND is_main = 1 LIMIT 1) as main_image,
                (SELECT image_url FROM post_images WHERE post_id = p.id AND is_main = 0 LIMIT 1) as sub_image
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.type = 'marketplace' AND p.status = 'active'
            ORDER BY p.created_at DESC
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
                vouch_count: post.vouch_count || 0,
                seller_vouches: post.seller_vouches || 0
            };
        });

        // D1 returns an array of objects in results
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

