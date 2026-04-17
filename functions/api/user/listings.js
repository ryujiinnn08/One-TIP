export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('user_id');

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing user ID' }), { status: 400 });
        }

        const db = env.DB;

        // Fetch user's marketplace and service listings
        const marketplaceQuery = db.prepare(`
            SELECT p.id, p.title, p.description, p.price, p.views_count as view_count,
                   (SELECT image_url FROM post_images WHERE post_id = p.id AND is_main = 1 LIMIT 1) as image_url
            FROM posts p WHERE p.type = 'marketplace' AND p.user_id = ? ORDER BY p.created_at DESC
        `).bind(userId);

        const serviceQuery = db.prepare(`
            SELECT p.id, p.title, p.description, p.price, p.views_count as order_count,
                   (SELECT image_url FROM post_images WHERE post_id = p.id AND is_main = 1 LIMIT 1) as image_url
            FROM posts p WHERE p.type = 'service' AND p.user_id = ? ORDER BY p.created_at DESC
        `).bind(userId);

        const [marketplace, services] = await db.batch([
            marketplaceQuery,
            serviceQuery
        ]);

        return new Response(JSON.stringify({
            success: true,
            marketplace: marketplace.results,
            services: services.results
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("User Listings Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to load listings' }), { status: 500 });
    }
}
