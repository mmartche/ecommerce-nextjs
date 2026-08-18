"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCartCount } from "../lib/cart";

export default function CartButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    function updateCount() {
      setCount(getCartCount());
    }

    updateCount();

    window.addEventListener("cart-updated", updateCount);
    window.addEventListener("storage", updateCount);

    return () => {
      window.removeEventListener(
        "cart-updated",
        updateCount
      );

      window.removeEventListener(
        "storage",
        updateCount
      );
    };
  }, []);

  return (
    <Link
      href="/cart"
      style={{
        textDecoration: "none",
        color: "#111",
        fontWeight: "600"
      }}
    >
      Cart ({count})
    </Link>
  );
}