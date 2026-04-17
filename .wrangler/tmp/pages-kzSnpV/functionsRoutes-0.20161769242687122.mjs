import { onRequestPost as __api_auth_login_js_onRequestPost } from "/Users/aaronruzgal/WEBSYSTEMS/OneTIP-Backup2-main 2/functions/api/auth/login.js"
import { onRequestPost as __api_auth_register_js_onRequestPost } from "/Users/aaronruzgal/WEBSYSTEMS/OneTIP-Backup2-main 2/functions/api/auth/register.js"
import { onRequestGet as __api_dashboard_stats_js_onRequestGet } from "/Users/aaronruzgal/WEBSYSTEMS/OneTIP-Backup2-main 2/functions/api/dashboard/stats.js"
import { onRequestPost as __api_posts_create_js_onRequestPost } from "/Users/aaronruzgal/WEBSYSTEMS/OneTIP-Backup2-main 2/functions/api/posts/create.js"
import { onRequestGet as __api_posts_marketplace_js_onRequestGet } from "/Users/aaronruzgal/WEBSYSTEMS/OneTIP-Backup2-main 2/functions/api/posts/marketplace.js"
import { onRequestGet as __api_posts_services_js_onRequestGet } from "/Users/aaronruzgal/WEBSYSTEMS/OneTIP-Backup2-main 2/functions/api/posts/services.js"
import { onRequestGet as __api_user_listings_js_onRequestGet } from "/Users/aaronruzgal/WEBSYSTEMS/OneTIP-Backup2-main 2/functions/api/user/listings.js"

export const routes = [
    {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/register",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_register_js_onRequestPost],
    },
  {
      routePath: "/api/dashboard/stats",
      mountPath: "/api/dashboard",
      method: "GET",
      middlewares: [],
      modules: [__api_dashboard_stats_js_onRequestGet],
    },
  {
      routePath: "/api/posts/create",
      mountPath: "/api/posts",
      method: "POST",
      middlewares: [],
      modules: [__api_posts_create_js_onRequestPost],
    },
  {
      routePath: "/api/posts/marketplace",
      mountPath: "/api/posts",
      method: "GET",
      middlewares: [],
      modules: [__api_posts_marketplace_js_onRequestGet],
    },
  {
      routePath: "/api/posts/services",
      mountPath: "/api/posts",
      method: "GET",
      middlewares: [],
      modules: [__api_posts_services_js_onRequestGet],
    },
  {
      routePath: "/api/user/listings",
      mountPath: "/api/user",
      method: "GET",
      middlewares: [],
      modules: [__api_user_listings_js_onRequestGet],
    },
  ]