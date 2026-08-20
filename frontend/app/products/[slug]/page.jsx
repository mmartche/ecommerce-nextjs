"use client";

import { useEffect, useState } from "react";
import { addToCart } from "../../../lib/cart";
import { imageUrl } from "../../../lib/imageUrl";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.50.159:4000";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [keys, setKeys] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFont, setSelectedFont] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    async function loadProduct() {
      try {
        const { slug } = await params;

        const response = await fetch(
          `${API_URL}/api/products/${slug}`
        );

        if (!response.ok) {
          throw new Error("Product not found");
        }

        const data = await response.json();

        setProduct(data);

        if (data.colors.length > 0) {
          setSelectedColor(data.colors[0]);
        }

        if (data.fonts.length > 0) {
          setSelectedFont(data.fonts[0]);
        }

        setKeys(data.minKeys);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, []);

  useEffect(() => {
    setSelectedImage(0);
  }, [product?.id]);

  if (loading) {
    return <main>Loading...</main>;
  }

  if (!product) {
    return <main>Product not found.</main>;
  }

  function handleAddToCart() {
    if (!selectedColor || !selectedFont) {
      return;
    }

    addToCart({
      productId: product.id,
      slug: product.slug,
      name: product.name,

      quantity: 1,

      keys,

      color: {
        id: selectedColor.id,
        name: selectedColor.name,
        hex: selectedColor.hex
      },

      font: {
        id: selectedFont.id,
        name: selectedFont.name,
        bordered: selectedFont.bordered
      },

      unitPrice: Number(product.basePrice)
    });

    setAddedToCart(true);

    setTimeout(() => {
      setAddedToCart(false);
    }, 2000);
  }

  function previousImage() {
    setSelectedImage((current) => {
      if (!product?.images?.length) {
        return 0;
      }

      return current === 0
        ? product.images.length - 1
        : current - 1;
    });
  }

  function nextImage() {
    setSelectedImage((current) => {
      if (!product?.images?.length) {
        return 0;
      }

      return current ===
        product.images.length - 1
        ? 0
        : current + 1;
    });
  }

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "50px"
        }}
      >
        <div
          style={{
            minHeight: "500px",
            background: "#f5f5f5",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          <div

          >
            {product.images?.length > 0 && (
              <div style={styles.gallery}>
                <div style={styles.mainImageWrapper}>
                  <img
                    src={imageUrl(
                      product.images[selectedImage].url
                    )}
                    alt={
                      product.images[selectedImage].alt ||
                      product.name
                    }
                    style={styles.mainImage}
                  />

                  {product.images.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={previousImage}
                        aria-label="Previous image"
                        style={{
                          ...styles.arrowButton,
                          left: "14px",
                        }}
                      >
                        ‹
                      </button>

                      <button
                        type="button"
                        onClick={nextImage}
                        aria-label="Next image"
                        style={{
                          ...styles.arrowButton,
                          right: "14px",
                        }}
                      >
                        ›
                      </button>

                      <div style={styles.imageCounter}>
                        {selectedImage + 1} /{" "}
                        {product.images.length}
                      </div>
                    </>
                  )}
                </div>

                {product.images.length > 1 && (
                  <div style={styles.thumbnails}>
                    {product.images.map(
                      (image, index) => (
                        <button
                          key={image.id ?? index}
                          type="button"
                          onClick={() =>
                            setSelectedImage(index)
                          }
                          aria-label={`View image ${index + 1
                            }`}
                          style={{
                            ...styles.thumbnailButton,

                            border:
                              selectedImage === index
                                ? "2px solid #111"
                                : "1px solid #ddd",
                          }}
                        >
                          <img
                            src={imageUrl(image.url)}
                            alt={
                              image.alt ||
                              `${product.name} ${index + 1
                              }`
                            }
                            style={styles.thumbnailImage}
                          />
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h1>{product.name}</h1>

          <p>{product.description}</p>

          <h2>
            €{Number(product.basePrice).toFixed(2)}
          </h2>

          <hr />

          <h3>Number of keys</h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
          >
            <button
              onClick={() =>
                setKeys(Math.max(product.minKeys, keys - 1))
              }
            >
              −
            </button>

            <strong>{keys}</strong>

            <button
              onClick={() =>
                setKeys(Math.min(product.maxKeys, keys + 1))
              }
            >
              +
            </button>
          </div>

          <p>
            Choose between {product.minKeys} and{" "}
            {product.maxKeys} keys.
          </p>

          <hr />

          <h3>Color</h3>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap"
            }}
          >
            {product.colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "8px",
                  border:
                    selectedColor?.id === color.id
                      ? "3px solid black"
                      : "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    background: color.hex,
                    border: "1px solid #999",
                    marginRight: "8px",
                    verticalAlign: "middle"
                  }}
                />

                {color.name}
              </button>
            ))}
          </div>

          <hr />

          <h3>Font</h3>

          <div
            style={{
              display: "flex",
              gap: "10px"
            }}
          >
            {product.fonts.map((font) => (
              <button
                key={font.id}
                onClick={() => setSelectedFont(font)}
                style={{
                  padding: "10px 15px",
                  borderRadius: "8px",
                  border:
                    selectedFont?.id === font.id
                      ? "3px solid black"
                      : "1px solid #ccc",
                  background: "#fff",
                  cursor: "pointer"
                }}
              >
                {font.name}

                {font.bordered
                  ? " — With Border"
                  : " — Without Border"}
              </button>
            ))}
          </div>

          <hr />

          <h3>Selected configuration</h3>

          <p>
            <strong>Keys:</strong> {keys}
          </p>

          <p>
            <strong>Color:</strong>{" "}
            {selectedColor?.name}
          </p>

          <p>
            <strong>Font:</strong>{" "}
            {selectedFont?.name}
            {selectedFont?.bordered
              ? " — With Border"
              : " — Without Border"}
          </p>

          <button
            onClick={handleAddToCart}
            style={{
              width: "100%",
              padding: "16px",
              marginTop: "20px",
              border: "none",
              borderRadius: "8px",
              background: "#111",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            {addedToCart ? "Added to Cart ✓" : "Add to Cart"}
          </button>
        </div>
      </div>
    </main>
  );
}

const styles = {
  gallery: {
    width: "100%",
  },

  mainImageWrapper: {
    position: "relative",
    width: "100%",
    borderRadius: "16px",
    overflow: "hidden",
    background: "#f5f5f5",
  },

  mainImage: {
    display: "block",
    width: "100%",
    aspectRatio: "1 / 1",
    objectFit: "contain",
  },

  arrowButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",

    width: "44px",
    height: "44px",

    border: "none",
    borderRadius: "50%",

    background: "rgba(255,255,255,0.9)",

    fontSize: "32px",
    lineHeight: "40px",

    cursor: "pointer",
  },

  imageCounter: {
    position: "absolute",
    right: "14px",
    bottom: "14px",

    padding: "6px 10px",

    borderRadius: "20px",

    background: "rgba(0,0,0,0.65)",
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
    flex: "0 0 82px",

    width: "82px",
    height: "82px",

    padding: "3px",

    borderRadius: "10px",

    background: "#fff",

    cursor: "pointer",
  },

  thumbnailImage: {
    width: "100%",
    height: "100%",

    objectFit: "cover",

    borderRadius: "7px",
  },
}