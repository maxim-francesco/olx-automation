// Acest script este dedicat pentru a fi rulat de Cron Job
const { scrapeOLX } = require("../services/scraperService");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

console.log("▶️ Pornire job programat: Căutare anunțuri noi...");

scrapeOLX()
  .then(() => {
    console.log("✅ Job programat finalizat cu succes.");
    // Ne deconectăm de la baza de date pentru a închide procesul curat
    return prisma.$disconnect();
  })
  .catch((error) => {
    console.error("❌ A apărut o eroare în timpul job-ului programat:", error);
    return prisma.$disconnect();
  })
  .finally(() => {
    process.exit(); // Asigură închiderea procesului
  });
