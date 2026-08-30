"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function OrdersPage() {
  const { token, user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(
            "Could not load orders"
          );
        }

        const data = await response.json();

        setOrders(
          Array.isArray(data)
            ? data
            : data.orders || []
        );
      } catch (err) {
        console.error(err);
        setError(
          "Unable to load your orders."
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [token]);

  if (loading) {
    return (
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <p>Loading orders...</p>
      </main>
    );
  }

  if (!token || !user) {
    return (
      <main
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        <h1>My orders</h1>

        <p>
          Please log in to view your orders.
        </p>

        <Link href="/login">
          Login
        </Link>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 20px",
      }}
    >
      <h1>My orders</h1>

      {error && (
        <p>{error}</p>
      )}

      {!error &&
        orders.length === 0 && (
          <p>
            You do not have any orders yet.
          </p>
        )}

      <div
        style={{
          display: "grid",
          gap: "16px",
          marginTop: "30px",
        }}
      >
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            style={{
              display: "block",
              border: "1px solid #ddd",
              borderRadius: "8px",
              padding: "20px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                gap: "20px",
              }}
            >
              <div>
                <strong>
                  Order #{order.id}
                </strong>

                {order.createdAt && (
                  <p>
                    {new Date(
                      order.createdAt
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                {order.status && (
                  <p>
                    {order.status}
                  </p>
                )}

                {order.total != null && (
                  <strong>
                    €
                    {Number(
                      order.total
                    ).toFixed(2)}
                  </strong>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}