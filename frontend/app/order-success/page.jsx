"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <main
      style={{
        maxWidth: "700px",
        margin: "0 auto",
        padding: "80px 20px",
        textAlign: "center",
      }}
    >
      <h1>Order received ✓</h1>

      <p>Thank you for your order.</p>

      {orderId && (
        <p>
          Order number: <strong>#{orderId}</strong>
        </p>
      )}

      <Link href="/">
        Continue shopping
      </Link>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}