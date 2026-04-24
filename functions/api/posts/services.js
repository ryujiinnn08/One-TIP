export async function onRequestGet({ env }) {
    try {
        const db = env.DB;
        
        // Fetch service offers with provider info and category
        const { results } = await db.prepare(`
            SELECT 
                s.service_id as id, s.title, s.starting_price as price,
                c.name as category, s.description, s.created_at,
                s.delivery_time,
                u.first_name || ' ' || u.last_name as seller_name, 
                u.first_name || ' ' || u.last_name as provider_name,
                d.dept_name as seller_department,
                d.dept_name as provider_department,
                u.user_id as seller_id,
                (SELECT COUNT(*) FROM vouches WHERE vouchee_id = u.user_id) as seller_vouches,
                (SELECT COUNT(*) FROM vouches WHERE vouchee_id = u.user_id) as provider_reviews,
                (SELECT AVG(r.rating) FROM reviews r WHERE r.target_id = u.user_id) as provider_rating,
                (SELECT image_url FROM post_images WHERE item_type = 'service' AND item_id = s.service_id AND is_main = 1 LIMIT 1) as main_image,
                (SELECT image_url FROM post_images WHERE item_type = 'service' AND item_id = s.service_id AND is_main = 0 LIMIT 1) as sub_image
            FROM service_offers s
            JOIN users u ON s.provider_id = u.user_id
            LEFT JOIN departments d ON u.dept_id = d.dept_id
            LEFT JOIN categories c ON s.category_id = c.category_id
            WHERE s.status = 'active'
            ORDER BY s.created_at DESC
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
                type: 'service',
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
