"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { apiGet } from "@/lib/api";
import { imageUrl } from "@/lib/imageUrl";

export default function HomeContent() {
    const t = useTranslations("Home");

    const { locale } = useLanguage();

    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            try {
                setLoading(true);

                const data =
                    await apiGet(
                        `/api/products?locale=${locale}`
                    );

                setProducts(data);
            } catch (error) {
                console.error(
                    "Failed to load products:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadProducts();
    }, [locale]);

    if (loading) {
        return (
            <main>
                {t("loading")}
            </main>
        );
    }

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
                <div style={styles.grid}>
                    {products.map((product) => (
                        <Link
                            key={product.id}
                            href={`/products/${product.slug}`}
                            style={styles.link}
                        >
                            <article style={styles.card}>
                                <div style={styles.imageWrapper}>
                                    {product.images?.[0] ? (
                                        <img
                                            src={imageUrl(
                                                product.images[0].url
                                            )}
                                            alt={
                                                product.images[0].alt ||
                                                product.name
                                            }
                                            style={styles.image}
                                        />
                                    ) : (
                                        <div style={styles.noImage}>
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div style={styles.content}>
                                    <h2 style={styles.name}>
                                        {product.name}
                                    </h2>

                                    <div style={styles.footer}>
                                        <strong style={styles.price}>
                                            €
                                            {Number(
                                                product.basePrice
                                            ).toFixed(2)}
                                        </strong>

                                        <span style={styles.button}>
                                            {t("viewProduct")}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            )}
        </main>
    );
}
const styles = {
    grid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "24px",
        marginTop: "30px",
    },

    link: {
        textDecoration: "none",
        color: "inherit",
    },

    card: {
        background: "#fff",
        border: "1px solid #e8e8e8",
        borderRadius: "18px",
        overflow: "hidden",
        transition:
            "transform 0.2s ease, box-shadow 0.2s ease",
        height: "100%",
    },

    imageWrapper: {
        width: "100%",
        aspectRatio: "1 / 1",
        background: "#f6f6f6",
        overflow: "hidden",
    },

    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
    },

    noImage: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#999",
    },

    content: {
        padding: "18px",
    },

    name: {
        margin: "0 0 18px",
        fontSize: "18px",
        lineHeight: 1.3,
    },

    footer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
    },

    price: {
        fontSize: "20px",
    },

    button: {
        background: "#111",
        color: "#fff",
        padding: "10px 14px",
        borderRadius: "10px",
        fontSize: "14px",
        whiteSpace: "nowrap",
    },
};