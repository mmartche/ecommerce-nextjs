"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useAuth } from "../../../../context/AuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.50.159:4000";

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function AdminOrderPage() {
  const params = useParams();
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        `/login?redirect=/admin/orders/${params.id}`
      );

      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/account");
      return;
    }

    loadOrder();
  }, [
    authLoading,
    user,
    params.id,
    router,
  ]);

  async function loadOrder() {
    try {
      const response = await fetch(
        `${API_URL}/api/admin/orders/${params.id}`,
        {
          credentials: "include",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to load order"
        );
      }

      setOrder(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    status
  ) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${params.id}/status`,
        {
          method: "PATCH",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            status,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Failed to update status"
        );
      }

      setOrder((current) => ({
        ...current,
        status: data.status,
      }));
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <main style={styles.container}>
        Loading...
      </main>
    );
  }

  if (
    !user ||
    user.role !== "ADMIN"
  ) {
    return null;
  }

  if (error && !order) {
    return (
      <main style={styles.container}>
        <p>{error}</p>

        <Link href="/admin">
          Back to admin
        </Link>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <Link href="/admin">
        ← Back to orders
      </Link>

      <div style={styles.header}>
        <div>
          <h1>
            Order #{order.id}
          </h1>

          <p>
            {new Date(
              order.createdAt
            ).toLocaleString()}
          </p>
        </div>

        <div>
          <label>
            <strong>Status</strong>
          </label>

          <br />

          <select
            value={order.status}
            disabled={saving}
            onChange={(event) =>
              updateStatus(
                event.target.value
              )
            }
            style={styles.select}
          >
            {ORDER_STATUSES.map(
              (status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status}
                </option>
              )
            )}
          </select>
        </div>
      </div>

      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2>Customer</h2>

          <p>
            <strong>
              {order.user.name}
            </strong>
          </p>

          <p>
            {order.user.email}
          </p>
        </section>

        <section style={styles.card}>
          <h2>
            Shipping address
          </h2>

          <p>
            {order.shippingName}
          </p>

          <p>
            {order.shippingAddress}
          </p>

          <p>
            {
              order.shippingPostalCode
            }{" "}
            {order.shippingCity}
          </p>

          <p>
            {order.shippingCountry}
          </p>
        </section>
      </div>

      <section style={styles.card}>
        <h2>Items</h2>

        {order.items.map(
          (item) => (
            <div
              key={item.id}
              style={styles.item}
            >
              <div>
                <strong>
                  {
                    item.product
                      .name
                  }
                </strong>

                <p>
                  Quantity:{" "}
                  {item.quantity}
                </p>

                <p>
                  Keys: {item.keys}
                </p>

                <p>
                  Color:{" "}
                  {item.colorName ||
                    "-"}
                </p>

                <p>
                  Font:{" "}
                  {item.fontName ||
                    "-"}
                </p>
              </div>

              <strong>
                €
                {Number(
                  item.totalPrice
                ).toFixed(2)}
              </strong>
            </div>
          )
        )}
      </section>

      <section style={styles.summary}>
        <p>
          Subtotal: €
          {Number(
            order.subtotal
          ).toFixed(2)}
        </p>

        <p>
          Shipping: €
          {Number(
            order.shipping
          ).toFixed(2)}
        </p>

        <h2>
          Total: €
          {Number(
            order.total
          ).toFixed(2)}
        </h2>
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "0 auto",
    padding: "48px 20px",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "20px",
    marginTop: "25px",
    marginBottom: "30px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "22px",
    marginBottom: "20px",
  },

  item: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "20px",
    padding: "16px 0",
    borderBottom:
      "1px solid #eee",
  },

  select: {
    marginTop: "8px",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },

  summary: {
    maxWidth: "350px",
    marginLeft: "auto",
    textAlign: "right",
  },

  error: {
    color: "#b00020",
  },
};