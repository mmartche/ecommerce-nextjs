const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({
      status: "ok",
      service: "ecommerce-api",
      database: "connected"
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "error",
      service: "ecommerce-api",
      database: "disconnected"
    });
  }
});

/*
 * GET ALL PRODUCTS
 */
app.get("/api/products", async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        colors: true,
        fonts: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch products"
    });
  }
});

/*
 * GET PRODUCT BY SLUG
 */
app.get("/api/products/:slug", async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: {
        slug: req.params.slug
      },
      include: {
        colors: true,
        fonts: true
      }
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    res.json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch product"
    });
  }
});

/*
 * CREATE PRODUCT
 */
app.post("/api/products", async (req, res) => {
  try {
    const {
      name,
      slug,
      description,
      basePrice,
      stock,
      minKeys,
      maxKeys,
      colors,
      fonts
    } = req.body;

    if (!name || !slug || basePrice === undefined) {
      return res.status(400).json({
        error: "name, slug and basePrice are required"
      });
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        basePrice,
        stock: stock || 0,
        minKeys: minKeys || 1,
        maxKeys: maxKeys || 52,

        colors: {
          create: (colors || []).map((color) => ({
            name: color.name,
            hex: color.hex
          }))
        },

        fonts: {
          create: (fonts || []).map((font) => ({
            name: font.name,
            bordered: font.bordered || false
          }))
        }
      },

      include: {
        colors: true,
        fonts: true
      }
    });

    res.status(201).json(product);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create product"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});