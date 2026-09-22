import Link from "next/link";
import { imageUrl } from "../lib/imageUrl";
import { apiGet } from "@/lib/api";
import HomeContent from "../components/HomeContent";

const API_URL =
  process.env.API_URL || "http://api:4000";

async function getProducts() {
  const response = await apiGet(
    `${API_URL}/api/products`,
    {
      cache: "no-store"
    }
  );

  return response;
}

export default async function Home() {
  const products = await getProducts();

  return (
    <HomeContent
      products={products}
    />
  );
}