export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('user_id');

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing user ID' }), { status: 400 });
        }

        const db = env.DB;

        // Fetch counts for dashboard stats from normalized tables
        const marketplaceCountQuery = db.prepare(
            `SELECT COUNT(*) as count FROM marketplace_items WHERE seller_id = ?`
        ).bind(userId);
        
        const serviceCountQuery = db.prepare(
            `SELECT COUNT(*) as count FROM service_offers WHERE provider_id = ?`
        ).bind(userId);
        
        const vouchesCountQuery = db.prepare(
            `SELECT COUNT(*) as count FROM vouches WHERE vouchee_id = ?`
        ).bind(userId);

        const reviewsCountQuery = db.prepare(
            `SELECT COUNT(*) as count FROM reviews WHERE target_id = ?`
        ).bind(userId);

        const [marketplace, service, vouches, reviews] = await db.batch([
            marketplaceCountQuery,
            serviceCountQuery,
            vouchesCountQuery,
            reviewsCountQuery
        ]);

        return new Response(JSON.stringify({
            marketplace_count: marketplace.results[0].count || 0,
            service_count: service.results[0].count || 0,
            total_vouches: vouches.results[0].count || 0,
            total_reviews: reviews.results[0].count || 0
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to load stats' }), { status: 500 });
    }
}
