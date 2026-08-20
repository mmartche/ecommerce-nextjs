"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "../../../../context/AuthContext";
import ProductForm from "../../../../components/admin/ProductForm";

export default function NewProductPage() {
  const router = useRouter();

  const {
    user,
    loading,
  } = useAuth();

  if (loading) {
    return (
      <main style={styles.container}>
        Checking access...
      </main>
    );
  }

  if (!user) {
    router.replace(
      "/login?redirect=/admin/products/new"
    );

    return null;
  }

  if (user.role !== "ADMIN") {
    router.replace("/account");

    return null;
  }

  return (
    <main style={styles.container}>
      <p style={styles.eyebrow}>
        ADMINISTRATION
      </p>

      <h1>New product</h1>

      <ProductForm />
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding: "48px 20px",
  },

  eyebrow: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#777",
  },
};