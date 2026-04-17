export async function onRequestGet({ env }) {
    try {
        const db = env.DB;
        
        // Fetch service posts and join with users to get provider info
        const { results } = await db.prepare(`
            SELECT 
                p.id, p.title, p.price,
                p.category, p.description, p.created_at, p.views_count,
                p.condition_status as delivery_time,
                u.first_name || ' ' || u.last_name as seller_name, 
                u.first_name || ' ' || u.last_name as provider_name,
                u.department as seller_department,
                u.department as provider_department,
                u.id as seller_id,
                u.rating as provider_rating,
                (SELECT COUNT(*) FROM vouches WHERE post_id = p.id) as vouch_count,
                (SELECT COUNT(*) FROM vouches WHERE receiver_id = u.id) as seller_vouches,
                (SELECT COUNT(*) FROM vouches WHERE receiver_id = u.id) as provider_reviews,
                (SELECT image_url FROM post_images WHERE post_id = p.id AND is_main = 1 LIMIT 1) as main_image,
                (SELECT image_url FROM post_images WHERE post_id = p.id AND is_main = 0 LIMIT 1) as sub_image
            FROM posts p
            JOIN users u ON p.user_id = u.id
            WHERE p.type = 'service' AND p.status = 'active'
            ORDER BY p.created_at DESC
        `).all();
        
        // Post-process to structure images array
        const processedPosts = results.map(post => {
            const images = [];
            if (post.main_image) images.push(post.main_image);
            if (post.sub_image) images.push(post.sub_image);
            
            delete post.main_image;
            delete post.sub_image;
            
            return {
                ...post,
                images: images,
                vouch_count: post.vouch_count || 0,
                seller_vouches: post.seller_vouches || 0,
                provider_rating: post.provider_rating || 0,
                provider_reviews: post.provider_reviews || 0
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
        console.error("Services Fetch Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to load services' }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
