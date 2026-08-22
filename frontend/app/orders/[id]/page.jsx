"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "../../../context/AuthContext";
import { formatWeight } from "../../../lib/formatWeight";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.50.159:4000";

export default function OrderDetailsPage() {
  const params = useParams();

  const {
    user,
    loading: authLoading
  } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    async function loadOrder() {
      try {
        const response = await fetch(
          `${API_URL}/api/orders/${params.id}`,
          {
            credentials: "include"
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Failed to load order"
          );
        }

        setOrder(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [authLoading, user, params.id]);

  if (authLoading || loading) {
    return (
      <main style={styles.container}>
        Loading order...
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <main style={styles.container}>
        <p style={{ color: "red" }}>
          {error}
        </p>

        <Link href="/orders">
          Back to orders
        </Link>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main style={styles.container}>
      <div style={styles.topBar}>
        <div>
          <p style={styles.eyebrow}>
            MY ACCOUNT
          </p>

          <h1>
            Order #{order.id}
          </h1>

          <p style={styles.date}>
            {new Date(
              order.createdAt
            ).toLocaleString()}
          </p>
        </div>

        <Link href="/orders">
          Back to orders
        </Link>
      </div>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2>Order status</h2>

          <div style={styles.status}>
            {order.status}
          </div>
        </section>

        <section style={styles.card}>
          <h2>Shipping address</h2>

          <p>
            <strong>
              {order.shippingName}
            </strong>
          </p>

          <p>
            {order.shippingAddress}
          </p>

          <p>
            {order.shippingPostalCode}{" "}
            {order.shippingCity}
          </p>

          <p>
            {order.shippingCountry}
          </p>
        </section>
      </div>

      <section style={styles.card}>
        <h2>Items</h2>

        {order.items.map((item) => (
          <div
            key={item.id}
            style={styles.item}
          >
            <div>
              <Link
                href={`/products/${item.product.slug}`}
                style={styles.productLink}
              >
                <strong>
                  {item.product.name}
                </strong>
              </Link>

              {item.characters && (
                <p>
                  <strong>Characters:</strong>{" "}
                  {item.characters}
                </p>
              )}

              <p>
                Keys: {item.keys}
              </p>

              {item.colorName && (
                <p>
                  Color:{" "}
                  <span
                    style={{
                      display: "inline-block",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      background:
                        item.colorHex ||
                        "#ccc",
                      border:
                        "1px solid #aaa",
                      marginRight: "6px"
                    }}
                  />

                  {item.colorName}
                </p>
              )}

              {item.fontName && (
                <p>
                  Font: {item.fontName}
                  {item.bordered
                    ? " — With Border"
                    : " — Without Border"}
                </p>
              )}
            </div>

            <div style={styles.itemPrice}>
              <p>
                {item.quantity} × €
                {Number(
                  item.unitPrice
                ).toFixed(2)}
              </p>

              <strong>
                €
                {Number(
                  item.totalPrice
                ).toFixed(2)}
              </strong>
            </div>
          </div>
        ))}
      </section>
      <section style={styles.card}>
        <div>
          <h2>Payment</h2>
          <div style={styles.item}>
            <p>
              {order.paymentMethod || "—"}
            </p>

            <p>Payment status{" "}
              {order.paymentStatus}
            </p>
          </div>
        </div>
      </section>
      <section style={styles.summary}>
        <div>
          <span>Subtotal</span>

          <span>
            €
            {Number(
              order.subtotal
            ).toFixed(2)}
          </span>
        </div>

        <div>
          <span>
            Weight
          </span>

          <span>
            {formatWeight(
              order.totalWeightGrams
            )}
          </span>
        </div>

        <div>
          <span>Shipping</span>

          <div>
            <span>Shipping service</span>

            <span>
              {order.shippingProvider}{" "}
              {order.shippingService}
            </span>
          </div>

          <span>
            €
            {Number(
              order.shipping
            ).toFixed(2)}
          </span>
        </div>

        <div style={styles.total}>
          <span>Total</span>

          <span>
            €
            {Number(
              order.total
            ).toFixed(2)}
          </span>
        </div>
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "50px 20px"
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px"
  },

  eyebrow: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#777"
  },

  date: {
    color: "#777"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    marginBottom: "20px"
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "20px"
  },

  status: {
    display: "inline-block",
    padding: "8px 12px",
    borderRadius: "20px",
    background: "#eee",
    fontWeight: "700"
  },

  item: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    padding: "20px 0",
    borderBottom: "1px solid #eee"
  },

  itemPrice: {
    textAlign: "right"
  },

  productLink: {
    color: "#111",
    textDecoration: "none"
  },

  summary: {
    marginLeft: "auto",
    maxWidth: "400px",
    borderTop: "1px solid #ddd",
    paddingTop: "20px"
  },

  total: {
    fontSize: "22px",
    fontWeight: "700"
  }
};