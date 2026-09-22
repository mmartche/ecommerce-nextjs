"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { useTranslations } from "next-intl";

export default function AccountPage() {
  const router = useRouter();

  const {
    user,
    loading,
    logout
  } = useAuth();
  const t = useTranslations("Account");

  async function handleLogout() {
    await logout();

    router.push("/");
  }

  if (loading) {
    return (
      <main style={styles.container}>
        <p>{t("loadingAccount")}</p>
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
            {t("title")}
          </p>

          <h1 style={styles.title}>
            {t("hello", { name: user.name })}
          </h1>

          <p style={styles.subtitle}>
            {t("manageAccountAndOrders")}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={styles.logoutButton}
        >
          {t("logout")}
        </button>
      </div>

      <div style={styles.grid}>
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            {t("accountDetails")}
          </h2>

          <div style={styles.field}>
            <span style={styles.label}>
              {t("name")}
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
              {t("role")}
            </span>

            <strong>{user.role}</strong>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            {t("orders")}
          </h2>

          <p style={styles.text}>
            {t("subtitle")}
          </p>

          <button
            onClick={() =>
              router.push("/orders")
            }
            style={styles.primaryButton}
          >
            {t("orders")}
          </button>
        </section>

        <section style={styles.card}>
          <h2 style={styles.cardTitle}>
            Shopping
          </h2>

          <p style={styles.text}>
            {t("continueShoppingOrReview")}
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
              {t("continueShopping")}
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
              {t("manageProducts")}
            </p>

            <button
              onClick={() =>
                router.push("/admin")
              }
              style={styles.primaryButton}
            >
              {t("adminDashboard")}
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