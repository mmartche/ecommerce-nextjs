"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  clearCart
} from "../../lib/cart";

import { formatWeight } from "../../lib/formatWeight";

export default function CartPage() {
  const [cart, setCart] = useState([]);

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

  function changeQuantity(item, quantity) {
    updateCartQuantity(
      item.cartItemId,
      quantity
    );

    refreshCart();
  }

  function removeItem(cartItemId) {
    removeFromCart(cartItemId);
    refreshCart();
  }

  function handleClearCart() {
    clearCart();
    refreshCart();
  }

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.unitPrice || 0) *
      Number(item.quantity || 1),
    0
  );

  const totalWeightGrams = cart.reduce(
    (total, item) =>
      total +
      Number(item.weightGrams || 0) *
      Number(item.quantity || 1),
    0
  );

  if (cart.length === 0) {
    return (
      <main
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "50px 20px"
        }}
      >
        <h1>Your Cart</h1>

        <p>Your cart is empty.</p>

        <Link href="/">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "50px 20px"
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px"
        }}
      >
        <h1>Your Cart</h1>

        <button
          onClick={handleClearCart}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            textDecoration: "underline"
          }}
        >
          Clear cart
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}
      >
        {cart.map((item) => (
          <article
            key={item.cartItemId}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "20px",
              display: "grid",
              gridTemplateColumns:
                "1fr auto",
              gap: "20px"
            }}
          >
            <div>
              <Link
                href={`/products/${item.slug}`}
                style={{
                  color: "#111",
                  textDecoration: "none"
                }}
              >
                <h2
                  style={{
                    marginTop: 0
                  }}
                >
                  {item.name}
                </h2>
              </Link>

              {item.characters && (
                <p>
                  <strong>Characters:</strong>{" "}
                  {item.characters}
                </p>
              )}

              <p>
                <strong>Keys:</strong>{" "}
                {item.keys}
              </p>

              <p>
                <strong>Color:</strong>{" "}
                <span
                  style={{
                    display: "inline-block",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background:
                      item.color?.hex,
                    border:
                      "1px solid #aaa",
                    marginRight: "6px"
                  }}
                />

                {item.color?.name}
              </p>

              <p>
                <strong>Font:</strong>{" "}
                {item.font?.name}

                {item.font?.bordered
                  ? " — With Border"
                  : " — Without Border"}
              </p>

              <p>
                <strong>Weight:{" "}</strong>
                {item.weightGrams} g
              </p>

              <p>
                <strong>Item Total:{" "}</strong>
                €
                {Number(
                  item.unitPrice
                ).toFixed(2)}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                justifyContent:
                  "space-between"
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px"
                }}
              >
                <button
                  onClick={() =>
                    changeQuantity(
                      item,
                      item.quantity - 1
                    )
                  }
                >
                  −
                </button>

                <strong>
                  {item.quantity}
                </strong>

                <button
                  onClick={() =>
                    changeQuantity(
                      item,
                      item.quantity + 1
                    )
                  }
                >
                  +
                </button>
              </div>

              <button
                onClick={() =>
                  removeItem(
                    item.cartItemId
                  )
                }
                style={{
                  border: "none",
                  background: "transparent",
                  textDecoration:
                    "underline",
                  cursor: "pointer"
                }}
              >
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>



      <section
        style={{
          marginTop: "40px",
          borderTop: "1px solid #ddd",
          paddingTop: "30px"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
          }}
        >
          <span>Total weight:{" "}</span>
          <span>
            {formatWeight(
              totalWeightGrams
            )}
          </span>

        </div>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            fontSize: "22px",
            fontWeight: "700"
          }}
        >
          <span>Subtotal</span>

          <span>
            €{subtotal.toFixed(2)}
          </span>
        </div>

        <p
          style={{
            color: "#666"
          }}
        >
          Shipping will be calculated at checkout.
        </p>

        <Link
          href="/checkout"
          style={{
            display: "block",
            width: "100%",
            boxSizing: "border-box",
            marginTop: "20px",
            padding: "16px",
            textAlign: "center",
            textDecoration: "none",
            background: "#111",
            color: "#fff",
            borderRadius: "8px",
            fontSize: "18px"
          }}
        >
          Checkout
        </Link>
      </section>
    </main>
  );
}