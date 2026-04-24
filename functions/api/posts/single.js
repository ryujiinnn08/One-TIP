export async function onRequestGet({ env, request }) {
    try {
        const url = new URL(request.url);
        const postId = url.searchParams.get('id');
        const postType = url.searchParams.get('type') || 'marketplace';

        if (!postId) {
            return new Response(JSON.stringify({ error: 'Post ID is required' }), { status: 400 });
        }

        const db = env.DB;
        let post;
        let images = [];

        if (postType === 'marketplace') {
            post = await db.prepare(`
                SELECT m.*, u.username as seller_username, 
                       d.dept_name as seller_department,
                       u.profile_photo as seller_avatar,
                       (SELECT AVG(r.rating) FROM reviews r WHERE r.target_id = u.user_id) as seller_rating
                FROM marketplace_items m
                LEFT JOIN users u ON m.seller_id = u.user_id
                LEFT JOIN departments d ON u.dept_id = d.dept_id
                WHERE m.item_id = ?
            `).bind(postId).first();

            if (post) {
                const { results } = await db.prepare(
                    "SELECT image_url, is_main FROM post_images WHERE item_type = 'marketplace' AND item_id = ? ORDER BY is_main DESC, id ASC"
                ).bind(postId).all();
                if (results) images = results;

                post = {
                    ...post,
                    id: post.item_id,
                    type: 'marketplace',
                    productName: post.title,
                    user_id: post.seller_id
                };
            }
        } else if (postType === 'service') {
            post = await db.prepare(`
                SELECT s.*, u.username as seller_username,
                       d.dept_name as seller_department,
                       u.profile_photo as seller_avatar,
                       (SELECT AVG(r.rating) FROM reviews r WHERE r.target_id = u.user_id) as seller_rating
                FROM service_offers s
                LEFT JOIN users u ON s.provider_id = u.user_id
                LEFT JOIN departments d ON u.dept_id = d.dept_id
                WHERE s.service_id = ?
            `).bind(postId).first();

            if (post) {
                const { results } = await db.prepare(
                    "SELECT image_url, is_main FROM post_images WHERE item_type = 'service' AND item_id = ? ORDER BY is_main DESC, id ASC"
                ).bind(postId).all();
                if (results) images = results;

                post = {
                    ...post,
                    id: post.service_id,
                    type: 'service',
                    serviceTitle: post.title,
                    startingPrice: post.starting_price,
                    serviceCategory: post.category,
                    serviceDescription: post.description,
                    user_id: post.provider_id
                };
            }
        }

        if (!post) {
            return new Response(JSON.stringify({ error: 'Post not found' }), { status: 404 });
        }

        return new Response(JSON.stringify({
            success: true,
            post: post,
            images: images
        }), {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });
        
    } catch (error) {
        console.error("Get Post Error:", error);
        return new Response(JSON.stringify({ error: 'Database error while fetching post' }), { status: 500 });
    }
}

export async function onRequestDelete({ request, env }) {
    try {
        const url = new URL(request.url);
        const postId = url.searchParams.get('id');
        const postType = url.searchParams.get('type') || 'marketplace';
        
        if (!postId) {
            return new Response(JSON.stringify({ error: 'Post ID is required' }), { status: 400 });
        }
        
        const db = env.DB;
        let success;

        // Delete associated images first
        await db.prepare("DELETE FROM post_images WHERE item_type = ? AND item_id = ?")
            .bind(postType, postId).run();
        
        if (postType === 'marketplace') {
            const result = await db.prepare("DELETE FROM marketplace_items WHERE item_id = ?").bind(postId).run();
            success = result.success;
        } else if (postType === 'service') {
            const result = await db.prepare("DELETE FROM service_offers WHERE service_id = ?").bind(postId).run();
            success = result.success;
        }
        
        if (success) {
            return new Response(JSON.stringify({ 
                success: true, 
                message: 'Post deleted successfully'
            }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        } else {
            throw new Error("Delete operation failed");
        }
        
    } catch (error) {
        console.error("Delete Post Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to delete post' }), { status: 500 });
    }
}
