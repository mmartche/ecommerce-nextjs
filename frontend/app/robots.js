export default function robots() {
    const siteUrl = process.env.SITE_URL || "http://localhost:3000";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: [
                "/admin/",
                "/account/",
                "/checkout/",
                "/orders/",
                "/login",
                "/register",
                "/api/",
            ],
        },

        sitemap:
            `${siteUrl}/sitemap.xml`,
    };
}