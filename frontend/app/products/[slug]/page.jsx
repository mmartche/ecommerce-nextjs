import ProductPageClient
    from "./ProductPageClient";

const API_URL =
    process.env.API_URL ||
    "http://api:4000";

const SITE_URL =
    process.env.SITE_URL ||
    "http://localhost:3000";

async function getProduct(
    slug
) {
    const response =
        await fetch(
            `${API_URL}/api/products/${slug}`,
            {
                next: {
                    revalidate: 300,
                },
            }
        );

    if (!response.ok) {
        return null;
    }

    return response.json();
}

export async function generateMetadata({
    params,
}) {
    const {
        slug,
    } = await params;

    const product =
        await getProduct(
            slug
        );

    if (!product) {
        return {
            title:
                "Product not found",

            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const description =
        product.description
            ?.replace(
                /\s+/g,
                " "
            )
            .trim()
            .slice(
                0,
                160
            ) ||
        product.name;

    const image =
        product.images?.[0]
            ?.url;

    return {
        title:
            product.name,

        description,

        alternates: {
            canonical:
                `/products/${product.slug}`,
        },

        openGraph: {
            type:
                "website",

            title:
                product.name,

            description,

            url:
                `/products/${product.slug}`,

            images:
                image
                    ? [
                        {
                            url:
                                image,

                            alt:
                                product.name,
                        },
                    ]
                    : [],
        },

        twitter: {
            card:
                "summary_large_image",

            title:
                product.name,

            description,

            images:
                image
                    ? [image]
                    : [],
        },
    };
}

export default async function ProductPage({
    params,
}) {
    const {
        slug,
    } = await params;

    const product =
        await getProduct(
            slug
        );

    if (!product) {
        return (
            <ProductPageClient
                slug={
                    slug
                }
            />
        );
    }

    const jsonLd = {
        "@context":
            "https://schema.org",

        "@type":
            "Product",

        name:
            product.name,

        description:
            product.description,

        image:
            product.images?.map(
                (image) =>
                    image.url
            ),

        sku:
            String(
                product.id
            ),

        offers: {
            "@type":
                "Offer",

            priceCurrency:
                "EUR",

            price:
                Number(
                    product.basePrice
                ),

            availability:
                product.active
                    ? "https://schema.org/InStock"
                    : "https://schema.org/OutOfStock",

            url:
                `${SITE_URL}/products/${product.slug}`,
        },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html:
                        JSON.stringify(
                            jsonLd
                        ).replace(
                            /</g,
                            "\\u003c"
                        ),
                }}
            />

            <ProductPageClient
                slug={
                    slug
                }
            />
        </>
    );
}