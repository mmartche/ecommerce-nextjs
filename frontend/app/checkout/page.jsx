"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, clearCart } from "../../lib/cart";
import { useAuth } from "../../context/AuthContext";
import { formatWeight } from "../../lib/formatWeight";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export default function CheckoutPage() {
  const router = useRouter();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, loading: authLoading } = useAuth();
  const [customer, setCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    postalCode: "",
    city: "",
    country: "Portugal"
  });
  const [shipping, setShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("MBWAY");
  const [createdOrderId, setCreatedOrderId] = useState(null);


  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login?redirect=/checkout");
    }
  }, [authLoading, user, router]);

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

  function formatPostalCode(value) {
    const numbers = value.replace(/\D/g, "").slice(0, 7);

    if (numbers.length <= 4) {
      return numbers;
    }

    return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) {
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!shipping) {
      setError(
        "Please enter a valid postal code and calculate shipping."
      );

      return;
    }


    setLoading(true);
    setError("");

    try {
      let orderId = createdOrderId;
      if (!orderId) {
        const orderResponse = await fetch(
          `${API_URL}/api/orders`,
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              // items: cart,
              items: cart.map(
                (item) => ({
                  productId: item.productId,
                  quantity: item.quantity,
                  keys: item.keys,
                  color: item.color,
                  font: item.font,
                  characters: item.characters,
                })
              ),
              shippingAddress: {
                name: customer.name,
                address: customer.address,
                postalCode: customer.postalCode,
                city: customer.city,
                country: customer.country
              }
            })
          }
        );

        const order = await orderResponse.json();

        if (!orderResponse.ok) {
          throw new Error(
            Array.isArray(order.message)
              ? order.message.join(", ")
              : order.message ||
              order.error ||
              "Failed to create order"
          );
        }
        orderId = order.id;
        setCreatedOrderId(order.id);
      }
      
      const paymentResponse = await fetch(
        `${API_URL}/api/payments/create`,
        {
          method: "POST",
          credentials: "include",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            orderId,
            method: paymentMethod,
            mobileNumber: customer.phone,
          }),
        }
      );

      const payment =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(
          Array.isArray(payment.message)
            ? payment.message.join(", ")
            : payment.message ||
            payment.error ||
            "Failed to create payment"
        );
      }

      clearCart();

      router.push(`/orders/${orderId}/success`);
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

  const shippingPrice =
    Number(shipping?.price || 0);

  const total =
    subtotal + shippingPrice;

  const totalWeightGrams = cart.reduce(
    (total, item) =>
      total +
      Number(item.weightGrams || 0) *
      Number(item.quantity || 1),
    0
  );

  async function validatePostalCode() {
    const postalCode = customer.postalCode.trim();

    if (!/^\d{4}-\d{3}$/.test(postalCode)) {
      setError("Invalid postal code.");
      return;
    }

    const response = await fetch(
      `${API_URL}/api/postal-codes/${postalCode}`
    );

    const data = await response.json();

    if (!response.ok || !data.valid) {
      setError("Postal code not found.");
      return;
    }

    setCustomer((current) => ({
      ...current,
      city: data.locality,
    }));

    await calculateShippingCost();
  }

  async function calculateShippingCost() {
    const postalCode =
      customer.postalCode.trim();

    if (!/^\d{4}-\d{3}$/.test(postalCode)) {
      setShipping(null);
      return;
    }

    try {
      setShippingLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/shipping/calculate`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postalCode,
            weightGrams: totalWeightGrams,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(", ")
            : data.message ||
            data.error ||
            "Unable to calculate shipping"
        );
      }

      setShipping(data);
    } catch (error) {
      setShipping(null);
      setError(error.message);
    } finally {
      setShippingLoading(false);
    }
  }

  if (authLoading) {
    return <main>Checking session...</main>;
  }

  if (!user) {
    return null;
  }

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
            ["country", "Country"],
          ].map(([name, label]) => (
            <div
              key={name}
              style={{ marginBottom: "16px" }}
            >
              <label
                style={{
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                {label}
              </label>

              <input
                name={name}
                value={customer[name]}
                onChange={(event) => {
                  if (name === "postalCode") {
                    const formatted =
                      formatPostalCode(
                        event.target.value
                      );

                    setCustomer((current) => ({
                      ...current,
                      postalCode: formatted,
                    }));

                    setShipping(null);

                    return;
                  }

                  handleChange(event);
                }}
                onBlur={
                  name === "postalCode"
                    ? validatePostalCode
                    : undefined
                }
                inputMode={
                  name === "postalCode"
                    ? "numeric"
                    : undefined
                }
                maxLength={
                  name === "postalCode"
                    ? 8
                    : undefined
                }
                placeholder={
                  name === "postalCode"
                    ? "0000-000"
                    : undefined
                }
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
                  borderRadius: "6px",
                }}
              />
            </div>
          ))}

          {error && (
            <p style={{ color: "red" }}>{error}</p>
          )}

          <section
            style={{
              marginTop: "24px",
              marginBottom: "24px",
            }}
          >
            <h2>Payment</h2>

            <label
              style={{
                display: "block",
                marginBottom: "10px",
              }}
            >
              <input
                type="radio"
                name="paymentMethod"
                value="MBWAY"
                checked={
                  paymentMethod === "MBWAY"
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
              />

              {" "}MB WAY
            </label>

            <label>
              <input
                type="radio"
                name="paymentMethod"
                value="CARD"
                checked={
                  paymentMethod === "CARD"
                }
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value
                  )
                }
              />

              {" "}Card
            </label>
          </section>

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
            {loading
              ? "Processing..."
              : createdOrderId
                ? "Try payment again"
                : "Place Order"}
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
              {shipping && (
                <div>
                  <p>
                    <strong>
                      {shipping.provider}{" "}
                      {shipping.service}
                    </strong>
                  </p>

                  <p>
                    Weight:{" "}
                    {formatWeight(
                      shipping.weightGrams
                    )}
                  </p>

                  <p>
                    Shipping:{" "}
                    <strong>
                      €
                      {Number(
                        shipping.price
                      ).toFixed(2)}
                    </strong>
                  </p>

                  <p>
                    Estimated delivery:{" "}
                    {shipping.estimatedDelivery}
                  </p>

                  <small>
                    {shipping.deliveryNote}
                  </small>
                </div>
              )}
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
            <span>Total:</span>
            <span>€{total.toFixed(2)}</span>

          </div>

        </aside>
      </div>
    </main>
  );
}