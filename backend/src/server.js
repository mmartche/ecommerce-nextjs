const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  authGuard,
  adminGuard
} = require("./middleware/auth");

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 4000;

app.use(
  cors({
    origin: "http://192.168.50.159:3000",
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

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

app.post("/api/orders", authGuard, async (req, res) => {
  try {
    const {
      items,
      shipping = 0,
      shippingAddress
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        error: "Order must contain at least one item"
      });
    }

    if (
      !shippingAddress?.name ||
      !shippingAddress?.address ||
      !shippingAddress?.postalCode ||
      !shippingAddress?.city ||
      !shippingAddress?.country
    ) {
      return res.status(400).json({
        error: "Shipping address is required"
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

        shippingName:
          shippingAddress.name,

        shippingAddress:
          shippingAddress.address,

        shippingPostalCode:
          shippingAddress.postalCode,

        shippingCity:
          shippingAddress.city,

        shippingCountry:
          shippingAddress.country,
        
        userId: req.user.id,

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

app.get("/api/orders", authGuard, async (req, res) => {
  try {
    const orders =
      await prisma.order.findMany({
        where: {
          userId: req.user.id
        },

        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true
                }
              }
            }
          }
        },

        orderBy: {
          createdAt: "desc"
        }
      });

    res.json(orders);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch orders"
    });
  }
});

app.get("/api/orders/:id", authGuard, async (req, res) => {
  try {
    const orderId = Number(req.params.id);

    if (!Number.isInteger(orderId)) {
      return res.status(400).json({
        error: "Invalid order id"
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: req.user.id
      },

      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        error: "Order not found"
      });
    }

    res.json(order);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to fetch order"
    });
  }
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must contain at least 8 characters"
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email already registered"
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash
      }
    });

    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to register"
    });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase()
      }
    });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to login"
    });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("auth_token");

  res.json({
    success: true
  });
});

app.get("/api/auth/me", authGuard, async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.user.id
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    }
  });

  if (!user) {
    return res.status(404).json({
      error: "User not found"
    });
  }

  res.json(user);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running on port ${PORT}`);
});