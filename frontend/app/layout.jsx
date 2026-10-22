import Header from "../components/Header";
import { AuthProvider } from "../context/AuthContext";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ToastProvider } from "../context/ToastContext";
import { LanguageProvider } from "../context/LanguageContext";
import { cookies } from "next/headers";

export const metadata = {
  metadataBase: new URL(
    process.env.SITE_URL ||
    "http://localhost:3000"
  ),

  title: {
    default:
      "Loja da Fumaça | Produtos personalizados",
    template:
      "%s | Loja da Fumaça",
  },

  description:
    "Produtos personalizados e criativos, produzidos com atenção ao detalhe e enviados para todo Portugal.",

  applicationName:
    "Loja da Fumaça",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",

    siteName:
      "Loja da Fumaça",

    title:
      "Loja da Fumaça",

    description:
      "Produtos personalizados e criativos.",

    images: [
      {
        url:
          "/opengraph-image.jpg",
        width: 1200,
        height: 630,
        alt:
          "Loja da Fumaça",
      },
    ],

    url: "/",
  },

  twitter: {
    card:
      "summary_large_image",

    title:
      "Loja da Fumaça",

    description:
      "Produtos personalizados e criativos.",

    images: [
      "/twitter-image.jpg",
    ],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();

  const initialLocale =
    cookieStore.get(
      "NEXT_LOCALE"
    )?.value || "en";

  return (
    <html lang={initialLocale}>
      <body
        style={{
          margin: 0,
          fontFamily: "Arial, sans-serif",
          background: "#fff",
          color: "#111"
        }}
      >
        <LanguageProvider
          initialLocale={
            initialLocale
          }
        >
          <ToastProvider>
            <AuthProvider>
              <Header />

              {children}
            </AuthProvider>
          </ToastProvider>
        </LanguageProvider>

        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GA_ID}
        />
      </body>
    </html>
  );
}