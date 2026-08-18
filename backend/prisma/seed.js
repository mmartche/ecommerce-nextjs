const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const colors = [
    {
      name: "Matte Marine Blue",
      hex: "#6F5034",
      filamentCode: "11600"
    },
    {
      name: "Matte Ivory White",
      hex: "#FFFFFF",
      filamentCode: "11100"
    },
    {
      name: "Indigo Purple",
      hex: "#482A60",
      filamentCode: "10701"
    },
    {
      name: "Bambu Green",
      hex: "#16C344",
      filamentCode: "10501"
    },
    {
      name: "Black",
      hex: "#000000",
      filamentCode: "10101"
    },
    {
      name: "Red",
      hex: "#C12E1F",
      filamentCode: "10200"
    }
  ];

  const createdColors = [];

  for (const color of colors) {
    const created = await prisma.color.upsert({
      where: {
        name: color.name
      },
      update: color,
      create: color
    });

    createdColors.push(created);
  }

  const fontWithoutBorder = await prisma.font.create({
    data: {
      name: "Standard",
      bordered: false
    }
  });

  const fontWithBorder = await prisma.font.create({
    data: {
      name: "Standard",
      bordered: true
    }
  });

  await prisma.product.create({
    data: {
      name: "Flexi Keycap Clicker Fidget Keychain",
      slug: "flexi-keycap-clicker-fidget-keychain",
      description:
        "Customizable articulated keycap fidget keychain. Choose your characters, colors and font style.",
      basePrice: 9.99,
      minKeys: 1,
      maxKeys: 52,
      active: true,

      colors: {
        create: createdColors.map((color) => ({
          colorId: color.id
        }))
      },

      fonts: {
        create: [
          {
            fontId: fontWithoutBorder.id
          },
          {
            fontId: fontWithBorder.id
          }
        ]
      }
    }
  });

  console.log("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });