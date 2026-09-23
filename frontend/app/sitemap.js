const SITE_URL = process.env.SITE_URL || "http://localhost:3000";

const API_URL =
    process.env.API_URL ||
    "http://api:4000";

export default async function sitemap() {
    let products = [];

    try {
        const response = await fetch(
            `${API_URL}/api/products`,
            {
                next: {
                    revalidate: 3600,
                },
            }
        );

        if (response.ok) {
            products =
                await response.json();
        }
    } catch (error) {
        console.error(
            "Failed to generate sitemap:",
            error
        );
    }

    const productUrls =
        products.map((product) => ({
            url:
                `${SITE_URL}/products/${product.slug}`,

            lastModified:
                product.updatedAt
                    ? new Date(
                        product.updatedAt
                    )
                    : new Date(),

            changeFrequency:
                "weekly",

            priority: 0.8,
        }));

    return [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 1,
        },

        ...productUrls,
    ];
}