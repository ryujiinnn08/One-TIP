import { onRequestPost as registerHandler } from '../functions/api/auth/register.js';
import { onRequestPost as loginHandler } from '../functions/api/auth/login.js';
import { onRequestPost as sendCodeHandler } from '../functions/api/auth/send-code.js';
import { onRequestPost as verifyCodeHandler } from '../functions/api/auth/verify-code.js';
import { onRequestPost as createPostHandler } from '../functions/api/posts/create.js';
import { onRequestGet as marketplaceHandler } from '../functions/api/posts/marketplace.js';
import { onRequestGet as servicesHandler } from '../functions/api/posts/services.js';
import { onRequestGet as statsHandler } from '../functions/api/dashboard/stats.js';
import { onRequestGet as listingsHandler } from '../functions/api/user/listings.js';
import { onRequestGet as getPostHandler, onRequestDelete as deletePostHandler } from '../functions/api/posts/single.js';
import { onRequestPost as updatePostHandler } from '../functions/api/posts/update.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname;
        const method = request.method;

        // Build context object matching Pages Functions convention
        const context = { request, env, ctx, params: {} };

        try {
            // Auth Routes
            if (path === '/api/auth/register' && method === 'POST') {
                return await registerHandler(context);
            }
            if (path === '/api/auth/login' && method === 'POST') {
                return await loginHandler(context);
            }
            if (path === '/api/auth/send-code' && method === 'POST') {
                return await sendCodeHandler(context);
            }
            if (path === '/api/auth/verify-code' && method === 'POST') {
                return await verifyCodeHandler(context);
            }

            // Post Routes
            if (path === '/api/posts/create' && method === 'POST') {
                return await createPostHandler(context);
            }
            if (path === '/api/posts/update' && method === 'POST') {
                return await updatePostHandler(context);
            }

            // Single post (GET/DELETE) - uses query params ?id=&type=
            if (path === '/api/posts/single' && (method === 'GET' || method === 'DELETE')) {
                if (method === 'GET') {
                    return await getPostHandler(context);
                }
                if (method === 'DELETE') {
                    return await deletePostHandler(context);
                }
            }

            // Legacy dynamic route for single post (backwards compatibility)
            const postMatch = path.match(/^\/api\/posts\/(\d+)$/);
            if (postMatch) {
                context.params.id = postMatch[1];
                if (method === 'GET') {
                    return await getPostHandler(context);
                }
                if (method === 'DELETE') {
                    return await deletePostHandler(context);
                }
            }

            if (path === '/api/posts/marketplace' && method === 'GET') {
                return await marketplaceHandler(context);
            }
            if (path === '/api/posts/services' && method === 'GET') {
                return await servicesHandler(context);
            }
            if (path === '/api/dashboard/stats' && method === 'GET') {
                return await statsHandler(context);
            }
            if (path === '/api/user/listings' && method === 'GET') {
                return await listingsHandler(context);
            }

            // Unknown API path
            if (path.startsWith('/api/')) {
                return new Response(JSON.stringify({ error: 'Not Found' }), {
                    status: 404,
                    headers: { 'Content-Type': 'application/json' }
                });
            }
        } catch (error) {
            console.error('API Error:', error);
            return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // For non-API requests, serve static assets
        return env.ASSETS.fetch(request);
    }
};
