import Link from "next/link";
import { imageUrl } from "../lib/imageUrl";

const API_URL =
  process.env.API_URL || "http://api:4000";

async function getProducts() {
  const response = await fetch(
    `${API_URL}/api/products`,
    {
      cache: "no-store"
    }
  );

  if (!response.ok) {
    throw new Error("Failed to load products");
  }

  return response.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "40px 20px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1>A Loja da Fumaca</h1>

      <p>Produtos</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
          marginTop: "30px"
        }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            style={{
              textDecoration: "none",
              color: "inherit"
            }}
          >
            <article
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "20px"
              }}
            >
              <div
                style={{
                  height: "200px",
                  background: "#f5f5f5",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {product.images?.[0] && (
                  <img
                    src={imageUrl(
                      product.images[0].url
                    )}
                    alt={
                      product.images[0].alt ||
                      product.name
                    }
                    style={{
                      width: "100%",
                      height: "250px",
                      objectFit: "cover",
                      borderRadius: "12px",
                    }}
                  />
                )}
              </div>

              <h2>{product.name}</h2>

              <p>{product.description}</p>

              <strong>
                €{Number(product.basePrice).toFixed(2)}
              </strong>
            </article>
          </Link>
        ))}
      </div>
    </main>
  );
}