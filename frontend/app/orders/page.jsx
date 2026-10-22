"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  apiGet,
} from "@/lib/api";

import {
  useTranslations,
} from "next-intl";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function OrdersPage() {
  const t =
    useTranslations(
      "Orders"
    );

  const {
    user,
    loading:
    authLoading,
  } = useAuth();

  const [
    orders,
    setOrders,
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
    if (
      authLoading
    ) {
      return;
    }

    if (!user) {
      setLoading(false);

      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");

        const data =
          await apiGet(
            `${API_URL}/api/orders`
          );

        setOrders(
          Array.isArray(data)
            ? data
            : data.orders || []
        );
      } catch (err) {
        console.error(err);

        setError(
          t("loadError")
        );
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [
    authLoading,
    user,
    t,
  ]);

  if (
    authLoading ||
    loading
  ) {
    return (
      <main
        style={
          styles.container
        }
      >
        <p>
          {t(
            "loading"
          )}
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main
        style={
          styles.container
        }
      >
        <h1>
          {t("title")}
        </h1>

        <p>
          {t(
            "loginRequired"
          )}
        </p>

        <Link
          href="/login?redirect=/orders"
        >
          {t("login")}
        </Link>
      </main>
    );
  }

  return (
    <main
      style={
        styles.container
      }
    >
      <div
        style={
          styles.header
        }
      >
        <div>
          <h1
            style={
              styles.title
            }
          >
            {t("title")}
          </h1>

          <p
            style={
              styles.subtitle
            }
          >
            {t(
              "subtitle"
            )}
          </p>
        </div>
      </div>

      {error && (
        <div
          style={
            styles.error
          }
        >
          {error}
        </div>
      )}

      {!error &&
        orders.length === 0 && (
          <div
            style={
              styles.empty
            }
          >
            <p>
              {t(
                "empty"
              )}
            </p>

            <Link
              href="/"
              style={
                styles.shoppingLink
              }
            >
              {t(
                "continueShopping"
              )}
            </Link>
          </div>
        )}

      <div
        style={
          styles.list
        }
      >
        {orders.map(
          (order) => (
            <Link
              key={
                order.id
              }
              href={`/orders/${order.id}`}
              style={
                styles.orderCard
              }
            >
              <div
                style={
                  styles.orderHeader
                }
              >
                <div>
                  <strong
                    style={
                      styles.orderNumber
                    }
                  >
                    {t(
                      "order"
                    )}{" "}
                    #{order.id}
                  </strong>

                  {order.createdAt && (
                    <div
                      style={
                        styles.date
                      }
                    >
                      {new Date(
                        order.createdAt
                      ).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div
                  style={
                    styles.right
                  }
                >
                  {order.status && (
                    <span
                      style={
                        styles.status
                      }
                    >
                      {t(
                        `status.${order.status}`,
                        {
                          fallback:
                            order.status,
                        }
                      )}
                    </span>
                  )}

                  {order.total != null && (
                    <strong
                      style={
                        styles.total
                      }
                    >
                      €
                      {Number(
                        order.total
                      ).toFixed(
                        2
                      )}
                    </strong>
                  )}
                </div>
              </div>

              <div
                style={
                  styles.viewDetails
                }
              >
                {t(
                  "viewDetails"
                )}
                {" →"}
              </div>
            </Link>
          )
        )}
      </div>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "0 auto",
    padding:
      "48px 20px 80px",
  },

  header: {
    marginBottom:
      "30px",
  },

  title: {
    margin: 0,
    fontSize:
      "clamp(30px, 4vw, 40px)",
  },

  subtitle: {
    margin:
      "8px 0 0",
    color: "#777",
  },

  list: {
    display: "grid",
    gap: "16px",
    marginTop:
      "25px",
  },

  orderCard: {
    display: "block",
    border:
      "1px solid #ddd",
    borderRadius:
      "14px",
    padding: "20px",
    textDecoration:
      "none",
    color: "inherit",
    background: "#fff",
  },

  orderHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    gap: "20px",
  },

  orderNumber: {
    fontSize: "17px",
  },

  date: {
    marginTop: "7px",
    color: "#777",
    fontSize: "13px",
  },

  right: {
    display: "grid",
    justifyItems: "end",
    gap: "8px",
  },

  status: {
    padding:
      "5px 9px",
    borderRadius:
      "20px",
    background:
      "#f1f1f1",
    fontSize: "12px",
  },

  total: {
    fontSize: "17px",
  },

  viewDetails: {
    marginTop: "18px",
    paddingTop: "14px",
    borderTop:
      "1px solid #eee",
    fontSize: "13px",
    color: "#555",
  },

  error: {
    padding: "14px",
    borderRadius:
      "10px",
    background:
      "#fff2f2",
    color: "#a00000",
  },

  empty: {
    padding:
      "30px 20px",
    border:
      "1px dashed #ccc",
    borderRadius:
      "14px",
    textAlign:
      "center",
  },

  shoppingLink: {
    display:
      "inline-block",
    marginTop:
      "10px",
  },
};