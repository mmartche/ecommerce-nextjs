"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  addToCart,
} from "../../../lib/cart";

import {
  imageUrl,
} from "../../../lib/imageUrl";

import {
  apiGet,
} from "@/lib/api";

import {
  useTranslations,
} from "next-intl";

import {
  useLanguage,
} from "@/context/LanguageContext";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

function ChevronLeft() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

export default function ProductPage({
  params,
}) {
  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [
    selectedColor,
    setSelectedColor,
  ] = useState(null);

  const [
    selectedFont,
    setSelectedFont,
  ] = useState(null);

  const [
    addedToCart,
    setAddedToCart,
  ] = useState(false);

  const [
    selectedImage,
    setSelectedImage,
  ] = useState(0);

  const [
    characters,
    setCharacters,
  ] = useState("");

  const [slug, setSlug] =
    useState(null);

  const t =
    useTranslations("Product");

  const {
    locale,
  } = useLanguage();

  const keys =
    characters.length;

  const calculatedUnitPrice =
    Number(
      product?.basePrice || 0
    ) +
    Number(
      product?.pricePerKey || 0
    ) *
    keys;

  const calculatedWeightGrams =
    product?.baseWeightGrams !=
      null &&
      product?.weightPerKeyGrams !=
      null
      ? Number(
        product.baseWeightGrams
      ) +
      Number(
        product.weightPerKeyGrams
      ) *
      keys
      : Number(
        product?.weightGrams || 0
      );

  useEffect(() => {
    async function loadParams() {
      const result =
        await params;

      setSlug(
        result.slug
      );
    }

    loadParams();
  }, [params]);

  useEffect(() => {
    if (!slug) {
      return;
    }

    async function loadProduct() {
      try {
        setLoading(true);

        const data =
          await apiGet(
            `${API_URL}/api/products/${slug}?locale=${locale}`
          );

        setProduct(data);

        if (
          data.colors.length > 0
        ) {
          setSelectedColor(
            data.colors[0]
          );
        }

        if (
          data.fonts.length > 0
        ) {
          setSelectedFont(
            data.fonts[0]
          );
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [slug, locale]);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

  if (loading) {
    return (
      <main style={styles.container}>
        Loading...
      </main>
    );
  }

  if (!product) {
    return (
      <main style={styles.container}>
        Product not found.
      </main>
    );
  }

  function handleAddToCart() {
    if (
      !selectedColor ||
      !selectedFont
    ) {
      return;
    }

    if (
      keys < product.minKeys ||
      keys > product.maxKeys
    ) {
      return;
    }

    addToCart({
      productId:
        product.id,

      slug:
        product.slug,

      name:
        product.name,

      image:
        product.images?.[0]?.url ||
        null,

      quantity: 1,

      weightGrams:
        calculatedWeightGrams,

      characters,

      keys,

      color: {
        id:
          selectedColor.id,

        name:
          selectedColor.name,

        hex:
          selectedColor.hex,
      },

      font: {
        id:
          selectedFont.id,

        name:
          selectedFont.name,

        bordered:
          selectedFont.bordered,
      },

      unitPrice:
        calculatedUnitPrice,
    });

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  }

  function previousImage() {
    setSelectedImage(
      (current) => {
        if (
          !product?.images?.length
        ) {
          return 0;
        }

        return current === 0
          ? product.images.length -
          1
          : current - 1;
      }
    );
  }

  function nextImage() {
    setSelectedImage(
      (current) => {
        if (
          !product?.images?.length
        ) {
          return 0;
        }

        return current ===
          product.images.length -
          1
          ? 0
          : current + 1;
      }
    );
  }

  return (
    <main style={styles.container}>
      <div
        style={
          styles.productLayout
        }
      >
        {/* Gallery */}
        <div style={styles.gallery}>
          {product.images?.length >
            0 && (
              <>
                <div
                  style={
                    styles.mainImageWrapper
                  }
                >
                  <img
                    src={imageUrl(
                      product.images[
                        selectedImage
                      ].url
                    )}
                    alt={
                      product.images[
                        selectedImage
                      ].alt ||
                      product.name
                    }
                    style={
                      styles.mainImage
                    }
                  />

                  {product.images.length >
                    1 && (
                      <>
                        <button
                          type="button"
                          onClick={
                            previousImage
                          }
                          aria-label="Previous image"
                          style={{
                            ...styles.arrowButton,
                            left: "16px",
                          }}
                        >
                          <ChevronLeft />
                        </button>

                        <button
                          type="button"
                          onClick={
                            nextImage
                          }
                          aria-label="Next image"
                          style={{
                            ...styles.arrowButton,
                            right: "16px",
                          }}
                        >
                          <ChevronRight />
                        </button>

                        <div
                          style={
                            styles.imageCounter
                          }
                        >
                          {selectedImage + 1}
                          {" / "}
                          {
                            product.images
                              .length
                          }
                        </div>
                      </>
                    )}
                </div>

                {product.images.length >
                  1 && (
                    <div
                      style={
                        styles.thumbnails
                      }
                    >
                      {product.images.map(
                        (
                          image,
                          index
                        ) => (
                          <button
                            key={
                              image.id ??
                              index
                            }
                            type="button"
                            onClick={() =>
                              setSelectedImage(
                                index
                              )
                            }
                            style={{
                              ...styles.thumbnailButton,

                              border:
                                selectedImage ===
                                  index
                                  ? "2px solid #111"
                                  : "1px solid #ddd",
                            }}
                          >
                            <img
                              src={imageUrl(
                                image.url
                              )}
                              alt={
                                image.alt ||
                                `${product.name} ${index +
                                1
                                }`
                              }
                              style={
                                styles.thumbnailImage
                              }
                            />
                          </button>
                        )
                      )}
                    </div>
                  )}
              </>
            )}
        </div>

        {/* Product info */}
        <div
          style={
            styles.productInfo
          }
        >
          <div>
            <h1
              style={
                styles.productTitle
              }
            >
              {product.name}
            </h1>

            <div
              style={styles.price}
            >
              €
              {calculatedUnitPrice.toFixed(
                2
              )}
            </div>
          </div>

          <section
            style={
              styles.optionSection
            }
          >
            <div
              style={
                styles.sectionTitleRow
              }
            >
              <h3
                style={
                  styles.optionTitle
                }
              >
                {t("keys")}
              </h3>

              <strong>
                {keys}
              </strong>
            </div>

            <p
              style={
                styles.helperText
              }
            >
              Choose between{" "}
              {product.minKeys} and{" "}
              {product.maxKeys}{" "}
              keys.
            </p>

            <label
              style={
                styles.fieldLabel
              }
            >
              {t("characters")}

              <input
                value={
                  characters
                }
                maxLength={
                  product.maxKeys
                }
                onChange={(
                  event
                ) =>
                  setCharacters(
                    event.target
                      .value
                  )
                }
                placeholder="e.g. MARCELO"
                style={
                  styles.textInput
                }
              />
            </label>
          </section>

          <section
            style={
              styles.optionSection
            }
          >
            <h3
              style={
                styles.optionTitle
              }
            >
              {t(
                "chooseColor"
              )}
            </h3>

            <div
              style={
                styles.colorOptions
              }
            >
              {product.colors.map(
                (color) => (
                  <button
                    key={
                      color.id
                    }
                    type="button"
                    title={
                      color.name
                    }
                    onClick={() =>
                      setSelectedColor(
                        color
                      )
                    }
                    style={{
                      ...styles.colorButton,

                      border:
                        selectedColor?.id ===
                          color.id
                          ? "2px solid #111"
                          : "1px solid #ddd",
                    }}
                  >
                    <span
                      style={{
                        ...styles.colorDot,

                        background:
                          color.hex,
                      }}
                    />

                    <span>
                      {
                        color.name
                      }
                    </span>
                  </button>
                )
              )}
            </div>
          </section>

          <section
            style={
              styles.optionSection
            }
          >
            <h3
              style={
                styles.optionTitle
              }
            >
              {t(
                "chooseFont"
              )}
            </h3>

            <div
              style={
                styles.fontOptions
              }
            >
              {product.fonts.map(
                (font) => (
                  <button
                    key={
                      font.id
                    }
                    type="button"
                    onClick={() =>
                      setSelectedFont(
                        font
                      )
                    }
                    style={{
                      ...styles.fontButton,

                      border:
                        selectedFont?.id ===
                          font.id
                          ? "2px solid #111"
                          : "1px solid #ddd",

                      background:
                        selectedFont?.id ===
                          font.id
                          ? "#f7f7f7"
                          : "#fff",
                    }}
                  >
                    <strong>
                      {
                        font.name
                      }
                    </strong>

                    <span
                      style={
                        styles.fontMeta
                      }
                    >
                      {font.bordered
                        ? "With Border"
                        : "Without Border"}
                    </span>
                  </button>
                )
              )}
            </div>
          </section>

          <div
            style={
              styles.summary
            }
          >
            <div
              style={
                styles.summaryHeader
              }
            >
              <strong>
                {t(
                  "selectedConfiguration"
                )}
              </strong>

              <span
                style={
                  styles.summaryPrice
                }
              >
                €
                {calculatedUnitPrice.toFixed(
                  2
                )}
              </span>
            </div>

            <p
              style={
                styles.summaryText
              }
            >
              {keys}{" "}
              {t("keys").toLowerCase()}
              {" · "}
              {selectedColor?.name}
              {" · "}
              {selectedFont?.name}
            </p>

            <span
              style={
                styles.weight
              }
            >
              {t("weight")}:{" "}
              {
                calculatedWeightGrams
              }{" "}
              g
            </span>
          </div>

          <button
            type="button"
            onClick={
              handleAddToCart
            }
            style={{
              ...styles.addToCartButton,

              opacity:
                keys <
                  product.minKeys ||
                  keys >
                  product.maxKeys
                  ? 0.45
                  : 1,

              cursor:
                keys <
                  product.minKeys ||
                  keys >
                  product.maxKeys
                  ? "not-allowed"
                  : "pointer",
            }}
            disabled={
              keys <
              product.minKeys ||
              keys >
              product.maxKeys
            }
          >
            {addedToCart
              ? t(
                "addedToCart"
              )
              : t(
                "addToCart"
              )}
          </button>
        </div>
      </div>

      {/* Description */}
      <section
        style={
          styles.descriptionSection
        }
      >
        <h2
          style={
            styles.descriptionTitle
          }
        >
          {t("description")}
        </h2>

        <div
          style={
            styles.descriptionText
          }
        >
          {product.description}
        </div>
      </section>
    </main>
  );
}

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px 80px",
    fontFamily:
      "Arial, sans-serif",
  },

  productLayout: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit, minmax(320px, 1fr))",

    gap: "56px",

    alignItems: "start",
  },

  gallery: {
    width: "100%",

    alignSelf: "start",

    position: "sticky",

    top: "24px",
  },

  mainImageWrapper: {
    position: "relative",

    width: "100%",

    aspectRatio: "1 / 1",

    borderRadius: "20px",

    overflow: "hidden",

    background: "#f6f6f6",

    border:
      "1px solid #eeeeee",
  },

  mainImage: {
    display: "block",

    width: "100%",

    height: "100%",

    objectFit: "contain",

    padding: "20px",

    boxSizing:
      "border-box",
  },

  arrowButton: {
    position: "absolute",

    top: "50%",

    transform:
      "translateY(-50%)",

    width: "44px",

    height: "44px",

    padding: 0,

    border:
      "1px solid rgba(0,0,0,0.08)",

    borderRadius: "50%",

    background:
      "rgba(255,255,255,0.94)",

    display: "flex",

    alignItems: "center",

    justifyContent:
      "center",

    color: "#111",

    cursor: "pointer",

    boxShadow:
      "0 4px 14px rgba(0,0,0,0.12)",

    zIndex: 2,
  },

  imageCounter: {
    position: "absolute",

    right: "14px",

    bottom: "14px",

    padding: "6px 10px",

    borderRadius: "20px",

    background:
      "rgba(0,0,0,0.65)",

    color: "#fff",

    fontSize: "13px",
  },

  thumbnails: {
    display: "flex",

    gap: "10px",

    marginTop: "12px",

    overflowX: "auto",

    paddingBottom: "4px",
  },

  thumbnailButton: {
    flex: "0 0 76px",

    width: "76px",

    height: "76px",

    padding: "4px",

    borderRadius: "10px",

    background: "#fff",

    cursor: "pointer",
  },

  thumbnailImage: {
    width: "100%",

    height: "100%",

    objectFit: "contain",

    borderRadius: "7px",
  },

  productInfo: {
    minWidth: 0,
  },

  productTitle: {
    margin: 0,

    fontSize:
      "clamp(28px, 4vw, 42px)",

    lineHeight: 1.1,

    letterSpacing:
      "-0.02em",
  },

  price: {
    marginTop: "18px",

    fontSize: "32px",

    fontWeight: 700,

    letterSpacing:
      "-0.02em",
  },

  optionSection: {
    padding: "24px 0",

    borderBottom:
      "1px solid #eeeeee",
  },

  sectionTitleRow: {
    display: "flex",

    alignItems: "center",

    justifyContent:
      "space-between",

    gap: "20px",
  },

  optionTitle: {
    margin: "0 0 14px",

    fontSize: "16px",

    fontWeight: 700,
  },

  helperText: {
    margin:
      "0 0 16px",

    color: "#666",

    fontSize: "14px",
  },

  fieldLabel: {
    display: "grid",

    gap: "8px",

    fontSize: "14px",

    fontWeight: 600,
  },

  textInput: {
    width: "100%",

    padding: "13px 14px",

    boxSizing:
      "border-box",

    border:
      "1px solid #d8d8d8",

    borderRadius: "10px",

    fontSize: "16px",

    outline: "none",
  },

  colorOptions: {
    display: "flex",

    gap: "10px",

    flexWrap: "wrap",
  },

  colorButton: {
    display: "flex",

    alignItems: "center",

    gap: "9px",

    padding: "10px 13px",

    borderRadius: "10px",

    background: "#fff",

    cursor: "pointer",
  },

  colorDot: {
    display: "block",

    width: "20px",

    height: "20px",

    borderRadius: "50%",

    border:
      "1px solid rgba(0,0,0,0.2)",
  },

  fontOptions: {
    display: "flex",

    flexWrap: "wrap",

    gap: "10px",
  },

  fontButton: {
    display: "grid",

    gap: "3px",

    textAlign: "left",

    padding:
      "11px 14px",

    borderRadius: "10px",

    cursor: "pointer",
  },

  fontMeta: {
    color: "#777",

    fontSize: "12px",
  },

  summary: {
    marginTop: "24px",

    padding: "18px",

    border:
      "1px solid #e5e5e5",

    borderRadius: "14px",

    background: "#fafafa",
  },

  summaryHeader: {
    display: "flex",

    justifyContent:
      "space-between",

    gap: "20px",

    alignItems: "center",
  },

  summaryPrice: {
    fontSize: "18px",

    fontWeight: 700,
  },

  summaryText: {
    margin:
      "12px 0 6px",

    color: "#444",

    lineHeight: 1.5,
  },

  weight: {
    color: "#777",

    fontSize: "13px",
  },

  addToCartButton: {
    width: "100%",

    padding: "17px 20px",

    marginTop: "20px",

    border: "none",

    borderRadius: "12px",

    background: "#111",

    color: "#fff",

    fontSize: "16px",

    fontWeight: 700,
  },

  descriptionSection: {
    marginTop: "72px",

    paddingTop: "36px",

    borderTop:
      "1px solid #eeeeee",

    maxWidth: "800px",
  },

  descriptionTitle: {
    margin:
      "0 0 20px",

    fontSize: "24px",
  },

  descriptionText: {
    whiteSpace: "pre-line",

    lineHeight: 1.8,

    color: "#444",

    fontSize: "16px",
  },
};