"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import { useAuth } from "../../../../context/AuthContext";
import ProductForm from "../../../../components/admin/ProductForm";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.50.159:4000";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.replace(
        `/login?redirect=/admin/products/${params.id}`
      );

      return;
    }

    if (
      user.role !== "ADMIN"
    ) {
      router.replace(
        "/account"
      );

      return;
    }

    loadProduct();
  }, [
    authLoading,
    user,
    params.id,
    router,
  ]);

  async function loadProduct() {
    try {
      const response =
        await fetch(
          `${API_URL}/api/admin/products/${params.id}`,
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
            "Failed to load product"
        );
      }

      setProduct(data);
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  if (
    authLoading ||
    loading
  ) {
    return (
      <main style={styles.container}>
        Loading product...
      </main>
    );
  }

  if (
    !user ||
    user.role !== "ADMIN"
  ) {
    return null;
  }

  if (error) {
    return (
      <main style={styles.container}>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <p style={styles.eyebrow}>
        ADMINISTRATION
      </p>

      <h1>Edit product</h1>

      <ProductForm
        product={product}
      />
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