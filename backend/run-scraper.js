const { scrapeOLX } = require("./src/services/scraperService");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const run = async () => {
  try {
    await scrapeOLX();
  } catch (error) {
    console.error("A apărut o eroare în timpul rulării scraper-ului:", error);
  } finally {
    // Asigură-te că te deconectezi de la baza de date la final
    await prisma.$disconnect();
    process.exit();
  }
};

run();
