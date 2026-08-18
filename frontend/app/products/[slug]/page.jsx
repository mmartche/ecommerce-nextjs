"use client";

import { useEffect, useState } from "react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.50.159:4000";

export default function ProductPage({ params }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [keys, setKeys] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFont, setSelectedFont] = useState(null);

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

  if (loading) {
    return <main>Loading...</main>;
  }

  if (!product) {
    return <main>Product not found.</main>;
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
          <span>Product Image</span>
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
            Add to Cart
          </button>
        </div>
      </div>
    </main>
  );
}