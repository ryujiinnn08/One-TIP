export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('user_id');

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing user ID' }), { status: 400 });
        }

        const db = env.DB;

        // Fetch user's marketplace items
        const marketplaceQuery = db.prepare(`
            SELECT m.item_id as id, m.title, m.description, m.price,
                   (SELECT image_url FROM post_images WHERE item_type = 'marketplace' AND item_id = m.item_id AND is_main = 1 LIMIT 1) as image_url
            FROM marketplace_items m WHERE m.seller_id = ? ORDER BY m.created_at DESC
        `).bind(userId);

        // Fetch user's service offers
        const serviceQuery = db.prepare(`
            SELECT s.service_id as id, s.title, s.description, s.starting_price as price,
                   (SELECT image_url FROM post_images WHERE item_type = 'service' AND item_id = s.service_id AND is_main = 1 LIMIT 1) as image_url
            FROM service_offers s WHERE s.provider_id = ? ORDER BY s.created_at DESC
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
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
            }
        });

    } catch (error) {
        console.error("User Listings Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to load listings' }), { status: 500 });
    }
}
