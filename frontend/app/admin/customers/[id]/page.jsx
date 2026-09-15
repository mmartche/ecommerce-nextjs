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

import {
  useAuth,
} from "../../../../context/AuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [customer, setCustomer] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [updatingRole, setUpdatingRole] =
    useState(false);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        `/login?redirect=/admin/customers/${params.id}`
      );

      return;
    }

    if (user.role !== "ADMIN") {
      router.replace("/account");

      return;
    }

    loadCustomer();
  }, [
    authLoading,
    user,
    params.id,
    router,
  ]);

  async function loadCustomer() {
    try {
      setLoading(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/admin/users/${params.id}`,
          {
            credentials:
              "include",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to load customer"
        );
      }

      setCustomer(data);
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateRole(
    role
  ) {
    if (!customer) {
      return;
    }

    try {
      setUpdatingRole(true);
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/admin/users/${customer.id}/role`,
          {
            method: "PATCH",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                role,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          data.error ||
          "Failed to update role"
        );
      }

      setCustomer(
        (current) => ({
          ...current,
          role:
            data.role,
        })
      );
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setUpdatingRole(false);
    }
  }

  if (authLoading) {
    return (
      <main style={styles.container}>
        Checking access...
      </main>
    );
  }

  if (
    !user ||
    user.role !== "ADMIN"
  ) {
    return null;
  }

  if (loading) {
    return (
      <main style={styles.container}>
        Loading customer...
      </main>
    );
  }

  if (!customer) {
    return (
      <main style={styles.container}>
        {error || "Customer not found"}
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.topBar}>
        <Link
          href="/admin/customers"
          style={styles.backLink}
        >
          ← Customers
        </Link>
      </div>

      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            CUSTOMER
          </p>

          <h1 style={styles.title}>
            {customer.name}
          </h1>

          <p style={styles.subtitle}>
            Customer information and
            order history.
          </p>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          {error}
        </div>
      )}

      <section style={styles.card}>
        <h2 style={styles.cardTitle}>
          Customer information
        </h2>

        <div style={styles.detailsGrid}>
          <div>
            <span style={styles.label}>
              ID
            </span>

            <strong>
              #{customer.id}
            </strong>
          </div>

          <div>
            <span style={styles.label}>
              Name
            </span>

            <strong>
              {customer.name}
            </strong>
          </div>

          <div>
            <span style={styles.label}>
              Email
            </span>

            <strong>
              {customer.email}
            </strong>
          </div>

          <div>
            <span style={styles.label}>
              Registered
            </span>

            <strong>
              {new Date(
                customer.createdAt
              ).toLocaleString()}
            </strong>
          </div>

          <div>
            <span style={styles.label}>
              Role
            </span>

            <select
              value={customer.role}
              disabled={updatingRole}
              onChange={(event) =>
                updateRole(
                  event.target.value
                )
              }
              style={styles.select}
            >
              <option value="CUSTOMER">
                Customer
              </option>

              <option value="ADMIN">
                Admin
              </option>
            </select>

            {updatingRole && (
              <div style={styles.saving}>
                Saving...
              </div>
            )}
          </div>
        </div>
      </section>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              Orders
            </h2>

            <p style={styles.subtitle}>
              {customer.orders?.length || 0}
              {" "}
              order(s)
            </p>
          </div>
        </div>

        {!customer.orders ||
        customer.orders.length === 0 ? (
          <div style={styles.empty}>
            This customer has no orders yet.
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
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {customer.orders.map(
                  (order) => (
                    <tr key={order.id}>
                      <td style={styles.td}>
                        <strong>
                          #{order.id}
                        </strong>
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
                        {order.status}
                      </td>

                      <td style={styles.td}>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          style={styles.orderLink}
                        >
                          View order
                        </Link>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "48px 20px",
  },

  topBar: {
    marginBottom: "24px",
  },

  backLink: {
    color: "#111",
    fontWeight: "600",
    textDecoration: "none",
  },

  header: {
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

  error: {
    padding: "14px",
    border:
      "1px solid #f3b3b3",
    background: "#fff4f4",
    borderRadius: "8px",
    marginBottom: "20px",
  },

  card: {
    border:
      "1px solid #ddd",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
  },

  cardTitle: {
    marginTop: 0,
    marginBottom: "20px",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "24px",
  },

  label: {
    display: "block",
    color: "#777",
    fontSize: "12px",
    marginBottom: "6px",
  },

  select: {
    padding: "8px 10px",
    borderRadius: "8px",
    border:
      "1px solid #ccc",
    background: "#fff",
  },

  saving: {
    marginTop: "5px",
    fontSize: "11px",
    color: "#777",
  },

  sectionHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "20px",
  },

  empty: {
    padding: "24px",
    background: "#fafafa",
    borderRadius: "8px",
    color: "#666",
  },

  tableWrapper: {
    overflowX: "auto",
    border:
      "1px solid #ddd",
    borderRadius: "10px",
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
    minWidth: "750px",
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
    verticalAlign:
      "middle",
  },

  orderLink: {
    color: "#111",
    fontWeight: "600",
    textDecoration: "none",
  },
};