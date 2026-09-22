export default function robots() {
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
            "https://lojadafumaca.com/sitemap.xml",
    };
}