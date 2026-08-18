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
      where: {
        active: true
      },

      include: {
        colors: {
          include: {
            color: true
          }
        },

        fonts: {
          include: {
            font: true
          }
        },

        images: true
      },

      orderBy: {
        createdAt: "desc"
      }
    });

    const response = products.map((product) => ({
      ...product,

      colors: product.colors.map((item) => item.color),

      fonts: product.fonts.map((item) => item.font)
    }));

    res.json(response);
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
        colors: {
          include: {
            color: true
          }
        },
        fonts: {
          include: {
            font: true
          }
        },
        images: true
      }
    });

    if (!product) {
      return res.status(404).json({
        error: "Product not found"
      });
    }

    const response = {
      ...product,

      colors: product.colors.map((item) => item.color),

      fonts: product.fonts.map((item) => item.font)
    };

    res.json(response);
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

app.post("/api/orders", async (req, res) => {
  try {
    const {
      customer,
      items,
      shipping = 0
    } = req.body;

    if (!customer?.name || !customer?.email) {
      return res.status(400).json({
        error: "Customer name and email are required"
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "Order must contain at least one item"
      });
    }

    const subtotal = items.reduce(
      (total, item) =>
        total +
        Number(item.unitPrice) * Number(item.quantity),
      0
    );

    const total = subtotal + Number(shipping);

    const order = await prisma.order.create({
      data: {
        subtotal,
        shipping,
        total,

        customer: {
          create: {
            name: customer.name,
            email: customer.email,
            phone: customer.phone || null,
            address: customer.address || null,
            postalCode: customer.postalCode || null,
            city: customer.city || null,
            country: customer.country || "Portugal"
          }
        },

        items: {
          create: items.map((item) => ({
            quantity: item.quantity,
            keys: item.keys,

            colorName: item.color?.name || null,
            colorHex: item.color?.hex || null,

            fontName: item.font?.name || null,
            bordered: item.font?.bordered || false,

            unitPrice: Number(item.unitPrice),
            totalPrice:
              Number(item.unitPrice) *
              Number(item.quantity),

            productId: item.productId
          }))
        }
      },

      include: {
        customer: true,
        items: true
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create order"
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});