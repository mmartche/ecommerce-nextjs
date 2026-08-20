"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../context/AuthContext";

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

export default function AdminPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] =
    useState(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        "/login?redirect=/admin"
      );

      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/account");

      return;
    }

    loadOrders();
  }, [authLoading, user, router]);

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/orders`,
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

  async function updateStatus(
    orderId,
    status
  ) {
    try {
      setUpdatingId(orderId);
      setError("");

      const response = await fetch(
        `${API_URL}/api/admin/orders/${orderId}/status`,
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
          "Failed to update order"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
              ...order,
              status:
                data.status,
            }
            : order
        )
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (authLoading) {
    return (
      <main style={styles.container}>
        Checking access...
      </main>
    );
  }

  if (!user) {
    return null;
  }

  if (user.role !== "ADMIN") {
    return null;
  }

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            ADMINISTRATION
          </p>

          <h1 style={styles.title}>
            Orders
          </h1>

          <p style={styles.subtitle}>
            Manage customer orders and
            update their status.
          </p>
        </div>

        <button
          onClick={loadOrders}
          style={styles.refreshButton}
        >
          Refresh
        </button>
        <Link href="/admin/products">
          Products
        </Link>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <div style={styles.empty}>
          No orders yet.
        </div>
      ) : (
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Order
                </th>

                <th style={styles.th}>
                  Customer
                </th>

                <th style={styles.th}>
                  Date
                </th>

                <th style={styles.th}>
                  Items
                </th>

                <th style={styles.th}>
                  Total
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {orders.map(
                (order) => (
                  <tr key={order.id}>
                    <td style={styles.td}>
                      <strong>
                        #{order.id}
                      </strong>
                    </td>

                    <td style={styles.td}>
                      <div>
                        <strong>
                          {order.user?.name}
                        </strong>
                      </div>

                      <div
                        style={
                          styles.smallText
                        }
                      >
                        {order.user?.email}
                      </div>
                    </td>

                    <td style={styles.td}>
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </td>

                    <td style={styles.td}>
                      {order.items?.reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          item.quantity,
                        0
                      )}
                    </td>

                    <td style={styles.td}>
                      <strong>
                        €
                        {Number(
                          order.total
                        ).toFixed(2)}
                      </strong>
                    </td>

                    <td style={styles.td}>
                      <select
                        value={
                          order.status
                        }
                        disabled={
                          updatingId ===
                          order.id
                        }
                        onChange={(event) =>
                          updateStatus(
                            order.id,
                            event.target
                              .value
                          )
                        }
                        style={
                          styles.select
                        }
                      >
                        {ORDER_STATUSES.map(
                          (status) => (
                            <option
                              key={
                                status
                              }
                              value={
                                status
                              }
                            >
                              {status}
                            </option>
                          )
                        )}
                      </select>

                      {updatingId ===
                        order.id && (
                          <div
                            style={
                              styles.saving
                            }
                          >
                            Saving...
                          </div>
                        )}
                    </td>

                    <td style={styles.td}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={
                          styles.link
                        }
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 20px",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "30px",
  },

  eyebrow: {
    margin: 0,
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#777",
  },

  title: {
    marginBottom: "8px",
  },

  subtitle: {
    margin: 0,
    color: "#666",
  },

  refreshButton: {
    border: "1px solid #ccc",
    background: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  error: {
    padding: "14px",
    border: "1px solid #f3b3b3",
    background: "#fff4f4",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  empty: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "30px",
  },

  tableWrapper: {
    overflowX: "auto",
    border: "1px solid #ddd",
    borderRadius: "12px",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    textAlign: "left",
    padding: "14px",
    borderBottom:
      "1px solid #ddd",
    background: "#f7f7f7",
    fontSize: "13px",
  },

  td: {
    padding: "14px",
    borderBottom:
      "1px solid #eee",
    verticalAlign: "middle",
  },

  smallText: {
    fontSize: "12px",
    color: "#777",
    marginTop: "3px",
  },

  select: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    background: "#fff",
  },

  saving: {
    marginTop: "5px",
    fontSize: "11px",
    color: "#777",
  },

  link: {
    textDecoration: "none",
    fontWeight: "600",
    color: "#111",
  },
};