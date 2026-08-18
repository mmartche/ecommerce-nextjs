"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { useAuth } from "../../context/AuthContext";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://192.168.50.159:4000";

export default function OrdersPage() {
    const {
        user,
        loading: authLoading
    } = useAuth();

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    useEffect(() => {
        if (authLoading || !user) {
            return;
        }

        async function loadOrders() {
            try {
                const response = await fetch(
                    `${API_URL}/api/orders`,
                    {
                        credentials: "include"
                    }
                );

                const data =
                    await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Failed to load orders"
                    );
                }

                setOrders(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        loadOrders();
    }, [authLoading, user]);

    if (authLoading) {
        return (
            <main style={styles.container}>
                Checking session...
            </main>
        );
    }

    if (!user) {
        return null;
    }

    if (loading) {
        return (
            <main style={styles.container}>
                Loading orders...
            </main>
        );
    }

    return (
        <main style={styles.container}>
            <div style={styles.header}>
                <div>
                    <p style={styles.eyebrow}>
                        MY ACCOUNT
                    </p>

                    <h1>My Orders</h1>
                </div>

                <Link href="/account">
                    Back to account
                </Link>
            </div>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

            {!error &&
                orders.length === 0 && (
                    <section style={styles.empty}>
                        <h2>No orders yet</h2>

                        <p>
                            Your orders will appear
                            here after checkout.
                        </p>

                        <Link href="/">
                            Continue shopping
                        </Link>
                    </section>
                )}

            <div style={styles.orders}>
                {orders.map((order) => (
                    <article
                        key={order.id}
                        style={styles.order}
                    >
                        <div
                            style={
                                styles.orderHeader
                            }
                        >
                            <div>
                                <Link
                                    href={`/orders/${order.id}`}
                                    style={{
                                        color: "#111",
                                        textDecoration: "none"
                                    }}
                                >
                                    <strong>
                                        Order #{order.id}
                                    </strong>
                                </Link>

                                <p style={styles.date}>
                                    {new Date(
                                        order.createdAt
                                    ).toLocaleDateString()}
                                </p>
                            </div>

                            <span style={styles.status}>
                                {order.status}
                            </span>
                        </div>

                        <div>
                            {order.items.map(
                                (item) => (
                                    <div
                                        key={item.id}
                                        style={
                                            styles.orderItem
                                        }
                                    >
                                        <div>
                                            <strong>
                                                {
                                                    item.product
                                                        ?.name
                                                }
                                            </strong>

                                            <p>
                                                {item.keys} keys
                                            </p>

                                            {item.colorName && (
                                                <p>
                                                    Color:{" "}
                                                    {item.colorName}
                                                </p>
                                            )}

                                            {item.fontName && (
                                                <p>
                                                    Font:{" "}
                                                    {item.fontName}
                                                    {item.bordered
                                                        ? " — With Border"
                                                        : " — Without Border"}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            {item.quantity} × €
                                            {Number(
                                                item.unitPrice
                                            ).toFixed(2)}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div style={styles.total}>
                            <span>Total</span>

                            <strong>
                                €
                                {Number(
                                    order.total
                                ).toFixed(2)}
                            </strong>
                        </div>
                    </article>
                ))}
            </div>
        </main>
    );
}

const styles = {
    container: {
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "50px 20px"
    },

    header: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "center",
        marginBottom: "40px"
    },

    eyebrow: {
        margin: 0,
        fontSize: "12px",
        letterSpacing: "2px",
        color: "#777"
    },

    empty: {
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "30px"
    },

    orders: {
        display: "flex",
        flexDirection: "column",
        gap: "20px"
    },

    order: {
        border: "1px solid #ddd",
        borderRadius: "12px",
        padding: "24px"
    },

    orderHeader: {
        display: "flex",
        justifyContent:
            "space-between",
        alignItems: "flex-start",
        borderBottom:
            "1px solid #eee",
        paddingBottom: "15px",
        marginBottom: "20px"
    },

    date: {
        color: "#777",
        marginBottom: 0
    },

    status: {
        padding: "6px 10px",
        borderRadius: "20px",
        background: "#eee",
        fontSize: "12px",
        fontWeight: "700"
    },

    orderItem: {
        display: "flex",
        justifyContent:
            "space-between",
        gap: "20px",
        padding: "15px 0",
        borderBottom:
            "1px solid #eee"
    },

    total: {
        display: "flex",
        justifyContent:
            "space-between",
        marginTop: "20px",
        fontSize: "20px"
    }
};