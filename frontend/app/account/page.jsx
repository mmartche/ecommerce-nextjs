"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function AccountPage() {
  const router = useRouter();

  const {
    user,
    loading,
    logout
  } = useAuth();

  async function handleLogout() {
    await logout();

    router.push("/");
  }

  if (loading) {
    return (
      <main style={styles.container}>
        <p>Loading account...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            MY ACCOUNT
          </p>

          <h1 style={styles.title}>
            Hello, {user.name}
          </h1>

          <p style={styles.subtitle}>
            Manage your account and orders.
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </button>
      </div>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Account details
          </h2>

          <div style={styles.field}>
            <span style={styles.label}>
              Name
            </span>

            <strong>{user.name}</strong>
          </div>

          <div style={styles.field}>
            <span style={styles.label}>
              Email
            </span>

            <strong>{user.email}</strong>
          </div>

          <div style={styles.field}>
            <span style={styles.label}>
              Role
            </span>

            <strong>{user.role}</strong>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Orders
          </h2>

          <p style={styles.text}>
            View your previous orders and
            their current status.
          </p>

          <button
            onClick={() =>
              router.push("/orders")
            }
            style={styles.primaryButton}
          >
            View orders
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Shopping
          </h2>

          <p style={styles.text}>
            Continue shopping or review
            your cart.
          </p>

          <div style={styles.actions}>
            <button
              onClick={() =>
                router.push("/")
              }
              style={
                styles.secondaryButton
              }
            >
              Continue shopping
            </button>

            <button
              onClick={() =>
                router.push("/cart")
              }
              style={styles.primaryButton}
            >
              View cart
            </button>
          </div>
        </section>

        {user.role === "ADMIN" && (
          <section style={styles.card}>
            <h2 style={styles.cardTitle}>
              Administration
            </h2>

            <p style={styles.text}>
              Manage products, customers
              and orders.
            </p>

            <button
              onClick={() =>
                router.push("/admin")
              }
              style={styles.primaryButton}
            >
              Admin dashboard
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "50px 20px"
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "40px"
  },

  eyebrow: {
    margin: 0,
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#777"
  },

  title: {
    margin: "8px 0"
  },

  subtitle: {
    margin: 0,
    color: "#666"
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px"
  },

  card: {
    border: "1px solid #e2e2e2",
    borderRadius: "12px",
    padding: "24px",
    background: "#fff"
  },

  cardTitle: {
    marginTop: 0
  },

  field: {
    marginBottom: "18px"
  },

  label: {
    display: "block",
    color: "#777",
    fontSize: "13px",
    marginBottom: "5px"
  },

  text: {
    color: "#666"
  },

  actions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  primaryButton: {
    border: "none",
    borderRadius: "8px",
    padding: "12px 18px",
    background: "#111",
    color: "#fff",
    cursor: "pointer"
  },

  secondaryButton: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "12px 18px",
    background: "#fff",
    cursor: "pointer"
  },

  logoutButton: {
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px 16px",
    background: "#fff",
    cursor: "pointer"
  }
};