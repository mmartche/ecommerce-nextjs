"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
} from "react";

import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../../lib/cart";

import {
  formatWeight,
} from "../../lib/formatWeight";

import {
  useTranslations,
} from "next-intl";

import {
  imageUrl,
} from "../../lib/imageUrl";

import {
  useLanguage,
} from "@/context/LanguageContext";

import {
  apiGet,
} from "@/lib/api";

export default function CartPage() {
  const {
    locale,
  } = useLanguage();

  const [
    localizedProducts,
    setLocalizedProducts,
  ] = useState({});

  const [cart, setCart] =
    useState([]);

  const t =
    useTranslations("Cart");

  function refreshCart() {
    setCart(getCart());
  }

  useEffect(() => {
    refreshCart();

    window.addEventListener(
      "cart-updated",
      refreshCart
    );

    return () => {
      window.removeEventListener(
        "cart-updated",
        refreshCart
      );
    };
  }, []);

  useEffect(() => {
    async function loadLocalizedProducts() {
      try {
        const products =
          await apiGet(
            `/api/products?locale=${locale}`
          );

        const productsBySlug =
          Object.fromEntries(
            products.map(
              (product) => [
                product.slug,
                product,
              ]
            )
          );

        setLocalizedProducts(
          productsBySlug
        );
      } catch (error) {
        console.error(
          "Failed to load localized products:",
          error
        );
      }
    }

    loadLocalizedProducts();
  }, [locale]);

  function changeQuantity(
    item,
    quantity
  ) {
    if (quantity < 1) {
      return;
    }

    updateCartQuantity(
      item.cartItemId,
      quantity
    );

    refreshCart();
  }

  function removeItem(
    cartItemId
  ) {
    removeFromCart(
      cartItemId
    );

    refreshCart();
  }

  function handleClearCart() {
    clearCart();
    refreshCart();
  }

  const subtotal =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.unitPrice || 0
        ) *
        Number(
          item.quantity || 1
        ),
      0
    );

  const totalWeightGrams =
    cart.reduce(
      (total, item) =>
        total +
        Number(
          item.weightGrams || 0
        ) *
        Number(
          item.quantity || 1
        ),
      0
    );

  if (cart.length === 0) {
    return (
      <main
        style={
          styles.emptyContainer
        }
      >
        <div
          style={
            styles.emptyCard
          }
        >
          <div
            style={
              styles.emptyIcon
            }
          >
            🛒
          </div>

          <h1
            style={
              styles.emptyTitle
            }
          >
            {t("title")}
          </h1>

          <p
            style={
              styles.emptyText
            }
          >
            {t("empty")}
          </p>

          <Link
            href="/"
            style={
              styles.primaryLink
            }
          >
            {t(
              "continueShopping"
            )}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={styles.container}
    >
      <div
        style={styles.header}
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
              styles.itemCount
            }
          >
            {cart.length}{" "}
            {cart.length === 1
              ? t("item")
              : t("items")}
          </p>
        </div>

        <button
          type="button"
          onClick={
            handleClearCart
          }
          style={
            styles.clearButton
          }
        >
          {t("clearCart")}
        </button>
      </div>

      <div
        style={
          styles.cartLayout
        }
      >
        {/* PRODUCTS */}
        <section
          style={
            styles.itemsColumn
          }
        >
          {cart.map(
            (item) => {
              const localizedProduct =
                localizedProducts[
                item.slug
                ];

              const productName =
                localizedProduct?.name ||
                item.name;

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
                <article
                  key={
                    item.cartItemId
                  }
                  style={
                    styles.itemCard
                  }
                >
                  <div
                    style={
                      styles.itemMain
                    }
                  >
                    <Link
                      href={`/products/${item.slug}`}
                      style={
                        styles.imageLink
                      }
                    >
                      <div
                        style={
                          styles.productImageWrapper
                        }
                      >
                        {item.image ? (
                          <img
                            src={imageUrl(
                              item.image
                            )}
                            alt={
                              item.name
                            }
                            style={
                              styles.productImage
                            }
                          />
                        ) : (
                          <div
                            style={
                              styles.noImage
                            }
                          >
                            No image
                          </div>
                        )}
                      </div>
                    </Link>

                    <div
                      style={
                        styles.itemContent
                      }
                    >
                      <Link
                        href={`/products/${item.slug}`}
                        style={
                          styles.productLink
                        }
                      >
                        <h2
                          style={
                            styles.productName
                          }
                        >
                          {
                            productName
                          }
                        </h2>
                      </Link>

                      {item.characters && (
                        <div
                          style={
                            styles.characters
                          }
                        >
                          “
                          {
                            item.characters
                          }
                          ”
                        </div>
                      )}

                      <div
                        style={
                          styles.attributes
                        }
                      >
                        <div
                          style={
                            styles.attribute
                          }
                        >
                          <span
                            style={
                              styles.attributeLabel
                            }
                          >
                            {t(
                              "keys"
                            )}
                          </span>

                          <span>
                            {
                              item.keys
                            }
                          </span>
                        </div>

                        <div
                          style={
                            styles.attribute
                          }
                        >
                          <span
                            style={
                              styles.attributeLabel
                            }
                          >
                            {t(
                              "color"
                            )}
                          </span>

                          <span
                            style={
                              styles.colorValue
                            }
                          >
                            <span
                              style={{
                                ...styles.colorDot,

                                background:
                                  item
                                    .color
                                    ?.hex,
                              }}
                            />

                            {
                              item
                                .color
                                ?.name
                            }
                          </span>
                        </div>

                        <div
                          style={
                            styles.attribute
                          }
                        >
                          <span
                            style={
                              styles.attributeLabel
                            }
                          >
                            {t(
                              "font"
                            )}
                          </span>

                          <span>
                            {
                              item
                                .font
                                ?.name
                            }

                            {item
                              .font
                              ?.bordered
                              ? ` · ${t(
                                "withBorder"
                              )}`
                              : ` · ${t(
                                "withoutBorder"
                              )}`}
                          </span>
                        </div>

                        <div
                          style={
                            styles.attribute
                          }
                        >
                          <span
                            style={
                              styles.attributeLabel
                            }
                          >
                            {t(
                              "weight"
                            )}
                          </span>

                          <span>
                            {formatWeight(
                              Number(
                                item.weightGrams ||
                                0
                              )
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={
                        styles.itemPrice
                      }
                    >
                      €
                      {itemTotal.toFixed(
                        2
                      )}
                    </div>
                  </div>

                  <div
                    style={
                      styles.itemFooter
                    }
                  >
                    <div
                      style={
                        styles.quantityControl
                      }
                    >
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        disabled={
                          item.quantity <=
                          1
                        }
                        onClick={() =>
                          changeQuantity(
                            item,
                            item.quantity -
                            1
                          )
                        }
                        style={{
                          ...styles.quantityButton,

                          opacity:
                            item.quantity <=
                              1
                              ? 0.35
                              : 1,
                        }}
                      >
                        −
                      </button>

                      <span
                        style={
                          styles.quantity
                        }
                      >
                        {
                          item.quantity
                        }
                      </span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          changeQuantity(
                            item,
                            item.quantity +
                            1
                          )
                        }
                        style={
                          styles.quantityButton
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeItem(
                          item.cartItemId
                        )
                      }
                      style={
                        styles.removeButton
                      }
                    >
                      {t("remove")}
                    </button>
                  </div>
                </article>
              );
            }
          )}
        </section>

        {/* SUMMARY */}
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
            {t("summary")}
          </h2>

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
                  "totalWeight"
                )}
              </span>

              <span>
                {formatWeight(
                  totalWeightGrams
                )}
              </span>
            </div>

            <div
              style={
                styles.summaryRow
              }
            >
              <span>
                {t("subtotal")}
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
                styles.shippingRow
              }
            >
              <span>
                {t("shipping")}
              </span>

              <span>
                {t(
                  "calculatedAtCheckout"
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
              {t("subtotal")}
            </span>

            <span>
              €
              {subtotal.toFixed(
                2
              )}
            </span>
          </div>

          <p
            style={
              styles.shippingNote
            }
          >
            {t(
              "shippingMessage"
            )}
          </p>

          <Link
            href="/checkout"
            style={
              styles.checkoutButton
            }
          >
            {t("checkout")}
          </Link>

          <Link
            href="/"
            style={
              styles.continueLink
            }
          >
            ←{" "}
            {t(
              "continueShopping"
            )}
          </Link>
        </aside>
      </div>
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
    display: "flex",
    justifyContent:
      "space-between",
    alignItems:
      "flex-end",
    gap: "20px",
    marginBottom: "32px",
  },

  title: {
    margin: 0,
    fontSize:
      "clamp(30px, 4vw, 42px)",
    letterSpacing:
      "-0.03em",
  },

  itemCount: {
    margin:
      "8px 0 0",
    color: "#777",
    fontSize: "14px",
  },

  clearButton: {
    border: "none",
    background:
      "transparent",
    color: "#777",
    cursor: "pointer",
    padding: "8px",
    textDecoration:
      "underline",
  },

  cartLayout: {
    display: "grid",

    gridTemplateColumns:
      "minmax(0, 1fr) minmax(300px, 360px)",

    gap: "40px",

    alignItems: "start",
  },

  itemsColumn: {
    display: "grid",
    gap: "16px",
  },

  itemCard: {
    border:
      "1px solid #e5e5e5",

    borderRadius:
      "16px",

    padding: "22px",

    background: "#fff",
  },

  itemMain: {
    display: "grid",

    gridTemplateColumns:
      "120px minmax(0, 1fr) auto",

    gap: "20px",

    alignItems:
      "start",
  },

  itemContent: {
    minWidth: 0,
  },

  productLink: {
    textDecoration:
      "none",

    color: "#111",
  },

  productName: {
    margin: 0,

    fontSize: "20px",

    lineHeight: 1.3,
  },

  characters: {
    display:
      "inline-block",

    marginTop: "10px",

    padding:
      "6px 10px",

    borderRadius:
      "8px",

    background:
      "#f5f5f5",

    fontWeight: 600,

    fontSize: "14px",
  },

  attributes: {
    display: "grid",

    gap: "8px",

    marginTop:
      "18px",
  },

  attribute: {
    display: "grid",

    gridTemplateColumns:
      "90px 1fr",

    gap: "12px",

    fontSize: "14px",

    lineHeight: 1.4,
  },

  attributeLabel: {
    color: "#777",
  },

  colorValue: {
    display: "flex",

    alignItems:
      "center",

    gap: "7px",
  },

  colorDot: {
    width: "14px",

    height: "14px",

    borderRadius:
      "50%",

    border:
      "1px solid #aaa",

    flexShrink: 0,
  },

  itemPrice: {
    whiteSpace:
      "nowrap",

    fontSize: "20px",

    fontWeight: 700,
  },

  itemFooter: {
    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "space-between",

    marginTop:
      "20px",

    paddingTop:
      "18px",

    borderTop:
      "1px solid #eee",
  },

  quantityControl: {
    display: "flex",

    alignItems:
      "center",

    border:
      "1px solid #ddd",

    borderRadius:
      "10px",

    overflow:
      "hidden",
  },

  quantityButton: {
    width: "38px",

    height: "38px",

    border: "none",

    background:
      "#fff",

    fontSize: "20px",

    cursor: "pointer",
  },

  quantity: {
    minWidth: "38px",

    textAlign:
      "center",

    fontWeight: 600,
  },

  removeButton: {
    border: "none",

    background:
      "transparent",

    color: "#777",

    cursor: "pointer",

    textDecoration:
      "underline",
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
      "0 0 24px",

    fontSize: "21px",
  },

  summaryRows: {
    display: "grid",
    gap: "14px",
  },

  summaryRow: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: "20px",

    fontSize: "14px",
  },

  shippingRow: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: "20px",

    color: "#777",

    fontSize: "13px",
  },

  totalRow: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: "20px",

    marginTop:
      "22px",

    paddingTop:
      "20px",

    borderTop:
      "1px solid #ddd",

    fontSize: "22px",

    fontWeight: 700,
  },

  shippingNote: {
    color: "#777",

    fontSize: "13px",

    lineHeight: 1.5,

    margin:
      "14px 0 0",
  },

  checkoutButton: {
    display: "block",

    width: "100%",

    boxSizing:
      "border-box",

    marginTop:
      "22px",

    padding: "16px",

    textAlign:
      "center",

    textDecoration:
      "none",

    background: "#111",

    color: "#fff",

    borderRadius:
      "12px",

    fontSize: "16px",

    fontWeight: 700,
  },

  continueLink: {
    display: "block",

    marginTop:
      "18px",

    textAlign:
      "center",

    color: "#555",

    textDecoration:
      "none",

    fontSize: "14px",
  },

  emptyContainer: {
    maxWidth: "600px",

    margin:
      "80px auto",

    padding: "20px",

    fontFamily:
      "Arial, sans-serif",
  },

  emptyCard: {
    textAlign:
      "center",

    padding:
      "60px 30px",

    border:
      "1px solid #e5e5e5",

    borderRadius:
      "20px",

    background:
      "#fafafa",
  },

  emptyIcon: {
    fontSize: "42px",

    marginBottom:
      "18px",
  },

  emptyTitle: {
    margin:
      "0 0 12px",
  },

  emptyText: {
    color: "#777",

    margin:
      "0 0 24px",
  },

  primaryLink: {
    display:
      "inline-block",

    padding:
      "14px 20px",

    borderRadius:
      "10px",

    background:
      "#111",

    color: "#fff",

    textDecoration:
      "none",

    fontWeight: 600,
  },
  imageLink: {
    textDecoration:
      "none",

    flexShrink: 0,
  },

  productImageWrapper: {
    width: "120px",

    height: "120px",

    borderRadius:
      "14px",

    overflow:
      "hidden",

    background:
      "#f6f6f6",

    border:
      "1px solid #eeeeee",
  },

  productImage: {
    width: "100%",

    height: "100%",

    objectFit:
      "contain",

    display: "block",

    padding: "8px",

    boxSizing:
      "border-box",
  },

  noImage: {
    width: "100%",

    height: "100%",

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    color: "#999",

    fontSize: "12px",
  },
};