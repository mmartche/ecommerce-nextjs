"use client";

import Link from "next/link";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useAuth,
} from "../../../context/AuthContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.50.159:4000";

export default function AdminProductsPage() {
  const router = useRouter();

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    products,
    setProducts,
  ] = useState([]);

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
        "/login?redirect=/admin/products",
      );

      return;
    }

    if (
      user.role !== "ADMIN"
    ) {
      router.replace(
        "/account",
      );

      return;
    }

    loadProducts();
  }, [
    authLoading,
    user,
    router,
  ]);

  async function loadProducts() {
    try {
      setError("");

      const response =
        await fetch(
          `${API_URL}/api/admin/products`,
          {
            credentials:
              "include",
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to load products",
        );
      }

      setProducts(data);
    } catch (error) {
      setError(
        error.message,
      );
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(
    product,
  ) {
    try {
      const response =
        await fetch(
          `${API_URL}/api/admin/products/${product.id}/active`,
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
                active:
                  !product.active,
              }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
          "Failed to update product",
        );
      }

      setProducts(
        (current) =>
          current.map(
            (item) =>
              item.id ===
                product.id
                ? {
                  ...item,
                  active:
                    data.active,
                }
                : item,
          ),
      );
    } catch (error) {
      setError(
        error.message,
      );
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

  return (
    <main style={styles.container}>
      <div style={styles.header}>
        <div>
          <p style={styles.eyebrow}>
            ADMINISTRATION
          </p>

          <h1>
            Products
          </h1>
        </div>

        <Link
          href="/admin/products/new"
          style={styles.button}
        >
          + New Product
        </Link>
      </div>

      {error && (
        <p style={styles.error}>
          {error}
        </p>
      )}

      <div style={styles.grid}>
        {products.map(
          (product) => (
            <article
              key={product.id}
              style={styles.card}
            >
              {product.images?.[0] && (
                <img
                  src={
                    product.images[0].url.startsWith(
                      "http"
                    )
                      ? product.images[0].url
                      : `${API_URL}${product.images[0].url}`
                  }
                  alt={product.name}
                  style={styles.image}
                />
              )}

              <h2>
                {product.name}
              </h2>

              <p>
                €
                {Number(
                  product.basePrice,
                ).toFixed(2)}
              </p>

              <p>
                Colors:{" "}
                {
                  product.colors
                    .length
                }
              </p>

              <p>
                Fonts:{" "}
                {
                  product.fonts
                    .length
                }
              </p>

              <p>
                Status:{" "}
                <strong>
                  {product.active
                    ? "ACTIVE"
                    : "INACTIVE"}
                </strong>
              </p>

              <div
                style={
                  styles.actions
                }
              >
                <Link
                  href={`/admin/products/${product.id}`}
                >
                  Edit
                </Link>

                <button
                  onClick={() =>
                    toggleActive(
                      product,
                    )
                  }
                >
                  {product.active
                    ? "Disable"
                    : "Enable"}
                </button>
              </div>
            </article>
          ),
        )}
      </div>
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
    alignItems: "center",
    marginBottom: "30px",
  },

  eyebrow: {
    fontSize: "12px",
    letterSpacing: "2px",
    color: "#777",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "20px",
  },

  card: {
    border: "1px solid #ddd",
    borderRadius: "12px",
    padding: "18px",
  },

  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px",
  },

  actions: {
    display: "flex",
    gap: "15px",
    alignItems: "center",
  },

  button: {
    background: "#111",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "8px",
    textDecoration: "none",
  },

  error: {
    color: "#b00020",
  },
};