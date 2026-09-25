"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  getCart,
  clearCart,
} from "../../lib/cart";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  formatWeight,
} from "../../lib/formatWeight";

import {
  apiGet,
  apiPost,
} from "@/lib/api";

import {
  useTranslations,
} from "next-intl";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function CheckoutPage() {
  const router =
    useRouter();

  const t =
    useTranslations(
      "Checkout"
    );

  const [
    cart,
    setCart,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [
    customer,
    setCustomer,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    country: "Portugal",
  });

  const [
    shipping,
    setShipping,
  ] = useState(null);

  const [
    shippingLoading,
    setShippingLoading,
  ] = useState(false);

  const [
    paymentMethod,
    setPaymentMethod,
  ] = useState("MBWAY");

  const [
    createdOrderId,
    setCreatedOrderId,
  ] = useState(null);

  useEffect(() => {
    if (
      !authLoading &&
      !user
    ) {
      router.replace(
        "/login?redirect=/checkout"
      );
    }
  }, [
    authLoading,
    user,
    router,
  ]);

  useEffect(() => {
    setCart(
      getCart()
    );
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setCustomer(
      (current) => ({
        ...current,
        name:
          current.name ||
          user.name ||
          "",

        email:
          current.email ||
          user.email ||
          "",
      })
    );
  }, [user]);

  function handleChange(
    event
  ) {
    const {
      name,
      value,
    } = event.target;

    setCustomer(
      (current) => ({
        ...current,
        [name]: value,
      })
    );
  }

  function formatPostalCode(
    value
  ) {
    const numbers =
      value
        .replace(
          /\D/g,
          ""
        )
        .slice(0, 7);

    if (
      numbers.length <= 4
    ) {
      return numbers;
    }

    return `${numbers.slice(
      0,
      4
    )}-${numbers.slice(4)}`;
  }

  const subtotal =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.unitPrice || 0
        ) *
        Number(
          item.quantity || 1
        ),
      0
    );

  const shippingPrice =
    Number(
      shipping?.price || 0
    );

  const total =
    subtotal +
    shippingPrice;

  const totalWeightGrams =
    cart.reduce(
      (
        total,
        item
      ) =>
        total +
        Number(
          item.weightGrams || 0
        ) *
        Number(
          item.quantity || 1
        ),
      0
    );

  async function validatePostalCode() {
    const postalCode =
      customer.postalCode.trim();

    if (
      !/^\d{4}-\d{3}$/.test(
        postalCode
      )
    ) {
      setError(
        t(
          "invalidPostalCode"
        )
      );

      setShipping(null);

      return;
    }

    try {
      setError("");

      const data =
        await apiGet(
          `${API_URL}/api/postal-codes/${postalCode}`
        );

      setCustomer(
        (current) => ({
          ...current,
          city:
            data.locality,
        })
      );

      await calculateShippingCost(
        postalCode
      );
    } catch (error) {
      setError(
        error.message
      );
    }
  }

  async function calculateShippingCost(
    postalCodeValue
  ) {
    const postalCode =
      (
        postalCodeValue ||
        customer.postalCode
      ).trim();

    if (
      !/^\d{4}-\d{3}$/.test(
        postalCode
      )
    ) {
      setShipping(null);

      return;
    }

    try {
      setShippingLoading(
        true
      );

      setError("");

      const data =
        await apiPost(
          `${API_URL}/api/shipping/calculate`,
          {
            postalCode,
            weightGrams:
              totalWeightGrams,
          }
        );

      setShipping(data);
    } catch (error) {
      setShipping(null);

      setError(
        error.message
      );
    } finally {
      setShippingLoading(
        false
      );
    }
  }

  async function handleSubmit(
    event
  ) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (
      cart.length === 0
    ) {
      setError(
        t("emptyCart")
      );

      return;
    }

    if (!shipping) {
      setError(
        t(
          "validPostalCode"
        )
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      let orderId =
        createdOrderId;

      if (!orderId) {
        const order =
          await apiPost(
            `${API_URL}/api/orders`,
            {
              items:
                cart.map(
                  (
                    item
                  ) => ({
                    productId:
                      item.productId,

                    quantity:
                      item.quantity,

                    keys:
                      item.keys,

                    color:
                      item.color,

                    font:
                      item.font,

                    characters:
                      item.characters,
                  })
                ),

              shippingAddress:
              {
                name:
                  customer.name,

                address:
                  customer.address,

                postalCode:
                  customer.postalCode,

                city:
                  customer.city,

                country:
                  customer.country,
              },
            }
          );

        orderId =
          order.id;

        setCreatedOrderId(
          order.id
        );
      }

      await apiPost(
        `${API_URL}/api/payments/create`,
        {
          orderId,

          method:
            paymentMethod,

          mobileNumber:
            customer.phone,
        }
      );

      clearCart();

      router.push(
        `/orders/${orderId}/success`
      );
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <main
        style={
          styles.container
        }
      >
        {t(
          "checkingSession"
        )}
      </main>
    );
  }

  if (!user) {
    return null;
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
            "checkoutSubtitle"
          )}
        </p>
      </div>

      <form
        onSubmit={
          handleSubmit
        }
      >
        <div
          style={
            styles.layout
          }
        >
          {/* LEFT COLUMN */}
          <div
            style={
              styles.formColumn
            }
          >
            {error && (
              <div
                style={
                  styles.error
                }
              >
                {error}
              </div>
            )}

            {/* CONTACT */}
            <section
              style={
                styles.card
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "customerDetails"
                )}
              </h2>

              <label
                style={
                  styles.label
                }
              >
                {t("name")}

                <input
                  name="name"
                  value={
                    customer.name
                  }
                  onChange={
                    handleChange
                  }
                  required
                  style={
                    styles.input
                  }
                />
              </label>

              <div
                style={
                  styles.grid2
                }
              >
                <label
                  style={
                    styles.label
                  }
                >
                  {t("email")}

                  <input
                    name="email"
                    type="email"
                    value={
                      customer.email
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={
                      styles.input
                    }
                  />
                </label>

                <label
                  style={
                    styles.label
                  }
                >
                  {t("phone")}

                  <input
                    name="phone"
                    type="tel"
                    value={
                      customer.phone
                    }
                    onChange={
                      handleChange
                    }
                    style={
                      styles.input
                    }
                  />
                </label>
              </div>
            </section>

            {/* ADDRESS */}
            <section
              style={
                styles.card
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "deliveryAddress"
                )}
              </h2>

              <label
                style={
                  styles.label
                }
              >
                {t("address")}

                <input
                  name="address"
                  value={
                    customer.address
                  }
                  onChange={
                    handleChange
                  }
                  required
                  style={
                    styles.input
                  }
                />
              </label>

              <div
                style={
                  styles.grid2
                }
              >
                <label
                  style={
                    styles.label
                  }
                >
                  {t(
                    "postalCode"
                  )}

                  <input
                    name="postalCode"
                    value={
                      customer.postalCode
                    }
                    onChange={(
                      event
                    ) => {
                      const formatted =
                        formatPostalCode(
                          event
                            .target
                            .value
                        );

                      setCustomer(
                        (
                          current
                        ) => ({
                          ...current,
                          postalCode:
                            formatted,
                        })
                      );

                      setShipping(
                        null
                      );
                    }}
                    onBlur={
                      validatePostalCode
                    }
                    inputMode="numeric"
                    maxLength={8}
                    placeholder="0000-000"
                    required
                    style={
                      styles.input
                    }
                  />
                </label>

                <label
                  style={
                    styles.label
                  }
                >
                  {t("city")}

                  <input
                    name="city"
                    value={
                      customer.city
                    }
                    onChange={
                      handleChange
                    }
                    required
                    style={
                      styles.input
                    }
                  />
                </label>
              </div>

              <label
                style={
                  styles.label
                }
              >
                {t("country")}

                <input
                  name="country"
                  value={
                    customer.country
                  }
                  onChange={
                    handleChange
                  }
                  required
                  style={
                    styles.input
                  }
                />
              </label>

              <button
                type="button"
                onClick={
                  validatePostalCode
                }
                disabled={
                  shippingLoading
                }
                style={
                  styles.secondaryButton
                }
              >
                {shippingLoading
                  ? t(
                    "calculatingShipping"
                  )
                  : t(
                    "calculateShipping"
                  )}
              </button>

              {shipping && (
                <div
                  style={
                    styles.shippingBox
                  }
                >
                  <div
                    style={
                      styles.shippingHeader
                    }
                  >
                    <strong>
                      {
                        shipping.provider
                      }{" "}
                      {
                        shipping.service
                      }
                    </strong>

                    <strong>
                      €
                      {Number(
                        shipping.price
                      ).toFixed(
                        2
                      )}
                    </strong>
                  </div>

                  <div
                    style={
                      styles.shippingDetails
                    }
                  >
                    <span>
                      {t(
                        "weight"
                      )}
                      :{" "}
                      {formatWeight(
                        shipping.weightGrams
                      )}
                    </span>

                    <span>
                      {t(
                        "estimatedDelivery"
                      )}
                      :{" "}
                      {
                        shipping.estimatedDelivery
                      }
                    </span>
                  </div>

                  {shipping.deliveryNote && (
                    <small
                      style={
                        styles.shippingNote
                      }
                    >
                      {
                        shipping.deliveryNote
                      }
                    </small>
                  )}
                </div>
              )}
            </section>

            {/* PAYMENT */}
            <section
              style={
                styles.card
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                {t(
                  "payment"
                )}
              </h2>

              <div
                style={
                  styles.paymentOptions
                }
              >
                <label
                  style={{
                    ...styles.paymentOption,

                    border:
                      paymentMethod ===
                        "MBWAY"
                        ? "2px solid #111"
                        : "1px solid #ddd",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="MBWAY"
                    checked={
                      paymentMethod ===
                      "MBWAY"
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event
                          .target
                          .value
                      )
                    }
                  />

                  <div>
                    <strong>
                      MB WAY
                    </strong>

                    <div
                      style={
                        styles.paymentDescription
                      }
                    >
                      {t(
                        "mbwayDescription"
                      )}
                    </div>
                  </div>
                </label>

                <label
                  style={{
                    ...styles.paymentOption,

                    border:
                      paymentMethod ===
                        "CARD"
                        ? "2px solid #111"
                        : "1px solid #ddd",
                  }}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CARD"
                    checked={
                      paymentMethod ===
                      "CARD"
                    }
                    onChange={(
                      event
                    ) =>
                      setPaymentMethod(
                        event
                          .target
                          .value
                      )
                    }
                  />

                  <div>
                    <strong>
                      {t(
                        "card"
                      )}
                    </strong>

                    <div
                      style={
                        styles.paymentDescription
                      }
                    >
                      {t(
                        "cardDescription"
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN */}
          <aside
            style={
              styles.summary
            }
          >
            <h2
              style={
                styles.summaryTitle
              }
            >
              {t(
                "orderSummary"
              )}
            </h2>

            <div
              style={
                styles.orderItems
              }
            >
              {cart.map(
                (item) => {
                  const itemTotal =
                    Number(
                      item.unitPrice ||
                      0
                    ) *
                    Number(
                      item.quantity ||
                      1
                    );

                  return (
                    <div
                      key={
                        item.cartItemId
                      }
                      style={
                        styles.orderItem
                      }
                    >
                      <div>
                        <strong
                          style={
                            styles.orderItemName
                          }
                        >
                          {
                            item.name
                          }
                        </strong>

                        <div
                          style={
                            styles.orderItemMeta
                          }
                        >
                          {
                            item.quantity
                          }{" "}
                          × €
                          {Number(
                            item.unitPrice
                          ).toFixed(
                            2
                          )}
                        </div>

                        <div
                          style={
                            styles.orderItemMeta
                          }
                        >
                          {
                            item.keys
                          }{" "}
                          {t(
                            "keys"
                          ).toLowerCase()}

                          {item.color
                            ?.name
                            ? ` · ${item.color.name}`
                            : ""}
                        </div>
                      </div>

                      <strong>
                        €
                        {itemTotal.toFixed(
                          2
                        )}
                      </strong>
                    </div>
                  );
                }
              )}
            </div>

            <div
              style={
                styles.summaryRows
              }
            >
              <div
                style={
                  styles.summaryRow
                }
              >
                <span>
                  {t(
                    "subtotal"
                  )}
                </span>

                <span>
                  €
                  {subtotal.toFixed(
                    2
                  )}
                </span>
              </div>

              <div
                style={
                  styles.summaryRow
                }
              >
                <span>
                  {t(
                    "shipping"
                  )}
                </span>

                <span>
                  {shipping
                    ? `€${shippingPrice.toFixed(
                      2
                    )}`
                    : "—"}
                </span>
              </div>

              <div
                style={
                  styles.summaryRow
                }
              >
                <span>
                  {t(
                    "weight"
                  )}
                </span>

                <span>
                  {formatWeight(
                    totalWeightGrams
                  )}
                </span>
              </div>
            </div>

            <div
              style={
                styles.totalRow
              }
            >
              <span>
                {t("total")}
              </span>

              <span>
                €
                {total.toFixed(
                  2
                )}
              </span>
            </div>

            <button
              type="submit"
              disabled={
                loading ||
                !shipping
              }
              style={{
                ...styles.submitButton,

                opacity:
                  loading ||
                    !shipping
                    ? 0.5
                    : 1,

                cursor:
                  loading ||
                    !shipping
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? t(
                  "processing"
                )
                : createdOrderId
                  ? t(
                    "tryPaymentAgain"
                  )
                  : t(
                    "placeOrder"
                  )}
            </button>

            {!shipping && (
              <p
                style={
                  styles.checkoutHint
                }
              >
                {t(
                  "shippingRequired"
                )}
              </p>
            )}
          </aside>
        </div>
      </form>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding:
      "48px 20px 80px",
    fontFamily:
      "Arial, sans-serif",
  },

  header: {
    marginBottom:
      "32px",
  },

  title: {
    margin: 0,

    fontSize:
      "clamp(30px, 4vw, 42px)",

    letterSpacing:
      "-0.03em",
  },

  subtitle: {
    margin:
      "10px 0 0",

    color: "#777",

    fontSize: "15px",
  },

  layout: {
    display: "grid",

    gridTemplateColumns:
      "minmax(0, 1fr) minmax(320px, 380px)",

    gap: "40px",

    alignItems:
      "start",
  },

  formColumn: {
    display: "grid",

    gap: "20px",
  },

  card: {
    border:
      "1px solid #e5e5e5",

    borderRadius:
      "18px",

    padding: "24px",

    background: "#fff",
  },

  sectionTitle: {
    margin:
      "0 0 22px",

    fontSize: "20px",
  },

  label: {
    display: "grid",

    gap: "8px",

    marginBottom:
      "16px",

    fontSize: "14px",

    fontWeight: 600,
  },

  input: {
    width: "100%",

    boxSizing:
      "border-box",

    padding:
      "13px 14px",

    border:
      "1px solid #d8d8d8",

    borderRadius:
      "10px",

    fontSize: "15px",

    outline: "none",
  },

  grid2: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",

    gap: "14px",
  },

  secondaryButton: {
    border:
      "1px solid #ccc",

    background: "#fff",

    padding:
      "12px 16px",

    borderRadius:
      "10px",

    cursor: "pointer",

    fontWeight: 600,
  },

  shippingBox: {
    marginTop:
      "18px",

    padding: "16px",

    borderRadius:
      "12px",

    background:
      "#f7f7f7",

    border:
      "1px solid #e5e5e5",
  },

  shippingHeader: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: "20px",
  },

  shippingDetails: {
    display: "grid",

    gap: "5px",

    marginTop:
      "10px",

    color: "#666",

    fontSize: "13px",
  },

  shippingNote: {
    display: "block",

    marginTop:
      "10px",

    color: "#777",

    lineHeight: 1.5,
  },

  paymentOptions: {
    display: "grid",

    gap: "12px",
  },

  paymentOption: {
    display: "flex",

    alignItems:
      "flex-start",

    gap: "12px",

    padding: "16px",

    borderRadius:
      "12px",

    cursor: "pointer",
  },

  paymentDescription: {
    marginTop: "4px",

    color: "#777",

    fontSize: "13px",
  },

  error: {
    padding: "14px",

    borderRadius:
      "10px",

    background:
      "#fff2f2",

    border:
      "1px solid #f1b1b1",

    color: "#a00000",
  },

  summary: {
    position: "sticky",

    top: "24px",

    border:
      "1px solid #e5e5e5",

    borderRadius:
      "18px",

    padding: "24px",

    background:
      "#fafafa",
  },

  summaryTitle: {
    margin:
      "0 0 22px",

    fontSize: "21px",
  },

  orderItems: {
    display: "grid",

    gap: "16px",

    paddingBottom:
      "20px",

    borderBottom:
      "1px solid #ddd",
  },

  orderItem: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: "20px",

    alignItems:
      "flex-start",
  },

  orderItemName: {
    display: "block",

    marginBottom:
      "5px",

    lineHeight: 1.3,
  },

  orderItemMeta: {
    color: "#777",

    fontSize: "13px",

    marginTop: "3px",
  },

  summaryRows: {
    display: "grid",

    gap: "12px",

    marginTop:
      "20px",
  },

  summaryRow: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: "20px",

    fontSize: "14px",
  },

  totalRow: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: "20px",

    marginTop:
      "20px",

    paddingTop:
      "20px",

    borderTop:
      "1px solid #ddd",

    fontSize: "22px",

    fontWeight: 700,
  },

  submitButton: {
    width: "100%",

    marginTop:
      "22px",

    padding:
      "16px 20px",

    border: "none",

    borderRadius:
      "12px",

    background: "#111",

    color: "#fff",

    fontSize: "16px",

    fontWeight: 700,
  },

  checkoutHint: {
    margin:
      "12px 0 0",

    color: "#777",

    fontSize: "12px",

    textAlign: "center",

    lineHeight: 1.4,
  },
};