export async function onRequestGet({ request, env }) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('user_id');

        if (!userId) {
            return new Response(JSON.stringify({ error: 'Missing user ID' }), { status: 400 });
        }

        const db = env.DB;

        // Fetch counts for dashboard stats
        const marketplaceCountQuery = db.prepare(`SELECT COUNT(*) as count FROM posts WHERE type = 'marketplace' AND user_id = ?`).bind(userId);
        const serviceCountQuery = db.prepare(`SELECT COUNT(*) as count FROM posts WHERE type = 'service' AND user_id = ?`).bind(userId);
        const likesCountQuery = db.prepare(`SELECT COUNT(*) as count FROM likes WHERE post_user_id = ?`).bind(userId);
        const vouchesCountQuery = db.prepare(`SELECT COUNT(*) as count FROM vouches WHERE receiver_id = ?`).bind(userId);

        const [marketplace, service, likes, vouches] = await db.batch([
            marketplaceCountQuery,
            serviceCountQuery,
            likesCountQuery,
            vouchesCountQuery
        ]);

        return new Response(JSON.stringify({
            marketplace_count: marketplace.results[0].count || 0,
            service_count: service.results[0].count || 0,
            total_likes: likes.results[0].count || 0,
            total_vouches: vouches.results[0].count || 0,
            likes_this_week: 0, // Simplified for now
            vouches_this_month: 0 // Simplified for now
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return new Response(JSON.stringify({ error: 'Failed to load stats' }), { status: 500 });
    }
}
