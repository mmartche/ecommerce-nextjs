"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, clearCart } from "../../lib/cart";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://192.168.50.159:4000";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    country: "Portugal"
  });

  useEffect(() => {
    setCart(getCart());
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setCustomer((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            customer,
            items: cart,
            shipping: 0
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create order"
        );
      }

      clearCart();

      router.push(`/order-success?id=${data.id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const subtotal = cart.reduce(
    (total, item) =>
      total +
      Number(item.unitPrice) * Number(item.quantity),
    0
  );

  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "50px 20px"
      }}
    >
      <h1>Checkout</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "40px"
        }}
      >
        <form onSubmit={handleSubmit}>
          <h2>Customer information</h2>

          {[
            ["name", "Name"],
            ["email", "Email"],
            ["phone", "Phone"],
            ["address", "Address"],
            ["postalCode", "Postal Code"],
            ["city", "City"],
            ["country", "Country"]
          ].map(([name, label]) => (
            <div
              key={name}
              style={{ marginBottom: "16px" }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "6px"
                }}
              >
                {label}
              </label>

              <input
                name={name}
                value={customer[name]}
                onChange={handleChange}
                required={
                  name === "name" ||
                  name === "email" ||
                  name === "address" ||
                  name === "postalCode" ||
                  name === "city"
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px"
                }}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: "red" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              border: 0,
              borderRadius: "8px",
              background: "#111",
              color: "#fff",
              fontSize: "18px",
              cursor: "pointer"
            }}
          >
            {loading ? "Creating order..." : "Place Order"}
          </button>
        </form>

        <aside>
          <h2>Order summary</h2>

          {cart.map((item) => (
            <div
              key={item.cartItemId}
              style={{
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom: "1px solid #ddd"
              }}
            >
              <strong>{item.name}</strong>

              <p>
                {item.quantity} × €
                {Number(item.unitPrice).toFixed(2)}
              </p>

              <p>{item.keys} keys</p>
              <p>{item.color?.name}</p>
            </div>
          ))}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontWeight: "700",
              fontSize: "20px"
            }}
          >
            <span>Subtotal</span>
            <span>€{subtotal.toFixed(2)}</span>
          </div>

          <p>Shipping: calculated later</p>
        </aside>
      </div>
    </main>
  );
}