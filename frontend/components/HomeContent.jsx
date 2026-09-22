"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { imageUrl } from "../lib/imageUrl";

export default function HomeContent({
    products,
}) {
    const t =
        useTranslations("Home");

    return (
        <main
            style={{
                maxWidth: "1200px",
                margin: "0 auto",
                padding: "40px 20px",
                fontFamily:
                    "Arial, sans-serif",
            }}
        >
            <h1>
                {t("title")}
            </h1>

            <p>
                {t("subtitle")}
            </p>

            {products.length === 0 ? (
                <p>
                    {t("noProducts")}
                </p>
            ) : (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns:
                            "repeat(auto-fill, minmax(250px, 1fr))",
                        gap: "20px",
                        marginTop: "30px",
                    }}
                >
                    {products.map(
                        (product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.slug}`}
                                style={{
                                    textDecoration:
                                        "none",
                                    color:
                                        "inherit",
                                }}
                            >
                                <article
                                    style={{
                                        border:
                                            "1px solid #ddd",
                                        borderRadius:
                                            "10px",
                                        padding:
                                            "20px",
                                    }}
                                >
                                    <div
                                        style={{
                                            height:
                                                "200px",
                                            background:
                                                "#f5f5f5",
                                            borderRadius:
                                                "8px",
                                            display:
                                                "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "center",
                                        }}
                                    >
                                        {product.images?.[0] && (
                                            <img
                                                src={imageUrl(
                                                    product.images[0]
                                                        .url
                                                )}
                                                alt={
                                                    product.images[0]
                                                        .alt ||
                                                    product.name
                                                }
                                                style={{
                                                    width:
                                                        "100%",
                                                    height:
                                                        "250px",
                                                    objectFit:
                                                        "cover",
                                                    borderRadius:
                                                        "12px",
                                                }}
                                            />
                                        )}
                                    </div>

                                    <h2>
                                        {product.name}
                                    </h2>

                                    <p>
                                        {
                                            product.description
                                        }
                                    </p>

                                    <strong>
                                        €
                                        {Number(
                                            product.basePrice
                                        ).toFixed(2)}
                                    </strong>

                                    <div
                                        style={{
                                            marginTop:
                                                "12px",
                                        }}
                                    >
                                        {t(
                                            "viewProduct"
                                        )}
                                    </div>
                                </article>
                            </Link>
                        )
                    )}
                </div>
            )}
        </main>
    );
}