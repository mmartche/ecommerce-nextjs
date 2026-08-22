const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const FILE_PATH = path.join(
  __dirname,
  "../data/ctt/codigos_postais.txt"
);

function clean(value) {
  const result = value?.trim();

  return result || null;
}

async function main() {
  console.log("Reading CTT postal code file...");

  const content = fs.readFileSync(
    FILE_PATH,
    "utf8"
  );

  const lines = content
    .split(/\r?\n/)
    .filter((line) => line.trim());

  console.log(
    `Found ${lines.length} rows`
  );

  const BATCH_SIZE = 500;

  let imported = 0;
  let skipped = 0;

  for (
    let offset = 0;
    offset < lines.length;
    offset += BATCH_SIZE
  ) {
    const batch = lines.slice(
      offset,
      offset + BATCH_SIZE
    );

    const data = [];

    for (const line of batch) {
      const columns = line.split(";");

      if (columns.length < 17) {
        console.warn(
          "Skipping invalid row:",
          line
        );

        skipped++;
        continue;
      }

      const [
        districtCode,
        countyCode,
        localityCode,
        locality,

        streetCode,
        streetType,
        streetPreposition,
        streetTitle,
        streetPreposition2,
        streetName,

        extra1,
        extra2,
        extra3,
        extra4,

        postalCode4,
        postalCode3,
        postalDesignation,
      ] = columns;

      if (
        !postalCode4 ||
        !postalCode3
      ) {
        skipped++;
        continue;
      }

      data.push({
        districtCode:
          clean(districtCode) || "",

        countyCode:
          clean(countyCode) || "",

        localityCode:
          clean(localityCode) || "",

        locality:
          clean(locality) || "",

        streetCode:
          clean(streetCode),

        streetType:
          clean(streetType),

        streetPreposition:
          clean(streetPreposition),

        streetTitle:
          clean(streetTitle),

        streetPreposition2:
          clean(streetPreposition2),

        streetName:
          clean(streetName),

        extra1:
          clean(extra1),

        extra2:
          clean(extra2),

        extra3:
          clean(extra3),

        extra4:
          clean(extra4),

        postalCode4:
          clean(postalCode4),

        postalCode3:
          clean(postalCode3),

        postalDesignation:
          clean(postalDesignation) || "",

        rawLine:
          line,
      });
    }

    if (data.length > 0) {
      await prisma.postalCode.createMany({
        data,
      });

      imported += data.length;
    }

    console.log(
      `Imported ${imported}/${lines.length}`
    );
  }

  console.log("");
  console.log("Import completed.");
  console.log(`Imported: ${imported}`);
  console.log(`Skipped: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });